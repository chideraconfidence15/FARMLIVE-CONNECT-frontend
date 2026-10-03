import { api } from "../lib/api";

export const fetchFarm = async (farmId) => {
  try {
    const farm = await api.get(`/farms/${farmId}`);
    return [farm];
  } catch (error) {
    console.error(`Error fetching farm ${farmId}:`, error.message);
    // Return fallback farm to prevent crash
    return [{
      $id: farmId,
      id: farmId,
      farmName: "Local Farm Partner",
      location: "Nigeria",
      farmDescription: "Fresh local livestock & agricultural produce.",
      rating: 4.8,
      status: "open",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80"
    }];
  }
};

export const fetchFarmProducts = async (farmId) => {
  try {
    return await api.get('/products', { farmId });
  } catch (error) {
    console.error(`Error fetching products for farm ${farmId}:`, error.message);
    return [];
  }
};

export const fetchAllProducts = async (params = {}) => {
  try {
    const products = await api.get('/products', params);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
};

export const fetchAllFarms = async () => {
  try {
    const farms = await api.get('/farms');
    return Array.isArray(farms) ? farms : [];
  } catch (error) {
    console.error("Error fetching farms:", error.message);
    return [];
  }
};

export const fetchProduct = async (productId) => {
  try {
    return await api.get(`/products/${productId}`);
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error.message);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const categories = await api.get('/categories');
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }
};
