import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { App } from './app';
import { Product } from './models/product';

const url = `${environment.apiUrl}/products`;

const mouse: Product = {
  id: 1,
  name: 'Wireless Mouse',
  description: 'Ergonomic',
  price: 24.99,
  quantity: 50,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: null,
};

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  let page: HTMLElement;

  const rows = () => Array.from(page.querySelectorAll('tbody tr'));
  const text = () => page.textContent ?? '';
  const button = (label: string) =>
    Array.from(page.querySelectorAll('button')).find((b) => b.textContent?.trim() === label)!;
  const value = (id: string) => page.querySelector<HTMLInputElement>(`#${id}`)!.value;

  function type(id: string, text: string): void {
    const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  function fillForm(name: string, price: string, quantity: string): void {
    type('name', name);
    type('price', price);
    type('quantity', quantity);
  }

  async function submit(): Promise<void> {
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  async function start(products: Product[] = [mouse]): Promise<void> {
    http.expectOne(url).flush(products);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    window.scrollTo = () => {}; // jsdom doesn't implement it
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    page = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('READ: lists the products from the API', async () => {
    await start();

    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('Wireless Mouse');
    expect(rows()[0].textContent).toContain('$24.99');
    expect(text()).toContain('Products (1)');
  });

  it('READ: shows an empty state', async () => {
    await start([]);

    expect(text()).toContain('No products yet');
  });

  it('READ: shows a banner when the API is unreachable', async () => {
    http.expectOne(url).error(new ProgressEvent('error'));
    await fixture.whenStable();

    expect(page.querySelector('.alert-danger')?.textContent).toContain('Cannot reach the server');
  });

  it('CREATE: posts trimmed data, appends the row and clears the form', async () => {
    await start();

    fillForm('  USB Hub  ', '39.5', '15');
    await submit();

    const request = http.expectOne({ method: 'POST', url });
    expect(request.request.body).toEqual({
      name: 'USB Hub',
      description: null,
      price: 39.5,
      quantity: 15,
    });
    request.flush({ ...mouse, id: 2, name: 'USB Hub', price: 39.5, quantity: 15 });
    await fixture.whenStable();

    expect(rows()).toHaveLength(2);
    expect(page.querySelector('.alert-success')?.textContent).toContain('"USB Hub" was added.');
    expect(value('name')).toBe('');
    expect(value('price')).toBe('');
  });

  it('CREATE: does not call the API when the form is invalid', async () => {
    await start();

    fillForm('A', '0', '1.5');
    await submit();

    expect(text()).toContain('Name must be 2-100 characters.');
    expect(text()).toContain('Price must be between 0.01 and 1,000,000.');
    expect(text()).toContain('Quantity must be a whole number between 0 and 100,000.');
    http.expectNone({ method: 'POST', url });
  });

  it('CREATE: rejects a price with more than 2 decimal places', async () => {
    await start();

    fillForm('USB Hub', '1.999', '1');
    await submit();

    expect(text()).toContain('Price can have at most 2 decimal places.');
    http.expectNone({ method: 'POST', url });
  });

  it('CREATE: shows API validation errors next to the field until corrected', async () => {
    await start();

    fillForm('USB Hub', '10', '1');
    await submit();
    http
      .expectOne({ method: 'POST', url })
      .flush(
        { title: 'One or more validation errors occurred.', errors: { Name: ['Name is taken.'] } },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();

    expect(page.querySelector('#name')!.classList).toContain('is-invalid');
    expect(text()).toContain('Name is taken.');

    type('name', 'USB Hub 2');
    await fixture.whenStable();
    expect(page.querySelector('#name')!.classList).not.toContain('is-invalid');
  });

  it('UPDATE: fills the form, puts the changes and replaces the row', async () => {
    await start();

    button('Edit').click();
    await fixture.whenStable();
    expect(text()).toContain('Edit product #1');
    expect(value('name')).toBe('Wireless Mouse');
    expect(value('price')).toBe('24.99');
    expect(rows()[0].classList).toContain('table-warning');

    type('name', 'Silent Mouse');
    await submit();

    const request = http.expectOne({ method: 'PUT', url: `${url}/1` });
    expect(request.request.body.name).toBe('Silent Mouse');
    request.flush({ ...mouse, name: 'Silent Mouse' });
    await fixture.whenStable();

    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('Silent Mouse');
    expect(text()).toContain('Add new product');
    expect(value('name')).toBe('');
  });

  it('UPDATE: cancel returns to add mode without calling the API', async () => {
    await start();

    button('Edit').click();
    await fixture.whenStable();
    button('Cancel').click();
    await fixture.whenStable();

    expect(text()).toContain('Add new product');
    expect(value('name')).toBe('');
  });

  it('UPDATE: keeps the edits when the API fails', async () => {
    await start();

    button('Edit').click();
    await fixture.whenStable();
    type('name', 'Silent Mouse');
    await submit();
    http
      .expectOne({ method: 'PUT', url: `${url}/1` })
      .flush({ message: 'Product 1 not found.' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(page.querySelector('.alert-danger')?.textContent).toContain('Product 1 not found.');
    expect(value('name')).toBe('Silent Mouse');
  });

  it('DELETE: asks first, then removes the row', async () => {
    await start();

    button('Delete').click();
    await fixture.whenStable();
    expect(page.querySelector('.modal')?.textContent).toContain('Wireless Mouse');
    http.expectNone({ method: 'DELETE', url: `${url}/1` });

    page.querySelector<HTMLButtonElement>('.modal .btn-danger')!.click();
    http.expectOne({ method: 'DELETE', url: `${url}/1` }).flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(page.querySelector('.modal')).toBeNull();
    expect(rows()).toHaveLength(0);
    expect(page.querySelector('.alert-success')?.textContent).toContain('was deleted.');
  });

  it('DELETE: cancelling keeps the product', async () => {
    await start();

    button('Delete').click();
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('.modal .btn-secondary')!.click();
    await fixture.whenStable();

    expect(page.querySelector('.modal')).toBeNull();
    expect(rows()).toHaveLength(1);
  });

  it('DELETE: leaves edit mode when the edited product is deleted', async () => {
    await start();

    button('Edit').click();
    await fixture.whenStable();
    button('Delete').click();
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('.modal .btn-danger')!.click();
    http.expectOne({ method: 'DELETE', url: `${url}/1` }).flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(text()).toContain('Add new product');
  });

  it('disables actions while a save is in flight', async () => {
    await start();

    fillForm('USB Hub', '10', '1');
    await submit();

    expect(button('Add product').disabled).toBe(true);
    expect(button('Refresh').disabled).toBe(true);
    expect(button('Edit').disabled).toBe(true);
    expect(button('Delete').disabled).toBe(true);

    http.expectOne({ method: 'POST', url }).flush({ ...mouse, id: 2 });
    await fixture.whenStable();
    expect(button('Refresh').disabled).toBe(false);
  });
});
