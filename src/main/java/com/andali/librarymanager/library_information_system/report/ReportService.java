package com.andali.librarymanager.library_information_system.report;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookRepository;
import com.andali.librarymanager.library_information_system.fine.FineRepository;
import com.andali.librarymanager.library_information_system.loan.Loan;
import com.andali.librarymanager.library_information_system.loan.LoanDTO;
import com.andali.librarymanager.library_information_system.loan.LoanRepository;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private LoanRepository loanRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    public DashboardDTO getDashboard() {
        long totalBooks = bookRepository.count();
        long borrowedBooks = bookRepository.findByStatus(Book.Status.BORROWED).size();
        long availableBooks = bookRepository.findByStatus(Book.Status.AVAILABLE).size();
        long overdueBooks = loanRepository.findOverdueLoans().size();
        long totalUsers = userRepository.count();
        long totalFines = fineRepository.count();
        
        return DashboardDTO.builder()
                .totalBooks(totalBooks)
                .borrowedBooks(borrowedBooks)
                .availableBooks(availableBooks)
                .overdueBooks(overdueBooks)
                .totalUsers(totalUsers)
                .totalFines(totalFines)
                .build();
    }
    
    public List<LoanDTO> getBorrowedBooks() {
        return loanRepository.findByStatus(Loan.Status.BORROWED).stream()
                .map(this::mapToLoanDTO)
                .toList();
    }
    
    public List<LoanDTO> getOverdueBooks() {
        return loanRepository.findOverdueLoans().stream()
                .map(this::mapToLoanDTO)
                .toList();
    }
    
    public DashboardDTO getUserActivity(Long userId) {
        List<Loan> userLoans = loanRepository.findByUserId(userId);
        
        long borrowedCount = userLoans.stream()
                .filter(l -> l.getStatus().equals(Loan.Status.BORROWED))
                .count();
        
        long overdueCount = userLoans.stream()
                .filter(l -> l.getStatus().equals(Loan.Status.OVERDUE))
                .count();
        
        long returnedCount = userLoans.stream()
                .filter(l -> l.getStatus().equals(Loan.Status.RETURNED))
                .count();
        
        return DashboardDTO.builder()
                .borrowedBooks(borrowedCount)
                .overdueBooks(overdueCount)
                .totalBooks(returnedCount)
                .build();
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
