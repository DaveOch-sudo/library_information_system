package com.andali.librarymanager.library_information_system.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private Long totalBooks;
    private Long borrowedBooks;
    private Long availableBooks;
    private Long overdueBooks;
    private Long totalUsers;
    private Long totalFines;
}
