import { useCallback, useEffect, useState } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getErrorMessage,
  getValidationErrors,
} from './api/productService';

export default function App() {
  // ---- State: everything the UI needs to render ----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);         // product being edited, or null
  const [toDelete, setToDelete] = useState(null);       // product awaiting delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState(null);             // { type: 'success' | 'danger', text }

  const showAlert = (type, text) => setAlert({ type, text });

  // ---- READ ----
  const fetchProducts = useCallback(
    () =>
      getProducts()
        .then(setProducts)
        .catch((err) => showAlert('danger', getErrorMessage(err)))
        .finally(() => setLoading(false)),
    [],
  );

  // Runs once when the component first appears on screen (loading starts as true).
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // "Refresh" button: show the spinner, then fetch again.
  const handleRefresh = () => {
    setLoading(true);
    fetchProducts();
  };

  // ---- CREATE / UPDATE ----
  // Returns { ok, fieldErrors } so the form can reset itself or show API validation errors.
  const handleSubmit = async (data) => {
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, data);
        setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        showAlert('success', `"${updated.name}" was updated.`);
        setEditing(null);
      } else {
        const created = await createProduct(data);
        setProducts((list) => [...list, created]);
        showAlert('success', `"${created.name}" was added.`);
      }
      return { ok: true };
    } catch (err) {
      showAlert('danger', getErrorMessage(err));
      return { ok: false, fieldErrors: getValidationErrors(err) };
    }
  };

  // ---- DELETE ----
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      setProducts((list) => list.filter((p) => p.id !== toDelete.id));
      if (editing?.id === toDelete.id) setEditing(null);
      showAlert('success', `"${toDelete.name}" was deleted.`);
    } catch (err) {
      showAlert('danger', getErrorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-primary mb-4">
        <div className="container">
          <span className="navbar-brand fw-semibold">Product Manager</span>
          <span className="navbar-text small">React + ASP.NET Core + SQL Server</span>
        </div>
      </nav>

      <main className="container pb-5">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
            {alert.text}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert(null)} />
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-4">
            <ProductForm
              key={editing?.id ?? 'new'}
              product={editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">Products ({products.length})</h2>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleRefresh} disabled={loading}>
                Refresh
              </button>
            </div>
            <ProductTable
              products={products}
              loading={loading}
              editingId={editing?.id}
              onEdit={handleEdit}
              onDelete={setToDelete}
            />
          </div>
        </div>
      </main>

      <ConfirmDeleteModal
        product={toDelete}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
