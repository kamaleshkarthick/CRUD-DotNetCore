import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { ConfirmDeleteModal } from './components/confirm-delete-modal/confirm-delete-modal';
import { ProductForm } from './components/product-form/product-form';
import { ProductTable } from './components/product-table/product-table';
import { Product, ProductRequest } from './models/product';
import { getErrorMessage, getValidationErrors } from './services/api-errors';
import { ProductService } from './services/product.service';

interface Alert {
  type: 'success' | 'danger';
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [ConfirmDeleteModal, ProductForm, ProductTable],
  templateUrl: './app.html',
})
export class App {
  private readonly api = inject(ProductService);
  private readonly form = viewChild.required(ProductForm);

  // ---- State: everything the UI needs to render ----
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly editing = signal<Product | null>(null); // product being edited, or null
  protected readonly toDelete = signal<Product | null>(null); // product awaiting delete confirmation
  protected readonly deleting = signal(false);
  protected readonly alert = signal<Alert | null>(null);

  // One request at a time, so a slow list response can't overwrite a save that finished after it.
  protected readonly busy = computed(() => this.loading() || this.saving());

  constructor() {
    this.load();
  }

  // ---- READ ----
  protected load(): void {
    this.loading.set(true);
    this.api
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: (err: HttpErrorResponse) => this.showError(err),
      });
  }

  // ---- CREATE / UPDATE ----
  protected save(data: ProductRequest): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, data) : this.api.create(data);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        if (editing) {
          this.products.update((list) => list.map((p) => (p.id === saved.id ? saved : p)));
          this.showSuccess(`"${saved.name}" was updated.`);
          this.editing.set(null);
        } else {
          this.products.update((list) => [...list, saved]);
          this.showSuccess(`"${saved.name}" was added.`);
          this.form().reset();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.showError(err);
        this.form().showServerErrors(getValidationErrors(err));
      },
    });
  }

  protected edit(product: Product): void {
    this.editing.set(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- DELETE ----
  protected confirmDelete(): void {
    const product = this.toDelete()!;

    this.deleting.set(true);
    this.api
      .delete(product.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.toDelete.set(null);
        }),
      )
      .subscribe({
        next: () => {
          this.products.update((list) => list.filter((p) => p.id !== product.id));
          if (this.editing()?.id === product.id) this.editing.set(null);
          this.showSuccess(`"${product.name}" was deleted.`);
        },
        error: (err: HttpErrorResponse) => this.showError(err),
      });
  }

  private showSuccess(text: string): void {
    this.alert.set({ type: 'success', text });
  }

  private showError(err: HttpErrorResponse): void {
    this.alert.set({ type: 'danger', text: getErrorMessage(err) });
  }
}
