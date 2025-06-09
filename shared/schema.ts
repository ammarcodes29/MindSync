import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course table schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  instructor: text("instructor"),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  color: text("color").default("#5C6DF3"),
  progress: integer("progress").default(0),
  grade: text("grade"),
  termId: integer("term_id"),
});

// Term table schema
export const terms = pgTable("terms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

// Task table schema (for assignments, projects, etc.)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  courseId: integer("course_id"),
  taskType: text("task_type").notNull(), // "assignment", "project", "exam", "quiz"
  priority: text("priority").default("medium"), // "high", "medium", "low"
  status: text("status").default("incomplete"), // "complete", "incomplete"
  estimatedHours: integer("estimated_hours"),
});

// Study session schema
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  courseId: integer("course_id"),
  location: text("location"),
  completed: boolean("completed").default(false),
});

// Goals schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date"),
  courseId: integer("course_id"),
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  darkMode: boolean("dark_mode").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  studyReminders: boolean("study_reminders").default(true),
  deadlineReminders: boolean("deadline_reminders").default(true),
});

// User statistics schema
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalHoursStudied: integer("total_hours_studied").default(0),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  streakDays: integer("streak_days").default(0),
  lastStudyDate: timestamp("last_study_date"),
  weeklyStudyGoal: integer("weekly_study_goal").default(10),
  weeklyHoursStudied: integer("weekly_hours_studied").default(0),
  improvement: integer("improvement").default(0),
  overallProgress: integer("overall_progress").default(0),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertTermSchema = createInsertSchema(terms).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true });

// Define types for insert and select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertTerm = z.infer<typeof insertTermSchema>;
export type Term = typeof terms.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Extended schemas with validation for frontend forms
export const extendedUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8),
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
