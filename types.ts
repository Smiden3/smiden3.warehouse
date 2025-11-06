export type Theme = 'light' | 'dark';

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


export type SortKey = 'default' | 'price' | 'quantity' | 'name';
export type SortDirection = 'asc' | 'desc';