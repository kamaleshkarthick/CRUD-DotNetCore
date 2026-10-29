const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export default function ProductTable({ products, loading, editingId, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading products…</p>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="alert alert-light border text-center">No products yet. Add one using the form.</div>;
  }

  return (
    // table-responsive adds horizontal scrolling on small screens
    <div className="table-responsive card shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th className="d-none d-md-table-cell">Description</th>
            <th className="text-end">Price</th>
            <th className="text-end">Qty</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            // `key` lets React track which row is which between renders
            <tr key={p.id} className={p.id === editingId ? 'table-warning' : undefined}>
              <td>{p.id}</td>
              <td className="fw-medium">{p.name}</td>
              <td className="d-none d-md-table-cell text-muted">{p.description}</td>
              <td className="text-end">{currency.format(p.price)}</td>
              <td className="text-end">{p.quantity}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
