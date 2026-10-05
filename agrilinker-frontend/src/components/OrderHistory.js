import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const OrderHistory = () => {
  const { user } = useContext(AuthContext); //  get logged-in user
  const USER_ID = user?.email || null; // email comes from user object

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!USER_ID) {
          setOrders([]);
          return;
        }
        //change
        const res = await api.get(
          `/api/orders/user/${encodeURIComponent(USER_ID)}`,
        );

        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [USER_ID]);

  if (loading)
    return <div className="text-center p-10">Loading your history...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-900 mb-8">
        My Purchase History
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
          <p className="text-gray-500 text-lg">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id || order._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between border-b pb-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Order ID
                  </p>
                  <p className="font-mono text-sm text-gray-700">
                    {order.id || order._id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Date
                  </p>
                  <p className="text-sm text-gray-700">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-800">
                      {item.name}{" "}
                      <span className="text-gray-400 text-sm">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Rs.{" "}
                      {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                    {order.paymentMethod || "N/A"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus || "N/A"}
                  </span>
                </div>

                <div className="text-xl font-black text-green-900">
                  Total: Rs. {Number(order.totalAmount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
