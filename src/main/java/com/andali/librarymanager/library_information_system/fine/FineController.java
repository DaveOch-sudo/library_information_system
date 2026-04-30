package com.andali.librarymanager.library_information_system.fine;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
@Tag(name = "Fines", description = "Fine management endpoints")
public class FineController {
    
    @Autowired
    private FineService fineService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get all fines")
    public ResponseEntity<ApiResponse<Page<FineDTO>>> getAllFines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<FineDTO> fines = fineService.getAllFines(page, size);
        return ResponseEntity.ok(ApiResponse.success("Fines retrieved", fines));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user's fines")
    public ResponseEntity<ApiResponse<Page<FineDTO>>> getUserFines(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<FineDTO> fines = fineService.getUserFines(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("User fines retrieved", fines));
    }
    
    @PutMapping("/pay/{fineId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Mark fine as paid")
    public ResponseEntity<ApiResponse<FineDTO>> payFine(@PathVariable Long fineId) {
        FineDTO fine = fineService.payFine(fineId);
        return ResponseEntity.ok(ApiResponse.success("Fine marked as paid", fine));
    }
    
    @GetMapping("/unpaid")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get unpaid fines")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getUnpaidFines() {
        List<FineDTO> fines = fineService.getUnpaidFines();
        return ResponseEntity.ok(ApiResponse.success("Unpaid fines retrieved", fines));
    }
}
