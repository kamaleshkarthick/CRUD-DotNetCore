import { useState } from 'react';

const emptyForm = { name: '', description: '', price: '', quantity: '' };

const toFormValues = (product) =>
  product
    ? { name: product.name, description: product.description ?? '', price: String(product.price), quantity: String(product.quantity) }
    : emptyForm;

// Client-side validation mirrors the [Required]/[Range] rules on ProductRequest.cs.
// The server still validates: never trust the client alone.
function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2 || name.length > 100) errors.name = 'Name must be 2-100 characters.';

  if (values.description.length > 500) errors.description = 'Description can be at most 500 characters.';

  const price = Number(values.price);
  if (values.price === '') errors.price = 'Price is required.';
  else if (Number.isNaN(price) || price < 0.01 || price > 1_000_000) errors.price = 'Price must be between 0.01 and 1,000,000.';

  const qty = Number(values.quantity);
  if (values.quantity === '') errors.quantity = 'Quantity is required.';
  else if (!Number.isInteger(qty) || qty < 0 || qty > 100_000) errors.quantity = 'Quantity must be a whole number between 0 and 100,000.';

  return errors;
}

// Used for both Create and Update: if `product` is passed in, we are editing.
// App.jsx gives this component a `key` based on the product id, so React creates a
// fresh form (with fresh state) whenever you switch between "add" and "edit #N".
export default function ProductForm({ product, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(product);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined })); // clear error while typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    // onSubmit resolves to { ok, fieldErrors } — fieldErrors come from an API 400 response.
    const { ok, fieldErrors } = await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
      price: Number(values.price),
      quantity: Number(values.quantity),
    });
    setSubmitting(false);
    if (fieldErrors) setErrors(fieldErrors);
    if (ok && !isEdit) setValues(emptyForm);
  };

  const field = (name) => `form-control${errors[name] ? ' is-invalid' : ''}`;

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">{isEdit ? `Edit product #${product.id}` : 'Add new product'}</div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name *</label>
            <input id="name" name="name" className={field('name')} value={values.name} onChange={handleChange} />
            <div className="invalid-feedback">{errors.name}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea id="description" name="description" rows="2" className={field('description')} value={values.description} onChange={handleChange} />
            <div className="invalid-feedback">{errors.description}</div>
          </div>

          <div className="row">
            <div className="col-sm-6 mb-3">
              <label htmlFor="price" className="form-label">Price *</label>
              <input id="price" name="price" type="number" step="0.01" min="0" className={field('price')} value={values.price} onChange={handleChange} />
              <div className="invalid-feedback">{errors.price}</div>
            </div>
            <div className="col-sm-6 mb-3">
              <label htmlFor="quantity" className="form-label">Quantity *</label>
              <input id="quantity" name="quantity" type="number" step="1" min="0" className={field('quantity')} value={values.quantity} onChange={handleChange} />
              <div className="invalid-feedback">{errors.quantity}</div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm me-2" />}
              {isEdit ? 'Save changes' : 'Add product'}
            </button>
            {isEdit && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
