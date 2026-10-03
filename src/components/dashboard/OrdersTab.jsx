import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/react";
import { fetchAllOrders, updateOrderStatus, deleteOrder } from "../../controllers/adminController";
import OrderModal from "./OrderModal";
import toast from "react-hot-toast";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";

export default function OrdersTab({ onOpenNewOrder, isCreateOpen, onOpenChangeCreate }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // View order detail modal
  const viewDisclosure = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit order modal
  const editDisclosure = useDisclosure();
  const [editingOrder, setEditingOrder] = useState(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status changed to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleDelete = async (order) => {
    const id = order.$id || order.id;
    if (window.confirm(`Are you sure you want to cancel and delete Order #${id}?`)) {
      try {
        await deleteOrder(id);
        toast.success("Order deleted successfully");
        loadOrders();
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    viewDisclosure.onOpen();
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    editDisclosure.onOpen();
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (o.$id && o.$id.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.userName && o.userName.toLowerCase().includes(q)) ||
        (o.customer && o.customer.toLowerCase().includes(q)) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
        (o.animalName && o.animalName.toLowerCase().includes(q)) ||
        (o.paymentReference && o.paymentReference.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

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

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Customer Orders</h2>
          <p className="text-xs text-gray-500">Track shipments, dispatch livestock, update statuses, or create manual phone orders.</p>
        </div>
        <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" startContent={<Plus size={16} aria-hidden="true" />} onPress={onOpenNewOrder}>
          Record New Order
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="w-full sm:w-72">
          <Input
            size="sm"
            placeholder="Search by customer, order #, breed..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            isClearable
            startContent={<Search size={16} className="text-gray-400" aria-hidden="true" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {["all", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => (
              <Button
                key={s}
                size="sm"
                className={`bg-[#14532D] text-xs capitalize h-8 text-yellow-300 hover:bg-[#166534] ${statusFilter === s ? "font-bold ring-2 ring-yellow-300" : ""}`}
                onPress={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Table aria-label="Orders management table" className="min-w-full">
        <TableHeader>
          <TableColumn>ORDER ID</TableColumn>
          <TableColumn>CUSTOMER</TableColumn>
          <TableColumn>ITEMS</TableColumn>
          <TableColumn>TOTAL</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={"No orders match your filter criteria."}>
          {filteredOrders.map((order) => {
            const id = order.$id || order.id || "order";
            const custName = order.userName || order.customer || "Customer";
            const custEmail = order.userEmail || order.customerEmail || "N/A";
            const items = order.items || [];
            const itemsText = items.length > 0
              ? items.map((i) => `${i.productName || i.name} (x${i.quantity || 1})`).join(", ")
              : order.animalName || "Farm Produce";

            return (
              <TableRow key={id}>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-gray-800">
                    #{id.slice(-6).toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-xs text-gray-900">{custName}</p>
                    <p className="text-[11px] text-gray-400">{custEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-gray-700 max-w-[200px] truncate" title={itemsText}>
                    {itemsText}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-xs text-green-700">
                    ₦{Number(order.totalAmount || parseFloat(order.price?.toString().replace(/[^0-9.]/g, '') || 0)).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <select
                    value={order.status || "paid"}
                    onChange={(e) => handleStatusUpdate(id, e.target.value)}
                    className="text-xs font-semibold rounded-lg px-2 py-1 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {order.date || new Date(order.$createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 items-center">
                    <Tooltip content="View Receipt & Items">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleView(order)}>
                        <Eye size={16} className="text-gray-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit Order">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(order)}>
                        <Pencil size={16} className="text-blue-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete Order">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(order)}>
                        <Trash2 size={16} className="text-red-500" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* View Order Detail Modal */}
      <Modal isOpen={viewDisclosure.isOpen} onOpenChange={viewDisclosure.onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span>Order #{selectedOrder?.$id?.slice(-8) || selectedOrder?.id?.slice(-8)}</span>
                <span className="text-xs text-gray-500 font-normal">Created on {selectedOrder?.date || selectedOrder?.$createdAt}</span>
              </ModalHeader>
              <ModalBody>
                {selectedOrder && (
                  <div className="flex flex-col gap-4">
                    {/* Customer Info */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase">Customer Information</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrder.userName || selectedOrder.customer}</p>
                      <p className="text-xs text-gray-600">{selectedOrder.userEmail || selectedOrder.customerEmail || "No email provided"}</p>
                      {selectedOrder.paymentReference && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">Ref: {selectedOrder.paymentReference}</p>
                      )}
                    </div>

                    {/* Items List */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Purchased Items</p>
                      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl p-2 bg-white">
                        {(selectedOrder.items || []).length > 0 ? (
                          selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 px-1">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.productName || item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity || 1} &bull; ₦{Number(item.price || 0).toLocaleString()} each</p>
                              </div>
                              <span className="font-bold text-sm text-gray-800">
                                ₦{((parseFloat(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 px-1 flex justify-between items-center">
                            <span className="text-sm font-semibold">{selectedOrder.animalName || "Produce Item"}</span>
                            <span className="font-bold text-sm">₦{Number(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total & Status */}
                    <div className="flex justify-between items-center px-1 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">Order Status:</span>
                        <Chip size="sm" color={getStatusColor(selectedOrder.status)} variant="flat" className="ml-2 capitalize font-bold">
                          {selectedOrder.status || "paid"}
                        </Chip>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total Amount</span>
                        <span className="text-xl font-black text-green-700">
                          ₦{Number(selectedOrder.totalAmount || parseFloat(selectedOrder.price?.toString().replace(/[^0-9.]/g, '') || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={onClose}>
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Order Modal */}
      <OrderModal
        isOpen={editDisclosure.isOpen}
        onOpenChange={editDisclosure.onOpenChange}
        order={editingOrder}
        onSuccess={loadOrders}
      />
    </div>
  );
}
