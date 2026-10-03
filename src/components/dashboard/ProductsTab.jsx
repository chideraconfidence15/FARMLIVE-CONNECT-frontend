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
  Image,
  Tooltip,
  Input,
  Chip
} from "@heroui/react";
import { fetchAllProducts, fetchCategories } from "../../controllers/productController";
import { deleteProduct, updateProductStock } from "../../controllers/adminController";
import ProductModal from "./ProductModal";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Pencil, Trash2, TriangleAlert, Plus, Minus } from "lucide-react";

export default function ProductsTab({ isCreateOpen, onOpenChangeCreate, onOpenNewProduct }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProducts(),
        fetchCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    if (onOpenNewProduct) {
      onOpenNewProduct();
    } else {
      onOpen();
    }
  };

  const handleDelete = async (product) => {
    const id = product.$id || product.id;
    if (window.confirm(`Are you sure you want to delete "${product.productName || product.name}"?`)) {
      try {
        await deleteProduct(id, product.imageId);
        toast.success("Product deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  // Inline Quick Stock Increment / Decrement
  const handleStockAdjust = async (product, delta) => {
    const id = product.$id || product.id;
    const currentStock = product.stockQuantity !== undefined ? product.stockQuantity : 10;
    const newStock = Math.max(0, currentStock + delta);

    try {
      await updateProductStock(id, newStock);
      setProducts((prev) =>
        prev.map((p) => ((p.$id || p.id) === id ? { ...p, stockQuantity: newStock } : p))
      );
      toast.success(`Stock updated: ${newStock} units`);
    } catch (err) {
      toast.error("Failed to adjust stock");
    }
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.productName && p.productName.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.breed && p.breed.toLowerCase().includes(q)) ||
        (p.species && p.species.toLowerCase().includes(q)) ||
        (p.farms?.farmName && p.farms.farmName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "all" ||
        p.categories?.some((c) => (c.name || c).toLowerCase() === selectedCategory.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Livestock & Farm Produce</h2>
          <p className="text-xs text-gray-500">Track cattle, sheep, goats, poultry, fishery, and harvested farm crops.</p>
        </div>
        <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" startContent={<Plus size={16} aria-hidden="true" />} onPress={handleCreate}>
          Add New Listing
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="w-full sm:w-72">
          <Input
            size="sm"
            placeholder="Search name, breed, species, farm..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            isClearable
            startContent={<Search size={16} className="text-gray-400" aria-hidden="true" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Category:</span>
          <Button
            size="sm"
            className={`bg-[#14532D] text-xs text-yellow-300 hover:bg-[#166534] ${selectedCategory === "all" ? "font-bold ring-2 ring-yellow-300" : ""}`}
            onPress={() => setSelectedCategory("all")}
          >
            All ({products.length})
          </Button>
          {categories.slice(0, 5).map((cat) => (
            <Button
              key={cat.$id || cat.id || cat.name}
              size="sm"
              className={`bg-[#14532D] text-xs text-yellow-300 hover:bg-[#166534] ${selectedCategory === cat.name ? "font-bold ring-2 ring-yellow-300" : ""}`}
              onPress={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table aria-label="Livestock and produce table" className="min-w-full">
        <TableHeader>
          <TableColumn>ITEM</TableColumn>
          <TableColumn>BREED / SPECIES</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>STOCK (QUICK EDIT)</TableColumn>
          <TableColumn>FARM PARTNER</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={"No livestock or produce found matching your search."}>
          {filteredProducts.map((product) => {
            const id = product.$id || product.id;
            const stock = product.stockQuantity !== undefined ? product.stockQuantity : 10;
            const isLowStock = stock <= 5;

            return (
              <TableRow key={id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.img}
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                      fallbackSrc="https://via.placeholder.com/150"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-gray-900 truncate max-w-[200px]" title={product.productName}>
                        {product.productName || product.name}
                      </p>
                      <div className="flex gap-1 items-center mt-0.5">
                        {product.group && (
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {product.group}
                          </span>
                        )}
                        {product.origin && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">
                            {product.origin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{product.breed || "Standard"}</p>
                    <p className="text-[11px] text-gray-400">{product.species || product.category || ""}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-xs text-green-700">
                    ₦{Number(product.price).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={isLowStock ? "danger" : "success"}
                      variant="flat"
                      className="text-xs font-bold"
                    >
                      {stock} units {isLowStock && <TriangleAlert size={14} className="inline text-amber-600" aria-label="Low stock" />}
                    </Chip>
                    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                      <button
                        onClick={() => handleStockAdjust(product, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-gray-700 text-xs font-bold"
                        title="Reduce Stock"
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleStockAdjust(product, 5)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-gray-700 text-xs font-bold"
                        title="Add 5 Units"
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600 truncate max-w-[120px] block">
                    {product.farms?.farmName || "Direct Breeder"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 items-center">
                    <Tooltip content="View Live Listing">
                      <Link
                        to={`/product/${id}`}
                        className="p-1.5 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                      </Link>
                    </Tooltip>
                    <Tooltip content="Edit Listing">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(product)}>
                        <Pencil size={16} className="text-blue-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete Listing">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(product)}>
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

      <ProductModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        product={selectedProduct}
        onSuccess={loadData}
      />
    </div>
  );
}
