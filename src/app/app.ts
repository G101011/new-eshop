import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import { CartService, CartItem, Product } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  title = 'E-SHOP';

  /** 🛍 Product Data */
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing"];
  selectedCategory: string | null = null;
  searchTerm = '';

  /** 🛒 Cart Data */
  cart: CartItem[] = [];
  isOpen = false;

  /** 📦 Product Detail */
  selectedProduct: Product | null = null;

  /** 🧾 Invoice Modal */
  showInvoice = false;
  customerName = '';
  customerSex = '';
  currentDate: Date = new Date();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  /** 🔄 Initialize Product & Cart */
  async ngOnInit(): Promise<void> {
    await this.loadProducts();

    this.cartService.cartChanges.subscribe((cart) => {
      this.cart = [...cart];
    });

    this.cart = [...this.cartService.getCart()];
  }

  /** 🔄 Fetch Products from API */
  private async loadProducts(): Promise<void> {
    try {
      const products = await this.productService.fetchProducts();
      this.products = products.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: this.mapCategory(p.category),
        thumbnail: p.image || 'https://via.placeholder.com/300x300?text=No+Image',
      }));
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  }

  /** 🛒 Cart Logic */
  get totalUSD(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get totalKHR(): number {
    return this.totalUSD * 4100;
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  changeQty(productId: number, delta: number): void {
    this.cartService.changeQty(productId, delta);
  }

  remove(productId: number): void {
    this.cartService.remove(productId);
    if (this.cart.length === 0) this.isOpen = false;
  }

  toggleCart(): void {
    this.isOpen = !this.isOpen;
  }

  /** 🧾 Checkout */
  confirmCheckout(): void {
    if (this.cart.length === 0) {
      alert('🛒 Your cart is empty!');
      return;
    }
    this.showInvoice = true;
    this.isOpen = false;
    this.currentDate = new Date();
  }

  /** 🔍 Product Filtering */
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(
      (p) =>
        (!this.selectedCategory || p.category === this.selectedCategory) &&
        (!term || p.title.toLowerCase().includes(term))
    );
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = null;
    this.filterProducts();
  }

  /** 🖱 Product Detail View */
  openProductDetail(product: Product): void {
    this.selectedProduct = product;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  /** ⬇️ Smooth Scroll */
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (id !== 'products') this.selectedProduct = null;
  }

  /** 🗂 Map API Category to Display Category */
  private mapCategory(apiCategory: string): string {
    const categoryMap: Record<string, string> = {
      electronics: 'Electronics',
      jewelery: 'Jewelery',
      "men's clothing": "Men's Clothing",
      "women's clothing": "Women's Clothing",
    };
    return categoryMap[apiCategory] || 'Others';
  }

  /** 🖨 Print Styled Invoice */
  printInvoice(): void {
    const printContent = document.getElementById('invoice');
    if (!printContent) return;

    const newWindow = window.open('', '', 'width=900,height=700');
    if (!newWindow) return;

    const cloned = printContent.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('button').forEach(btn => btn.remove());

    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; color: #000; }
            .invoice-header { text-align: center; border-bottom: 2px solid #1976D2; padding-bottom: 10px; margin-bottom: 20px; }
            .invoice-header h1 { margin: 0; color: #1976D2; }
            .invoice-header p { margin: 2px 0; font-size: 14px; }
            .customer-info { margin-bottom: 20px; }
            .customer-info div { margin: 3px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #e3f2fd; }
            .total-row { font-weight: bold; background-color: #f1f8e9; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #555; }
            .product-img { width: 50px; height: 50px; object-fit: contain; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>E-SHOP Invoice</h1>
            <p>${this.currentDate.toLocaleString()}</p>
          </div>

          <div class="customer-info">
            <div><strong>Customer Name:</strong> ${this.customerName || 'N/A'}</div>
            <div><strong>Sex:</strong> ${this.customerSex || 'N/A'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Thumbnail</th>
                <th>Price (USD)</th>
                <th>Qty</th>
                <th>Subtotal (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${this.cart.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.title}</td>
                  <td><img src="${item.thumbnail}" class="product-img"/></td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${item.qty}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">Total (USD)</td>
                <td>${this.totalUSD.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="5">Total (KHR)</td>
                <td>${this.totalKHR.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Thank you for shopping with E-SHOP!<br>
            Have a great day!
          </div>
        </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }

  /** 🧹 Close Invoice & Clear Cart */
  closeInvoiceModal(): void {
    this.showInvoice = false;
    this.cartService.clearCart();
    this.cart = [...this.cartService.getCart()];
    this.customerName = '';
    this.customerSex = '';
  }
}
