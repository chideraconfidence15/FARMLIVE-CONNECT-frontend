import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Tooltip,
  Input,
  Image
} from "@heroui/react";
import { fetchCategories } from "../../controllers/productController";
import { deleteCategory } from "../../controllers/adminController";
import CategoryModal from "./CategoryModal";
import toast from "react-hot-toast";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

export default function CategoriesTab({ isCreateOpen, onOpenChangeCreate, onOpenNewCategory }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleDelete = async (category) => {
    const id = category.$id || category.id;
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        await deleteCategory(id, category.imageId);
        toast.success("Category deleted successfully");
        loadCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    if (onOpenNewCategory) {
      onOpenNewCategory();
    } else {
      onOpen();
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || (c.name && c.name.toLowerCase().includes(q));
    });
  }, [categories, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Marketplace Categories</h2>
          <p className="text-xs text-gray-500">Organize livestock, dairy, poultry, fishery, and agricultural produce taxonomy.</p>
        </div>
        <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" startContent={<Plus size={16} aria-hidden="true" />} onPress={handleCreate}>
          Add New Category
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="w-full sm:w-72">
          <Input
            size="sm"
            placeholder="Search category name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            isClearable
            startContent={<Search size={16} className="text-gray-400" aria-hidden="true" />}
          />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{filteredCategories.length} categories</span>
      </div>

      {/* Table */}
      <Table aria-label="Categories table" className="min-w-full">
        <TableHeader>
          <TableColumn>ICON / IMAGE</TableColumn>
          <TableColumn>CATEGORY NAME</TableColumn>
          <TableColumn>IDENTIFIER</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={"No categories found."}>
          {filteredCategories.map((category) => {
            const id = category.$id || category.id;

            return (
              <TableRow key={id}>
                <TableCell>
                  {category.img ? (
                    <Image
                      src={category.img}
                      alt={category.name}
                      className="w-10 h-10 object-cover rounded-lg"
                      fallbackSrc="https://via.placeholder.com/100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-sm text-gray-900">{category.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-gray-400">{id}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content="Edit Category">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(category)}>
                        <Pencil size={16} className="text-blue-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete Category">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(category)}>
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

      <CategoryModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        category={selectedCategory}
        onSuccess={loadCategories}
      />
    </div>
  );
}
