package com.andali.librarymanager.library_information_system.loan;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@Tag(name = "Loans", description = "Loan management endpoints")
public class LoanController {
    
    @Autowired
    private LoanService loanService;
    
    @PostMapping("/borrow")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Borrow a book")
    public ResponseEntity<ApiResponse<LoanDTO>> borrowBook(@Valid @RequestBody BorrowRequest request) {
        LoanDTO loan = loanService.borrowBook(request);
        return ResponseEntity.ok(ApiResponse.success("Book borrowed successfully", loan));
    }
    
    @PostMapping("/return/{loanId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Return a borrowed book")
    public ResponseEntity<ApiResponse<LoanDTO>> returnBook(@PathVariable Long loanId) {
        LoanDTO loan = loanService.returnBook(loanId);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", loan));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get all loans")
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoanDTO> loans = loanService.getAllLoans(page, size);
        return ResponseEntity.ok(ApiResponse.success("Loans retrieved", loans));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get loans for a user")
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> getUserLoans(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoanDTO> loans = loanService.getUserLoans(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("User loans retrieved", loans));
    }
    
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get overdue loans")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getOverdueLoans() {
        List<LoanDTO> loans = loanService.getOverdueLoans();
        return ResponseEntity.ok(ApiResponse.success("Overdue loans retrieved", loans));
    }
}
