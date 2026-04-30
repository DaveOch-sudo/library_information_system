package com.andali.librarymanager.library_information_system.loan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    List<Loan> findByStatus(Loan.Status status);
    
    @Query("SELECT l FROM Loan l WHERE l.status = 'BORROWED' AND l.dueDate < CURRENT_TIMESTAMP")
    List<Loan> findOverdueLoans();
    
    @Query("SELECT l FROM Loan l WHERE l.user.id = ?1 AND l.status = 'BORROWED'")
    List<Loan> findBorrowedBooksByUser(Long userId);
}
