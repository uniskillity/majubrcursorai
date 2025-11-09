# University Books Setup Guide

## Overview

This application now fetches books from Google Books API and filters them to show only university department and semester-specific textbooks.

## Features

✅ **Google Books API Integration**: Fetches books from Google Books API
✅ **Department-Based Filtering**: Books are filtered by university departments
✅ **Semester-Specific Books**: Books can be filtered by semester (1-8)
✅ **Image Display**: All book cards show book cover images
✅ **Auto-Sync**: Manual sync button to fetch books from Google Books API
✅ **Database Storage**: Books are stored in Supabase database with department/semester metadata

## Setup Steps

### 1. Run Database Migration

Run the new migration file to update the database schema:

```sql
-- File: supabase/migrations/20251107000000_setup_university_books.sql
```

This migration:
- Changes `books.id` from UUID to TEXT (to support Google Books API IDs)
- Adds constraints for departments and semesters
- Creates indexes for faster queries
- Removes all non-university books

**To run the migration:**
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `supabase/migrations/20251107000000_setup_university_books.sql`
3. Click "Run"

### 2. Clear Existing Books (Optional)

If you want to remove all existing books and start fresh:

```sql
DELETE FROM public.books WHERE department IS NULL;
```

Or use the function in the code:
```typescript
import { clearNonUniversityBooks } from "@/lib/universityBooks";
await clearNonUniversityBooks();
```

### 3. Sync Books from Google Books API

#### Option A: Using the UI (Recommended)

1. Sign in to the application
2. Select a department from the dropdown (e.g., "BS Computer Science")
3. Optionally select a semester
4. Click the **"Sync Books"** button
5. Wait for books to be fetched and synced to the database

#### Option B: Using Code

```typescript
import { syncBooksToDatabase } from "@/lib/universityBooks";

// Sync books for a specific department
await syncBooksToDatabase("BS Computer Science", 1); // Department, Semester

// Sync books for a department (all semesters)
await syncBooksToDatabase("BS Computer Science");
```

#### Option C: Sync All Departments

```typescript
import { syncAllUniversityBooks } from "@/lib/universityBooks";

// This will sync books for all departments and semesters
// ⚠️ This may take a long time due to API rate limits
await syncAllUniversityBooks();
```

## Department Mappings

The application maps departments to Google Books search subjects:

- **BS Computer Science**: computer science, programming, data structures, algorithms, etc.
- **BS Software Engineering**: software engineering, software development, software design, etc.
- **BS Artificial Intelligence**: AI, machine learning, deep learning, neural networks, etc.
- **BBA**: business administration, management, business strategy, etc.
- **BS FinTech**: financial technology, fintech, banking, finance, etc.
- **BS Business Computing**: business computing, information systems, etc.
- **BS Accounting & Finance**: accounting, finance, financial accounting, etc.
- **BS Biotechnology**: biotechnology, biology, genetics, etc.
- **BS Psychology**: psychology, cognitive psychology, clinical psychology, etc.

## Semester Topics

Books are also filtered by semester-specific topics:

- **Semesters 1-2**: Introduction, fundamentals, basics, beginner
- **Semesters 3-4**: Intermediate, principles, methods
- **Semesters 5-6**: Advanced, specialized, professional
- **Semesters 7-8**: Advanced, specialized, professional, research, thesis

## Book Images

All books fetched from Google Books API include cover images. The BookCard component:
- Displays book cover images
- Falls back to placeholder if image fails to load
- Uses higher quality images (zoom=2)
- Ensures HTTPS URLs

## Filtering

The application automatically filters books to show only:
- Books with a `department` field (university books only)
- Books matching the selected department
- Books matching the selected semester (if specified)

## API Rate Limits

Google Books API has rate limits:
- **Free tier**: 1,000 requests per day
- **Recommended**: Sync books in batches, not all at once
- **Best practice**: Sync one department at a time

## Troubleshooting

### No Books Showing

1. **Check if books are synced**: Select a department and click "Sync Books"
2. **Check database**: Verify books exist in Supabase with `department` field
3. **Check filters**: Make sure department/semester filters are set correctly

### Images Not Loading

1. **Check image URLs**: Verify `cover_url` field in database
2. **Check CORS**: Google Books API images should work without CORS issues
3. **Check placeholder**: If images fail, placeholder should appear

### Sync Fails

1. **Check API limits**: You may have hit Google Books API rate limits
2. **Check network**: Verify internet connection
3. **Check console**: Look for error messages in browser console

### Database Errors

1. **Run migration**: Make sure the migration file has been run
2. **Check constraints**: Verify department and semester values are valid
3. **Check permissions**: Ensure RLS policies allow book insertion

## Manual Book Addition

If you want to add books manually:

```sql
INSERT INTO public.books (
  id, title, author, description, genre, cover_url, 
  department, semester, course_code, rating
) VALUES (
  'google_books_id',
  'Book Title',
  'Author Name',
  'Book description',
  'Genre',
  'https://book-cover-url.com/image.jpg',
  'BS Computer Science',
  1,
  'CS101',
  4.5
);
```

## Next Steps

1. ✅ Run the database migration
2. ✅ Sync books for your department
3. ✅ Verify books appear with images
4. ✅ Test filtering by department and semester
5. ✅ Add more books as needed

## Notes

- Books are fetched from Google Books API, which is free and doesn't require an API key
- Only books with cover images are included
- Books are stored in the database for faster loading
- The sync process can be run multiple times to update books
- Duplicate books are automatically handled (updated if they exist)

