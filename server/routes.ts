import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertCourseSchema, 
  insertTermSchema,
  insertTaskSchema, 
  insertStudySessionSchema,
  insertGoalSchema,
  insertUserStatsSchema
} from "../shared/schema";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {

  // Set up authentication
  setupAuth(app);

  const httpServer = createServer(app);

  // Course routes
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const courses = await storage.getCourses(userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const courseData = insertCourseSchema.parse({
        ...req.body,
        userId
      });
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating course" });
    }
  });

  app.get("/api/test", (req, res) => {
    console.log("Test endpoint hit");
    res.json({ message: "API is working!" });
  });

  app.get("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Ensure user only accesses their own courses
      if (course.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  app.put("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Ensure user only updates their own courses
      if (course.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Error updating course" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Ensure user only deletes their own courses
      if (course.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCourse(courseId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting course" });
    }
  });

  // Term routes
  app.get("/api/terms", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const terms = await storage.getTerms(userId);
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching terms" });
    }
  });

  app.post("/api/terms", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const termData = insertTermSchema.parse({
        ...req.body,
        userId
      });
      
      const term = await storage.createTerm(termData);
      res.status(201).json(term);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating term" });
    }
  });

  app.get("/api/terms/active", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const term = await storage.getActiveTermForUser(userId);
      
      if (!term) {
        return res.status(404).json({ message: "No active term found" });
      }
      
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active term" });
    }
  });

  app.get("/api/terms/:id", isAuthenticated, async (req, res) => {
    try {
      const termId = parseInt(req.params.id);
      const term = await storage.getTerm(termId);
      
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      
      // Ensure user only accesses their own terms
      if (term.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Error fetching term" });
    }
  });

  app.put("/api/terms/:id", isAuthenticated, async (req, res) => {
    try {
      const termId = parseInt(req.params.id);
      const term = await storage.getTerm(termId);
      
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      
      // Ensure user only updates their own terms
      if (term.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTerm = await storage.updateTerm(termId, req.body);
      res.json(updatedTerm);
    } catch (error) {
      res.status(500).json({ message: "Error updating term" });
    }
  });

  app.delete("/api/terms/:id", isAuthenticated, async (req, res) => {
    try {
      const termId = parseInt(req.params.id);
      const term = await storage.getTerm(termId);
      
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      
      // Ensure user only deletes their own terms
      if (term.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTerm(termId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting term" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.get("/api/tasks/type/:type", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const taskType = req.params.type;
      const tasks = await storage.getTasksByType(userId, taskType);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by type" });
    }
  });

  app.get("/api/tasks/course/:courseId", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      // Ensure user only accesses tasks from their own courses
      if (course && course.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const tasks = await storage.getTasksByCourse(courseId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by course" });
    }
  });

  app.get("/api/tasks/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const tasks = await storage.getUpcomingTasks(userId, days);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId
      });
      
      // If a courseId is provided, ensure it belongs to the user
      if (taskData.courseId) {
        const course = await storage.getCourse(taskData.courseId);
        if (!course || course.userId !== userId) {
          return res.status(403).json({ message: "Invalid course ID" });
        }
      }
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure user only accesses their own tasks
      if (task.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure user only updates their own tasks
      if (task.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // If courseId is being updated, ensure it belongs to the user
      if (req.body.courseId) {
        const course = await storage.getCourse(req.body.courseId);
        if (!course || course.userId !== (req.user as any).id) {
          return res.status(403).json({ message: "Invalid course ID" });
        }
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure user only deletes their own tasks
      if (task.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  // Study session routes
  app.get("/api/study-sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const sessions = await storage.getStudySessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study sessions" });
    }
  });

  app.get("/api/study-sessions/day", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const dateStr = req.query.date as string;
      let date: Date;
      
      if (dateStr) {
        date = new Date(dateStr);
      } else {
        date = new Date();
      }
      
      const sessions = await storage.getStudySessionsForDay(userId, date);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study sessions for day" });
    }
  });

  app.post("/api/study-sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const sessionData = insertStudySessionSchema.parse({
        ...req.body,
        userId
      });
      
      // If a courseId is provided, ensure it belongs to the user
      if (sessionData.courseId) {
        const course = await storage.getCourse(sessionData.courseId);
        if (!course || course.userId !== userId) {
          return res.status(403).json({ message: "Invalid course ID" });
        }
      }
      
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating study session" });
    }
  });

  // User stats routes
  app.get("/api/user-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        // Create default stats if none exist
        const newStats = await storage.createUserStats({
          userId,
          totalHoursStudied: 0,
          totalTasksCompleted: 0,
          streakDays: 0,
          weeklyStudyGoal: 10,
          weeklyHoursStudied: 0,
          improvement: 0,
          overallProgress: 0
        });
        return res.json(newStats);
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  app.put("/api/user-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const updatedStats = await storage.updateUserStats(userId, req.body);
      
      if (!updatedStats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      
      res.json(updatedStats);
    } catch (error) {
      res.status(500).json({ message: "Error updating user stats" });
    }
  });

  // Goal routes
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId
      });
      
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating goal" });
    }
  });

  app.put("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoal(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Ensure user only updates their own goals
      if (goal.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Error updating goal" });
    }
  });

  return httpServer;
}