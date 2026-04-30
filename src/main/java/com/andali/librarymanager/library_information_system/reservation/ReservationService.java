package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookRepository;
import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import com.andali.librarymanager.library_information_system.user.User;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        return reservationRepository.findByUserId(userId).stream()
                .map(this::mapToReservationDTO)
                .collect(java.util.stream.Collectors.toList())
                .stream()
                .skip((long) page * size)
                .limit(size)
                .collect(() -> new org.springframework.data.domain.PageImpl<>(
                        new java.util.ArrayList<>(),
                        pageable,
                        reservationRepository.findByUserId(userId).size()),
                (c, b) -> c.get().add(b),
                (c1, c2) -> c1.get().addAll(c2.get()));
    }
    
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservation.setStatus(Reservation.Status.CANCELLED);
        reservationRepository.save(reservation);
    }
    
    private ReservationDTO mapToReservationDTO(Reservation reservation) {
        List<ReservedBook> reservedBooks = reservedBookRepository.findByReservationId(reservation.getId());
        List<ReservedBookDTO> books = reservedBooks.stream()
                .map(rb -> ReservedBookDTO.builder()
                        .id(rb.getId())
                        .bookId(rb.getBook().getId())
                        .bookTitle(rb.getBook().getTitle())
                        .build())
                .toList();
        
        return mapToReservationDTO(reservation, books);
    }
    
    private ReservationDTO mapToReservationDTO(Reservation reservation, List<ReservedBookDTO> books) {
        return ReservationDTO.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userFullName(reservation.getUser().getFullName())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus().name())
                .books(books)
                .build();
    }
}
