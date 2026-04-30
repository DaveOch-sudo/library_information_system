package com.andali.librarymanager.library_information_system.book;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByStatus(Book.Status status);
    List<Book> findByAuthorId(Long authorId);
    List<Book> findByCategoryId(Long categoryId);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %?1% OR b.description LIKE %?1% OR b.isbn LIKE %?1%")
    List<Book> searchBooks(String query);
}
