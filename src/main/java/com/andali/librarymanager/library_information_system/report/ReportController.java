package com.andali.librarymanager.library_information_system.report;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import com.andali.librarymanager.library_information_system.loan.LoanDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Report endpoints")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard() {
        DashboardDTO dashboard = reportService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboard));
    }
    
    @GetMapping("/borrowed-books")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get borrowed books report")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getBorrowedBooks() {
        List<LoanDTO> books = reportService.getBorrowedBooks();
        return ResponseEntity.ok(ApiResponse.success("Borrowed books retrieved", books));
    }
    
    @GetMapping("/overdue-books")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get overdue books report")
    public ResponseEntity<ApiResponse<List<LoanDTO>>> getOverdueBooks() {
        List<LoanDTO> books = reportService.getOverdueBooks();
        return ResponseEntity.ok(ApiResponse.success("Overdue books retrieved", books));
    }
    
    @GetMapping("/user-activity/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get user activity report")
    public ResponseEntity<ApiResponse<DashboardDTO>> getUserActivity(@PathVariable Long userId) {
        DashboardDTO activity = reportService.getUserActivity(userId);
        return ResponseEntity.ok(ApiResponse.success("User activity retrieved", activity));
    }
}
