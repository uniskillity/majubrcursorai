import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { fetchUniversityBooks, convertGoogleBookToDb, GoogleBook } from "@/lib/universityBooks";
import { GraduationCap, FileText } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  genre: string;
  rating: number | null;
  published_year: number | null;
  cover_url: string | null;
  department: string | null;
  semester: number | null;
  course_code: string | null;
  googleBookId?: string;
}

const DEPARTMENTS = [
  "BS Computer Science",
  "BS Software Engineering", 
  "BS Artificial Intelligence",
  "BBA",
  "BS FinTech",
  "BS Business Computing",
  "BS Accounting & Finance",
  "BS Biotechnology",
  "BS Psychology"
];

const Trending = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const allBooks: Book[] = [];
      const seenIds = new Set<string>();

      // Fetch trending books from multiple departments
      const departmentsToFetch = DEPARTMENTS.slice(0, 5); // Get from first 5 departments
      
      for (const department of departmentsToFetch) {
        try {
          const googleBooks = await fetchUniversityBooks(department, undefined, 8);
          
          for (const googleBook of googleBooks) {
            if (!seenIds.has(googleBook.id) && googleBook.volumeInfo.imageLinks) {
              const bookData = convertGoogleBookToDb(googleBook, department);
              allBooks.push({
                ...bookData,
                googleBookId: googleBook.id,
              });
              seenIds.add(googleBook.id);
              
              // Limit total books to 40
              if (allBooks.length >= 40) break;
            }
          }
          
          if (allBooks.length >= 40) break;
        } catch (error) {
          console.error(`Error fetching trending books for ${department}:`, error);
        }
      }
      
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading trending books:", error);
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-3 py-6 md:px-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Trending University Books
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Popular textbooks across all departments
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] md:h-[400px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <FileText className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-xl font-semibold mb-2">No trending books found</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Try again later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {books.map((book) => (
              <div key={book.id}>
                <Link to={`/book/${book.googleBookId || book.id}`}>
                <BookCard
                  id={book.id}
                    title={book.title}
                    author={book.author}
                    description={book.description}
                    genre={book.genre}
                    rating={book.rating || 0}
                    publishedYear={book.published_year || undefined}
                    imageUrl={book.cover_url}
                    department={book.department || undefined}
                    semester={book.semester || undefined}
                    courseCode={book.course_code || undefined}
                />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Trending;
