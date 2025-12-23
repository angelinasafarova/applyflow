import { User } from './types';
import { dbStatements, generateId } from './db';

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export const SESSION_COOKIE = 'applyflow_session';

// Generate session token
export const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Create session
export const createSession = (userId: string): string => {
  const token = generateSessionToken();
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

  sessions.set(token, { userId, expiresAt });
  return token;
};

// Validate session
export const validateSession = (token: string): string | null => {
  const session = sessions.get(token);

  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session.userId;
};

// Destroy session
export const destroySession = (token: string): void => {
  sessions.delete(token);
};

// Auth functions
export const signUp = async (email: string, password: string): Promise<User | null> => {
  try {
    // Check if user exists
    const existingUser = dbStatements.getUserByEmail.get(email) as User | undefined;
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const userId = generateId();
    dbStatements.createUser.run(userId, email);

    const user = dbStatements.getUserById.get(userId) as User;
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
  try {
    // For MVP, we don't validate password - create user if doesn't exist
    let user = dbStatements.getUserByEmail.get(email) as User | undefined;

    if (!user) {
      // Create new user
      const userId = generateId();
      dbStatements.createUser.run(userId, email);
      user = dbStatements.getUserById.get(userId) as User;
    }

    const token = createSession(user.id);
    return { user, token };
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
};

// Get current user from request (server-side)
export const getCurrentUser = (request: Request): User | null => {
  // For MVP testing, always return the test user if any auth header is present
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Return test user for any valid-looking token
    return dbStatements.getUserByEmail.get('test@example.com') as User;
  }

  // Fallback to cookies
  const cookies = request.headers.get('cookie') || '';
  const sessionCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith(`${SESSION_COOKIE}=`));

  if (sessionCookie) {
    return dbStatements.getUserByEmail.get('test@example.com') as User;
  }

  return null;
};

// Client-side auth helpers
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    // Also clear any stored user data
    localStorage.removeItem('current_user');
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
