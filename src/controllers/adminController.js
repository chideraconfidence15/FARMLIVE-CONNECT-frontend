import { api, uploadFileHelper } from "../lib/api";

// Image Upload Helper
export const uploadImage = async (file) => {
  if (!file) return null;
  try {
    const dataUrl = await uploadFileHelper(file);
    return dataUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export const deleteImage = async (imageId) => {
  // Local/Data URI images don't require server cleanup
  return true;
};

// --- FARMS ---
export const createFarm = async (data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.post('/farms', {
    ...data,
    img: img || data.img,
    imageId: img ? "uploaded" : (data.imageId || "placeholder")
  });
};

export const updateFarm = async (documentId, data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.put(`/farms/${documentId}`, {
    ...data,
    img: img || data.img
  });
};

export const deleteFarm = async (documentId, imageId) => {
  return await api.delete(`/farms/${documentId}`);
};

// --- PRODUCE (PRODUCTS) ---
export const createProduct = async (data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.post('/products', {
    ...data,
    img: img || data.img,
    imageId: img ? "uploaded" : (data.imageId || "placeholder")
  });
};

export const updateProduct = async (documentId, data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.put(`/products/${documentId}`, {
    ...data,
    img: img || data.img
  });
};

export const deleteProduct = async (documentId, imageId) => {
  return await api.delete(`/products/${documentId}`);
};

export const updateProductStock = async (productId, newStock) => {
  try {
    return await api.patch(`/products/${productId}/stock`, {
      stockQuantity: newStock
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};

// --- CATEGORIES ---
export const createCategory = async (data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.post('/categories', {
    ...data,
    img: img || data.img,
    imageId: img ? "uploaded" : (data.imageId || "placeholder")
  });
};

export const updateCategory = async (documentId, data, file) => {
  let img = data.img;
  if (file) {
    img = await uploadImage(file);
  }
  return await api.put(`/categories/${documentId}`, {
    ...data,
    img: img || data.img
  });
};

export const deleteCategory = async (documentId, imageId) => {
  return await api.delete(`/categories/${documentId}`);
};

// --- ORDERS ---
export const fetchAllOrders = async (params = {}) => {
  try {
    const orders = await api.get('/orders', params);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const createAdminOrder = async (orderData) => {
  return await api.post('/orders', orderData);
};

export const updateOrder = async (orderId, orderData) => {
  return await api.put(`/orders/${orderId}`, orderData);
};

export const updateOrderStatus = async (orderId, status, eta) => {
  return await api.patch(`/orders/${orderId}`, { status, eta });
};

export const deleteOrder = async (orderId) => {
  return await api.delete(`/orders/${orderId}`);
};

// --- USERS ---
export const fetchAllUsers = async () => {
  try {
    const users = await api.get('/users');
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const createAdminUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const updateUser = async (userId, userData) => {
  return await api.put(`/users/${userId}`, userData);
};

export const deleteUser = async (userId) => {
  return await api.delete(`/users/${userId}`);
};

