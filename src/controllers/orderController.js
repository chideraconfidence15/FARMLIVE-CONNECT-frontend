import { api } from "../lib/api";

export const saveOrder = async (user, totalAmount, paymentReference, items, status = "paid") => {
  if (!user) {
    console.error("No user provided to saveOrder");
    throw new Error("User must be logged in to save an order");
  }

  try {
    const formattedItems = items.map((item) => ({
      productId: item.$id || item.id || item.productId,
      productName: item.productName || item.name || "Produce Item",
      price: item.price,
      quantity: item.quantity || 1
    }));

    const orderData = {
      userId: user.$id || user.id,
      userName: user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || "Customer",
      userEmail: user.email || "",
      totalAmount: parseFloat(totalAmount) || 0,
      status: status,
      paymentReference: String(paymentReference || `REF-${Date.now()}`),
      items: formattedItems
    };

    console.log("Saving order to REST API:", orderData);
    const response = await api.post('/orders', orderData);
    console.log("Order saved successfully:", response);
    return response;
  } catch (error) {
    console.error("Detailed error in saveOrder:", error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const orders = await api.get('/orders', { userId });
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return [];
  }
};
