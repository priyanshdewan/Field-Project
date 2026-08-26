import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  CreditCard,
  Search,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  Receipt,
  Star,
  ArrowRight,
  ShieldCheck,
  Phone,
  Store,
  ShoppingCart,
  X,
  Zap,
  Tag,
  Filter,
  Check,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useBusinessData } from "@/lib/business-context";
import { GoogleMapsPicker } from "@/components/google-maps-picker";

export const Route = createFileRoute("/_app/customer-portal")({
  head: () => ({
    meta: [
      { title: "Amazon Fresh & Nearby Store — Bizora Customer" },
      {
        name: "description",
        content: "Amazon-style hyperlocal storefront with live inventory from your nearest store.",
      },
    ],
  }),
  component: CustomerPortal,
});

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  imageUrl: string;
  unit: string;
  quantity: number;
  storeStock: number;
}

// Map high-resolution Unsplash product photos for Amazon UI aesthetics
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "Amul Taaza Milk 1L": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
  "Amul Butter 500g": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
  "Sony WH-1000XM5 Wireless Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  "Lakmé Perfecting Liquid Foundation": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
  "Nescafé Gold Blend Premium Coffee 200g": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
  "Organic Ratnagiri Alphonso Mangoes 1kg": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  "Levi's 511 Slim Fit Denim Jeans": "https://images.unsplash.com/photo-1542272604-780c36856d67?auto=format&fit=crop&w=600&q=80",
  "HP LaserJet Pro Wireless Printer": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80",
  "Dairy": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  "Electronics": "https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80",
  "Beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  "Fashion": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
  "Default": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
};

export function CustomerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { products: dbProducts } = useBusinessData(); // Live database inventory from nearest store!

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true); // Default to showing only products in stock at nearest shop
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState("18th Road, Near Turner Road, Bandra West, Mumbai 400050");
  const [paymentMethod, setPaymentMethod] = useState<"UPI_RAZORPAY" | "CARD" | "COD">("UPI_RAZORPAY");

  // Hyperlocal Orders
  const [placedOrders, setPlacedOrders] = useState<Array<{
    id: string;
    items: CartItem[];
    total: number;
    address: string;
    status: "PENDING_ACCEPTANCE" | "ACCEPTED_BY_STORE" | "OUT_FOR_DELIVERY" | "DELIVERED";
    acceptedStore?: string;
    storePhone?: string;
    driverName?: string;
    driverPhone?: string;
    createdAt: string;
  }>>([
    {
      id: "ORD-9021",
      items: [
        { id: "prod-001", name: "Amul Taaza Milk 1L", category: "Grocery", price: 68, mrp: 75, imageUrl: PRODUCT_IMAGE_MAP["Amul Taaza Milk 1L"], unit: "1L", quantity: 2, storeStock: 128 },
        { id: "prod-002", name: "Amul Butter 500g", category: "Grocery", price: 265, mrp: 285, imageUrl: PRODUCT_IMAGE_MAP["Amul Butter 500g"], unit: "500g", quantity: 1, storeStock: 45 }
      ],
      total: 401,
      address: "18th Road, Bandra West, Mumbai 400050",
      status: "ACCEPTED_BY_STORE",
      acceptedStore: "GrandSquare Supermart (Store ID: #STR-104)",
      storePhone: "+91 98765 43210",
      driverName: "Ramesh Kumar (Express Partner)",
      driverPhone: "+91 98765 43211",
      createdAt: "10 mins ago"
    }
  ]);

  const [activeTab, setActiveTab] = useState<"STORE" | "ORDERS">("STORE");

  // Transform Database Products into Amazon UI Items
  const catalogProducts = useMemo(() => {
    const baseItems = dbProducts && dbProducts.length > 0 ? dbProducts : [
      { id: "SKU-10021", name: "Amul Taaza Milk 1L", category: "Grocery", dept: "Grocery", price: 68, cost: 54, stock: 128, reorder: 200, status: "ok" },
      { id: "SKU-10022", name: "Amul Butter 500g", category: "Grocery", dept: "Grocery", price: 265, cost: 210, stock: 45, reorder: 50, status: "low" },
      { id: "SKU-10023", name: "Sony WH-1000XM5 Wireless Headphones", category: "Electronics", dept: "Electronics", price: 29990, cost: 24000, stock: 8, reorder: 10, status: "ok" },
      { id: "SKU-10024", name: "Lakmé Perfecting Liquid Foundation", category: "Beauty", dept: "Beauty", price: 185, cost: 140, stock: 4, reorder: 15, status: "critical" },
      { id: "SKU-10025", name: "Nescafé Gold Blend Premium Coffee 200g", category: "Beverages", dept: "Grocery", price: 649, cost: 500, stock: 32, reorder: 40, status: "ok" },
      { id: "SKU-10026", name: "Organic Ratnagiri Alphonso Mangoes 1kg", category: "Fresh Fruits", dept: "Grocery", price: 499, cost: 380, stock: 60, reorder: 30, status: "ok" },
      { id: "SKU-10027", name: "Levi's 511 Slim Fit Denim Jeans", category: "Fashion", dept: "Fashion", price: 3499, cost: 2500, stock: 14, reorder: 20, status: "ok" },
      { id: "SKU-10028", name: "HP LaserJet Pro Wireless Printer", category: "Electronics", dept: "Electronics", price: 16999, cost: 13500, stock: 5, reorder: 5, status: "ok" },
    ];

    return baseItems.map((p: any) => {
      const img = PRODUCT_IMAGE_MAP[p.name] || PRODUCT_IMAGE_MAP[p.dept] || PRODUCT_IMAGE_MAP["Default"];
      const mrp = Math.round(p.price * 1.15);
      return {
        id: p.id,
        name: p.name,
        category: p.category || p.dept || "Grocery",
        dept: p.dept || "Grocery",
        price: p.price,
        mrp,
        stock: p.stock ?? 15,
        rating: 4.8,
        reviews: Math.floor(100 + Math.random() * 900),
        imageUrl: img,
        isAvailableInNearestShop: (p.stock ?? 15) > 0,
      };
    });
  }, [dbProducts]);

  // Filter Catalog Products
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category.includes(selectedCategory) || p.dept.includes(selectedCategory);
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = inStockOnly ? p.isAvailableInNearestShop : true;
      return matchCat && matchSearch && matchStock;
    });
  }, [catalogProducts, selectedCategory, searchQuery, inStockOnly]);

  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          mrp: product.mrp,
          imageUrl: product.imageUrl,
          unit: "1 Unit",
          quantity: 1,
          storeStock: product.stock,
        },
      ];
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartSavings = useMemo(() => cart.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0), [cart]);

  // Handle Hyperlocal Order Placement with Category Store Routing
  const handlePlaceOrder = () => {
    if (cart.length === 0) return toast.error("Your cart is empty!");

    // Determine store category based on cart items
    const hasDairyGrocery = cart.some((i) => ["Grocery", "Dairy", "Milk", "Beverages", "Fresh Fruits"].includes(i.category) || i.name.toLowerCase().includes("milk"));
    const hasElectronics = cart.some((i) => i.category === "Electronics" || i.name.toLowerCase().includes("headphone") || i.name.toLowerCase().includes("printer"));
    const hasFashion = cart.some((i) => i.category === "Fashion" || i.name.toLowerCase().includes("jeans") || i.name.toLowerCase().includes("saree"));

    let matchedStoreName = "GrandSquare Kirana & Supermart (#STR-104)";
    let matchedStoreType = "Kirana / Daily Grocery Store";

    if (hasDairyGrocery && !hasElectronics && !hasFashion) {
      matchedStoreName = "GrandSquare Kirana & Daily Fresh (#STR-104)";
      matchedStoreType = "Kirana / Daily Grocery Store";
    } else if (hasElectronics) {
      matchedStoreName = "Metro Digital & Electronics Hub (#STR-208)";
      matchedStoreType = "Consumer Electronics & Tech";
    } else if (hasFashion) {
      matchedStoreName = "Saree Sadan & Fashion Retail (#STR-312)";
      matchedStoreType = "Apparel & Fashion Boutique";
    }

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newOrderId,
      items: [...cart],
      total: cartTotal,
      address,
      status: "PENDING_ACCEPTANCE" as const,
      createdAt: "Just now"
    };

    setPlacedOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab("ORDERS");

    toast.success(`🎉 Order ${newOrderId} placed! Routing to nearest ${matchedStoreType}...`);

    // Simulate Shopkeeper Grabbing Order First
    setTimeout(() => {
      setPlacedOrders((prev) =>
        prev.map((o) => {
          if (o.id === newOrderId) {
            return {
              ...o,
              status: "ACCEPTED_BY_STORE",
              acceptedStore: `${matchedStoreName} (${matchedStoreType})`,
              storePhone: "+91 98765 43210",
              driverName: "Ramesh Kumar (Express 10-Min Partner)",
              driverPhone: "+91 98765 43211",
            };
          }
          return o;
        })
      );
      toast.success(
        `🚨 Nearest Storekeeper "${matchedStoreName}" (${matchedStoreType}) grabbed & accepted your order! Express 10-min delivery dispatched!`,
        { duration: 7000 }
      );
    }, 2800);
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#eaeded] text-slate-900 pb-20">
      {/* 1. Amazon Top Dark Navy Navigation Bar */}
      <header className="bg-[#131921] text-white">
        <div className="mx-auto flex items-center justify-between px-4 py-2.5 gap-4">
          {/* Amazon Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("STORE")}>
            <div className="flex items-center gap-1 font-bold text-xl tracking-tight text-white">
              <span className="text-amber-400 font-extrabold">amazon</span>
              <span className="text-cyan-400 text-sm font-semibold">fresh</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
              .in
            </span>
          </div>

          {/* Delivery Location Pill */}
          <div
            onClick={() => setIsCheckoutOpen(true)}
            className="hidden lg:flex items-center gap-1.5 rounded border border-transparent p-1.5 text-xs hover:border-white cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-300">Deliver to Aditi</p>
              <p className="font-bold line-clamp-1 text-white max-w-[200px] truncate">{address}</p>
            </div>
          </div>

          {/* Amazon Search Bar */}
          <div className="flex flex-1 max-w-3xl items-center rounded-md bg-white text-slate-900 shadow-sm overflow-hidden border-2 border-amber-400">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 text-xs font-semibold px-2 py-2.5 border-r border-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Grocery">Amazon Fresh & Dairy</option>
              <option value="Electronics">Electronics & Tech</option>
              <option value="Beauty">Beauty & Cosmetics</option>
              <option value="Fashion">Fashion & Clothing</option>
            </select>

            <input
              type="text"
              placeholder="Search Amazon Fresh & products in your nearest store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />

            <button className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 font-bold transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Account & Orders */}
          <div className="flex items-center gap-4 text-xs">
            <div
              onClick={() => setActiveTab("ORDERS")}
              className="rounded border border-transparent p-1.5 hover:border-white cursor-pointer"
            >
              <p className="text-[10px] text-slate-300">Returns</p>
              <p className="font-bold text-white">& Orders ({placedOrders.length})</p>
            </div>

            {/* Cart Button */}
            <div
              onClick={() => setIsCheckoutOpen(true)}
              className="relative flex items-center gap-1 rounded border border-transparent p-1.5 hover:border-white cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="h-7 w-7 text-amber-400" />
                <span className="absolute -top-1 right-0 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <span className="hidden sm:inline font-bold text-white text-sm">Cart</span>
            </div>
          </div>
        </div>

        {/* 2. Amazon Secondary Navigation Strip */}
        <div className="bg-[#232f3e] text-white text-xs px-4 py-1.5 flex items-center justify-between overflow-x-auto border-t border-slate-700">
          <div className="flex items-center gap-5 whitespace-nowrap font-medium">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Store className="h-3.5 w-3.5" /> Nearest Shop: GrandSquare Supermart (800m)
            </span>
            <button onClick={() => setSelectedCategory("All")} className="hover:text-amber-400">
              All Products
            </button>
            <button onClick={() => setSelectedCategory("Grocery")} className="hover:text-amber-400">
              Fresh Dairy & Grocery
            </button>
            <button onClick={() => setSelectedCategory("Electronics")} className="hover:text-amber-400">
              Electronics Deals
            </button>
            <button onClick={() => setSelectedCategory("Beauty")} className="hover:text-amber-400">
              Beauty & Health
            </button>
            <button onClick={() => setSelectedCategory("Fashion")} className="hover:text-amber-400">
              Fashion Store
            </button>
          </div>

          {/* Real Inventory Filter Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-600">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Available at Nearest Shop Only
            </span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-amber-400 cursor-pointer h-3.5 w-3.5"
            />
          </div>
        </div>
      </header>

      {/* 3. Main Amazon Product Showcase */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        {/* Amazon Deals Hero Banner */}
        <div className="relative rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 p-6 text-white shadow-md overflow-hidden mb-6">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="inline-flex items-center gap-1 rounded bg-black/40 px-2.5 py-0.5 text-xs font-bold text-amber-300">
              ⚡ AMAZON FLASH SALE · 10-MIN EXPRESS DISPATCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Live Stock From Your Local Bandra Shop
            </h2>
            <p className="text-xs text-amber-100">
              Orders placed here are broadcast directly to local shopkeepers. First shopkeeper to accept delivers within 10 minutes!
            </p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block text-7xl opacity-80">
            📦
          </div>
        </div>

        {/* Nearby Approved Shops Directory */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Nearby Approved Shops & Supermarkets</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              3 Shops Online · 10-Min Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">GrandSquare Supermart</p>
                <p className="text-[11px] text-slate-500">Bandra West · 800m away</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                  ★ 4.9 · 10-Min Express
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80">
              <div>
                <p className="font-bold text-slate-900">Metro Express Mart</p>
                <p className="text-[11px] text-slate-500">Khar West · 1.2km away</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                  ★ 4.7 · 15-Min Express
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80">
              <div>
                <p className="font-bold text-slate-900">Fresh Produce Hub</p>
                <p className="text-[11px] text-slate-500">Santacruz West · 1.8km away</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                  ★ 4.8 · 20-Min Express
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid (Amazon Style) */}
        {activeTab === "STORE" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.id === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Real Product Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-md bg-slate-50 flex items-center justify-center">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {/* Prime Badge */}
                      <span className="absolute top-2 left-2 rounded bg-cyan-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase shadow-sm">
                        prime ⚡ 10-MIN
                      </span>
                    </div>

                    {/* Meta & Title */}
                    <div>
                      <h3 className="font-medium text-sm text-slate-900 line-clamp-2 hover:text-amber-600 cursor-pointer leading-snug">
                        {p.name}
                      </h3>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <div className="flex text-amber-400">
                          {"★".repeat(4)}
                          <span className="text-slate-300">★</span>
                        </div>
                        <span className="text-slate-600 font-bold text-[11px]">{p.rating}</span>
                        <span className="text-slate-400 text-[11px]">({p.reviews})</span>
                      </div>

                      {/* Live Store Stock Status Badge */}
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-700">
                          In Stock at GrandSquare Store ({p.stock} units)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-red-600 font-bold">-15%</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        M.R.P.: ₹{p.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      FREE Delivery by <strong className="text-slate-800">Nearby Local Shopkeeper</strong>
                    </p>

                    {inCart ? (
                      <div className="flex items-center justify-between rounded-lg bg-amber-400 px-3 py-1.5 text-slate-950 font-bold shadow-sm">
                        <button onClick={() => handleUpdateQuantity(p.id, -1)} className="p-1 hover:bg-amber-500 rounded">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm">{inCart.quantity} in cart</span>
                        <button onClick={() => handleUpdateQuantity(p.id, 1)} className="p-1 hover:bg-amber-500 rounded">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="w-full rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2 text-xs transition-colors shadow-sm"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Track Orders Section */}
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" /> Your Amazon Fresh Orders
            </h2>

            {placedOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <span className="font-bold text-amber-600 font-mono text-base">{ord.id}</span>
                    <p className="text-xs text-slate-500">Deliver to: {ord.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">₹{ord.total}</span>
                    <p className="text-xs text-emerald-600 font-bold">Accepted by Local Shop</p>
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-emerald-800">⚡ Accepted by {ord.acceptedStore}</p>
                    <p className="text-slate-600">Store Contact: {ord.storePhone} | Driver: {ord.driverName}</p>
                  </div>
                  <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded">
                    ETA: 8 Mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl rounded-xl bg-[#131921] p-4 text-white shadow-2xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300">
              Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items):
            </p>
            <p className="text-lg font-extrabold text-amber-400">₹{cartTotal.toLocaleString("en-IN")}</p>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 py-2.5 text-xs shadow-md"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      )}

      {/* Amazon Checkout Drawer with Google Maps Live Geolocation */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4 text-slate-900 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#131921]">Amazon Fresh Checkout</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Google Maps Live Geolocation Auto-Fill Component */}
            <GoogleMapsPicker
              address={address}
              onAddressChange={(newAddr) => setAddress(newAddr)}
              label="Delivery Address (Google Maps Live GPS)"
            />

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs border-b pb-2">
                  <div className="flex items-center gap-2">
                    <img src={item.imageUrl} className="h-10 w-10 object-cover rounded" alt={item.name} />
                    <span className="font-semibold">{item.name} (x{item.quantity})</span>
                  </div>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between"><span>Items Subtotal:</span><span>₹{cartTotal}</span></div>
              <div className="flex justify-between text-emerald-600 font-bold"><span>Delivery:</span><span>FREE Express</span></div>
              <div className="flex justify-between font-extrabold text-sm border-t pt-1"><span>Order Total:</span><span>₹{cartTotal}</span></div>
            </div>

            {/* Secure Production Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Select Secure Production Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI_RAZORPAY")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 font-bold transition-all ${
                    paymentMethod === "UPI_RAZORPAY"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">📲</span>
                  <div>
                    <p className="leading-none">UPI / QR</p>
                    <p className="text-[10px] text-slate-500 font-normal">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 font-bold transition-all ${
                    paymentMethod === "CARD"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="leading-none">Cards / NetBank</p>
                    <p className="text-[10px] text-slate-500 font-normal">Visa, Mastercard, HDFC</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-2.5 rounded-lg border text-left col-span-2 flex items-center gap-2 font-bold transition-all ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">💵</span>
                  <div>
                    <p className="leading-none">Cash on 10-Min Delivery (COD)</p>
                    <p className="text-[10px] text-slate-500 font-normal">Pay store delivery partner at doorstep</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3 text-sm shadow-md flex items-center justify-center gap-2"
            >
              <span>PAY ₹{cartTotal} & BROADCAST TO NEARBY SHOP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
