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
  SelectItem
} from "@heroui/react";
import { createAdminUser, updateUser } from "../../controllers/adminController";
import toast from "react-hot-toast";

export default function UserModal({ isOpen, onOpenChange, user, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "customer"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer"
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (onClose) => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    if (!user && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        await updateUser(user.$id || user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        toast.success("User updated successfully");
      } else {
        await createAdminUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        toast.success("User registered successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{user ? "Edit User Account" : "Register New Platform User"}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isRequired
                  placeholder="e.g. Babatunde Lawal"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  isRequired
                  placeholder="user@example.com"
                />

                {!user && (
                  <Input
                    label="Initial Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    isRequired
                    placeholder="Min 6 characters"
                  />
                )}

                <Select
                  label="User Role & Permissions"
                  name="role"
                  selectedKeys={[formData.role]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <SelectItem key="customer" value="customer">Customer (Buyer)</SelectItem>
                  <SelectItem key="farmer" value="farmer">Farmer / Breeder (Seller)</SelectItem>
                  <SelectItem key="admin" value="admin">Administrator (Full Access)</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                {user ? "Update User" : "Create User"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
