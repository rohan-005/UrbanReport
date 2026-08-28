import { User } from '../types';
import { MOCK_USERS } from '../data/mock-users';
import { validateAadhaarNumber } from '../utils/validation';

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  login(email: string, password?: string): Promise<User>;
  register(userData: {
    name: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
  }): Promise<User>;
  logout(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

class MockAuthRepositoryImpl implements IAuthRepository {
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();
  private storageKey = 'urbanreports_mock_auth_user_v1';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
          return;
        } catch {
          // fallback
        }
      }
    }
    // Default logged in user for smooth demo
    this.currentUser = MOCK_USERS[0];
  }

  private persist() {
    if (typeof window !== 'undefined') {
      if (this.currentUser) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getCurrentUser(): Promise<User | null> {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  public async login(email: string): Promise<User> {
    const existing = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.currentUser = existing;
    } else {
      // Create citizen user on the fly if unknown email
      const nameFromEmail = email.split('@')[0].replace('.', ' ');
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email,
        phone: '+91 98000 00000',
        role: email.includes('admin') ? 'ADMIN' : 'CITIZEN',
        isVerified: true,
      };
      this.currentUser = newUser;
    }

    this.persist();
    return { ...this.currentUser };
  }

  public async register(userData: {
    name: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
  }): Promise<User> {
    const aadhaarResult = validateAadhaarNumber(userData.aadhaarNumber);
    if (!aadhaarResult.isValid) {
      throw new Error(aadhaarResult.error || 'Invalid Aadhaar format');
    }

    // Mask Aadhaar for UI display security
    const cleaned = userData.aadhaarNumber.replace(/\D/g, '');
    const masked = `XXXX-XXXX-${cleaned.slice(8)}`;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'CITIZEN',
      aadhaarNumber: masked,
      isVerified: true,
    };

    this.currentUser = newUser;
    this.persist();
    return newUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    this.persist();
  }
}

export const authRepository = new MockAuthRepositoryImpl();
