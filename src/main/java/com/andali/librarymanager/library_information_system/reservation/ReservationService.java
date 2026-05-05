package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookRepository;
import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import com.andali.librarymanager.library_information_system.reservation.Reservation;
import com.andali.librarymanager.library_information_system.reservation.ReservationRepository;
import com.andali.librarymanager.library_information_system.reservation.ReservedBook;
import com.andali.librarymanager.library_information_system.reservation.ReservedBookRepository;
import com.andali.librarymanager.library_information_system.reservation.ReservedBookDTO;
import com.andali.librarymanager.library_information_system.reservation.ReservationDTO;
import com.andali.librarymanager.library_information_system.user.User;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {

        @Autowired
        private ReservationRepository reservationRepository;

        @Autowired
        private ReservedBookRepository reservedBookRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private BookRepository bookRepository;

        public ReservationDTO createReservation(ReservationRequest request) {
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Reservation reservation = Reservation.builder()
                                .user(user)
                                .reservationDate(LocalDateTime.now())
                                .status(Reservation.Status.PENDING)
                                .build();

                reservationRepository.save(reservation);

                List<ReservedBookDTO> reservedBooks = new ArrayList<>();
                for (Long bookId : request.getBookIds()) {
                        Book book = bookRepository.findById(bookId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

                        ReservedBook reservedBook = ReservedBook.builder()
                                        .reservation(reservation)
                                        .book(book)
                                        .build();
                        reservedBookRepository.save(reservedBook);

                        reservedBooks.add(ReservedBookDTO.builder()
                                        .id(reservedBook.getId())
                                        .bookId(book.getId())
                                        .bookTitle(book.getTitle())
                                        .build());
                }

                return mapToReservationDTO(reservation, reservedBooks);
        }

        public Page<ReservationDTO> getAllReservations(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                return reservationRepository.findAll(pageable).map(this::mapToReservationDTO);
        }

        public Page<ReservationDTO> getUserReservations(Long userId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                List<ReservationDTO> reservations = reservationRepository.findByUserId(userId).stream()
                                .map(this::mapToReservationDTO)
                                .toList();

                int start = Math.min(page * size, reservations.size());
                int end = Math.min(start + size, reservations.size());
                return new PageImpl<>(reservations.subList(start, end), pageable, reservations.size());
        }

        public void cancelReservation(Long reservationId) {
                Reservation reservation = reservationRepository.findById(reservationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
                reservation.setStatus(Reservation.Status.CANCELLED);
                reservationRepository.save(reservation);
        }

        public ReservationDTO approveReservation(Long reservationId, LocalDate returnDate, Long approvedBy) {
                Reservation reservation = reservationRepository.findById(reservationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

                if (reservation.getStatus() != Reservation.Status.PENDING) {
                        throw new IllegalStateException("Only pending reservations can be approved");
                }

                reservation.setStatus(Reservation.Status.APPROVED);
                reservation.setApprovedAt(LocalDateTime.now());
                reservation.setReturnDate(returnDate);
                reservation.setApprovedBy(approvedBy);

                reservationRepository.save(reservation);
                return mapToReservationDTO(reservation);
        }

        public ReservationDTO rejectReservation(Long reservationId, Long approvedBy) {
                Reservation reservation = reservationRepository.findById(reservationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

                if (reservation.getStatus() != Reservation.Status.PENDING) {
                        throw new IllegalStateException("Only pending reservations can be rejected");
                }

                reservation.setStatus(Reservation.Status.REJECTED);
                reservation.setApprovedAt(LocalDateTime.now());
                reservation.setApprovedBy(approvedBy);

                reservationRepository.save(reservation);
                return mapToReservationDTO(reservation);
        }

        public ReservationDTO createSingleBookReservation(Long userId, Long bookId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

                Reservation reservation = Reservation.builder()
                                .user(user)
                                .reservationDate(LocalDateTime.now())
                                .status(Reservation.Status.PENDING)
                                .build();

                reservationRepository.save(reservation);
                return mapToReservationDTO(reservation);
        }

        private ReservationDTO mapToReservationDTO(Reservation reservation) {
                // Since we now have direct book relationship, create a single book DTO if book
                // exists
                List<ReservedBookDTO> books = new ArrayList<>();
                if (reservation.getBook() != null) {
                        ReservedBookDTO bookDTO = ReservedBookDTO.builder()
                                        .bookId(reservation.getBook().getId())
                                        .bookTitle(reservation.getBook().getTitle())
                                        .build();
                        books.add(bookDTO);
                }

                return mapToReservationDTO(reservation, books);
        }

        private ReservationDTO mapToReservationDTO(Reservation reservation, List<ReservedBookDTO> books) {
                return ReservationDTO.builder()
                                .id(reservation.getId())
                                .userId(reservation.getUser() != null ? reservation.getUser().getId() : null)
                                .userFullName(reservation.getUser() != null ? reservation.getUser().getFullName()
                                                : null)
                                .bookId(reservation.getBook() != null ? reservation.getBook().getId() : null)
                                .bookTitle(reservation.getBook() != null ? reservation.getBook().getTitle() : null)
                                .bookIsbn(reservation.getBook() != null ? reservation.getBook().getIsbn() : null)
                                .bookHasEbook(reservation.getBook() != null
                                                && reservation.getBook().getHasEbook() != null
                                                                ? reservation.getBook().getHasEbook()
                                                                : false)
                                .reservationDate(reservation.getReservationDate())
                                .approvedAt(reservation.getApprovedAt())
                                .returnDate(reservation.getReturnDate())
                                .approvedBy(reservation.getApprovedBy())
                                .status(reservation.getStatus().name())
                                .books(books)
                                .build();
        }
}
