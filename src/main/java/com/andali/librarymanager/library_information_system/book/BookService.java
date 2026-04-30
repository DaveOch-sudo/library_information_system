package com.andali.librarymanager.library_information_system.book;

import com.andali.librarymanager.library_information_system.author.Author;
import com.andali.librarymanager.library_information_system.author.AuthorRepository;
import com.andali.librarymanager.library_information_system.category.Category;
import com.andali.librarymanager.library_information_system.category.CategoryRepository;
import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import com.andali.librarymanager.library_information_system.shelf.Shelf;
import com.andali.librarymanager.library_information_system.shelf.ShelfRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private AuthorRepository authorRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ShelfRepository shelfRepository;
    
    public BookDTO createBook(BookDTO bookDTO) {
        Author author = authorRepository.findById(bookDTO.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        
        Category category = categoryRepository.findById(bookDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        Shelf shelf = shelfRepository.findById(bookDTO.getShelfId())
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        
        Book book = Book.builder()
                .isbn(bookDTO.getIsbn())
                .title(bookDTO.getTitle())
                .description(bookDTO.getDescription())
                .quantity(bookDTO.getQuantity())
                .availableCopies(bookDTO.getAvailableCopies())
                .status(Book.Status.AVAILABLE)
                .author(author)
                .category(category)
                .shelf(shelf)
                .build();
        
        bookRepository.save(book);
        return mapToBookDTO(book);
    }
    
    public Page<BookDTO> getAllBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.findAll(pageable).map(this::mapToBookDTO);
    }
    
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        return mapToBookDTO(book);
    }
    
    public BookDTO updateBook(Long id, BookDTO bookDTO) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        if (bookDTO.getTitle() != null) book.setTitle(bookDTO.getTitle());
        if (bookDTO.getDescription() != null) book.setDescription(bookDTO.getDescription());
        if (bookDTO.getQuantity() != null) book.setQuantity(bookDTO.getQuantity());
        if (bookDTO.getAvailableCopies() != null) book.setAvailableCopies(bookDTO.getAvailableCopies());
        
        bookRepository.save(book);
        return mapToBookDTO(book);
    }
    
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        bookRepository.delete(book);
    }
    
    public List<BookDTO> searchBooks(String query) {
        return bookRepository.searchBooks(query).stream()
                .map(this::mapToBookDTO)
                .toList();
    }
    
    public Page<BookDTO> filterBooks(Long categoryId, Long authorId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<BookDTO> filtered = bookRepository.findAll().stream()
                .filter(b -> categoryId == null || b.getCategory().getId().equals(categoryId))
                .filter(b -> authorId == null || b.getAuthor().getId().equals(authorId))
                .filter(b -> status == null || b.getStatus().name().equals(status))
                .map(this::mapToBookDTO)
                .toList();

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }
    
    private BookDTO mapToBookDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .description(book.getDescription())
                .quantity(book.getQuantity())
                .availableCopies(book.getAvailableCopies())
                .status(book.getStatus().name())
                .authorId(book.getAuthor().getId())
                .authorName(book.getAuthor().getName())
                .categoryId(book.getCategory().getId())
                .categoryName(book.getCategory().getName())
                .shelfId(book.getShelf().getId())
                .shelfLocationCode(book.getShelf().getLocationCode())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}
