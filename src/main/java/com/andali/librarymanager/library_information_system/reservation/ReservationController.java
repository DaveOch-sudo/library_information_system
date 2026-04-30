package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@Tag(name = "Reservations", description = "Reservation management endpoints")
public class ReservationController {
    
    @Autowired
    private ReservationService reservationService;
    
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Create a reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> createReservation(@Valid @RequestBody ReservationRequest request) {
        ReservationDTO reservation = reservationService.createReservation(request);
        return ResponseEntity.ok(ApiResponse.success("Reservation created", reservation));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Get all reservations")
    public ResponseEntity<ApiResponse<Page<ReservationDTO>>> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReservationDTO> reservations = reservationService.getAllReservations(page, size);
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved", reservations));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user's reservations")
    public ResponseEntity<ApiResponse<Page<ReservationDTO>>> getUserReservations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReservationDTO> reservations = reservationService.getUserReservations(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("User reservations retrieved", reservations));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<String>> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", null));
    }
}
