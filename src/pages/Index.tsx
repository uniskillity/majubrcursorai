import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-maju.jpg";
import { Link } from "react-router-dom";
import { fetchUniversityBooks, convertGoogleBookToDb, GoogleBook } from "@/lib/universityBooks";

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
  pdf_url: string | null;
  googleBookId?: string; // Store Google Books ID for details page
}

const DEPARTMENTS = [
  "All Departments",
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

const SEMESTERS = ["All Semesters", "1", "2", "3", "4", "5", "6", "7", "8"];

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("BS Computer Science");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && selectedDepartment !== "All Departments") {
      loadBooks();
    }
  }, [selectedDepartment, selectedSemester, session]);

  const loadBooks = async () => {
    if (selectedDepartment === "All Departments") {
      setBooks([]);
      return;
    }

    setLoading(true);
    try {
      const semester = selectedSemester !== "All Semesters" ? parseInt(selectedSemester) : undefined;
      
      // Fetch books directly from Google Books API
      const googleBooks = await fetchUniversityBooks(selectedDepartment, semester, 40);
      
      // Convert Google Books to our Book format
      const convertedBooks: Book[] = googleBooks.map((googleBook: GoogleBook) => {
        const bookData = convertGoogleBookToDb(googleBook, selectedDepartment, semester);
        return {
          ...bookData,
          googleBookId: googleBook.id,
        };
      });
      
      setBooks(convertedBooks);
    } catch (error: any) {
      console.error("Error loading books:", error);
      toast({
        variant: "destructive",
        title: "Error loading books",
        description: error.message || "Failed to fetch books. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      loadBooks();
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      // Search in Google Books API with department filter
      const searchTerms = searchQuery.trim();
      const departmentTerms = selectedDepartment !== "All Departments" 
        ? `${selectedDepartment} ${searchTerms}` 
        : searchTerms;
      
      const semester = selectedSemester !== "All Semesters" ? parseInt(selectedSemester) : undefined;
      
      // Fetch books with search query
      const googleBooks = await fetchUniversityBooks(selectedDepartment, semester, 40);
      
      // Filter by search query
      const filteredBooks = googleBooks.filter((book: GoogleBook) => {
        const title = book.volumeInfo.title?.toLowerCase() || '';
        const author = book.volumeInfo.authors?.join(' ').toLowerCase() || '';
        const description = book.volumeInfo.description?.toLowerCase() || '';
        const search = searchQuery.toLowerCase();
        
        return title.includes(search) || author.includes(search) || description.includes(search);
      });
      
      // Convert to Book format
      const convertedBooks: Book[] = filteredBooks.map((googleBook: GoogleBook) => {
        const bookData = convertGoogleBookToDb(googleBook, selectedDepartment, semester);
        return {
          ...bookData,
          googleBookId: googleBook.id,
        };
      });
      
      setBooks(convertedBooks);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "Failed to search books. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    loadBooks();
  };

  const handleSaveBook = async (bookId: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to save books",
      });
      return;
    }

    try {
      // Find the book to get its Google Books ID
      const book = books.find(b => b.id === bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      // Save to reading history using Google Books ID
      const { error } = await supabase.from("reading_history").insert({
        user_id: session.user.id,
        book_id: book.googleBookId || bookId,
        status: "want_to_read",
      });

      if (error) throw error;

      toast({
        title: "Book saved!",
        description: "Added to your reading list",
      });
    } catch (error: any) {
      console.error("Error saving book:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save book. Please try again.",
      });
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Search Header - Minimal */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 md:flex-row md:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm md:pl-10 md:h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="flex-1 h-9 text-sm md:w-[180px] md:h-10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.filter(d => d !== "All Departments").map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-sm">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-24 h-9 text-sm md:w-[120px] md:h-10">
                  <SelectValue placeholder="Sem" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={sem} className="text-sm">
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(isSearching || searchQuery) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClearSearch} 
                  className="h-9 px-3 text-sm md:h-10"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Hero Section - Minimal */}
      {!isSearching && (
      <div className="relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <img 
          src={heroImage} 
          alt="MAJU Library" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <GraduationCap className="h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-4" />
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
            MAJU Library
          </h1>
          <p className="text-xs md:text-base lg:text-lg max-w-2xl opacity-90">
            University textbooks and course materials
          </p>
        </div>
      </div>
      )}

      {/* Main Content - Minimal */}
      <main className="container mx-auto px-3 py-6 md:px-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            {isSearching ? "Search Results" : selectedDepartment || "Books"}
          </h2>
          {selectedSemester !== "All Semesters" && (
            <p className="text-xs md:text-sm text-muted-foreground">
              Semester {selectedSemester}
            </p>
          )}
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
            <h3 className="text-base md:text-xl font-semibold mb-2">No books found</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              {isSearching && searchQuery
                ? `No results for "${searchQuery}"`
                : "Try selecting a different department"}
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
                    onSave={handleSaveBook}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-primary text-primary-foreground mt-12 md:mt-20">
        <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
          <div className="text-center text-xs md:text-sm opacity-75">
            <p>&copy; {new Date().getFullYear()} MAJU Library. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
