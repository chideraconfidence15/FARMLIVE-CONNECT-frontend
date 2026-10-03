import { Card, CardBody, Chip, Spinner, Accordion, AccordionItem, Divider, Alert } from "@heroui/react";
import { useUser } from "../contexts/userContext";
import { useEffect, useState } from "react";
import { getUserOrders } from "../controllers/orderController";

export default function OrderHistoryPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user === null) {
      const timer = setTimeout(() => {
        if (!user) setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (user) {
      getUserOrders(user.$id || user.id).then(userOrders => {
        setOrders(userOrders);
        setIsLoading(false);
      }).catch(err => {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
        setIsLoading(false);
      });
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'successful':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  /**
   * Robust parser for order items.
   * Handles: 
   * 1. Single JSON string containing an array
   * 2. Array of JSON strings (Appwrite "array" attribute)
   * 3. Already parsed array of objects
   */
  const getOrderItems = (itemsData) => {
    if (!itemsData) return [];
    
    try {
      // Case 1: It's an array
      if (Array.isArray(itemsData)) {
        return itemsData.map(item => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return { productName: item }; // Fallback if string isn't JSON
            }
          }
          return item;
        });
      }

      // Case 2: It's a single string
      if (typeof itemsData === 'string') {
        const parsed = JSON.parse(itemsData);
        // If the string parsed into an array, recurse once to handle potential string elements
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'string') {
              try { return JSON.parse(item); } catch { return { productName: item }; }
            }
            return item;
          });
        }
        return [parsed];
      }
    } catch (e) {
      console.error("Error parsing order items:", e);
    }
    
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" color="success" label="Loading your orders..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 px-4">
        <Alert color="warning" title="Authentication Required" description="Please login to view your order history" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      {error && (
        <Alert color="danger" title="Error" description={error} className="mb-6" />
      )}

      {orders.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-gray-500 text-lg">
            You haven't placed any orders yet.
          </CardBody>
        </Card>
      ) : (
        <Accordion variant="splitted" className="px-0 gap-4">
          {orders.map((order) => {
            const items = getOrderItems(order.items);
            const date = new Date(order.createdAt || order.$createdAt).toLocaleDateString();
            
            return (
              <AccordionItem
                key={order.$id}
                aria-label={`Order ${order.$id}`}
                className="bg-white shadow-sm border border-gray-100"
                title={
                  <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 pr-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500 font-normal">{date}</span>
                      <span className="font-mono text-[10px] text-gray-400">Ref: {order.paymentReference || order.$id}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-lg font-bold text-green-700">
                        ${order.totalAmount ? Number(order.totalAmount).toFixed(2) : "0.00"}
                      </div>
                      <Chip color={getStatusColor(order.status)} variant="flat" size="sm" className="capitalize">
                        {order.status || 'Pending'}
                      </Chip>
                    </div>
                  </div>
                }
              >
                <div className="pb-4 pt-2">
                  <Divider className="mb-4" />
                  <h4 className="text-sm font-bold mb-3 text-gray-700 uppercase tracking-wider px-2">Order Items</h4>
                  <div className="flex flex-col gap-2">
                    {items.length > 0 ? (
                      items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mx-2 border border-gray-100">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{item?.productName || "Unknown Product"}</span>
                            <span className="text-[10px] text-gray-500">
                              {item?.price ? `$${item.price}/unit` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-gray-600">Qty: {item?.quantity || 1}</span>
                            <span className="font-bold text-sm">
                              {item?.price && item?.quantity ? `$${(item.price * item.quantity).toFixed(2)}` : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic px-2 text-sm">No items details available.</p>
                    )}
                  </div>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
