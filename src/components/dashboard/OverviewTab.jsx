import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Skeleton } from "@heroui/react";
import { DollarSign, Package, Tractor, UsersRound, TriangleAlert, ArrowRight } from "lucide-react";
import { fetchAllProducts, fetchAllFarms, fetchCategories } from "../../controllers/productController";
import { fetchAllOrders, fetchAllUsers, updateOrderStatus } from "../../controllers/adminController";
import toast from "react-hot-toast";

export default function OverviewTab({ setActiveTab }) {
  const [stats, setStats] = useState({
    products: [],
    farms: [],
    categories: [],
    orders: [],
    users: [],
    totalRevenue: 0,
    lowStockItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, farms, cats, ords, users] = await Promise.all([
        fetchAllProducts(),
        fetchAllFarms(),
        fetchCategories(),
        fetchAllOrders(),
        fetchAllUsers()
      ]);

      const totalRev = ords.reduce((acc, o) => {
        const val = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(o.price?.toString().replace(/[^0-9.]/g, '') || 0);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

      const lowStock = prods.filter((p) => (p.stockQuantity !== undefined ? p.stockQuantity : 10) <= 5);

      setStats({
        products: prods,
        farms: farms,
        categories: cats,
        orders: ords,
        users: users,
        totalRevenue: totalRev,
        lowStockItems: lowStock
      });
    } catch (err) {
      console.error("Error loading overview stats:", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId.slice(-6)} marked as ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "delivered":
        return "success";
      case "processing":
      case "shipped":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Metric KPI Cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {/* Total Revenue */}
        <Card className="min-w-0 border border-green-100 shadow-sm bg-gradient-to-br from-green-500/10 via-white to-white">
          <CardBody className="p-4 flex flex-col justify-between">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 break-words text-xs font-bold text-gray-500 uppercase">Gross Platform Revenue</span>
              <span className="shrink-0 p-2 rounded-xl bg-green-500 text-white shadow-sm">
                <DollarSign className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="break-words text-xl font-black text-gray-900 sm:text-2xl">
                ₦{stats.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-xs text-green-700 font-medium mt-0.5">
                From {stats.orders.length} total customer orders
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Total Livestock & Produce */}
        <Card className="min-w-0 border border-blue-100 shadow-sm bg-gradient-to-br from-blue-500/10 via-white to-white">
          <CardBody className="p-4 flex flex-col justify-between">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 break-words text-xs font-bold text-gray-500 uppercase">Livestock & Produce</span>
              <span className="shrink-0 p-2 rounded-xl bg-blue-500 text-white shadow-sm">
                <Package className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="break-words text-xl font-black text-gray-900 sm:text-2xl">{stats.products.length} Items</h3>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                Across {stats.categories.length} distinct categories
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Active Farms */}
        <Card className="min-w-0 border border-amber-100 shadow-sm bg-gradient-to-br from-amber-500/10 via-white to-white">
          <CardBody className="p-4 flex flex-col justify-between">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 break-words text-xs font-bold text-gray-500 uppercase">Farms & Breeders</span>
              <span className="shrink-0 p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                <Tractor className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="break-words text-xl font-black text-gray-900 sm:text-2xl">{stats.farms.length} Partners</h3>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                Pastoral ranches and local suppliers
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Registered Users */}
        <Card className="min-w-0 border border-purple-100 shadow-sm bg-gradient-to-br from-purple-500/10 via-white to-white">
          <CardBody className="p-4 flex flex-col justify-between">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 break-words text-xs font-bold text-gray-500 uppercase">Users & Customers</span>
              <span className="shrink-0 p-2 rounded-xl bg-purple-500 text-white shadow-sm">
                <UsersRound className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="break-words text-xl font-black text-gray-900 sm:text-2xl">{stats.users.length} Users</h3>
              <p className="text-xs text-purple-700 font-medium mt-0.5">
                Active buyers and verified sellers
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Low Stock Inventory Warning */}
      {stats.lowStockItems.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/50 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TriangleAlert className="w-5 h-5" aria-hidden="true" />
                <h3 className="font-bold text-amber-900 text-sm md:text-base">
                  Low Stock Inventory Alert ({stats.lowStockItems.length} items with &le; 5 units)
                </h3>
              </div>
              <Button size="sm" className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={() => setActiveTab("products")}>
                Manage Stock in Inventory <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stats.lowStockItems.slice(0, 6).map((item) => (
                <div
                  key={item.$id || item.id}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-amber-200"
                >
                  <img
                    src={item.img}
                    alt={item.productName}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.farms?.farmName || "Local Farm"}</p>
                  </div>
                  <Chip size="sm" color="danger" variant="flat" className="font-bold text-xs">
                    {item.stockQuantity || 0} left
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Orders Overview */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardBody className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">Recent Customer Orders</h3>
              <p className="text-xs text-gray-500">Live order processing and status management</p>
            </div>
            <Button size="sm" className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={() => setActiveTab("orders")}>
              View All Orders ({stats.orders.length}) <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </div>

          {stats.orders.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No orders placed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                    <th className="pb-3 px-2">Order ID</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Item(s)</th>
                    <th className="pb-3 px-2">Total Amount</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.orders.slice(0, 5).map((order) => {
                    const orderId = order.$id || order.id || "order";
                    const customerName = order.userName || order.customer || order.userEmail || "Customer";
                    const orderItems = order.items?.length
                      ? order.items.map((i) => i.productName || i.name).join(", ")
                      : order.animalName || "Farm Produce";

                    return (
                      <tr key={orderId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-2 font-mono text-xs font-bold text-gray-700">
                          #{orderId.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-semibold text-xs text-gray-900">{customerName}</p>
                          <p className="text-[11px] text-gray-400">{order.userEmail || order.customerEmail || ""}</p>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-600 max-w-[200px] truncate">
                          {orderItems}
                        </td>
                        <td className="py-3 px-2 font-bold text-xs text-green-700">
                          ₦{Number(order.totalAmount || parseFloat(order.price?.toString().replace(/[^0-9.]/g, '') || 0)).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <Chip size="sm" color={getStatusColor(order.status)} variant="flat" className="capitalize text-xs font-semibold">
                            {order.status || "paid"}
                          </Chip>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex gap-1 justify-end">
                            {order.status !== "shipped" && order.status !== "delivered" && (
                              <Button
                                size="sm"
                                className="bg-[#14532D] text-xs h-7 min-w-fit px-2 text-yellow-300 hover:bg-[#166534]"
                                onPress={() => handleQuickStatusChange(orderId, "shipped")}
                              >
                                Mark Shipped
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button
                                size="sm"
                                className="bg-[#14532D] text-xs h-7 min-w-fit px-2 text-yellow-300 hover:bg-[#166534]"
                                onPress={() => handleQuickStatusChange(orderId, "delivered")}
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
