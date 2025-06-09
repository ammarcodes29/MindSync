import {
  users, courses, terms, tasks, studySessions, goals, settings, userStats,
  type User, type Course, type Term, type Task, type StudySession, type Goal, type Settings, type UserStats,
  type InsertUser, type InsertCourse, type InsertTerm, type InsertTask, 
  type InsertStudySession, type InsertGoal, type InsertSettings, type InsertUserStats
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourses(userId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Term methods
  getTerms(userId: number): Promise<Term[]>;
  getTerm(id: number): Promise<Term | undefined>;
  getActiveTermForUser(userId: number): Promise<Term | undefined>;
  createTerm(term: InsertTerm): Promise<Term>;
  updateTerm(id: number, term: Partial<Term>): Promise<Term | undefined>;
  deleteTerm(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTasksByType(userId: number, taskType: string): Promise<Task[]>;
  getTasksByCourse(courseId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getUpcomingTasks(userId: number, days: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study session methods
  getStudySessions(userId: number): Promise<StudySession[]>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  getStudySessionsForDay(userId: number, date: Date): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<Settings>): Promise<Settings | undefined>;
  
  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private terms: Map<number, Term>;
  private tasks: Map<number, Task>;
  private studySessions: Map<number, StudySession>;
  private goals: Map<number, Goal>;
  private settings: Map<number, Settings>;
  private userStats: Map<number, UserStats>;
  
  sessionStore: session.Store;

  private userIdCounter: number;
  private courseIdCounter: number;
  private termIdCounter: number;
  private taskIdCounter: number;
  private studySessionIdCounter: number;
  private goalIdCounter: number;
  private settingsIdCounter: number;
  private userStatsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.terms = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.goals = new Map();
    this.settings = new Map();
    this.userStats = new Map();

    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.termIdCounter = 1;
    this.taskIdCounter = 1;
    this.studySessionIdCounter = 1;
    this.goalIdCounter = 1;
    this.settingsIdCounter = 1;
    this.userStatsIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Course methods
  async getCourses(userId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.userId === userId
    );
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) {
      return undefined;
    }
    const updatedCourse = { ...existingCourse, ...course };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Term methods
  async getTerms(userId: number): Promise<Term[]> {
    return Array.from(this.terms.values()).filter(
      (term) => term.userId === userId
    );
  }

  async getTerm(id: number): Promise<Term | undefined> {
    return this.terms.get(id);
  }

  async getActiveTermForUser(userId: number): Promise<Term | undefined> {
    return Array.from(this.terms.values()).find(
      (term) => term.userId === userId && term.isActive
    );
  }

  async createTerm(term: InsertTerm): Promise<Term> {
    const id = this.termIdCounter++;
    const newTerm: Term = { ...term, id };
    this.terms.set(id, newTerm);
    return newTerm;
  }

  async updateTerm(id: number, term: Partial<Term>): Promise<Term | undefined> {
    const existingTerm = this.terms.get(id);
    if (!existingTerm) {
      return undefined;
    }
    const updatedTerm = { ...existingTerm, ...term };
    this.terms.set(id, updatedTerm);
    return updatedTerm;
  }

  async deleteTerm(id: number): Promise<boolean> {
    return this.terms.delete(id);
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByType(userId: number, taskType: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.taskType === taskType
    );
  }

  async getTasksByCourse(courseId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.courseId === courseId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getUpcomingTasks(userId: number, days: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return Array.from(this.tasks.values()).filter(
      (task) => 
        task.userId === userId && 
        task.dueDate !== null && 
        task.dueDate !== undefined &&
        task.dueDate >= now && 
        task.dueDate <= futureDate
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Study session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async getStudySessionsForDay(userId: number, date: Date): Promise<StudySession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.studySessions.values()).filter(
      (session) => 
        session.userId === userId && 
        session.startTime >= startOfDay && 
        session.startTime <= endOfDay
    );
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionIdCounter++;
    const newSession: StudySession = { ...session, id };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined> {
    const existingSession = this.studySessions.get(id);
    if (!existingSession) {
      return undefined;
    }
    const updatedSession = { ...existingSession, ...session };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const newGoal: Goal = { ...goal, id };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) {
      return undefined;
    }
    const updatedGoal = { ...existingGoal, ...goal };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async createSettings(setting: InsertSettings): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const newSettings: Settings = { ...setting, id };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  async updateSettings(userId: number, updatedSettings: Partial<Settings>): Promise<Settings | undefined> {
    const existingSettings = Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
    
    if (!existingSettings) {
      return undefined;
    }
    
    const updated = { ...existingSettings, ...updatedSettings };
    this.settings.set(existingSettings.id, updated);
    return updated;
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      (stats) => stats.userId === userId
    );
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const id = this.userStatsIdCounter++;
    const newStats: UserStats = { ...stats, id };
    this.userStats.set(id, newStats);
    return newStats;
  }

  async updateUserStats(userId: number, updatedStats: Partial<UserStats>): Promise<UserStats | undefined> {
    const existingStats = Array.from(this.userStats.values()).find(
      (stats) => stats.userId === userId
    );
    
    if (!existingStats) {
      return undefined;
    }
    
    const updated = { ...existingStats, ...updatedStats };
    this.userStats.set(existingStats.id, updated);
    return updated;
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './database-storage';

// Use DatabaseStorage for production, MemStorage for development if needed
export const storage = new DatabaseStorage();
