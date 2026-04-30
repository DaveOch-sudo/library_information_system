package com.andali.librarymanager.library_information_system.exception;

import com.andali.librarymanager.library_information_system.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(ResourceNotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error(e.getMessage()), NOT_FOUND);
    }
    
    @ExceptionHandler(BookNotAvailableException.class)
    public ResponseEntity<ApiResponse<Object>> handleBookNotAvailableException(BookNotAvailableException e) {
        return new ResponseEntity<>(ApiResponse.error(e.getMessage()), BAD_REQUEST);
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateResourceException(DuplicateResourceException e) {
        return new ResponseEntity<>(ApiResponse.error(e.getMessage()), CONFLICT);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");
        return new ResponseEntity<>(ApiResponse.error(message), BAD_REQUEST);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException e) {
        return new ResponseEntity<>(ApiResponse.error("Access denied"), FORBIDDEN);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception e) {
        return new ResponseEntity<>(ApiResponse.error("An error occurred: " + e.getMessage()), INTERNAL_SERVER_ERROR);
    }
}
