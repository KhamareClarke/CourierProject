"use client";

import { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut, Radar, Scatter, PolarArea, Bubble } from "react-chartjs-2";
import "chart.js/auto";
import * as tf from "@tensorflow/tfjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { FaDownload, FaChartLine, FaBox, FaExclamationTriangle, FaFilter } from "react-icons/fa";
import { supabase } from "@/lib/supabase/client";
export default function OrdersUploadContent() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [restockRecommendations, setRestockRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch sales data
      const { data: sales } = await supabase.from("sales_data").select("*").order("order_date", { ascending: true });
      setSalesData(sales || []);

      // Fetch top-selling products
      const { data: topProducts } = await supabase.rpc("get_top_selling_products").limit(5);
      setTopProducts(topProducts || []);

      // Fetch inventory levels
      const { data: inventory } = await supabase.from("inventory").select("*");
      setInventoryLevels(inventory || []);

      // Fetch category-wise sales
      const { data: categoryData } = await supabase.rpc("get_category_sales");
      setCategorySales(categoryData || []);

      // Generate restocking recommendations
      generateRestockRecommendations(inventory || []);

      setLoading(false);
    }

    fetchData();

    // Live Sync with Supabase
    const subscription = supabase
      .channel("sales_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sales_data" }, (payload) => {
        setSalesData((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // AI Demand Forecasting Model
  useEffect(() => {
    if (salesData.length > 0) {
      async function predictFutureSales() {
        const dates = salesData.map((item) => new Date(item.order_date).getTime());
        const quantities = salesData.map((item) => item.quantity_sold);

        const maxDate = Math.max(...dates);
        const minDate = Math.min(...dates);
        const normalizedDates = dates.map((date) => (date - minDate) / (maxDate - minDate));

        const xs = tf.tensor2d(normalizedDates, [normalizedDates.length, 1]);
        const ys = tf.tensor2d(quantities, [quantities.length, 1]);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

        await model.fit(xs, ys, { epochs: 500 });

        const futureDays = 7;
        const futureDates = Array.from({ length: futureDays }, (_, i) => (maxDate + i * 86400000 - minDate) / (maxDate - minDate));
        const futureXs = tf.tensor2d(futureDates, [futureDays, 1]);
        const predictions = model.predict(futureXs) as tf.Tensor;

        const predictedValues = await predictions.data();
        const futureDatesFormatted = futureDates.map((_, i) => new Date(maxDate + i * 86400000).toISOString().split("T")[0]);

        setPredictions(futureDatesFormatted.map((date, i) => ({ date, quantity: predictedValues[i] })));
      }

      predictFutureSales();
    }
  }, [salesData]);

  // Generate Restocking Recommendations
  function generateRestockRecommendations(inventory: any[]) {
    const recommendations = inventory
      .filter((item) => item.stock < 10)
      .map((item) => ({
        product: item.product_name,
        stock: item.stock,
        recommendedQuantity: 30 - item.stock,
        reason: "Stock running critically low. AI predicts increased demand.",
      }));

    setRestockRecommendations(recommendations);

    // Alert for low stock products
    recommendations.forEach((item) => {
      toast.warn(`⚠️ ${item.product}: Only ${item.stock} left! Restock at least ${item.recommendedQuantity} units.`);
    });
  }

  // Export Data to CSV
  function exportToCSV() {
    const csvData = Papa.unparse(inventoryLevels);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">Inventory & Demand Dashboard</h1>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 md:mb-6 flex items-center gap-2"
        onClick={exportToCSV}
      >
        <FaDownload /> Export Inventory Data
      </motion.button>

      <ToastContainer />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Restocking Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border p-4 rounded shadow bg-white col-span-1 md:col-span-2"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-600">
            <FaExclamationTriangle /> Restocking Recommendations
          </h2>
          {restockRecommendations.length === 0 ? (
            <p className="text-green-600">✅ All stock levels are sufficient.</p>
          ) : (
            <ul className="list-disc pl-4">
              {restockRecommendations.map((item, i) => (
                <li key={i} className="text-red-600 font-semibold">
                  ⚠️ {item.product}: Only {item.stock} left! Restock at least {item.recommendedQuantity} units.
                  <br />
                  <span className="text-gray-600">{item.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Predicted Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border p-4 rounded shadow bg-white"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-600">
            <FaChartLine /> Predicted Sales
          </h2>
          <Line
            data={{
              labels: predictions.map((p) => p.date),
              datasets: [
                {
                  label: "Predicted Sales",
                  data: predictions.map((p) => p.quantity),
                  borderColor: "red",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: true,
                },
              ],
            }}
          />
        </motion.div>

        {/* Sales by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border p-4 rounded shadow bg-white"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-purple-600">
            <FaBox /> Sales by Category
          </h2>
          <PolarArea
            data={{
              labels: categorySales.map((c) => c.category),
              datasets: [
                {
                  data: categorySales.map((c) => c.total_sales),
                  backgroundColor: ["orange", "purple", "cyan", "pink", "teal"],
                },
              ],
            }}
          />
        </motion.div>

        {/* Stock Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border p-4 rounded shadow bg-white"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-green-600">
            <FaBox /> Stock Distribution
          </h2>
          <Doughnut
            data={{
              labels: inventoryLevels.map((i) => i.product_name),
              datasets: [
                {
                  data: inventoryLevels.map((i) => i.stock),
                  backgroundColor: ["blue", "green", "yellow", "red", "purple"],
                },
              ],
            }}
          />
        </motion.div>

        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="border p-4 rounded shadow bg-white"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-600">
            <FaChartLine /> Top Selling Products
          </h2>
          <Bar
            data={{
              labels: topProducts.map((p) => p.product_name),
              datasets: [
                {
                  label: "Units Sold",
                  data: topProducts.map((p) => p.total_sold),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
          />
        </motion.div>

        {/* Sales vs Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="border p-4 rounded shadow bg-white"
        >
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-teal-600">
            <FaFilter /> Sales vs Inventory
          </h2>
          <Scatter
            data={{
              datasets: [
                {
                  label: "Sales vs Inventory",
                  data: salesData.map((s) => ({ x: s.quantity_sold, y: inventoryLevels.find((i) => i.product_id === s.product_id)?.stock || 0 })),
                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
              ],
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}