package com.andali.librarymanager.library_information_system.config;

import com.andali.librarymanager.library_information_system.author.Author;
import com.andali.librarymanager.library_information_system.author.AuthorRepository;
import com.andali.librarymanager.library_information_system.book.Book;
import com.andali.librarymanager.library_information_system.book.BookRepository;
import com.andali.librarymanager.library_information_system.category.Category;
import com.andali.librarymanager.library_information_system.category.CategoryRepository;
import com.andali.librarymanager.library_information_system.shelf.Shelf;
import com.andali.librarymanager.library_information_system.shelf.ShelfRepository;
import com.andali.librarymanager.library_information_system.user.User;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    public CommandLineRunner initializeData(UserRepository userRepository,
                                           AuthorRepository authorRepository,
                                           CategoryRepository categoryRepository,
                                           ShelfRepository shelfRepository,
                                           BookRepository bookRepository) {
        return args -> {
            // Initialize Users
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .fullName("Admin User")
                        .email("admin@library.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(User.Role.ADMIN)
                        .contact("+1234567890")
                        .build();
                
                User librarian = User.builder()
                        .fullName("John Librarian")
                        .email("librarian@library.com")
                        .password(passwordEncoder.encode("librarian123"))
                        .role(User.Role.LIBRARIAN)
                        .contact("+1234567891")
                        .build();
                
                User student1 = User.builder()
                        .fullName("Alice Student")
                        .email("alice@library.com")
                        .password(passwordEncoder.encode("student123"))
                        .role(User.Role.STUDENT)
                        .contact("+1234567892")
                        .build();
                
                User student2 = User.builder()
                        .fullName("Bob Student")
                        .email("bob@library.com")
                        .password(passwordEncoder.encode("student123"))
                        .role(User.Role.STUDENT)
                        .contact("+1234567893")
                        .build();
                
                userRepository.save(admin);
                userRepository.save(librarian);
                userRepository.save(student1);
                userRepository.save(student2);
            }
            
            // Initialize Authors
            if (authorRepository.count() == 0) {
                Author author1 = Author.builder().name("George R. R. Martin").build();
                Author author2 = Author.builder().name("J.K. Rowling").build();
                Author author3 = Author.builder().name("Stephen King").build();
                Author author4 = Author.builder().name("Haruki Murakami").build();
                
                authorRepository.save(author1);
                authorRepository.save(author2);
                authorRepository.save(author3);
                authorRepository.save(author4);
            }
            
            // Initialize Categories
            if (categoryRepository.count() == 0) {
                Category fiction = Category.builder().name("Fiction").build();
                Category fantasy = Category.builder().name("Fantasy").build();
                Category mystery = Category.builder().name("Mystery").build();
                Category scienceFiction = Category.builder().name("Science Fiction").build();
                
                categoryRepository.save(fiction);
                categoryRepository.save(fantasy);
                categoryRepository.save(mystery);
                categoryRepository.save(scienceFiction);
            }
            
            // Initialize Shelves
            if (shelfRepository.count() == 0) {
                Shelf shelf1 = Shelf.builder().locationCode("A1").description("Fiction Section").build();
                Shelf shelf2 = Shelf.builder().locationCode("B1").description("Fantasy Section").build();
                Shelf shelf3 = Shelf.builder().locationCode("C1").description("Mystery Section").build();
                Shelf shelf4 = Shelf.builder().locationCode("D1").description("Science Fiction Section").build();
                
                shelfRepository.save(shelf1);
                shelfRepository.save(shelf2);
                shelfRepository.save(shelf3);
                shelfRepository.save(shelf4);
            }
            
            // Initialize Books
            if (bookRepository.count() == 0) {
                Author author1 = authorRepository.findAll().get(0);
                Author author2 = authorRepository.findAll().get(1);
                Author author3 = authorRepository.findAll().get(2);
                
                Category fantasy = categoryRepository.findAll().get(1);
                Category fiction = categoryRepository.findAll().get(0);
                Category mystery = categoryRepository.findAll().get(2);
                
                Shelf shelf1 = shelfRepository.findAll().get(0);
                Shelf shelf2 = shelfRepository.findAll().get(1);
                Shelf shelf3 = shelfRepository.findAll().get(2);
                
                Book book1 = Book.builder()
                        .isbn("978-0553103564")
                        .title("A Game of Thrones")
                        .description("The first novel in A Song of Ice and Fire by George R. R. Martin")
                        .quantity(5)
                        .availableCopies(5)
                        .status(Book.Status.AVAILABLE)
                        .author(author1)
                        .category(fantasy)
                        .shelf(shelf1)
                        .build();
                
                Book book2 = Book.builder()
                        .isbn("978-0439708180")
                        .title("Harry Potter and the Philosopher's Stone")
                        .description("The first Harry Potter book by J.K. Rowling")
                        .quantity(8)
                        .availableCopies(3)
                        .status(Book.Status.BORROWED)
                        .author(author2)
                        .category(fantasy)
                        .shelf(shelf2)
                        .build();
                
                Book book3 = Book.builder()
                        .isbn("978-0451524935")
                        .title("The Shining")
                        .description("A horror novel by Stephen King")
                        .quantity(3)
                        .availableCopies(1)
                        .status(Book.Status.BORROWED)
                        .author(author3)
                        .category(mystery)
                        .shelf(shelf3)
                        .build();
                
                Book book4 = Book.builder()
                        .isbn("978-0091920204")
                        .title("Norwegian Wood")
                        .description("A novel by Haruki Murakami")
                        .quantity(4)
                        .availableCopies(4)
                        .status(Book.Status.AVAILABLE)
                        .author(authorRepository.findAll().get(3))
                        .category(fiction)
                        .shelf(shelf1)
                        .build();
                
                bookRepository.save(book1);
                bookRepository.save(book2);
                bookRepository.save(book3);
                bookRepository.save(book4);
            }
        };
    }
}
