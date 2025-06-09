import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { User } from '../shared/schema';

// Load environment variables
dotenv.config();

// Get session secret from environment or use fallback
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-to-a-secure-random-secret";

if (SESSION_SECRET === "change-this-to-a-secure-random-secret") {
  console.warn("Warning: Using default session secret. Set a secure SESSION_SECRET in your .env file!");
}

// Add type definition for Express
declare global {
  namespace Express {
    interface User extends User {}
  }
}

// Password hashing functions
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password using PBKDF2
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') + '.' + salt);
    });
  });
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Split the hashed password to get the original salt
    const [hash, salt] = hashedPassword.split('.');
    
    // Hash the provided password with the same salt
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === hash);
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export function setupAuth(app: Express) {
  console.log("Setting up auth routes...");

  // Configure sessions
  app.use(
    session({
      cookie: { 
        maxAge: 86400000, 
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        domain: 'localhost'
      }, 
      store: storage.sessionStore,
      resave: false,
      saveUninitialized: true,
      secret: SESSION_SECRET,
      name: 'sessionId'
    })
  );

  // Add session debugging middleware
  app.use((req, res, next) => {
    console.log('Session:', {
      id: req.sessionID,
      cookie: req.session?.cookie,
      user: req.user
    });
    next();
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);
        
        // If no user found or password doesn't match
        if (!user || !(await verifyPassword(password, user.password))) {
          return done(null, false);
        }
        
        // User authenticated successfully
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    console.log("hit register:", req.method, req.path);
    try {
      console.log('tesssst')
      console.log("hit register:", req.method, req.path);
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Initialize user stats
      await storage.createUserStats({
        userId: user.id,
        totalHoursStudied: 0,
        totalTasksCompleted: 0,
        streakDays: 0,
        weeklyStudyGoal: 10,
        weeklyHoursStudied: 0,
        improvement: 0,
        overallProgress: 0
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error destroying session" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      // Don't send password back to client
      const { password, ...userWithoutPassword } = req.user as any;
      return res.json(userWithoutPassword);
    }
    res.status(401).json({ message: "Not authenticated" });
  });
}