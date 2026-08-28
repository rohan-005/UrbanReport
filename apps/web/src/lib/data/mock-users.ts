import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    aadhaarNumber: 'XXXX-XXXX-8901',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 'user-002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98123 45678',
    role: 'CITIZEN',
    aadhaarNumber: 'XXXX-XXXX-4321',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 'admin-001',
    name: 'Vikramaditya Singh',
    email: 'admin.vikram@urbanreports.gov.in',
    phone: '+91 99000 11223',
    role: 'ADMIN',
    isVerified: true,
  },
  {
    id: 'officer-001',
    name: 'Eng. Rajesh Kumar',
    email: 'rajesh.roads@urbanreports.gov.in',
    phone: '+91 98440 55667',
    role: 'OFFICER',
    isVerified: true,
  },
  {
    id: 'officer-002',
    name: 'Officer Sunita Rao',
    email: 'sunita.sanitation@urbanreports.gov.in',
    phone: '+91 97330 88990',
    role: 'OFFICER',
    isVerified: true,
  },
];
