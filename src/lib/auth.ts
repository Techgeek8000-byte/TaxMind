import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(email: string, name: string, password: string, company?: string) {
  // Check if user exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError('USER_EXISTS', 'An account with this email already exists');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new AuthError('WEAK_PASSWORD', 'Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new AuthError('WEAK_PASSWORD', 'Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new AuthError('WEAK_PASSWORD', 'Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new AuthError('WEAK_PASSWORD', 'Password must contain at least one special character');
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { email, name, passwordHash, company },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
  };
}

export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check if account is locked
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new AuthError('ACCOUNT_LOCKED', `Account is locked. Try again in ${remainingMin} minutes.`);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthError('ACCOUNT_DISABLED', 'Account has been disabled. Contact administrator.');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    const newFailedAttempts = user.failedAttempts + 1;
    const lockUntil = newFailedAttempts >= MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION_MS)
      : null;

    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lockedUntil,
      },
    });

    if (lockUntil) {
      throw new AuthError('ACCOUNT_LOCKED', `Too many failed attempts. Account locked for 15 minutes.`);
    }

    throw new AuthError('INVALID_CREDENTIALS', `Invalid email or password. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.`);
  }

  // Login successful - reset failed attempts
  await db.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'login',
      ipAddress,
      userAgent,
      details: JSON.stringify({ email, timestamp: new Date().toISOString() }),
    },
  });

  // Create session token (simple JWT-like token)
  const sessionToken = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now(),
  })).toString('base64');

  return {
    token: sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
    },
  };
}

export async function verifySession(token: string): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) return null;

    const user = await db.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) return null;

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}

export async function createAuditLog(userId: string, action: string, details?: any, ipAddress?: string, userAgent?: string) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
    },
  });
}

// Simple session store in-memory
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export { AuthError, sessions };
