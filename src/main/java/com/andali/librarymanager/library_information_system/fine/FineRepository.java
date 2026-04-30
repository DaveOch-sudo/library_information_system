package com.andali.librarymanager.library_information_system.fine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByLoanUserId(Long userId);
    List<Fine> findByPaid(Boolean paid);
}
