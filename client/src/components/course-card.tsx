import { useMutation } from "@tanstack/react-query";
import { Clock, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course, Category } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  category?: Category;
  isEnrolled: boolean;
  onViewDetails: () => void;
}

export default function CourseCard({ course, category, isEnrolled, onViewDetails }: CourseCardProps) {
  const { toast } = useToast();
  
  // Hardcoded user ID for demo purposes
  const currentUserId = 1;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enrollments", {
        userId: currentUserId,
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments/${currentUserId}`] });
      toast({
        title: "Enrollment Successful",
        description: `You have successfully enrolled in ${course.title}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEnrolled) {
      enrollMutation.mutate();
    }
  };

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
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onViewDetails}
    >
      <img 
        src={course.imageUrl} 
        alt={course.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-medium ${getCategoryColor(category?.name)}`}>
            {category?.name || "General"}
          </Badge>
          <span className="text-accent font-bold">{course.price}</span>
        </div>
        
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="mr-1 h-4 w-4" />
            <span>{course.studentCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Star className="mr-1 h-4 w-4 text-yellow-400 fill-current" />
            <span>{course.rating}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {course.level}
          </Badge>
        </div>

        {!isEnrolled ? (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
        ) : null}

        <Button
          className={`w-full ${
            isEnrolled 
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending ? "Enrolling..." : isEnrolled ? "View Course" : "Enroll Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
