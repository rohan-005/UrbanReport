import { User } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_USERS_SERVICE_URL || 'http://localhost:3001';

class AuthServiceAPI {
  private tokenKey = 'urbanreports_access_token';

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
  }

  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Invalid email address or password.');
    }

    const data = await res.json();
    this.setToken(data.accessToken);
    return { token: data.accessToken, user: data.user };
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    aadhaarNumber: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword || data.password,
        aadhaar: data.aadhaarNumber,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        Array.isArray(errData.message)
          ? errData.message[0]
          : errData.message || 'Registration failed.',
      );
    }

    const resData = await res.json();
    this.setToken(resData.accessToken);
    return { token: resData.accessToken, user: resData.user };
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearToken();
        return null;
      }

      return await res.json();
    } catch {
      return null;
    }
  }

  async updateProfile(updates: { name?: string; phone?: string; avatar?: string }): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('Unauthenticated');

    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update profile.');
    }

    return await res.json();
  }

  async updateNotificationPreferences(prefs: {
    complaintUpdates?: boolean;
    resolutionNotifications?: boolean;
    assignmentUpdates?: boolean;
  }): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Unauthenticated');

    const res = await fetch(`${API_BASE}/users/me/notification-preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prefs),
    });

    if (!res.ok) {
      throw new Error('Failed to update notification preferences.');
    }

    return await res.json();
  }

  logout() {
    this.clearToken();
  }
}

export const authService = new AuthServiceAPI();
