-- Manual database fix script
-- Run this script directly in MySQL to fix the schema issues

-- Connect to your database first: mysql -u root -p lims_db

-- 1. Drop the old junction table if it exists
DROP TABLE IF EXISTS reserved_books;

-- 2. Remove any existing foreign key constraints on reservations table
SET FOREIGN_KEY_CHECKS = 0;

-- 3. Add new columns to reservations table
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS book_id BIGINT,
ADD COLUMN IF NOT EXISTS approved_at DATETIME,
ADD COLUMN IF NOT EXISTS return_date DATE,
ADD COLUMN IF NOT EXISTS approved_by BIGINT;

-- 4. Add new columns to books table for EBook functionality
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS pdf_file_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_ebook BOOLEAN DEFAULT FALSE;

-- 5. Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 6. Add foreign key constraint for book_id (only if there are no conflicting records)
ALTER TABLE reservations 
ADD CONSTRAINT FK_reservation_book 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservation_book_id ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_return_date ON reservations(return_date);

-- 8. Update existing reservations to have a valid book_id (optional - adjust as needed)
-- This is just a placeholder - you may want to update based on your actual data
-- UPDATE reservations r SET r.book_id = 1 WHERE r.book_id IS NULL;

-- 9. Create uploads directory for PDF storage (run this in terminal)
-- mkdir -p /Users/ochwodavidjr/VS-code/LIMS/library_information_system/uploads/pdfs

SELECT 'Database schema fixed successfully!' as message;
