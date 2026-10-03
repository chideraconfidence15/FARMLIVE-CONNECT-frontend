import { Input, Badge, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Divider, Image, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { useUser } from "../contexts/userContext";
import { useState, useEffect, useRef } from "react";
import { fetchAllProducts } from "../controllers/productController";
import { ClipboardList, LayoutDashboard, LogOut, UserRound } from "lucide-react";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { user, logout } = useUser();
  const isAdmin = user?.role === "admin";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Live search effect with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchAllProducts({ search: searchQuery.trim() });
        setSearchResults(results.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setIsMenuOpen(false);
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    setIsMenuOpen(false);
    navigate(`/product/${productId}`);
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: "Farms", path: "/farms" },
    ...(isAdmin ? [{ name: "Dashboard", path: "/dashboard" }] : []),
    { name: "Cart", path: "/orders" },
  ];

  const handleCheckout = (onClose) => {
    onClose();
    navigate("/orders");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <nav className="w-full h-16 bg-[#14532D] relative text-yellow-300 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2 text-lg font-bold">
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-mark.jpg" alt="FARMLIVE Connect Logo" className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-[#14532D] object-cover shadow-sm border border-white/40 scale-110 origin-center" />
          <span className="font-extrabold text-lg md:text-xl tracking-tight hidden sm:inline text-white">FARMLIVE <span className="text-yellow-200 font-semibold">Connect</span></span>
        </Link>
      </div>

      {/* Desktop Search Bar with Live Results Dropdown */}
      <div ref={searchContainerRef} className="flex-1 max-w-md mx-4 hidden md:block relative">
        <form onSubmit={handleSearchSubmit}>
          <Input
            classNames={{
              input: [
                "bg-white",
                "text-gray-900",
                "placeholder:text-gray-500"
              ],
              innerWrapper: "bg-white",
              inputWrapper: ["bg-white", "border-gray-400", "hover:border-gray-600", "group-data-[focus=true]:border-gray-700"]
            }}
            placeholder="Search livestock breeds, goats, fish, yam..."
            type="search"
            variant="bordered"
            value={searchQuery}
            onValueChange={setSearchQuery}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            startContent={
              <button type="submit" className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-black hover:text-black transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            }
            endContent={
              isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className="text-gray-600 hover:text-black text-xs font-bold px-1"
                >
                  ✕
                </button>
              ) : null
            }
          />
        </form>

        {/* Live Floating Dropdown */}
        {showDropdown && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in duration-150">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 flex justify-between items-center">
              <span>Matching Livestock & Produce</span>
              <span>{searchResults.length} found</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No matching livestock or produce found for &ldquo;{searchQuery}&rdquo;.
                <div className="mt-1 text-xs text-gray-400">Try searching for &ldquo;goat&rdquo;, &ldquo;sheep&rdquo;, &ldquo;fish&rdquo;, or &ldquo;yam&rdquo;</div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {searchResults.map((item) => (
                  <div
                    key={item.$id || item.id}
                    onClick={() => handleSelectProduct(item.$id || item.id)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-green-50/80 cursor-pointer transition-colors"
                  >
                    <img
                      src={item.img}
                      alt={item.productName}
                      className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-green-700 font-bold">₦{Number(item.price).toLocaleString()}</span>
                        {item.breed && (
                          <span className="text-[11px] text-gray-500 truncate">• {item.breed}</span>
                        )}
                        {item.farms?.farmName && (
                          <span className="text-[11px] text-gray-400 truncate">• {item.farms.farmName}</span>
                        )}
                      </div>
                    </div>
                    {item.categories?.[0]?.name && (
                      <span className="text-[10px] bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                        {item.categories[0].name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* View all button */}
            <div className="border-t border-gray-100 p-2 bg-gray-50/60 rounded-b-2xl">
              <button
                onClick={handleSearchSubmit}
                className="w-full text-center text-xs font-bold text-green-700 hover:text-green-800 py-1.5 hover:bg-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all results for &ldquo;{searchQuery}&rdquo; in Catalog</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Mobile Menu Content */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-[#14532D] text-yellow-300 p-6 gap-4 z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${ !isMenuOpen ? "-translate-x-full" : "translate-x-0" }`} >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.jpg" alt="FARMLIVE Connect Logo" className="h-10 w-10 rounded-full bg-[#14532D] object-cover shadow-sm border border-white/40 scale-110 origin-center" />
            <span className="font-extrabold text-white text-lg tracking-tight">FARMLIVE <span className="text-yellow-200">Connect</span></span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-2">
          <Input
            size="sm"
            classNames={{
              input: ["bg-white", "text-gray-900", "placeholder:text-gray-500"],
              innerWrapper: "bg-white",
              inputWrapper: ["bg-white", "border-gray-400", "hover:border-gray-600"]
            }}
            placeholder="Search breeds, produce..."
            type="search"
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            }
          />
        </form>

        {
          menuItems.map((item, index) => (
            <NavLink onClick={() => setIsMenuOpen(false)} key={index} to={item.path} className={({isActive}) => `text-lg py-2 text-yellow-300 hover:text-yellow-200 ${isActive ? 'font-bold underline' : ''}`}>{item.name}</NavLink>
          ))
        }

        <div className="mt-auto border-t border-gray-400/50 pt-4 flex flex-col gap-3">
          {user ? (
            <>
              <div className="text-xs text-yellow-200">Signed in as <span className="font-semibold text-yellow-300">{user.name || user.email}</span></div>
              {isAdmin && <NavLink to="/dashboard" className="py-2 flex items-center gap-2 font-semibold text-yellow-300 hover:text-yellow-200" onClick={() => setIsMenuOpen(false)}>
                <LayoutDashboard size={18} aria-hidden="true" /> Admin Dashboard
              </NavLink>}
              <Button
                variant="light"
                className="w-full justify-start text-yellow-300"
                startContent={<UserRound size={18} aria-hidden="true" />}
                onPress={() => { setIsMenuOpen(false); navigate("/profile"); }}
              >
                My Profile
              </Button>
              <Button
                variant="light"
                className="w-full justify-start text-yellow-300"
                startContent={<ClipboardList size={18} aria-hidden="true" />}
                onPress={() => { setIsMenuOpen(false); navigate("/order-history"); }}
              >
                My Orders
              </Button>
              <Button
                variant="light"
                className="w-full justify-start text-red-700 hover:text-red-900"
                startContent={<LogOut size={18} aria-hidden="true" />}
                onPress={handleLogout}
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/auth/login" className="py-2 text-yellow-300" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
              <NavLink to="/auth/signup" className="py-2 bg-white text-gray-900 text-center rounded-lg font-bold" onClick={() => setIsMenuOpen(false)}>Sign up</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {
          menuItems.map((item, index) => (
            <NavLink key={index} to={item.path} className={({isActive}) => `text-yellow-300 hover:text-yellow-200 transition-colors ${isActive ? 'active font-semibold' : ''}`}>{item.name}</NavLink>
          ))
        }
        {!user && (
          <NavLink to="/auth/login" className="text-yellow-300 hover:text-yellow-200">Login</NavLink>
        )}
      </div>
      <div className="flex gap-2 md:gap-4 items-center">
        <Badge content={totalItems} color="danger" isInvisible={totalItems === 0} shape="circle" size="sm">
          <Button 
            isIconOnly 
            variant="light" 
            className="text-yellow-300 hover:text-yellow-200 p-1 min-w-fit h-fit"
            onPress={onOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> 
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /> 
            </svg> 
          </Button>
        </Badge>
        
        {user ? (
          <>
            <Link to="/order-history" className="text-yellow-300 hover:text-yellow-200 p-1" title="Notifications and order history">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /> 
              </svg> 
            </Link>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform cursor-pointer bg-yellow-300 text-black border border-yellow-500"
                  color="default"
                  name={userInitial}
                  size="sm"
                  getInitials={(name) => name}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold text-xs text-gray-500">Signed in as</p>
                  <p className="font-bold text-sm text-gray-900 truncate">{user.email}</p>
                </DropdownItem>
                {isAdmin && <DropdownItem key="dashboard" className="text-green-700 font-semibold" onPress={() => navigate("/dashboard")}>
                  <span className="flex items-center gap-2"><LayoutDashboard size={18} aria-hidden="true" /> Admin Dashboard</span>
                </DropdownItem>}
                <DropdownItem key="my-profile" startContent={<UserRound size={18} aria-hidden="true" />} onPress={() => navigate("/profile")}>
                  My Profile
                </DropdownItem>
                <DropdownItem key="orders" startContent={<ClipboardList size={18} aria-hidden="true" />} onPress={() => navigate("/order-history")}>
                  My Orders
                </DropdownItem>
                <DropdownItem key="logout" color="danger" startContent={<LogOut size={18} aria-hidden="true" />} onPress={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <NavLink to="/auth/signup" className="hidden sm:block px-4 py-1 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors">Sign up</NavLink>
        )}
      </div>


      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="md"
        placement="center"
      >
        <ModalContent className="bg-white text-black">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-white text-black">Shopping Cart ({totalItems} items)</ModalHeader>
              <ModalBody className="bg-white text-black">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-black">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cart.map((item) => (
                      <div key={item.$id} className="flex gap-4 items-center bg-white text-black">
                        <Image
                          src={item.img}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.productName}</h4>
                          <p className="text-xs text-black">${item.price} / kg</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button size="sm" isIconOnly className="bg-white text-black border border-gray-300" onPress={() => updateQuantity(item.$id, (item.quantity || 1) - 1)}>-</Button>
                            <span className="text-xs font-bold">{item.quantity || 1}</span>
                            <Button size="sm" isIconOnly className="bg-white text-black border border-gray-300" onPress={() => updateQuantity(item.$id, (item.quantity || 1) + 1)}>+</Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                          <Button 
                            size="sm" 
                            className="bg-black text-white hover:bg-gray-800"
                            isIconOnly
                            onPress={() => removeFromCart(item.$id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex-col items-stretch gap-3 bg-white text-black">
                <Divider />
                <div className="flex justify-between items-center px-1">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-xl text-black">${totalPrice.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full bg-[#14532d] text-black font-bold hover:bg-[#166534]"
                  isDisabled={cart.length === 0}
                  onPress={() => handleCheckout(onClose)}
                >
                  Proceed to Checkout
                </Button>
                <Button variant="flat" className="w-full bg-white text-black border border-gray-300" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </nav>
  );
}
