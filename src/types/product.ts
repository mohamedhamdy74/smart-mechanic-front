export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  workshopId: string;
  workshopName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  images: File[];
  stock: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  _id: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  workshopId?: string;
  search?: string;
}