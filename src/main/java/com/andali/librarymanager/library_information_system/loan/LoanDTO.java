package com.andali.librarymanager.library_information_system.loan;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDTO {
    private Long id;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userFullName;
    
    @NotNull(message = "Book ID is required")
    private Long bookId;
    
    private String bookTitle;
    
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String status;
}
