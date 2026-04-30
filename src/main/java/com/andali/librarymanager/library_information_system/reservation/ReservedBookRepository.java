package com.andali.librarymanager.library_information_system.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservedBookRepository extends JpaRepository<ReservedBook, Long> {
    List<ReservedBook> findByReservationId(Long reservationId);
}
