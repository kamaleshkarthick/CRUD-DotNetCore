import axios from 'axios';

// One configured Axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Each function maps 1:1 to an endpoint in ProductsController.
export const getProducts = () => api.get('/products').then((res) => res.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((res) => res.data);
export const createProduct = (product) => api.post('/products', product).then((res) => res.data);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then((res) => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Turn any Axios error into a human-readable message.
export function getErrorMessage(error) {
  if (!error.response) {
    // No response at all: API is not running, wrong URL, or CORS blocked it.
    return 'Cannot reach the server. Is the API running on ' + import.meta.env.VITE_API_URL + '?';
  }
  const { status, data } = error.response;
  if (data?.message) return data.message;             // our { message } from NotFound()
  if (data?.title) return `${data.title} (HTTP ${status})`; // ASP.NET ProblemDetails
  return `Request failed with status ${status}.`;
}

// ASP.NET returns validation errors as { errors: { Name: ["..."], Price: ["..."] } }.
// Convert to { name: "...", price: "..." } so the form can show them per field.
export function getValidationErrors(error) {
  const errors = error.response?.status === 400 ? error.response.data?.errors : null;
  if (!errors) return null;
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      messages[0],
    ]),
  );
}
