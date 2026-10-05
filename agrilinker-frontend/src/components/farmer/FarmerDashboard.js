import React, { useState, useEffect } from "react";

import api from "../../api/api";

import { useNavigate } from "react-router-dom"; // Import this for navigation
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  LayoutDashboard,
  ShoppingBasket,
  ClipboardList,
  Package,
  History,
  BarChart3,
  Store,
  Search,
  Bell,
  Download,
  ChevronDown,
} from "lucide-react"; // Using Lucide for cleaner icons

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProductsSold: 0,
    pendingPayments: 0,
  });
  const [paymentData, setPaymentData] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [farmerEmail, setFarmerEmail] = useState(localStorage.getItem("email"));

  //const COLORS = ["#10b981", "#f59e0b"];
  const COLORS = ["#10b981", "#94a3b8", "#1e293b"];

  const renderCustomizedLabel = ({ percent }) => {
    return `${(percent * 100).toFixed(0)}%`;
  };

  const [monthlySales, setMonthlySales] = useState([]);
  const monthlySalesData = [
    { month: "Jan", sales: monthlySales[0] || 0 },
    { month: "Feb", sales: monthlySales[1] || 0 },
    { month: "Mar", sales: monthlySales[2] || 0 },
    { month: "Apr", sales: monthlySales[3] || 0 },
    { month: "May", sales: monthlySales[4] || 0 },
    { month: "Jun", sales: monthlySales[5] || 0 },
    { month: "Jul", sales: monthlySales[6] || 0 },
    { month: "Aug", sales: monthlySales[7] || 0 },
    { month: "Sep", sales: monthlySales[8] || 0 },
    { month: "Oct", sales: monthlySales[9] || 0 },
    { month: "Nov", sales: monthlySales[10] || 0 },
    { month: "Dec", sales: monthlySales[11] || 0 },
  ];

  // Category vaice
  const vegetableCount = products.filter(
    (p) => p.category === "Vegetables",
  ).length;
  const fruitCount = products.filter((p) => p.category === "Fruits").length;
  const grainCount = products.filter((p) => p.category === "Grains").length;

  useEffect(() => {
    const fetchProducts = async () => {
      const email = localStorage.getItem("email"); // always latest
      if (!email) return;

      try {
        const res = await api.get(`api/products/farmer/${email}`);
        setProducts(res.data);

        // fetch stats
        const statsRes = await api.get(`api/orders/farmer-stats/${email}`);
        setStats(statsRes.data);

        // payment breakdown fetch
        api.get(`api/orders/farmer/payment-breakdown/${email}`).then((res) => {
          // Transform if res.data is object
          const data = Object.entries(res.data).map(([key, value]) => ({
            name: key,
            value: value,
          }));
          setPaymentData(data);
        });

        // 4. Fetch Monthly Sales (Line Chart)
        const salesRes = await api.get(
          `api/orders/farmer/monthly-sales/${email}`,
        );
        console.log("Monthly Sales received:", salesRes.data); // Console එකේ බලන්න data එනවද කියලා
        setMonthlySales(salesRes.data);

        setFarmerEmail(email);

        setFarmerEmail(email); // update state if needed
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts(); // initial fetch

    // Listen for login changes
    window.addEventListener("farmerChanged", fetchProducts);
    return () => window.removeEventListener("farmerChanged", fetchProducts);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10  ">
          {/* Dashboard Header */}
          <div className="flex flex-col max-w-6xl mx-auto mb-10  mb-8">
            <div>
              <h1 className="text-5xl font-black text-emerald-950">
                Farmer Dashboard
              </h1>
              <p className="text-emerald-500 text-sm">
                Manage your harvest and Listing with analytics details
              </p>
            </div>
          </div>

          <div className="flex  max-w-7xl mx-auto  w-[1300px] h-100 gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide ">
            {[
              {
                name: "Add Product",
                icon: <Package size={30} />,
                path: "/farmer/add-product2",
              },
              {
                name: "My Products",
                icon: <ShoppingBasket size={30} />,
                path: "/farmer/my-products",
              },
              {
                name: "Inquiries",
                icon: <ClipboardList size={30} />,
                path: "/farmer/inquiries",
              },
              {
                name: "Orders",
                icon: <History size={30} />,
                path: "/farmer/orders",
              },
              {
                name: "Sales History",
                icon: <BarChart3 size={30} />,
                path: "/farmer/sales-history",
              },
              {
                name: "Farmer Hub",
                icon: <Store size={30} />,
                path: "/farmer/FarmerHub",
              },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 h-[100px] bg-[#29ab87] border border-slate-200 rounded-full text-xl font-semibold text-white shadow-sm hover:border-emerald-400 hover:text-slate-600 hover:bg-emerald-50 transition-all active:scale-95"
              >
                <span className="text-white ">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
          <div className=" mx-auto max-w-7xl lg:flex-row gap-10 bg-slate-100 p-10 rounded-[10px]">
            {/* --- TOP STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-emerald-900 font-medium text-[30px]">
                    Sales
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ShoppingBasket size={20} />
                  </div>
                </div>
                <p className="text-slate-600 text-2sm mt-2 pt-5">Total Sales</p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-3xl font-bold text-slate-900">
                    Rs. {stats.totalSales.toLocaleString()}
                  </h3>
                  {/*<span className="text-emerald-500 text-xs font-bold">
                  +20.00%
                </span>*/}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-emerald-900 font-medium text-[30px]">
                    Orders
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ClipboardList size={20} />
                  </div>
                </div>
                <p className="text-slate-600 text-2sm mt-2 pt-5">
                  Completed orders
                </p>

                <div className="flex items-baseline gap-4">
                  <h3 className="text-3xl font-bold text-slate-900">
                    {stats.totalOrders}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-emerald-900 font-medium text-[30px]">
                    Total Products
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Package size={20} />
                  </div>
                </div>
                <p className="text-slate-600 text-2sm mt-2 pt-5">
                  My total items
                </p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {products.length} Items
                  </h3>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-emerald-900 font-medium text-[30px]">
                    Harvesting
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ShoppingBasket size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">
                      Vegetables
                    </span>
                    <span className="text-slate-900 font-bold">
                      {vegetableCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">
                      Fruits
                    </span>
                    <span className="text-slate-900 font-bold">
                      {fruitCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">
                      Grains
                    </span>
                    <span className="text-slate-900 font-bold">
                      {grainCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4"></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-emerald-900 font-medium text-[30px]">
                    Avarege Oder
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Package size={20} />
                  </div>
                </div>
                <p className="text-slate-600 text-2sm mt-2 pt-5">
                  Avarage order value
                </p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Rs. {stats.averageOrderValue}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-red-300 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-red-900 font-medium text-[30px]">
                    Payments
                  </span>
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <ChevronDown size={20} />
                  </div>
                </div>
                <p className="text-slate-600 text-2sm mt-2 pt-5">
                  Pending Payments{" "}
                </p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Rs. {stats.pendingPayments}
                  </h3>
                </div>
              </div>
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Bar Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm">
                <h5 className="text-slate-900 font-bold mb-6">
                  Total Sales in this Year
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#7d827e", fontSize: 15 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#7d7f80", fontSize: 15 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Invoices Donut Chart */}
              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm relative">
                <h3 className="text-emerald-900 font-bold mb-2">
                  Payment Status For Orders
                </h3>
                <div className="h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      Payments
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      status
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {paymentData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[idx] }}
                        ></div>
                        <span className="text-slate-900 font-bold">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Low Stock Items Card */}
            <div className="mt-6 bg-white p-6 rounded-2xl border border-yellow-300 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-yellow-700 font-bold text-lg">
                  Low Stock Items
                </h3>

                <Package className="text-yellow-600" size={20} />
              </div>

              {/* Content */}
              {products.filter((p) => p.quantity <= 10).length === 0 ? (
                <p className="text-slate-500 text-sm">No low stock items ✅</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products
                    .filter((p) => p.quantity <= 50)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="border border-yellow-200 rounded-lg p-3 bg-yellow-50"
                      >
                        <p className="font-bold text-slate-800">{item.name}</p>

                        <p className="text-xs text-slate-400">
                          Product ID: {item.id}
                        </p>

                        <p className="text-red-600 font-bold mt-1">
                          Stock: {item.quantity}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;
