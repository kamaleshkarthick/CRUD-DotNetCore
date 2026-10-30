import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage, getValidationErrors } from './api-errors';

const httpError = (status: number, error: unknown) => new HttpErrorResponse({ status, error });

describe('getErrorMessage', () => {
  it('explains that the server is unreachable when there is no response', () => {
    expect(getErrorMessage(httpError(0, null))).toContain('Cannot reach the server');
  });

  it('uses the { message } the API sends for a 404', () => {
    expect(getErrorMessage(httpError(404, { message: 'Product 9 not found.' }))).toBe(
      'Product 9 not found.',
    );
  });

  it('uses the ProblemDetails title for a 500', () => {
    expect(getErrorMessage(httpError(500, { title: 'An unexpected error occurred.' }))).toBe(
      'An unexpected error occurred. (HTTP 500)',
    );
  });

  it('falls back to the status code', () => {
    expect(getErrorMessage(httpError(503, null))).toBe('Request failed with status 503.');
  });
});

describe('getValidationErrors', () => {
  it('maps ASP.NET field errors to camelCase form fields', () => {
    const error = httpError(400, { errors: { Name: ['Too short.', 'Other.'], Price: ['Bad.'] } });
    expect(getValidationErrors(error)).toEqual({ name: 'Too short.', price: 'Bad.' });
  });

  it('ignores errors other than 400', () => {
    expect(getValidationErrors(httpError(500, { errors: { Name: ['x'] } }))).toEqual({});
  });
});
