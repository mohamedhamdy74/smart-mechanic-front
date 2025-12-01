import { api } from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: File[];
  stock?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

class ProductService {
  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
              queryParams.append(key, value.toString());
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `products${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get(`products/${id}`);
      return response.data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Create new product
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const formData = new FormData();

      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.post('products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Update product
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    try {
      const formData = new FormData();

      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.put(`products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await api.get(`products?category=${encodeURIComponent(category)}`);
      return (response.data as any).products || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await api.get(`products?search=${encodeURIComponent(query)}`);
      return (response.data as any).products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Get product statistics
  async getProductStats(): Promise<{
    totalProducts: number;
    totalCategories: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  }> {
    try {
      const response = await api.get('products/stats');
      return response.data as {
        totalProducts: number;
        totalCategories: number;
        lowStockProducts: number;
        outOfStockProducts: number;
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product statistics');
    }
  }
}

export const productService = new ProductService();