package com.andali.librarymanager.library_information_system.loan;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookRepository;
import com.andali.librarymanager.library_information_system.exception.BookNotAvailableException;
import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import com.andali.librarymanager.library_information_system.fine.Fine;
import com.andali.librarymanager.library_information_system.fine.FineRepository;
import com.andali.librarymanager.library_information_system.user.User;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {
    
    @Autowired
    private LoanRepository loanRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    private static final int BORROW_DAYS = 14;
    private static final double FINE_PER_DAY = 1000;
    
    public LoanDTO borrowBook(BorrowRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        if (book.getAvailableCopies() <= 0) {
            throw new BookNotAvailableException("Book not available for borrowing");
        }
        
        LocalDateTime borrowDate = LocalDateTime.now();
        LocalDateTime dueDate = borrowDate.plusDays(BORROW_DAYS);
        
        Loan loan = Loan.builder()
                .user(user)
                .book(book)
                .borrowDate(borrowDate)
                .dueDate(dueDate)
                .status(Loan.Status.BORROWED)
                .build();
        
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus(Book.Status.OUT_OF_STOCK);
        } else {
            book.setStatus(Book.Status.BORROWED);
        }
        bookRepository.save(book);
        
        loanRepository.save(loan);
        return mapToLoanDTO(loan);
    }
    
    public LoanDTO returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        
        if (!loan.getStatus().equals(Loan.Status.BORROWED)) {
            throw new IllegalArgumentException("Book is already returned");
        }
        
        LocalDateTime returnDate = LocalDateTime.now();
        loan.setReturnDate(returnDate);
        loan.setStatus(Loan.Status.RETURNED);
        
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        if (book.getAvailableCopies() > 0) {
            book.setStatus(Book.Status.AVAILABLE);
        }
        bookRepository.save(book);
        
        // Check for overdue and create fine
        if (returnDate.isAfter(loan.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(loan.getDueDate(), returnDate);
            double fineAmount = overdueDays * FINE_PER_DAY;
            
            Fine fine = Fine.builder()
                    .loan(loan)
                    .amount(fineAmount)
                    .paid(false)
                    .build();
            fineRepository.save(fine);
            
            loan.setStatus(Loan.Status.OVERDUE);
        }
        
        loanRepository.save(loan);
        return mapToLoanDTO(loan);
    }
    
    public Page<LoanDTO> getAllLoans(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return loanRepository.findAll(pageable).map(this::mapToLoanDTO);
    }
    
    public Page<LoanDTO> getUserLoans(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return loanRepository.findByUserId(userId).stream()
                .map(this::mapToLoanDTO)
                .collect(java.util.stream.Collectors.toList())
                .stream()
                .skip((long) page * size)
                .limit(size)
                .collect(() -> new org.springframework.data.domain.PageImpl<>(
                        new java.util.ArrayList<>(),
                        pageable,
                        loanRepository.findByUserId(userId).size()),
                (c, b) -> c.get().add(b),
                (c1, c2) -> c1.get().addAll(c2.get()));
    }
    
    public List<LoanDTO> getOverdueLoans() {
        return loanRepository.findOverdueLoans().stream()
                .map(this::mapToLoanDTO)
                .toList();
    }
    
    private LoanDTO mapToLoanDTO(Loan loan) {
        return LoanDTO.builder()
                .id(loan.getId())
                .userId(loan.getUser().getId())
                .userFullName(loan.getUser().getFullName())
                .bookId(loan.getBook().getId())
                .bookTitle(loan.getBook().getTitle())
                .borrowDate(loan.getBorrowDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .status(loan.getStatus().name())
                .build();
    }
}
