-- Simple database fix script for MySQL
-- Run this script directly in MySQL to fix the schema issues

-- 1. Drop the old junction table if it exists
DROP TABLE IF EXISTS reserved_books;

-- 2. Remove any existing foreign key constraints on reservations table
SET FOREIGN_KEY_CHECKS = 0;

-- 3. Add new columns to reservations table (without IF NOT EXISTS)
ALTER TABLE reservations ADD COLUMN book_id BIGINT;
ALTER TABLE reservations ADD COLUMN approved_at DATETIME;
ALTER TABLE reservations ADD COLUMN return_date DATE;
ALTER TABLE reservations ADD COLUMN approved_by BIGINT;

-- 4. Add new columns to books table for EBook functionality
ALTER TABLE books ADD COLUMN pdf_file_path VARCHAR(255);
ALTER TABLE books ADD COLUMN has_ebook BOOLEAN DEFAULT FALSE;

-- 5. Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 6. Add foreign key constraint for book_id
ALTER TABLE reservations ADD CONSTRAINT FK_reservation_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL;

-- 7. Create indexes for better performance
CREATE INDEX idx_reservation_book_id ON reservations(book_id);
CREATE INDEX idx_reservation_status ON reservations(status);
CREATE INDEX idx_reservation_return_date ON reservations(return_date);

SELECT 'Database schema fixed successfully!' as message;
