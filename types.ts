import type { User } from 'firebase/auth';

export type Theme = 'light' | 'dark';
export type FirebaseUser = User;

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  photos: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  createdAt: string;
  items: InvoiceItem[];
  total: number;
}

export interface ReceiptItem {
  productId: string;
  name: string;
  quantityAdded: number;
  newQuantity: number;
}

export interface Receipt {
  id: string;
  createdAt: string;
  items: ReceiptItem[];
}

export interface LedgerEntry {
  timestamp: string; // ISO string
  productId: string;
  productName: string;
  type: 'invoice' | 'receipt' | 'edit' | 'delete';
  quantityChange: number;
  beforeQuantity: number;
  afterQuantity: number;
}

export type SortKey = 'default' | 'price' | 'quantity' | 'name';
export type SortDirection = 'asc' | 'desc';