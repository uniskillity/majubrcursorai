import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { fetchUniversityBooks, convertGoogleBookToDb, GoogleBook } from "@/lib/universityBooks";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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

const Recommendations = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState("");
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
    if (session) {
      loadRecommendations();
    }
  }, [session]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Get user's reading history to find their preferred departments
      const { data: history } = await supabase
        .from("reading_history")
        .select("book_id")
        .eq("user_id", session!.user.id)
        .limit(10);

      // Try to get AI recommendations (optional)
      try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "book-recommendations",
        {
            body: { 
              query: "Give me personalized university textbook recommendations based on computer science, software engineering, and business administration courses" 
            },
        }
      );

      if (!aiError && aiData?.response) {
        setAiRecommendation(aiData.response);
      }
      } catch (error) {
        // AI recommendations are optional, continue without them
        console.log("AI recommendations not available");
      }

      // Fetch university books from multiple departments
      const allBooks: Book[] = [];
      const seenIds = new Set<string>();

      // Fetch from popular departments
      const recommendedDepartments = [
        "BS Computer Science",
        "BS Software Engineering",
        "BBA",
        "BS Artificial Intelligence"
      ];

      for (const department of recommendedDepartments) {
        try {
          const googleBooks = await fetchUniversityBooks(department, undefined, 10);
          
          for (const googleBook of googleBooks) {
            if (!seenIds.has(googleBook.id) && googleBook.volumeInfo.imageLinks) {
              const bookData = convertGoogleBookToDb(googleBook, department);
              allBooks.push({
                ...bookData,
                googleBookId: googleBook.id,
              });
              seenIds.add(googleBook.id);
              
              if (allBooks.length >= 30) break;
            }
          }
          
          if (allBooks.length >= 30) break;
        } catch (error) {
          console.error(`Error fetching recommendations for ${department}:`, error);
        }
      }
      
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-3 py-6 md:px-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Recommended University Books
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Personalized textbook recommendations for your courses
          </p>
        </div>

        {aiRecommendation && (
          <Card className="mb-6 md:mb-8">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {aiRecommendation}
                </p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] md:h-[400px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <FileText className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-xl font-semibold mb-2">No recommendations found</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Try browsing books by department
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

export default Recommendations;
