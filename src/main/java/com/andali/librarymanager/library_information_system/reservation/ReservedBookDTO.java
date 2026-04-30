package com.andali.librarymanager.library_information_system.reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservedBookDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
}
