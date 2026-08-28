import { User } from '../types';
import { authService } from '../services/authService';

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  login(email: string, password?: string): Promise<User>;
  register(data: {
    name: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<User>;
  logout(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export class AuthRepository implements IAuthRepository {
  private listeners: Set<() => void> = new Set();

  async getCurrentUser(): Promise<User | null> {
    return authService.getCurrentUser();
  }

  async login(email: string, password?: string): Promise<User> {
    const res = await authService.login(email, password);
    this.notify();
    return res.user;
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<User> {
    const res = await authService.register(data);
    this.notify();
    return res.user;
  }

  async logout(): Promise<void> {
    authService.logout();
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const authRepository = new AuthRepository();
