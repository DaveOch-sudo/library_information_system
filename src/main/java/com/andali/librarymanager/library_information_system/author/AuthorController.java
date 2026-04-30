package com.andali.librarymanager.library_information_system.author;

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
@RequestMapping("/api/authors")
@Tag(name = "Authors", description = "Author management endpoints")
public class AuthorController {
    
    @Autowired
    private AuthorService authorService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Create a new author")
    public ResponseEntity<ApiResponse<AuthorDTO>> createAuthor(@Valid @RequestBody AuthorDTO authorDTO) {
        AuthorDTO created = authorService.createAuthor(authorDTO);
        return ResponseEntity.ok(ApiResponse.success("Author created", created));
    }
    
    @GetMapping
    @Operation(summary = "Get all authors")
    public ResponseEntity<ApiResponse<Page<AuthorDTO>>> getAllAuthors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AuthorDTO> authors = authorService.getAllAuthors(page, size);
        return ResponseEntity.ok(ApiResponse.success("Authors retrieved", authors));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get author by ID")
    public ResponseEntity<ApiResponse<AuthorDTO>> getAuthorById(@PathVariable Long id) {
        AuthorDTO author = authorService.getAuthorById(id);
        return ResponseEntity.ok(ApiResponse.success("Author retrieved", author));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Update author")
    public ResponseEntity<ApiResponse<AuthorDTO>> updateAuthor(@PathVariable Long id, @Valid @RequestBody AuthorDTO authorDTO) {
        AuthorDTO updated = authorService.updateAuthor(id, authorDTO);
        return ResponseEntity.ok(ApiResponse.success("Author updated", updated));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Delete author")
    public ResponseEntity<ApiResponse<String>> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ResponseEntity.ok(ApiResponse.success("Author deleted", null));
    }
}
