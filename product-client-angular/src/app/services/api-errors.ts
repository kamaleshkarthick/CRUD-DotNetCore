import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type FieldErrors = Record<string, string>;

// Turn any HTTP error into a human-readable message.
export function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    // No response at all: API is not running, wrong URL, or CORS blocked it.
    return `Cannot reach the server. Is the API running on ${environment.apiUrl}?`;
  }
  if (error.error?.message) return error.error.message; // our { message } from NotFound()
  if (error.error?.title) return `${error.error.title} (HTTP ${error.status})`; // ASP.NET ProblemDetails
  return `Request failed with status ${error.status}.`;
}

// ASP.NET returns validation errors as { errors: { Name: ["..."], Price: ["..."] } }.
// Convert to { name: "...", price: "..." } so the form can show them per field.
export function getValidationErrors(error: HttpErrorResponse): FieldErrors {
  const errors: Record<string, string[]> | undefined =
    error.status === 400 ? error.error?.errors : undefined;
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      messages[0],
    ]),
  );
}
