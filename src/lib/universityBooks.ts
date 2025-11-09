import { searchBooks, getBooksByCategory } from "./googleBooks";
import type { GoogleBook } from "./googleBooks";
import { supabase } from "@/integrations/supabase/client";

// Re-export GoogleBook for use in other files
export type { GoogleBook };

// University department to book subject mapping
const DEPARTMENT_SUBJECTS: Record<string, string[]> = {
  "BS Computer Science": [
    "computer science",
    "programming",
    "data structures",
    "algorithms",
    "software engineering",
    "database systems",
    "operating systems",
    "computer networks",
    "artificial intelligence",
  ],
  "BS Software Engineering": [
    "software engineering",
    "software development",
    "software design",
    "software architecture",
    "software testing",
    "agile methodology",
    "programming",
  ],
  "BS Artificial Intelligence": [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "neural networks",
    "data science",
    "natural language processing",
    "computer vision",
  ],
  "BBA": [
    "business administration",
    "management",
    "business strategy",
    "entrepreneurship",
    "marketing",
    "finance",
    "accounting",
    "organizational behavior",
  ],
  "BS FinTech": [
    "financial technology",
    "fintech",
    "banking",
    "finance",
    "financial services",
    "blockchain",
    "cryptocurrency",
    "digital banking",
  ],
  "BS Business Computing": [
    "business computing",
    "information systems",
    "business technology",
    "enterprise systems",
    "business intelligence",
  ],
  "BS Accounting & Finance": [
    "accounting",
    "finance",
    "financial accounting",
    "managerial accounting",
    "corporate finance",
    "auditing",
  ],
  "BS Biotechnology": [
    "biotechnology",
    "biology",
    "genetics",
    "molecular biology",
    "biochemistry",
    "biomedical engineering",
  ],
  "BS Psychology": [
    "psychology",
    "cognitive psychology",
    "developmental psychology",
    "clinical psychology",
    "social psychology",
  ],
};

// Semester-based book topics
const SEMESTER_TOPICS: Record<number, string[]> = {
  1: ["introduction", "fundamentals", "basics", "beginner"],
  2: ["introduction", "fundamentals", "basics"],
  3: ["intermediate", "advanced basics", "principles"],
  4: ["intermediate", "principles", "methods"],
  5: ["advanced", "specialized", "professional"],
  6: ["advanced", "specialized", "professional"],
  7: ["advanced", "specialized", "professional", "research"],
  8: ["advanced", "specialized", "professional", "research", "thesis"],
};

export interface UniversityBook extends GoogleBook {
  department?: string;
  semester?: number;
  courseCode?: string;
}

/**
 * Convert Google Book to database format
 */
export const convertGoogleBookToDb = (
  googleBook: GoogleBook,
  department?: string,
  semester?: number,
  courseCode?: string
) => {
  const volumeInfo = googleBook.volumeInfo;
  const imageUrl =
    volumeInfo.imageLinks?.large ||
    volumeInfo.imageLinks?.medium ||
    volumeInfo.imageLinks?.thumbnail ||
    volumeInfo.imageLinks?.smallThumbnail ||
    null;

  // Extract year from publishedDate
  let publishedYear: number | null = null;
  if (volumeInfo.publishedDate) {
    const yearMatch = volumeInfo.publishedDate.match(/\d{4}/);
    if (yearMatch) {
      publishedYear = parseInt(yearMatch[0]);
    }
  }

  // Get ISBN
  const isbn =
    volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier ||
    volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier ||
    null;

  return {
    id: googleBook.id,
    title: volumeInfo.title || "Unknown Title",
    author: volumeInfo.authors?.join(", ") || "Unknown Author",
    description: volumeInfo.description || null,
    genre: volumeInfo.categories?.[0] || "General",
    cover_url: imageUrl ? imageUrl.replace("http:", "https:") : null,
    published_year: publishedYear,
    isbn: isbn,
    rating: volumeInfo.averageRating ? parseFloat(volumeInfo.averageRating.toFixed(2)) : null,
    department: department || null,
    semester: semester || null,
    course_code: courseCode || null,
    pdf_url: googleBook.accessInfo?.pdf?.downloadLink || null,
    total_copies: 1,
    available_copies: 1,
  };
};

/**
 * Fetch books for a specific department and semester
 */
export const fetchUniversityBooks = async (
  department: string,
  semester?: number,
  maxResults: number = 40
): Promise<GoogleBook[]> => {
  const subjects = DEPARTMENT_SUBJECTS[department] || [];
  const topics = semester ? SEMESTER_TOPICS[semester] || [] : [];

  const allBooks: GoogleBook[] = [];
  const seenIds = new Set<string>();

  // Build search query
  let searchQuery = subjects[0] || department.toLowerCase();
  
  // Add semester-specific terms
  if (semester && topics.length > 0) {
    searchQuery += ` ${topics[0]} textbook`;
  } else {
    searchQuery += " textbook";
  }

  // Primary search with combined query
  try {
    const books = await searchBooks(searchQuery, maxResults);
    for (const book of books) {
      if (!seenIds.has(book.id) && book.volumeInfo.imageLinks) {
        // Only include books with images
        allBooks.push(book);
        seenIds.add(book.id);
        if (allBooks.length >= maxResults) break;
      }
    }
  } catch (error) {
    console.error(`Error fetching books for ${department}:`, error);
  }

  // If we don't have enough books, search by individual subjects
  if (allBooks.length < maxResults && subjects.length > 1) {
    for (const subject of subjects.slice(1, 4)) {
      if (allBooks.length >= maxResults) break;
      
      try {
        const books = await getBooksByCategory(subject, Math.ceil((maxResults - allBooks.length) / 2));
        for (const book of books) {
          if (!seenIds.has(book.id) && book.volumeInfo.imageLinks) {
            allBooks.push(book);
            seenIds.add(book.id);
            if (allBooks.length >= maxResults) break;
          }
        }
      } catch (error) {
        console.error(`Error fetching books for subject ${subject}:`, error);
      }
    }
  }

  return allBooks.slice(0, maxResults);
};

/**
 * Sync books from Google Books API to database
 */
export const syncBooksToDatabase = async (
  department: string,
  semester?: number,
  courseCode?: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  try {
    const books = await fetchUniversityBooks(department, semester, 30);

    for (const book of books) {
      try {
        const bookData = convertGoogleBookToDb(book, department, semester, courseCode);

        // Check if book already exists
        const { data: existing } = await supabase
          .from("books")
          .select("id")
          .eq("id", bookData.id)
          .maybeSingle();

        if (existing && existing.id) {
          // Update existing book (preserve id)
          const { id, ...updateData } = bookData;
          const { error } = await supabase
            .from("books")
            .update(updateData)
            .eq("id", id);

          if (!error) {
            success++;
          } else {
            console.error("Error updating book:", error);
            failed++;
          }
        } else {
          // Insert new book
          const { error } = await supabase.from("books").insert([bookData]);

          if (!error) {
            success++;
          } else {
            // If it's a duplicate key error, try updating instead
            if (error.code === '23505' || error.message?.includes('duplicate')) {
              const { id, ...updateData } = bookData;
              const { error: updateError } = await supabase
                .from("books")
                .update(updateData)
                .eq("id", id);
              
              if (!updateError) {
                success++;
              } else {
                console.error("Error updating book after duplicate:", updateError);
                failed++;
              }
            } else {
              console.error("Error inserting book:", error);
              failed++;
            }
          }
        }
      } catch (error) {
        console.error("Error processing book:", error);
        failed++;
      }
    }
  } catch (error) {
    console.error("Error syncing books:", error);
    throw error;
  }

  return { success, failed };
};

/**
 * Fetch and sync books for all departments
 */
export const syncAllUniversityBooks = async (): Promise<void> => {
  const departments = Object.keys(DEPARTMENT_SUBJECTS);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const department of departments) {
    console.log(`Syncing books for ${department}...`);
    
    // Sync books for each semester
    for (const semester of semesters) {
      try {
        const result = await syncBooksToDatabase(department, semester);
        console.log(
          `  Semester ${semester}: ${result.success} success, ${result.failed} failed`
        );
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error syncing ${department} semester ${semester}:`, error);
      }
    }
  }
};

/**
 * Clear all non-university books from database
 */
export const clearNonUniversityBooks = async (): Promise<void> => {
  const departments = Object.keys(DEPARTMENT_SUBJECTS);
  
  // Delete books that don't have a department
  const { error } = await supabase
    .from("books")
    .delete()
    .is("department", null);

  if (error) {
    console.error("Error clearing non-university books:", error);
    throw error;
  }

  // Optionally, delete books with invalid departments
  const { error: invalidDeptError } = await supabase
    .from("books")
    .delete()
    .not("department", "in", `(${departments.map((d) => `"${d}"`).join(",")})`);

  if (invalidDeptError) {
    console.error("Error clearing invalid department books:", invalidDeptError);
  }
};

