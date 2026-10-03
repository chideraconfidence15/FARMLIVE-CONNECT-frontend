import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from "@heroui/react";
import { createCategory, updateCategory } from "../../controllers/adminController";
import toast from "react-hot-toast";

export default function CategoryModal({ isOpen, onOpenChange, category, onSuccess }) {
  const [formData, setFormData] = useState({
    name: ""
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        imageId: category.imageId
      });
    } else {
      setFormData({
        name: ""
      });
    }
    setFile(null);
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (onClose) => {
    setIsLoading(true);
    try {
      if (category) {
        const categoryId = category.$id || category.id;
        if (!categoryId) throw new Error("Category ID is missing; reload the categories list and try again.");
        await updateCategory(categoryId, formData, file);
        toast.success("Category updated successfully");
      } else {
        await createCategory(formData, file);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{category ? "Edit Category" : "Create New Category"}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  type="file"
                  label="Category Image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                {category ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
