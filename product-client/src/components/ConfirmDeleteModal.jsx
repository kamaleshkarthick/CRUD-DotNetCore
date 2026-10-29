// A Bootstrap-styled modal controlled by React state (no Bootstrap JavaScript needed).
export default function ConfirmDeleteModal({ product, deleting, onConfirm, onCancel }) {
  if (!product) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete product</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} disabled={deleting} />
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{product.name}</strong>? This cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
                {deleting && <span className="spinner-border spinner-border-sm me-2" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
