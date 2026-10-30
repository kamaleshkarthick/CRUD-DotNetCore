import { Component, input, output } from '@angular/core';
import { Product } from '../../models/product';

// A Bootstrap-styled modal controlled by the parent (no Bootstrap JavaScript needed).
@Component({
  selector: 'app-confirm-delete-modal',
  templateUrl: './confirm-delete-modal.html',
  host: { '(document:keydown.escape)': 'dismiss()' },
})
export class ConfirmDeleteModal {
  readonly product = input<Product | null>(null);
  readonly deleting = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected dismiss(): void {
    if (this.product() && !this.deleting()) this.cancelled.emit();
  }
}
