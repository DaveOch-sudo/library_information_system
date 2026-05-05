package com.andali.librarymanager.library_information_system.pdf;

import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookService;
import com.andali.librarymanager.library_information_system.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PdfController {

    private final BookService bookService;
    private final String UPLOAD_DIR = "uploads/pdfs";

    @PostMapping("/upload/{bookId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Upload PDF for a book")
    public ResponseEntity<String> uploadPdf(
            @PathVariable Long bookId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            // Validate file type
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed");
            }

            // Check if book exists
            Book book = bookService.getBookEntityById(bookId);
            if (book == null) {
                return ResponseEntity.notFound().build();
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update book with PDF path
            book.setPdfFilePath(fileName);
            book.setHasEbook(true);
            bookService.save(book);

            return ResponseEntity.ok("PDF uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload PDF: " + e.getMessage());
        }
    }

    @GetMapping("/view/{bookId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN') or (hasRole('STUDENT') and @bookService.canUserAccessBook(#bookId, authentication.principal.id))")
    @Operation(summary = "View PDF for a book")
    public ResponseEntity<Resource> viewPdf(@PathVariable Long bookId) {
        try {
            Book book = bookService.getBookEntityById(bookId);
            if (book == null || book.getPdfFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(UPLOAD_DIR).resolve(book.getPdfFilePath());
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + book.getTitle() + ".pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{bookId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN') or (hasRole('STUDENT') and @bookService.canUserAccessBook(#bookId, authentication.principal.id))")
    @Operation(summary = "Download PDF for a book")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long bookId) {
        try {
            Book book = bookService.getBookEntityById(bookId);
            if (book == null || book.getPdfFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(UPLOAD_DIR).resolve(book.getPdfFilePath());
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + book.getTitle() + ".pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    @Operation(summary = "Delete PDF for a book")
    public ResponseEntity<String> deletePdf(@PathVariable Long bookId) {
        try {
            Book book = bookService.getBookEntityById(bookId);
            if (book == null || book.getPdfFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete file
            Path filePath = Paths.get(UPLOAD_DIR).resolve(book.getPdfFilePath());
            Files.deleteIfExists(filePath);

            // Update book
            book.setPdfFilePath(null);
            book.setHasEbook(false);
            bookService.save(book);

            return ResponseEntity.ok("PDF deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete PDF: " + e.getMessage());
        }
    }
}
