/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  STUDENT = 'STUDENT'
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  institution?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  description: string;
  quantity: number;
  availableCopies: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_STOCK';
  author: Author;
  category: Category;
  shelf: Shelf;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Shelf {
  id: number;
  locationCode: string;
}

export interface Loan {
  id: number;
  user: User;
  book: Book;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

export interface Reservation {
  id: number;
  user: User;
  book: Book;
  reservationDate: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
}

export interface Fine {
  id: number;
  user: User;
  loan: Loan;
  amount: number;
  reason: string;
  status: 'PAID' | 'UNPAID';
  createdAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  borrowedBooks: number;
  availableBooks: number;
  overdueBooks: number;
  totalUsers: number;
}
