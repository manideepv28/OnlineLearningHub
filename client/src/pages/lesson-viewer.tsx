import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lesson, Course } from "@shared/schema";

interface LessonWithCourse extends Lesson {
  course: Course;
}

interface CourseProgress {
  lessons: Array<Lesson & { completed: boolean; completedAt: string | null }>;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function LessonViewer() {
  const params = useParams();
  const lessonId = params.lessonId ? parseInt(params.lessonId) : null;
  const { toast } = useToast();
  
  // Hardcoded user ID for demo purposes
  const currentUserId = 1;

  const { data: lesson, isLoading: lessonLoading } = useQuery<LessonWithCourse>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });

  const { data: courseProgress } = useQuery<CourseProgress>({
    queryKey: [`/api/progress/${currentUserId}/course/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      if (!lessonId) throw new Error("No lesson ID");
      
      return apiRequest("POST", "/api/progress", {
        userId: currentUserId,
        lessonId: lessonId,
        completed: completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${currentUserId}/course/${lesson?.courseId}`] });
      toast({
        title: "Progress Updated",
        description: "Lesson marked as complete!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lesson progress",
        variant: "destructive",
      });
    },
  });

  if (!lessonId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Lesson</h2>
          <p className="text-gray-600">The lesson ID is invalid or missing.</p>
        </div>
      </div>
    );
  }

  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  const currentLessonProgress = courseProgress?.lessons.find(l => l.id === lessonId);
  const isCompleted = currentLessonProgress?.completed || false;
  
  const currentLessonIndex = courseProgress?.lessons.findIndex(l => l.id === lessonId) ?? -1;
  const previousLesson = currentLessonIndex > 0 ? courseProgress?.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < (courseProgress?.lessons.length ?? 0) - 1 ? 
    courseProgress?.lessons[currentLessonIndex + 1] : null;

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(!isCompleted);
  };

  const navigateToLesson = (targetLessonId: number) => {
    window.location.href = `/lesson/${targetLessonId}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="font-semibold text-gray-900">{lesson.course.title}</h3>
              <p className="text-sm text-gray-600">{lesson.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Lesson {currentLessonIndex + 1} of {courseProgress?.totalLessons || 0}
            </div>
            <Button
              onClick={handleMarkComplete}
              disabled={markCompleteMutation.isPending}
              className={isCompleted ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Video Player Placeholder */}
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="h-16 w-16 mb-4 mx-auto opacity-80" />
              <p className="text-lg">Lesson Video Player</p>
              <p className="text-sm opacity-80">Duration: {lesson.duration}</p>
            </div>
          </div>

          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{lesson.title}</h2>
            <div className="prose prose-lg text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-4">Course Progress</h4>
          
          {courseProgress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{courseProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          <h5 className="font-medium text-gray-900 mb-3">Course Outline</h5>
          
          {courseProgress && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courseProgress.lessons.map((courseLesson, index) => (
                <Card 
                  key={courseLesson.id}
                  className={`cursor-pointer transition-colors ${
                    courseLesson.id === lessonId 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'hover:bg-white hover:border-gray-200'
                  }`}
                  onClick={() => navigateToLesson(courseLesson.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          courseLesson.completed 
                            ? 'bg-secondary' 
                            : courseLesson.id === lessonId 
                            ? 'bg-primary' 
                            : 'bg-gray-200'
                        }`}>
                          {courseLesson.completed ? (
                            <CheckCircle className="text-white h-4 w-4" />
                          ) : courseLesson.id === lessonId ? (
                            <Play className="text-white h-3 w-3" />
                          ) : (
                            <span className="text-gray-600 text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{courseLesson.title}</p>
                          <p className="text-xs text-gray-500">{courseLesson.duration}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!previousLesson}
                onClick={() => previousLesson && navigateToLesson(previousLesson.id)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                className="flex-1"
                disabled={!nextLesson}
                onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
