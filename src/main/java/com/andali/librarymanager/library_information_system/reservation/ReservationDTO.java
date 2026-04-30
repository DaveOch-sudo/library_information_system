package com.andali.librarymanager.library_information_system.reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private LocalDateTime reservationDate;
    private String status;
    private List<ReservedBookDTO> books;
}
