import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure
} from "@heroui/react";
import { fetchAllFarms, fetchCategories } from "../../controllers/productController";
import { createProduct, updateProduct } from "../../controllers/adminController";
import FarmModal from "./FarmModal";
import CategoryModal from "./CategoryModal";
import toast from "react-hot-toast";

export default function ProductModal({ isOpen, onOpenChange, product, onSuccess }) {
  const [formData, setFormData] = useState({
    productName: "",
    species: "",
    breed: "",
    origin: "local",
    group: "livestock",
    price: "",
    farms: "",
    categories: [],
    stockQuantity: 10,
    description: "",
    tags: "",
    img: ""
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [farmsList, setFarmsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Modals for creating farm/category on the fly
  const farmDisclosure = useDisclosure();
  const categoryDisclosure = useDisclosure();

  const loadDependencies = async () => {
    try {
      const [farms, categories] = await Promise.all([
        fetchAllFarms(),
        fetchCategories()
      ]);
      setFarmsList(farms);
      setCategoriesList(categories);
    } catch (error) {
      console.error("Error loading dependencies:", error);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || product.name || "",
        species: product.species || "",
        breed: product.breed || "",
        origin: product.origin || "local",
        group: product.group || "livestock",
        price: product.price || "",
        farms: product.farms?.$id || product.farms?.id || "",
        categories: product.categories?.map((c) => c.$id || c.id || c.name) || [],
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10,
        description: product.description || "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
        img: product.img || "",
        imageId: product.imageId
      });
    } else {
      setFormData({
        productName: "",
        species: "",
        breed: "",
        origin: "local",
        group: "livestock",
        price: "",
        farms: "",
        categories: [],
        stockQuantity: 10,
        description: "",
        tags: "Vaccinated, Farm Raised, Purebred",
        img: ""
      });
    }
    setFile(null);
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (onClose) => {
    if (!formData.productName || !formData.price) {
      toast.error("Product name and price are required");
      return;
    }

    setIsLoading(true);
    try {
      const parsedTags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const dataToSubmit = {
        ...formData,
        name: formData.productName,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        tags: parsedTags
      };

      if (product) {
        await updateProduct(product.$id || product.id, dataToSubmit, file);
        toast.success("Livestock/Produce updated successfully");
      } else {
        await createProduct(dataToSubmit, file);
        toast.success("Livestock/Produce created successfully");
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
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xl font-bold">
                  {product ? "Edit Livestock / Produce" : "Add New Livestock or Farm Produce"}
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  Configure breed details, stock, pricing, and farm association.
                </span>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {/* Name and Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label="Product / Animal Title"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        isRequired
                        placeholder="e.g. West African Dwarf Doe (Purebred)"
                      />
                    </div>
                    <Select
                      label="Group"
                      name="group"
                      selectedKeys={[formData.group]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, group: e.target.value }))}
                    >
                      <SelectItem key="livestock" value="livestock">Livestock</SelectItem>
                      <SelectItem key="poultry" value="poultry">Poultry</SelectItem>
                      <SelectItem key="fish" value="fish">Fishery</SelectItem>
                      <SelectItem key="produce" value="produce">Fresh Produce</SelectItem>
                      <SelectItem key="pets" value="pets">Guard & Pets</SelectItem>
                    </Select>
                  </div>

                  {/* Species and Breed */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Species (Latin or Common)"
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      placeholder="e.g. Goat (Capra hircus)"
                    />
                    <Input
                      label="Breed / Variety"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="e.g. Red Sokoto / Boer"
                    />
                    <Select
                      label="Origin"
                      name="origin"
                      selectedKeys={[formData.origin]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
                    >
                      <SelectItem key="local" value="local">Local Breed</SelectItem>
                      <SelectItem key="foreign" value="foreign">Foreign / Exotic</SelectItem>
                      <SelectItem key="cross" value="cross">Crossbreed (Hybrid)</SelectItem>
                    </Select>
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Price (₦)"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      isRequired
                      startContent={<div className="text-gray-400 text-xs">₦</div>}
                      placeholder="e.g. 95000"
                    />
                    <Input
                      label="Stock Quantity Available"
                      name="stockQuantity"
                      type="number"
                      min={0}
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      isRequired
                      placeholder="e.g. 20"
                    />
                  </div>

                  {/* Farm Association */}
                  <div className="flex gap-2 items-end">
                    <Select
                      label="Partner Farm / Ranch"
                      name="farms"
                      selectedKeys={formData.farms ? [formData.farms] : []}
                      onChange={(e) => setFormData((prev) => ({ ...prev, farms: e.target.value }))}
                      className="flex-1"
                      placeholder="Select responsible farm..."
                    >
                      {farmsList.map((farm) => (
                        <SelectItem key={farm.$id || farm.id} value={farm.$id || farm.id}>
                          {farm.farmName} ({farm.location || "Nigeria"})
                        </SelectItem>
                      ))}
                    </Select>
                    <Button className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={farmDisclosure.onOpen} title="Register New Farm">
                      + Farm
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="flex gap-2 items-end">
                    <Select
                      label="Categories (Multi-Select)"
                      name="categories"
                      selectionMode="multiple"
                      selectedKeys={new Set(formData.categories)}
                      onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, categories: Array.from(keys) }))}
                      className="flex-1"
                      placeholder="Assign categories..."
                    >
                      {categoriesList.map((cat) => (
                        <SelectItem key={cat.$id || cat.id || cat.name} value={cat.$id || cat.id || cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Button className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={categoryDisclosure.onOpen} title="Add New Category">
                      + Cat
                    </Button>
                  </div>

                  {/* Description */}
                  <Textarea
                    label="Description & Health Status"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide details on vaccination, weight, age, temperament, breeding readiness..."
                    minRows={2}
                  />

                  {/* Tags */}
                  <Input
                    label="Search Tags (comma separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. Vaccinated, High Fertility, Dairy Potential, Trypanotolerant"
                  />

                  {/* Image input or file upload */}
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Image Web URL (Optional)"
                      name="img"
                      value={formData.img}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <Input
                      type="file"
                      label="Or Upload Image File from Computer"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                  {product ? "Update Listing" : "Save Listing"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Quick Add Farm Modal */}
      <FarmModal
        isOpen={farmDisclosure.isOpen}
        onOpenChange={farmDisclosure.onOpenChange}
        onSuccess={loadDependencies}
      />

      {/* Quick Add Category Modal */}
      <CategoryModal
        isOpen={categoryDisclosure.isOpen}
        onOpenChange={categoryDisclosure.onOpenChange}
        onSuccess={loadDependencies}
      />
    </>
  );
}
