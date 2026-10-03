import { Button, Skeleton, Input } from "@heroui/react";
import ProductSlide from "../components/ProductSlide";
import { fetchAllProducts } from "../controllers/productController";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

export default function CategoriesPage() {
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const initialCategory = state?.selectedCategory || searchParams.get("category") || "All";
  const initialSearch = urlSearch || state?.searchQuery || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if URL search param changes
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    fetchAllProducts()
      .then((allProducts) => {
        const uniqueCategories = [];
        allProducts.forEach((product) => {
          if (Array.isArray(product.categories)) {
            product.categories.forEach((category) => {
              const catName = typeof category === "string" ? category : category.name;
              const catId = typeof category === "string" ? category : category.$id || category.id || catName;
              if (catName && !uniqueCategories.some((c) => c.name === catName)) {
                uniqueCategories.push({ $id: catId, name: catName });
              }
            });
          }
        });

        setCategories(uniqueCategories);
        setProducts(allProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories & products:", error);
        setIsLoading(false);
      });
  }, []);

  // Compute filtered products by both category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category check
      const matchesCategory =
        selectedCategory === "All" ||
        product.categories?.some((prodCat) => {
          const catName = typeof prodCat === "string" ? prodCat : prodCat.name;
          return catName?.toLowerCase() === selectedCategory.toLowerCase();
        }) ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      // 2. Search query check
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        product.productName?.toLowerCase().includes(q) ||
        product.name?.toLowerCase().includes(q) ||
        product.breed?.toLowerCase().includes(q) ||
        product.species?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.farms?.farmName?.toLowerCase().includes(q) ||
        product.farms?.location?.toLowerCase().includes(q) ||
        product.tags?.some((t) => t.toLowerCase().includes(q)) ||
        product.categories?.some((c) => {
          const name = typeof c === "string" ? c : c.name;
          return name?.toLowerCase().includes(q);
        });

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] md:text-[34px] font-extrabold text-gray-900">
            Shop Livestock & Produce
          </h2>
          <div className="text-gray-500 text-sm md:text-base mt-1">
            Browse verified pastoral ranches, livestock breeds, and fresh farm produce.
          </div>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-80">
          <Input
            isClearable
            radius="lg"
            placeholder="Search breed, goat, fish, yam..."
            value={searchQuery}
            onValueChange={handleSearchChange}
            onClear={clearSearch}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {searchQuery && (
        <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-900">
          <span className="font-semibold">Search Filter:</span>
          <span>Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
          <span className="text-gray-500 font-medium">({filteredProducts.length} items found)</span>
          <button
            onClick={clearSearch}
            className="ml-auto text-xs bg-white hover:bg-green-100 text-green-700 px-2.5 py-1 rounded-md border border-green-300 font-medium transition-colors"
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
        {isLoading ? (
          [...Array(6)].map((_, index) => (
            <Skeleton key={index} className="rounded-lg h-10 w-24 flex-shrink-0" />
          ))
        ) : (
          <>
            <Button
              onClick={() => setSelectedCategory("All")}
              color="success"
              variant={selectedCategory === "All" ? "solid" : "flat"}
              className={`min-w-fit font-medium ${selectedCategory === "All" ? "text-white" : ""}`}
            >
              All Produce & Breeds
            </Button>
            {categories.map((value, index) => (
              <Button
                key={index}
                className={`${
                  value.name === selectedCategory ? "bg-green-600 text-white font-semibold" : ""
                } min-w-fit`}
                onClick={() => setSelectedCategory(value.name)}
                color="success"
                variant={value.name === selectedCategory ? "solid" : "flat"}
              >
                {value.name}
              </Button>
            ))}
          </>
        )}
      </div>

      {/* Results View */}
      <div className="mt-4">
        {filteredProducts.length === 0 && !isLoading ? (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 my-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-gray-400 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <h3 className="text-lg font-bold text-gray-800">No matching livestock or produce found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
              Try searching for &ldquo;goat&rdquo;, &ldquo;sheep&rdquo;, &ldquo;fish&rdquo;, &ldquo;yam&rdquo;, or &ldquo;poultry&rdquo;.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              {searchQuery && (
                <Button size="sm" color="success" variant="flat" onPress={clearSearch}>
                  Clear Search
                </Button>
              )}
              {selectedCategory !== "All" && (
                <Button size="sm" color="default" variant="light" onPress={() => setSelectedCategory("All")}>
                  Show All Categories
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ProductSlide
            title={selectedCategory === "All" ? (searchQuery ? `Matching Results` : "All Livestock & Produce") : selectedCategory}
            products={filteredProducts}
            type="buy_add"
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

