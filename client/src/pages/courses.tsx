import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, GraduationCap, CheckCircle, Clock, Trophy, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseCard from "@/components/course-card";
import CourseModal from "@/components/course-modal";
import ProgressTracker from "@/components/progress-tracker";
import type { Course, Category } from "@shared/schema";

interface EnrollmentWithDetails {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  course: Course;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Hardcoded user ID for demo purposes
  const currentUserId = 1;

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: enrollments = [] } = useQuery<EnrollmentWithDetails[]>({
    queryKey: [`/api/enrollments/${currentUserId}`],
  });

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "All Categories") return matchesSearch;
    
    const category = categories.find(cat => cat.id === course.categoryId);
    return matchesSearch && category?.name === selectedCategory;
  });

  // Separate enrolled and available courses
  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
  const enrolledCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100);
  const availableCourses = filteredCourses.filter(course => !enrolledCourseIds.has(course.id));

  // Calculate stats
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const totalHours = enrollments.reduce((acc, e) => {
    const duration = e.course.duration.match(/(\d+)h/);
    return acc + (duration ? parseInt(duration[1]) : 0);
  }, 0);
  const certificates = completedCourses;

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <GraduationCap className="mr-2" />
                  LearnHub
                </h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#" className="text-primary font-medium">Courses</a>
                <a href="#" className="text-gray-500 hover:text-gray-900">My Learning</a>
                <a href="#" className="text-gray-500 hover:text-gray-900">Progress</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">Continue Your Learning Journey</h1>
              <p className="text-xl opacity-90 mb-6">Discover new skills and advance your career with our comprehensive course library.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-primary hover:bg-gray-50">
                  Browse All Courses
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  View My Progress
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <CheckCircle className="text-secondary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
                  <p className="text-gray-600">Courses Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Clock className="text-accent h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
                  <p className="text-gray-600">Hours Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Trophy className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{certificates}</p>
                  <p className="text-gray-600">Certificates Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* In Progress Courses */}
        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Continue Learning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <ProgressTracker
                  key={enrollment.id}
                  course={enrollment.course}
                  progress={enrollment.progress}
                  onContinue={() => setSelectedCourse(enrollment.course)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Course Filters */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Courses</h2>
              <p className="text-gray-600">Choose from our wide selection of professional courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option>All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:border-primary">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {availableCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              category={categories.find(cat => cat.id === course.categoryId)}
              isEnrolled={enrolledCourseIds.has(course.id)}
              onViewDetails={() => setSelectedCourse(course)}
            />
          ))}
        </section>

        {availableCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Course Modal */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          category={categories.find(cat => cat.id === selectedCourse.categoryId)}
          isEnrolled={enrolledCourseIds.has(selectedCourse.id)}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
