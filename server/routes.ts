import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEnrollmentSchema, insertLessonProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get course by ID with lessons
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const lessons = await storage.getLessonsByCourse(courseId);
      res.json({ ...course, lessons });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get user enrollments with course details and progress
  app.get("/api/enrollments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const enrollments = await storage.getEnrollmentsByUser(userId);
      const enrollmentsWithDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          const lessons = await storage.getLessonsByCourse(enrollment.courseId);
          const progress = await storage.getUserCourseProgress(userId, enrollment.courseId);
          
          const completedLessons = progress.filter(p => p.completed).length;
          const totalLessons = lessons.length;
          const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            ...enrollment,
            course,
            progress: progressPercentage,
            completedLessons,
            totalLessons,
          };
        })
      );

      res.json(enrollmentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Enroll in course
  app.post("/api/enrollments", async (req, res) => {
    try {
      const validatedData = insertEnrollmentSchema.parse(req.body);
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(validatedData.userId, validatedData.courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      // Check if course exists
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await storage.createEnrollment({
        ...validatedData,
        enrolledAt: new Date().toISOString(),
      });

      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Get lesson progress for user
  app.get("/api/progress/:userId/:lessonId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(userId) || isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid user ID or lesson ID" });
      }

      const progress = await storage.getLessonProgress(userId, lessonId);
      res.json(progress || { completed: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson progress" });
    }
  });

  // Update lesson progress
  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertLessonProgressSchema.parse(req.body);
      
      // Check if lesson exists
      const lesson = await storage.getLesson(validatedData.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const progress = await storage.createOrUpdateLessonProgress(validatedData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lesson progress" });
    }
  });

  // Get course progress for user
  app.get("/api/progress/:userId/course/:courseId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(userId) || isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid user ID or course ID" });
      }

      const lessons = await storage.getLessonsByCourse(courseId);
      const progress = await storage.getUserCourseProgress(userId, courseId);
      
      const lessonsWithProgress = lessons.map(lesson => {
        const lessonProgress = progress.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          completed: lessonProgress?.completed || false,
          completedAt: lessonProgress?.completedAt || null,
        };
      });

      const completedLessons = progress.filter(p => p.completed).length;
      const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

      res.json({
        lessons: lessonsWithProgress,
        progress: progressPercentage,
        completedLessons,
        totalLessons: lessons.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course progress" });
    }
  });

  // Get lesson by ID
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      res.json({ ...lesson, course });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
