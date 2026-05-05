package com.andali.librarymanager.library_information_system.reservation;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.andali.librarymanager.library_information_system.user.User;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reservations")
@Tag(name = "Reservations", description = "Reservation management endpoints")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Create a reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> createReservation(
            @Valid @RequestBody ReservationRequest request) {
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

    @PostMapping("/single")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Create reservation for a single book")
    public ResponseEntity<ApiResponse<ReservationDTO>> createSingleBookReservation(
            @RequestParam Long bookId,
            @AuthenticationPrincipal User user) {
        ReservationDTO reservation = reservationService.createSingleBookReservation(user.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.success("Reservation created", reservation));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Approve a reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> approveReservation(
            @PathVariable Long id,
            @RequestParam LocalDate returnDate,
            @AuthenticationPrincipal User user) {
        ReservationDTO reservation = reservationService.approveReservation(id, returnDate, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Reservation approved", reservation));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Reject a reservation")
    public ResponseEntity<ApiResponse<ReservationDTO>> rejectReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        ReservationDTO reservation = reservationService.rejectReservation(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Reservation rejected", reservation));
    }
}
