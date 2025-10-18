import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { App } from './app';

@Component({ template: '<h2>Products Page</h2>' })
class ProductsComponent {}

@Component({ template: '<h2>About Page</h2>' })
class AboutComponent {}

@Component({ template: '<h2>Product Detail Page</h2>' })
class ProductDetailComponent {}

@Component({ template: '<h2>404 Not Found</h2>' })
class NotFoundComponent {}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: App },
  { path: 'products', component: ProductsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: '**', component: NotFoundComponent } // catch-all
];
