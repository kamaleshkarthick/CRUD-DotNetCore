import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Product, ProductRequest } from '../../models/product';
import { FieldErrors } from '../../services/api-errors';

type Field = 'name' | 'description' | 'price' | 'quantity';

// Validate the trimmed name, because that is what gets sent to the API.
function nameLength(control: AbstractControl<string>): ValidationErrors | null {
  const length = control.value.trim().length;
  if (length === 0) return { required: true };
  return length < 2 || length > 100 ? { length: true } : null;
}

const priceRange = 'Price must be between 0.01 and 1,000,000.';
const quantityRange = 'Quantity must be a whole number between 0 and 100,000.';

// Message for each validator key, mirroring the rules on ProductRequest.cs.
// The server still validates: never trust the client alone.
const messages: Record<Field, Record<string, string>> = {
  name: { required: 'Name is required.', length: 'Name must be 2-100 characters.' },
  description: { maxlength: 'Description can be at most 500 characters.' },
  price: {
    required: 'Price is required.',
    min: priceRange,
    max: priceRange,
    pattern: 'Price can have at most 2 decimal places.', // the column is decimal(18,2)
  },
  quantity: {
    required: 'Quantity is required.',
    min: quantityRange,
    max: quantityRange,
    pattern: quantityRange,
  },
};

// Used for both Create and Update: if `product` is set, we are editing.
@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
})
export class ProductForm {
  readonly product = input<Product | null>(null);
  readonly saving = input(false);
  readonly disabled = input(false);
  readonly submitted = output<ProductRequest>();
  readonly cancelled = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', nameLength],
    description: ['', Validators.maxLength(500)],
    price: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(1_000_000),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ],
    ],
    quantity: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100_000),
        Validators.pattern(/^\d+$/),
      ],
    ],
  });

  // Errors from an API 400 response, keyed by field name.
  private readonly serverErrors = signal<FieldErrors>({});

  constructor() {
    // Runs whenever `product` changes: fills the form, or clears it when back in "add" mode.
    effect(() => {
      const product = this.product();
      this.serverErrors.set({});
      if (product) {
        this.form.reset({ ...product, description: product.description ?? '' });
      } else {
        this.form.reset();
      }
    });
  }

  // Called by the parent after a successful create.
  reset(): void {
    this.form.reset();
  }

  // Called by the parent when the API rejects the data.
  showServerErrors(errors: FieldErrors): void {
    this.serverErrors.set(errors);
  }

  protected error(field: Field): string | undefined {
    const control = this.form.controls[field];
    const [key] = control.touched ? Object.keys(control.errors ?? {}) : [];
    return key ? messages[field][key] : this.serverErrors()[field];
  }

  // Clear the API's error while the user types a correction.
  protected clearServerError(field: Field): void {
    this.serverErrors.update(({ [field]: _, ...rest }) => rest);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, description, price, quantity } = this.form.getRawValue();
    this.submitted.emit({
      name: name.trim(),
      description: description.trim() || null,
      price: price!, // required validators guarantee these are set
      quantity: quantity!,
    });
  }
}
