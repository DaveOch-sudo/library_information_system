package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private LocalDateTime reservationDate;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED,
        FULFILLED,
        CANCELLED,
        OVERDUE
    }
}
