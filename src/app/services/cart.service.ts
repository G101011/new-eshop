import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** 🛍 Product Model (matches FakeStoreAPI) */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category?: string;
  thumbnail?: string; // we'll map FakeStoreAPI's "image" to this
}

/** 🛒 Cart Item Model */
export interface CartItem extends Product {
  qty: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  cartChanges = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromLocalStorage();
  }

  /** 📦 Get all items in the cart */
  getCart(): CartItem[] {
    return this.cart;
  }

  /** ➕ Add product to cart */
  addToCart(product: Product): void {
    // Ensure correct product image mapping (FakeStoreAPI uses "image")
    const normalizedProduct: Product = {
      ...product,
      thumbnail: product.thumbnail || (product as any).image || 'https://via.placeholder.com/300x300?text=No+Image',
    };

    const existing = this.cart.find((item) => item.id === normalizedProduct.id);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...normalizedProduct, qty: 1 });
    }
    this.saveCart();
  }

  /** 🔁 Change quantity of a product */
  changeQty(productId: number, delta: number): void {
    const item = this.cart.find((i) => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(productId);
    } else {
      this.saveCart();
    }
  }

  /** ❌ Remove a product entirely */
  remove(productId: number): void {
    this.cart = this.cart.filter((i) => i.id !== productId);
    this.saveCart();
  }

  /** 🧹 Clear all cart items */
  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  /** 💵 Get total price in USD */
  getTotalUSD(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  /** 🔢 Get total number of items */
  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  /** 💾 Save cart to localStorage & notify subscribers */
  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartChanges.next([...this.cart]);
  }

  /** 📤 Load cart from localStorage */
  private loadCartFromLocalStorage(): void {
    const stored = localStorage.getItem('cart');
    this.cart = stored ? JSON.parse(stored) : [];
    this.cartChanges.next([...this.cart]);
  }
}
