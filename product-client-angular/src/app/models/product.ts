// Mirrors the JSON returned by the API (ProductApi/Models/Product.cs).
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string | null;
}

// What the client may send for Create and Update (ProductApi/Dtos/ProductRequest.cs).
export type ProductRequest = Pick<Product, 'name' | 'description' | 'price' | 'quantity'>;
