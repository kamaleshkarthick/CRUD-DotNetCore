import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-table',
  imports: [CurrencyPipe],
  templateUrl: './product-table.html',
})
export class ProductTable {
  readonly products = input.required<Product[]>();
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly editingId = input<number | undefined>();
  readonly edit = output<Product>();
  readonly remove = output<Product>();
}
