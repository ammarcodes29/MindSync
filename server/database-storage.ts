import { db } from './db';
import { 
  users, 
  courses, 
  terms, 
  tasks, 
  studySessions, 
  goals, 
  settings,
  userStats,
  type User,
  type InsertUser,
  type Course,
  type InsertCourse,
  type Term,
  type InsertTerm,
  type Task,
  type InsertTask,
  type StudySession,
  type InsertStudySession,
  type Goal,
  type InsertGoal,
  type Settings,
  type InsertSettings,
  type UserStats,
  type InsertUserStats
} from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';
import { IStorage } from './storage';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }

  async getCourses(userId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const results = await db.select().from(courses).where(eq(courses.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const results = await db.insert(courses).values(course).returning();
    return results[0];
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const results = await db.update(courses).set(course).where(eq(courses.id, id)).returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const results = await db.delete(courses).where(eq(courses.id, id)).returning();
    return results.length > 0;
  }

  async getTerms(userId: number): Promise<Term[]> {
    return await db.select().from(terms).where(eq(terms.userId, userId));
  }

  async getTerm(id: number): Promise<Term | undefined> {
    const results = await db.select().from(terms).where(eq(terms.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getActiveTermForUser(userId: number): Promise<Term | undefined> {
    const now = new Date();
    const results = await db.select().from(terms).where(
      and(
        eq(terms.userId, userId),
        lte(terms.startDate, now),
        gte(terms.endDate, now)
      )
    );
    return results.length > 0 ? results[0] : undefined;
  }

  async createTerm(term: InsertTerm): Promise<Term> {
    const results = await db.insert(terms).values(term).returning();
    return results[0];
  }

  async updateTerm(id: number, term: Partial<Term>): Promise<Term | undefined> {
    const results = await db.update(terms).set(term).where(eq(terms.id, id)).returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteTerm(id: number): Promise<boolean> {
    const results = await db.delete(terms).where(eq(terms.id, id)).returning();
    return results.length > 0;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTasksByType(userId: number, taskType: string): Promise<Task[]> {
    return await db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.taskType, taskType)
      )
    );
  }

  async getTasksByCourse(courseId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.courseId, courseId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const results = await db.select().from(tasks).where(eq(tasks.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUpcomingTasks(userId: number, days: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return await db.select().from(tasks).where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, futureDate)
      )
    ).orderBy(tasks.dueDate);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const results = await db.insert(tasks).values(task).returning();
    return results[0];
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const results = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const results = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return results.length > 0;
  }

  async getStudySessions(userId: number): Promise<StudySession[]> {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId));
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    const results = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getStudySessionsForDay(userId: number, date: Date): Promise<StudySession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select().from(studySessions).where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.startTime, startOfDay),
        lte(studySessions.startTime, endOfDay)
      )
    ).orderBy(studySessions.startTime);
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const results = await db.insert(studySessions).values(session).returning();
    return results[0];
  }

  async updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined> {
    const results = await db.update(studySessions).set(session).where(eq(studySessions.id, id)).returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    const results = await db.delete(studySessions).where(eq(studySessions.id, id)).returning();
    return results.length > 0;
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const results = await db.select().from(goals).where(eq(goals.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const results = await db.insert(goals).values(goal).returning();
    return results[0];
  }

  async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined> {
    const results = await db.update(goals).set(goal).where(eq(goals.id, id)).returning();
    return results.length > 0 ? results[0] : undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const results = await db.delete(goals).where(eq(goals.id, id)).returning();
    return results.length > 0;
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    const results = await db.select().from(settings).where(eq(settings.userId, userId));
    return results.length > 0 ? results[0] : undefined;
  }

  async createSettings(setting: InsertSettings): Promise<Settings> {
    const results = await db.insert(settings).values(setting).returning();
    return results[0];
  }

  async updateSettings(userId: number, updatedSettings: Partial<Settings>): Promise<Settings | undefined> {
    const results = await db.update(settings)
      .set(updatedSettings)
      .where(eq(settings.userId, userId))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const results = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const results = await db.insert(userStats).values(stats).returning();
    return results[0];
  }

  async updateUserStats(userId: number, updatedStats: Partial<UserStats>): Promise<UserStats | undefined> {
    const results = await db.update(userStats)
      .set(updatedStats)
      .where(eq(userStats.userId, userId))
      .returning();
    return results.length > 0 ? results[0] : undefined;
  }
}