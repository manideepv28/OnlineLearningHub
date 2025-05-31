import { Clock, Users, Star, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@shared/schema";

interface ProgressTrackerProps {
  course: Course;
  progress: number;
  onContinue: () => void;
}

export default function ProgressTracker({ course, progress, onContinue }: ProgressTrackerProps) {
  const getCategoryColor = (categoryName?: string) => {
    switch (categoryName) {
      case "Web Development": return "bg-primary/10 text-primary";
      case "Data Science": return "bg-purple-100 text-purple-700";
      case "Design": return "bg-pink-100 text-pink-700";
      case "Marketing": return "bg-orange-100 text-orange-700";
      case "Mobile Development": return "bg-green-100 text-green-700";
      case "Security": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <img 
        src={course.imageUrl} 
        alt={course.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-medium ${getCategoryColor()}`}>
            In Progress
          </Badge>
          <span className="text-sm text-gray-500">{course.duration}</span>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <Button
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          onClick={onContinue}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );
}
