package com.andali.librarymanager.library_information_system.scheduler;

import com.andali.librarymanager.library_information_system.reservation.Reservation;
import com.andali.librarymanager.library_information_system.reservation.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class OverdueReservationScheduler {

    @Autowired
    private ReservationRepository reservationRepository;

    @Scheduled(cron = "0 0 1 * * ?") // Run every day at 1 AM
    @Transactional
    public void updateOverdueReservations() {
        LocalDate today = LocalDate.now();
        
        // Find all approved reservations with return dates that have passed
        List<Reservation> overdueReservations = reservationRepository
                .findByStatusAndReturnDateBefore(Reservation.Status.APPROVED, today);
        
        // Update their status to OVERDUE
        for (Reservation reservation : overdueReservations) {
            reservation.setStatus(Reservation.Status.OVERDUE);
            reservationRepository.save(reservation);
        }
    }
}
