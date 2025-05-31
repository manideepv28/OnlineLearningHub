import {
  users,
  categories,
  courses,
  lessons,
  enrollments,
  lessonProgress,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type LessonProgress,
  type InsertLessonProgress,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Lessons
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  // Enrollments
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;

  // Lesson Progress
  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  getUserCourseProgress(userId: number, courseId: number): Promise<LessonProgress[]>;
  createOrUpdateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private enrollments: Map<number, Enrollment>;
  private lessonProgress: Map<number, LessonProgress>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentCourseId: number;
  private currentLessonId: number;
  private currentEnrollmentId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.enrollments = new Map();
    this.lessonProgress = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentCourseId = 1;
    this.currentLessonId = 1;
    this.currentEnrollmentId = 1;
    this.currentProgressId = 1;

    this.seedData();
  }

  private seedData() {
    // Create sample user
    const user: User = {
      id: this.currentUserId++,
      username: "johndoe",
      password: "password123",
      name: "John Doe",
    };
    this.users.set(user.id, user);

    // Create categories
    const categories: Category[] = [
      { id: this.currentCategoryId++, name: "Web Development", color: "primary" },
      { id: this.currentCategoryId++, name: "Data Science", color: "purple" },
      { id: this.currentCategoryId++, name: "Design", color: "pink" },
      { id: this.currentCategoryId++, name: "Marketing", color: "orange" },
      { id: this.currentCategoryId++, name: "Mobile Development", color: "green" },
      { id: this.currentCategoryId++, name: "Security", color: "red" },
    ];
    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Create courses
    const courses: Course[] = [
      {
        id: this.currentCourseId++,
        title: "Complete React Development",
        description: "Master modern React development with hooks, context, and best practices for building scalable applications.",
        fullDescription: "This comprehensive React course covers everything from fundamentals to advanced concepts. You'll learn React hooks, context API, state management, and modern development patterns. Build real-world projects and master the skills needed for professional React development.",
        instructor: "Sarah Johnson",
        categoryId: 1,
        price: "$49",
        duration: "12h 30m",
        level: "Beginner",
        rating: "4.8",
        studentCount: "2.4k students",
        imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["12.5 hours on-demand video", "15 downloadable resources", "10 coding exercises", "Certificate of completion"],
      },
      {
        id: this.currentCourseId++,
        title: "Python Data Analysis",
        description: "Learn data analysis, visualization, and machine learning using Python, pandas, and scikit-learn.",
        fullDescription: "Dive deep into data science with Python. This course covers data manipulation with pandas, visualization with matplotlib and seaborn, and machine learning with scikit-learn. Perfect for aspiring data scientists and analysts.",
        instructor: "Dr. Michael Chen",
        categoryId: 2,
        price: "$69",
        duration: "18h 20m",
        level: "Intermediate",
        rating: "4.9",
        studentCount: "1.8k students",
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["18 hours on-demand video", "25 downloadable resources", "15 hands-on projects", "Certificate of completion"],
      },
      {
        id: this.currentCourseId++,
        title: "UX/UI Design Fundamentals",
        description: "Master user experience and interface design principles, prototyping, and design thinking methodology.",
        fullDescription: "Learn the complete UX/UI design process from research to final implementation. This course covers user research, wireframing, prototyping, visual design, and usability testing. Perfect for aspiring designers and developers.",
        instructor: "Emily Rodriguez",
        categoryId: 3,
        price: "$59",
        duration: "14h 15m",
        level: "Beginner",
        rating: "4.7",
        studentCount: "3.1k students",
        imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["14 hours on-demand video", "20 downloadable resources", "8 design projects", "Certificate of completion"],
      },
      {
        id: this.currentCourseId++,
        title: "Digital Marketing Strategy",
        description: "Learn comprehensive digital marketing strategies including SEO, social media, and analytics.",
        fullDescription: "Master digital marketing from strategy to execution. This course covers SEO, content marketing, social media marketing, email marketing, and analytics. Learn how to create and execute successful digital marketing campaigns.",
        instructor: "David Thompson",
        categoryId: 4,
        price: "$39",
        duration: "10h 45m",
        level: "Beginner",
        rating: "4.6",
        studentCount: "4.2k students",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["10 hours on-demand video", "12 downloadable resources", "5 marketing projects", "Certificate of completion"],
      },
      {
        id: this.currentCourseId++,
        title: "React Native Development",
        description: "Build cross-platform mobile applications using React Native and modern development practices.",
        fullDescription: "Learn to build native mobile apps for iOS and Android using React Native. This course covers navigation, state management, API integration, and publishing to app stores.",
        instructor: "Alex Kim",
        categoryId: 5,
        price: "$79",
        duration: "20h 30m",
        level: "Intermediate",
        rating: "4.8",
        studentCount: "1.5k students",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["20 hours on-demand video", "30 downloadable resources", "12 mobile projects", "Certificate of completion"],
      },
      {
        id: this.currentCourseId++,
        title: "Cybersecurity Fundamentals",
        description: "Learn network security, ethical hacking, and threat assessment techniques.",
        fullDescription: "Comprehensive cybersecurity course covering network security, penetration testing, incident response, and security best practices. Perfect for IT professionals and security enthusiasts.",
        instructor: "Maria Santos",
        categoryId: 6,
        price: "$89",
        duration: "16h 45m",
        level: "Intermediate",
        rating: "4.9",
        studentCount: "2.2k students",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        features: ["16 hours on-demand video", "20 downloadable resources", "10 security labs", "Certificate of completion"],
      },
    ];
    courses.forEach(course => this.courses.set(course.id, course));

    // Create lessons for first course
    const lessons: Lesson[] = [
      {
        id: this.currentLessonId++,
        courseId: 1,
        title: "Introduction to React",
        duration: "15:30",
        videoUrl: "",
        content: "In this lesson, we'll explore what React is and why it's become one of the most popular JavaScript libraries for building user interfaces. React was created by Facebook and has revolutionized how we think about building web applications.",
        orderIndex: 1,
      },
      {
        id: this.currentLessonId++,
        courseId: 1,
        title: "Setting up Development Environment",
        duration: "12:15",
        videoUrl: "",
        content: "Learn how to set up your development environment for React development. We'll install Node.js, create a new React project, and explore the project structure.",
        orderIndex: 2,
      },
      {
        id: this.currentLessonId++,
        courseId: 1,
        title: "Understanding Components and JSX",
        duration: "25:45",
        videoUrl: "",
        content: "Components are the building blocks of React applications. In this lesson, we'll learn about functional and class components, and how JSX makes it easy to write component templates.",
        orderIndex: 3,
      },
      {
        id: this.currentLessonId++,
        courseId: 1,
        title: "State and Props",
        duration: "30:20",
        videoUrl: "",
        content: "Understanding state and props is crucial for React development. We'll learn how to manage component state and pass data between components using props.",
        orderIndex: 4,
      },
      {
        id: this.currentLessonId++,
        courseId: 1,
        title: "Event Handling",
        duration: "18:10",
        videoUrl: "",
        content: "Learn how to handle user interactions in React applications. We'll cover event handlers, form handling, and best practices for managing user input.",
        orderIndex: 5,
      },
    ];
    lessons.forEach(lesson => this.lessons.set(lesson.id, lesson));

    // Create sample enrollments
    const enrollments: Enrollment[] = [
      {
        id: this.currentEnrollmentId++,
        userId: 1,
        courseId: 1,
        enrolledAt: new Date().toISOString(),
      },
      {
        id: this.currentEnrollmentId++,
        userId: 1,
        courseId: 2,
        enrolledAt: new Date().toISOString(),
      },
    ];
    enrollments.forEach(enrollment => this.enrollments.set(enrollment.id, enrollment));

    // Create sample lesson progress
    const progress: LessonProgress[] = [
      {
        id: this.currentProgressId++,
        userId: 1,
        lessonId: 1,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      {
        id: this.currentProgressId++,
        userId: 1,
        lessonId: 2,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      {
        id: this.currentProgressId++,
        userId: 1,
        lessonId: 3,
        completed: false,
        completedAt: null,
      },
    ];
    progress.forEach(p => this.lessonProgress.set(p.id, p));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.categoryId === categoryId);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.userId === userId);
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentEnrollmentId++;
    const enrollment: Enrollment = { ...insertEnrollment, id };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    return Array.from(this.lessonProgress.values()).find(
      progress => progress.userId === userId && progress.lessonId === lessonId
    );
  }

  async getUserCourseProgress(userId: number, courseId: number): Promise<LessonProgress[]> {
    const courseLessons = await this.getLessonsByCourse(courseId);
    const lessonIds = courseLessons.map(lesson => lesson.id);
    return Array.from(this.lessonProgress.values()).filter(
      progress => progress.userId === userId && lessonIds.includes(progress.lessonId)
    );
  }

  async createOrUpdateLessonProgress(insertProgress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(insertProgress.userId, insertProgress.lessonId);
    
    if (existing) {
      const updated: LessonProgress = { 
        ...existing, 
        ...insertProgress,
        completedAt: insertProgress.completed ? new Date().toISOString() : null
      };
      this.lessonProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: LessonProgress = { 
        ...insertProgress, 
        id,
        completedAt: insertProgress.completed ? new Date().toISOString() : null
      };
      this.lessonProgress.set(id, progress);
      return progress;
    }
  }
}

export const storage = new MemStorage();
