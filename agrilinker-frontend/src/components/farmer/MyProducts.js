import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const farmerEmail = localStorage.getItem("email");
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingOrders: 0 });

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortByQuantity, setSortByQuantity] = useState("None");

  // 1. Fetch products from Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/products/farmer/${farmerEmail}`,
        );
        setProducts(res.data);
        setFilteredProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };
    if (farmerEmail) fetchProducts();
  }, [farmerEmail]);

  // Fetch farmer stats (pending orders count)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`api/orders/farmer-stats/${farmerEmail}`);

        console.log("Stats response:", res.data); // debug
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (farmerEmail) {
      fetchStats();
    }
  }, [farmerEmail]);

  useEffect(() => {
    let result = products;

    // Search Filter
    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category Filter
    if (filterCategory !== "All") {
      result = result.filter((p) => p.category === filterCategory);
    }

    // Quantity Sorting
    if (sortByQuantity === "LowToHigh") {
      result = [...result].sort((a, b) => a.quantity - b.quantity);
    } else if (sortByQuantity === "HighToLow") {
      result = [...result].sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredProducts(result);
  }, [searchTerm, filterCategory, sortByQuantity, products]);

  // 2. Delete Product Function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:8081/api/products/${id}`);
        setProducts(products.filter((p) => p.id !== id)); // Remove from UI
      } catch (err) {
        alert("Could not delete product.");
      }
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-emerald-600">
        Loading your harvest...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      {/* PAGE HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-5xl font-black text-emerald-950">
          My Product Listings
        </h1>
        <p className="text-emerald-600">
          Manage and track your available stock
        </p>
      </div>

      {/* QUICK STATS BAR */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50">
          <p className="text-3xl font-bold text-slate-400 uppercase">
            Active Listings
          </p>
          <p className="text-2xl font-black text-emerald-600">
            {products.length}
          </p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-200 text-white">
          <p className="text-sm font-bold opacity-80 uppercase">In Stock</p>
          <p className="text-3xl font-black text-white">
            {products.reduce((acc, curr) => acc + Number(curr.quantity), 0)}{" "}
            Units
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50">
          <p className="text-2xl font-bold text-slate-400 uppercase">
            Pending orders
          </p>
          <p className="text-3xl font-black text-emerald-600">
            {stats.pendingOrders}
          </p>
        </div>
      </div>
      {/* SEARCH & FILTER BAR */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search your harvest..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 opacity-30">🔍</span>
        </div>

        <select
          className="bg-white px-6 py-4 rounded-2xl border-none shadow-sm text-emerald-900 font-semibold"
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
        </select>

        <select
          className="bg-white px-6 py-4 rounded-2xl border-none shadow-sm text-emerald-900 font-semibold"
          onChange={(e) => setSortByQuantity(e.target.value)}
        >
          <option value="None">Sort by Quantity</option>
          <option value="LowToHigh">Low to High</option>
          <option value="HighToLow">High to Low</option>
        </select>
      </div>
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row gap-10 bg-slate-100 p-10 rounded-[10px]">
        {/* PRODUCT GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[20px] overflow-hidden shadow-xl shadow-slate-200/50 border border-emerald-50 hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Product Image */}
              <div className="flex bg-white  p-3 h-48 w-45 item-center bg-slate-200 relative gap-3">
                <img
                  src={`http://localhost:8081${product.product_image}`}
                  alt={product.name}
                  className="w-45 h-full object-cover rounded-[20px]"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=No+Image";
                  }}
                />
                {/*<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                  {product.category}
                </div>*/}
                <div className=" text-white/90 backdrop-blur-md px-3 py-1 h-8 rounded-[5px] rounded-0 text-s font-bold bg-emerald-600 shadow-sm">
                  {product.category}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-emerald-950">
                    {product.name}
                  </h3>
                  <span className="text-emerald-600 font-black text-lg">
                    LKR {product.price}
                  </span>
                </div>

                <div className="flex items-center text-slate-500 text-lg mb-6 space-x-4">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                    Qty: {product.quantity} {product.unit}
                  </span>
                  <span>📍 {product.location}</span>
                </div>
                <div className="flex items-center text-slate-500 text-sm mb-6 space-x-4">
                  {product.quantity < 50 && (
                    <div className="top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider  shadow-lg shadow-red-200 gap-4">
                      ⚠️ Low Stock
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                    className="py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="py-3 rounded-2xl bg-white border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Placeholder */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No products listed yet.</p>
            <button
              onClick={() => navigate("/add-product")}
              className="mt-4 text-emerald-600 font-bold underline"
            >
              Add your first harvest
            </button>
          </div>
        )}
        {/* --- NEW RIGHT NAVIGATION CARD --- */}
        <div className="lg:w-1/4 h-fit pt-0 pr-0 p-8 space-y-4 ">
          <div className=" rounded-[0.5rem] pb-6 pt-0 ">
            <div className="flex flex-col items-center space-y-[50px]">
              {[
                {
                  name: "Dashboard",
                  icon: "",
                  path: "/farmer/dashboard",
                },
                { name: "Add Prodct", icon: "", path: "/farmer/add-product2" },
                { name: "My Orders", icon: "", path: "/farmer/orders" },
                { name: "My Products", icon: "", path: "/farmer/my-products" },
                { name: "My request", icon: "", path: "/farmer/inquiries" },
                {
                  name: "Sales History",
                  icon: "",
                  path: "/farmer/sales-history",
                },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-center w-[200px] text-xl bg-[#29ab87] items-center h-[100px] space-x-4 s p-4  rounded-full hover:bg-emerald-400 text-white font-semibold transition-all duration-300 group active:scale-95 shadow-lg shadow-emerald-200 border border-transparent hover:border-emerald-500"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
