import { useQuery } from '@tanstack/react-query';
import api from '../utils/api.js';

/**
 * React Query Hook to handle product index queries.
 * Refetches automatically whenever filter query parameters change.
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await api.get('/products', { params: filters });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000
  });
}

/**
 * Hook to retrieve a single product's detail metrics.
 */
export function useProductDetail(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await api.get(`/products/${productId}`);
      return res.data;
    },
    enabled: !!productId
  });
}

/**
 * Hook to retrieve all categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });
}
