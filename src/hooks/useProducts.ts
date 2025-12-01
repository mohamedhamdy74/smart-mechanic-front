import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError,
  setCurrentProduct,
  setCategories,
} from '@/store/slices/productsSlice';
import { Product, CreateProductRequest, ProductFilters } from '@/types/product';

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    currentProduct,
    loading,
    error,
    total,
    page,
    pages,
    categories,
  } = useAppSelector((state: RootState) => state.products);

  const getProducts = async (filters?: ProductFilters, page = 1, limit = 10) => {
    try {
      const resultAction = await dispatch(fetchProducts({ filters, page, limit }));
      return resultAction.meta.requestStatus === 'fulfilled';
    } catch (error) {
      return false;
    }
  };

  const getProductById = async (productId: string) => {
    try {
      const resultAction = await dispatch(fetchProductById(productId));
      return resultAction.meta.requestStatus === 'fulfilled';
    } catch (error) {
      return false;
    }
  };

  const createNewProduct = async (productData: FormData) => {
    try {
      const resultAction = await dispatch(createProduct(productData));
      return resultAction.meta.requestStatus === 'fulfilled';
    } catch (error) {
      return false;
    }
  };

  const updateExistingProduct = async (productId: string, productData: FormData) => {
    try {
      const resultAction = await dispatch(updateProduct({ productId, productData }));
      return resultAction.meta.requestStatus === 'fulfilled';
    } catch (error) {
      return false;
    }
  };

  const deleteExistingProduct = async (productId: string) => {
    try {
      const resultAction = await dispatch(deleteProduct(productId));
      return resultAction.meta.requestStatus === 'fulfilled';
    } catch (error) {
      return false;
    }
  };

  const clearProductError = () => {
    dispatch(clearError());
  };

  const setProduct = (product: Product | null) => {
    dispatch(setCurrentProduct(product));
  };

  const updateCategories = (newCategories: string[]) => {
    dispatch(setCategories(newCategories));
  };

  return {
    products,
    currentProduct,
    loading,
    error,
    total,
    page,
    pages,
    categories,
    getProducts,
    getProductById,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
    clearError: clearProductError,
    setCurrentProduct: setProduct,
    setCategories: updateCategories,
  };
};