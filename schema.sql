-- SQL Schema for Library Information Management System

CREATE DATABASE IF NOT EXISTS lims_db;
USE lims_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'LIBRARIAN', 'STUDENT') NOT NULL,
    contact VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authors Table
CREATE TABLE IF NOT EXISTS authors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Shelves Table
CREATE TABLE IF NOT EXISTS shelves (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    quantity INT NOT NULL,
    available_copies INT NOT NULL,
    status ENUM('AVAILABLE', 'BORROWED', 'OUT_OF_STOCK') NOT NULL,
    author_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    shelf_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id)
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    borrow_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status ENUM('BORROWED', 'RETURNED', 'OVERDUE') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reservation_date TIMESTAMP NOT NULL,
    status ENUM('PENDING', 'FULFILLED', 'CANCELLED') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reserved Books Table
CREATE TABLE IF NOT EXISTS reserved_books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_shelf ON books(shelf_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_book ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reserved_books_reservation ON reserved_books(reservation_id);
CREATE INDEX idx_reserved_books_book ON reserved_books(book_id);
CREATE INDEX idx_fines_loan ON fines(loan_id);
