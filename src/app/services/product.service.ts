import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService {
  async fetchProducts(): Promise<any[]> {
    try {
      const res = await fetch('https://fakestoreapi.com/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data; // already an array
    } catch (error) {
      console.error('❌ Error loading fake products:', error);
      return [];
    }
  }
}
