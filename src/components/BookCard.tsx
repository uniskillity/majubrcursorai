import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Star } from "lucide-react";
import { useState } from "react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  rating?: number;
  publishedYear?: number;
  imageUrl?: string;
  department?: string;
  semester?: number;
  courseCode?: string;
  pdfUrl?: string;
  onSave?: (bookId: string) => void;
  onRate?: (bookId: string, rating: number) => void;
}

export const BookCard = ({
  id,
  title,
  author,
  description,
  genre,
  rating = 0,
  publishedYear,
  imageUrl,
  department,
  semester,
  courseCode,
  pdfUrl,
  onSave,
  onRate,
}: BookCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(id);
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    onRate?.(id, stars);
  };

  // Ensure image URL is properly formatted
  const imageSrc = imageUrl 
    ? imageUrl.replace('http:', 'https:').replace('&zoom=1', '&zoom=2')
    : '/placeholder.svg';

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col">
      {/* Mobile View - Minimal */}
      <div className="block md:hidden">
        <div className="w-full aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        <CardHeader className="p-3 space-y-2">
          <CardTitle className="font-sans text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            {department && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20">
                {department.split(' ')[0]}
              </Badge>
            )}
            {semester && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-secondary/10 text-secondary">
                Sem {semester}
              </Badge>
            )}
          </div>
        </CardHeader>
      </div>

      {/* Desktop View - Full Details */}
      <div className="hidden md:block">
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        <CardHeader className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-sans text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <CardDescription className="font-sans text-xs mt-1 line-clamp-1">
                {author}
              </CardDescription>
            </div>
            <button
              onClick={handleSave}
              className="shrink-0 p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isSaved ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {department && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                {department}
              </Badge>
            )}
            {semester && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary">
                Sem {semester}
              </Badge>
            )}
            {courseCode && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {courseCode}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
