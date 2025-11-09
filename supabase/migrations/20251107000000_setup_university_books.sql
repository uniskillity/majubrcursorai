-- Migration: Setup for University Books from Google Books API
-- This migration updates the books table to work with Google Books API

-- Change books.id from UUID to TEXT to support Google Books API IDs
-- First, drop foreign key constraints that reference books.id
ALTER TABLE public.reading_history 
  DROP CONSTRAINT IF EXISTS reading_history_book_id_fkey;

ALTER TABLE public.recommendations 
  DROP CONSTRAINT IF EXISTS recommendations_book_id_fkey;

ALTER TABLE public.feedback 
  DROP CONSTRAINT IF EXISTS feedback_book_id_fkey;

ALTER TABLE public.book_categories 
  DROP CONSTRAINT IF EXISTS book_categories_book_id_fkey;

ALTER TABLE public.book_issues 
  DROP CONSTRAINT IF EXISTS book_issues_book_id_fkey;

-- Create new books table with TEXT id
CREATE TABLE IF NOT EXISTS public.books_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  cover_url TEXT,
  published_year INTEGER,
  isbn TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  department TEXT,
  semester INTEGER,
  course_code TEXT,
  pdf_url TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Copy data from old table to new table (if any exists)
INSERT INTO public.books_new (
  id, title, author, description, genre, cover_url, published_year, isbn, rating,
  department, semester, course_code, pdf_url, total_copies, available_copies, created_at, updated_at
)
SELECT 
  COALESCE(id::text, gen_random_uuid()::text),
  title,
  author,
  description,
  genre,
  cover_url,
  published_year,
  isbn,
  rating,
  department,
  semester,
  course_code,
  pdf_url,
  COALESCE(total_copies, 1),
  COALESCE(available_copies, 1),
  created_at,
  updated_at
FROM public.books
ON CONFLICT (id) DO NOTHING;

-- Drop old table
DROP TABLE IF EXISTS public.books CASCADE;

-- Rename new table to books
ALTER TABLE public.books_new RENAME TO books;

-- Recreate foreign key constraints
ALTER TABLE public.reading_history 
  ADD CONSTRAINT reading_history_book_id_fkey 
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

ALTER TABLE public.recommendations 
  ADD CONSTRAINT recommendations_book_id_fkey 
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

ALTER TABLE public.feedback 
  ADD CONSTRAINT feedback_book_id_fkey 
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

ALTER TABLE public.book_categories 
  ADD CONSTRAINT book_categories_book_id_fkey 
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

ALTER TABLE public.book_issues 
  ADD CONSTRAINT book_issues_book_id_fkey 
  FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

-- Add constraint to ensure department is from valid list
ALTER TABLE public.books 
  ADD CONSTRAINT books_department_check 
  CHECK (
    department IS NULL OR 
    department IN (
      'BS Computer Science',
      'BS Software Engineering',
      'BS Artificial Intelligence',
      'BBA',
      'BS FinTech',
      'BS Business Computing',
      'BS Accounting & Finance',
      'BS Biotechnology',
      'BS Psychology'
    )
  );

-- Add constraint to ensure semester is between 1 and 8
ALTER TABLE public.books 
  ADD CONSTRAINT books_semester_check 
  CHECK (semester IS NULL OR (semester >= 1 AND semester <= 8));

-- Create index on department and semester for faster queries
CREATE INDEX IF NOT EXISTS idx_books_department ON public.books(department);
CREATE INDEX IF NOT EXISTS idx_books_semester ON public.books(semester);
CREATE INDEX IF NOT EXISTS idx_books_department_semester ON public.books(department, semester);

-- Update RLS policies
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books are publicly readable
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" 
  ON public.books FOR SELECT 
  USING (true);

-- Only admins and staff can insert/update/delete books
DROP POLICY IF EXISTS "Admins and staff can insert books" ON public.books;
CREATE POLICY "Admins and staff can insert books" 
  ON public.books FOR INSERT 
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins and staff can update books" ON public.books;
CREATE POLICY "Admins and staff can update books" 
  ON public.books FOR UPDATE 
  USING (public.is_admin_or_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins and staff can delete books" ON public.books;
CREATE POLICY "Admins and staff can delete books" 
  ON public.books FOR DELETE 
  USING (public.is_admin_or_staff(auth.uid()));

-- Delete all non-university books (books without department)
DELETE FROM public.books WHERE department IS NULL;

