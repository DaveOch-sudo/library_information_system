-- Fix reservation schema for new direct book relationship
-- This migration handles the transition from junction table to direct foreign key

-- First, drop the old junction table if it exists
DROP TABLE IF EXISTS reserved_books;

-- Add new columns to reservations table if they don't exist
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS book_id BIGINT,
ADD COLUMN IF NOT EXISTS approved_at DATETIME,
ADD COLUMN IF NOT EXISTS return_date DATE,
ADD COLUMN IF NOT EXISTS approved_by BIGINT;

-- Add foreign key constraint for book_id
ALTER TABLE reservations 
ADD CONSTRAINT FK_reservation_book 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reservation_book_id ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_return_date ON reservations(return_date);

-- Update existing reservations to have a valid book_id if possible
-- This is a data migration step - you may need to adjust based on your actual data
UPDATE reservations r 
SET r.book_id = (
    SELECT b.id 
    FROM books b 
    LIMIT 1
) 
WHERE r.book_id IS NULL;

-- Add new columns to books table for EBook functionality
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS pdf_file_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_ebook BOOLEAN DEFAULT FALSE;

-- Create uploads directory for PDF storage
-- Note: This needs to be done manually or via application startup
