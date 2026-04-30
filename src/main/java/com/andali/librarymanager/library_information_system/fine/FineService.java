package com.andali.librarymanager.library_information_system.fine;

import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FineService {
    
    @Autowired
    private FineRepository fineRepository;
    
    public Page<FineDTO> getAllFines(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return fineRepository.findAll(pageable).map(this::mapToFineDTO);
    }
    
    public Page<FineDTO> getUserFines(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return fineRepository.findByLoanUserId(userId).stream()
                .map(this::mapToFineDTO)
                .collect(java.util.stream.Collectors.toList())
                .stream()
                .skip((long) page * size)
                .limit(size)
                .collect(() -> new org.springframework.data.domain.PageImpl<>(
                        new java.util.ArrayList<>(),
                        pageable,
                        fineRepository.findByLoanUserId(userId).size()),
                (c, b) -> c.get().add(b),
                (c1, c2) -> c1.get().addAll(c2.get()));
    }
    
    public FineDTO payFine(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found"));
        fine.setPaid(true);
        fineRepository.save(fine);
        return mapToFineDTO(fine);
    }
    
    public List<FineDTO> getUnpaidFines() {
        return fineRepository.findByPaid(false).stream()
                .map(this::mapToFineDTO)
                .toList();
    }
    
    private FineDTO mapToFineDTO(Fine fine) {
        return FineDTO.builder()
                .id(fine.getId())
                .loanId(fine.getLoan().getId())
                .userId(fine.getLoan().getUser().getId())
                .userFullName(fine.getLoan().getUser().getFullName())
                .bookTitle(fine.getLoan().getBook().getTitle())
                .amount(fine.getAmount())
                .paid(fine.getPaid())
                .createdAt(fine.getCreatedAt())
                .build();
    }
}
