package com.andali.librarymanager.library_information_system.fine;

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
public class FineDTO {
    private Long id;
    
    @NotNull(message = "Loan ID is required")
    private Long loanId;
    
    private Long userId;
    private String userFullName;
    private String bookTitle;
    
    private Double amount;
    private Boolean paid;
    private LocalDateTime createdAt;
}
