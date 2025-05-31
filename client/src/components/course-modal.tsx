import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Clock, Users, Award, Smartphone, FileText, Code, Play, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course, Category, Lesson } from "@shared/schema";

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

interface CourseModalProps {
  course: Course;
  category?: Category;
  isEnrolled: boolean;
  onClose: () => void;
}

export default function CourseModal({ course, category, isEnrolled, onClose }: CourseModalProps) {
  const { toast } = useToast();
  
  // Hardcoded user ID for demo purposes
  const currentUserId = 1;

  const { data: courseWithLessons } = useQuery<CourseWithLessons>({
    queryKey: [`/api/courses/${course.id}`],
  });

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
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!isEnrolled) {
      enrollMutation.mutate();
    } else {
      // Navigate to first lesson if enrolled
      if (courseWithLessons?.lessons && courseWithLessons.lessons.length > 0) {
        window.location.href = `/lesson/${courseWithLessons.lessons[0].id}`;
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>By {course.instructor}</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{course.rating} reviews</span>
                </div>
                <span>{course.studentCount}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Course preview */}
              <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mb-4 mx-auto opacity-80" />
                  <p className="text-lg">Course Preview Video</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">What you'll learn</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="text-secondary mt-1 mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">Master the fundamentals and advanced concepts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-secondary mt-1 mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">Build real-world projects and applications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-secondary mt-1 mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">Understand industry standards and best practices</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-secondary mt-1 mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">Prepare for certification and career advancement</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Course Description</h4>
                  <p className="text-gray-600 leading-relaxed">{course.fullDescription}</p>
                </div>

                {courseWithLessons?.lessons && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Course Content</h4>
                    <div className="space-y-2">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">Course Lessons</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {courseWithLessons.lessons.length} lessons • {course.duration}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            {courseWithLessons.lessons.slice(0, 5).map((lesson, index) => (
                              <div key={lesson.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center">
                                  <Play className="text-primary mr-3 h-4 w-4" />
                                  <div>
                                    <p className="font-medium text-sm">{lesson.title}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{lesson.duration}</span>
                                  {!isEnrolled && <Lock className="text-gray-400 h-4 w-4" />}
                                </div>
                              </div>
                            ))}
                            {courseWithLessons.lessons.length > 5 && (
                              <p className="text-sm text-gray-500 pt-2">
                                And {courseWithLessons.lessons.length - 5} more lessons...
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{course.price}</div>
                  </div>
                  
                  <Button
                    className={`w-full mb-4 ${
                      isEnrolled 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending 
                      ? "Enrolling..." 
                      : isEnrolled 
                      ? "Continue Learning" 
                      : "Enroll Now"
                    }
                  </Button>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lessons</span>
                      <span className="font-medium">{courseWithLessons?.lessons.length || 0} lessons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-medium text-secondary">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access</span>
                      <span className="font-medium">Lifetime</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-3">This course includes:</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          {feature.includes("video") && <FileText className="mr-2 h-4 w-4 text-gray-400" />}
                          {feature.includes("resources") && <FileText className="mr-2 h-4 w-4 text-gray-400" />}
                          {feature.includes("exercises") && <Code className="mr-2 h-4 w-4 text-gray-400" />}
                          {feature.includes("certificate") && <Award className="mr-2 h-4 w-4 text-gray-400" />}
                          {!feature.includes("video") && !feature.includes("resources") && !feature.includes("exercises") && !feature.includes("certificate") && (
                            <Smartphone className="mr-2 h-4 w-4 text-gray-400" />
                          )}
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
