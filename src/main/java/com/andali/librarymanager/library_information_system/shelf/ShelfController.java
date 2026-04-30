package com.andali.librarymanager.library_information_system.shelf;

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
@RequestMapping("/api/shelves")
@Tag(name = "Shelves", description = "Shelf management endpoints")
public class ShelfController {
    
    @Autowired
    private ShelfService shelfService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Create a new shelf")
    public ResponseEntity<ApiResponse<ShelfDTO>> createShelf(@Valid @RequestBody ShelfDTO shelfDTO) {
        ShelfDTO created = shelfService.createShelf(shelfDTO);
        return ResponseEntity.ok(ApiResponse.success("Shelf created", created));
    }
    
    @GetMapping
    @Operation(summary = "Get all shelves")
    public ResponseEntity<ApiResponse<Page<ShelfDTO>>> getAllShelves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ShelfDTO> shelves = shelfService.getAllShelves(page, size);
        return ResponseEntity.ok(ApiResponse.success("Shelves retrieved", shelves));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get shelf by ID")
    public ResponseEntity<ApiResponse<ShelfDTO>> getShelfById(@PathVariable Long id) {
        ShelfDTO shelf = shelfService.getShelfById(id);
        return ResponseEntity.ok(ApiResponse.success("Shelf retrieved", shelf));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Update shelf")
    public ResponseEntity<ApiResponse<ShelfDTO>> updateShelf(@PathVariable Long id, @Valid @RequestBody ShelfDTO shelfDTO) {
        ShelfDTO updated = shelfService.updateShelf(id, shelfDTO);
        return ResponseEntity.ok(ApiResponse.success("Shelf updated", updated));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Delete shelf")
    public ResponseEntity<ApiResponse<String>> deleteShelf(@PathVariable Long id) {
        shelfService.deleteShelf(id);
        return ResponseEntity.ok(ApiResponse.success("Shelf deleted", null));
    }
}
