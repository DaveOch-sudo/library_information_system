package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime reservationDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    public enum Status {
        PENDING,
        FULFILLED,
        CANCELLED
    }
}
