"use client";

import { useState, useEffect } from "react";
import { supabase } from "./SupabaseClient";
import { Line, Bar, Pie, Doughnut, PolarArea, Radar, Bubble } from "react-chartjs-2";
import "chart.js/auto";
import * as tf from "@tensorflow/tfjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import Chart from "react-apexcharts";
import { Canvas } from "@react-three/fiber";
import { Box } from "@react-three/drei";

export function StockContent() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<any[]>([]);
  const [unloadingPlan, setUnloadingPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: inventory } = await supabase.from("inventory").select("*");
      setInventoryData(inventory || []);
      calculateLoadingUnloading(inventory || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  function calculateLoadingUnloading(inventory: any[]) {
    const maxWeight = 1000; // Max weight per pallet/container in kg
    let currentWeight = 0;
    let loadingPlan: any[] = [];
    let unloadingPlan: any[] = [];

    inventory.sort((a, b) => b.weight - a.weight);

    for (let item of inventory) {
      if (currentWeight + item.weight <= maxWeight) {
        loadingPlan.push(item);
        currentWeight += item.weight;
      } else {
        unloadingPlan.push(item);
      }
    }

    setLoadingPlan(loadingPlan);
    setUnloadingPlan(unloadingPlan);

    toast.success(`✅ Optimized: ${loadingPlan.length} loaded, ${unloadingPlan.length} unloaded`);
  }

  function exportToCSV() {
    const csvData = Papa.unparse([...loadingPlan, ...unloadingPlan]);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "loading_unloading_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4"> Warehouse Loading & Unloading Optimization</h1>

      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4" onClick={exportToCSV}>
        📥 Export Report
      </button>

      <ToastContainer />

      <div className="grid grid-cols-2 gap-6">
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">🚛 Optimal Loading Plan</h2>
          {loadingPlan.length === 0 ? <p>No optimized loading plan available.</p> : 
            <ul className="list-disc pl-4">
              {loadingPlan.map((item, i) => (
                <li key={i} className="text-green-600 font-semibold">
                  ✅ {item.product_name}: {item.weight}kg
                </li>
              ))}
            </ul>
          }
        </div>

        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">📦 Items for Unloading</h2>
          {unloadingPlan.length === 0 ? <p>All items fit into the optimal loading plan.</p> : 
            <ul className="list-disc pl-4">
              {unloadingPlan.map((item, i) => (
                <li key={i} className="text-red-600 font-semibold">
                  ❌ {item.product_name}: {item.weight}kg
                </li>
              ))}
            </ul>
          }
        </div>

        <div className="border p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-bold mb-2">📊 Loading vs Unloading Efficiency</h2>
          <Doughnut
            data={{
              labels: ["Loaded Items", "Unloaded Items"],
              datasets: [{ data: [loadingPlan.length, unloadingPlan.length], backgroundColor: ["blue", "red"] }],
            }}
          />
        </div>

        <div className="border p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-bold mb-2">📊 Space Utilization per Pallet</h2>
          <PolarArea
            data={{
              labels: inventoryData.map((i) => i.product_name),
              datasets: [
                {
                  label: "Space Used (%)",
                  data: inventoryData.map((i) => i.space_used || 0),
                  backgroundColor: ["blue", "red", "yellow", "green", "purple"],
                },
              ],
            }}
          />
        </div>

        <div className="border p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-bold mb-2">📊 Time Taken for Loading & Unloading</h2>
          {inventoryData.length === 0 ? <p>No data available</p> : 
            <Line
              data={{
                labels: inventoryData.map((i) => i.product_name),
                datasets: [
                  { label: "Loading Time (mins)", data: inventoryData.map((i) => i.loading_time || 0), borderColor: "green" },
                  { label: "Unloading Time (mins)", data: inventoryData.map((i) => i.unloading_time || 0), borderColor: "red" },
                ],
              }}
            />
          }
        </div>

        <div className="border p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-bold mb-2">🏭 3D Warehouse Visualization</h2>
          <Canvas style={{ height: "300px" }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {inventoryData.map((w, i) => (
              <Box key={i} position={[i * 2, 0, 0]}>
                <meshStandardMaterial attach="material" color={w.space_used > 80 ? "red" : "green"} />
              </Box>
            ))}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
