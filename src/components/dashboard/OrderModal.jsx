import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea
} from "@heroui/react";
import { createAdminOrder, updateOrder } from "../../controllers/adminController";
import { fetchAllProducts } from "../../controllers/productController";
import toast from "react-hot-toast";

export default function OrderModal({ isOpen, onOpenChange, order, onSuccess }) {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    productName: "",
    price: "",
    quantity: 1,
    status: "paid",
    paymentReference: "",
    eta: "Farm dispatching in progress"
  });

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllProducts().then((data) => setProductsList(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (order) {
      const firstItem = order.items?.[0] || {};
      setFormData({
        userName: order.userName || order.customer || "",
        userEmail: order.userEmail || order.customerEmail || "",
        productName: firstItem.productName || order.animalName || "",
        price: order.totalAmount || parseFloat(order.price?.toString().replace(/[^0-9.]/g, '') || 0),
        quantity: firstItem.quantity || 1,
        status: order.status || "paid",
        paymentReference: order.paymentReference || "",
        eta: order.eta || "Farm dispatching in progress"
      });
    } else {
      setFormData({
        userName: "",
        userEmail: "",
        productName: "",
        price: "",
        quantity: 1,
        status: "paid",
        paymentReference: `FL-${Date.now().toString().slice(-6)}`,
        eta: "Farm dispatching in progress"
      });
    }
  }, [order, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    const prod = productsList.find((p) => (p.$id || p.id) === selectedId);
    if (prod) {
      setFormData((prev) => ({
        ...prev,
        productName: prod.productName,
        price: prod.price
      }));
    }
  };

  const handleSubmit = async (onClose) => {
    if (!formData.userName || !formData.productName) {
      toast.error("Customer name and item are required");
      return;
    }

    setIsLoading(true);
    try {
      const priceNum = parseFloat(formData.price) || 0;
      const qtyNum = parseInt(formData.quantity) || 1;
      const totalAmount = priceNum * qtyNum;

      const payload = {
        userName: formData.userName,
        customer: formData.userName,
        userEmail: formData.userEmail,
        customerEmail: formData.userEmail,
        totalAmount,
        status: formData.status,
        paymentReference: formData.paymentReference,
        eta: formData.eta,
        items: [
          {
            productName: formData.productName,
            price: priceNum,
            quantity: qtyNum
          }
        ],
        animalName: formData.productName
      };

      if (order) {
        await updateOrder(order.$id || order.id, payload);
        toast.success("Order updated successfully");
      } else {
        await createAdminOrder(payload);
        toast.success("Order created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {order ? `Edit Order #${order.$id?.slice(-6) || order.id?.slice(-6)}` : "Record New Customer Order"}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer Full Name"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    isRequired
                    placeholder="e.g. Ibrahim Danladi"
                  />
                  <Input
                    label="Customer Email"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </div>

                {/* Quick Livestock/Product Selection */}
                {productsList.length > 0 && !order && (
                  <Select
                    label="Select Existing Livestock / Produce (Optional Quick Fill)"
                    placeholder="Choose from inventory..."
                    onChange={handleProductSelect}
                  >
                    {productsList.map((prod) => (
                      <SelectItem key={prod.$id || prod.id} value={prod.$id || prod.id}>
                        {prod.productName} — ₦{Number(prod.price).toLocaleString()}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <Input
                  label="Product / Livestock Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  isRequired
                  placeholder="e.g. Boerboel Puppy or Boer Goat Buck"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Unit Price (₦)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    isRequired
                    startContent={<span className="text-gray-400 text-xs">₦</span>}
                  />
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={handleChange}
                    isRequired
                  />
                  <div className="flex flex-col justify-end">
                    <span className="text-xs text-gray-500 mb-1">Calculated Total</span>
                    <span className="font-extrabold text-base text-green-700">
                      ₦{((parseFloat(formData.price) || 0) * (parseInt(formData.quantity) || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Order Status"
                    name="status"
                    selectedKeys={[formData.status]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <SelectItem key="paid" value="paid">Paid</SelectItem>
                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                    <SelectItem key="processing" value="processing">Processing</SelectItem>
                    <SelectItem key="shipped" value="shipped">Shipped</SelectItem>
                    <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
                    <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                  </Select>
                  <Input
                    label="Payment Reference"
                    name="paymentReference"
                    value={formData.paymentReference}
                    onChange={handleChange}
                    placeholder="e.g. FL-998822"
                  />
                </div>

                <Textarea
                  label="Dispatch / Delivery ETA Note"
                  name="eta"
                  value={formData.eta}
                  onChange={handleChange}
                  placeholder="e.g. In transit from Kaduna ranch, ETA 24 hours"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                {order ? "Update Order" : "Save Order"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
