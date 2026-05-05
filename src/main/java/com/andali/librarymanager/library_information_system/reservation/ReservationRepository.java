package com.andali.librarymanager.library_information_system.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByStatus(Reservation.Status status);

    List<Reservation> findByUserIdAndBookId(Long userId, Long bookId);

    List<Reservation> findByStatusAndReturnDateBefore(Reservation.Status status, LocalDate date);
}
