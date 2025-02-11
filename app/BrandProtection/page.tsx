"use client";

import { useState, useEffect } from "react";
import { supabase } from "./SupabaseClient";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";
import * as tf from "@tensorflow/tfjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { Canvas } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import { Spinner } from "./Spinner"; // Assuming you have a Spinner component for loading states

export function OrdersUploadContent() {
  const [counterfeitData, setCounterfeitData] = useState<any[]>([]);
  const [recyclingData, setRecyclingData] = useState<any[]>([]);
  const [fraudPredictions, setFraudPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        // Fetch counterfeit product alerts
        const { data: counterfeit } = await supabase.from("counterfeit_products").select("*");
        setCounterfeitData(counterfeit || []);

        // Fetch recycling workflows
        const { data: recycling } = await supabase.from("recycling_workflows").select("*");
        setRecyclingData(recycling || []);

        // Run AI fraud prediction
        await predictCounterfeitRisk(counterfeit || []);
      } catch (error) {
        toast.error("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function predictCounterfeitRisk(counterfeit: any[]) {
    const riskLevels = counterfeit.map((item) => (item.risk_level === "High" ? 1 : 0));

    if (riskLevels.length === 0) return;

    const xs = tf.tensor2d(riskLevels, [riskLevels.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

    await model.fit(xs, xs, { epochs: 100 });

    const futurePrediction = model.predict(xs) as tf.Tensor;
    const predictedValues = await futurePrediction.data();

    setFraudPredictions(counterfeit.map((item, i) => ({
      name: item.product_name,
      prediction: predictedValues[i] > 0.5 ? "High Risk" : "Low Risk"
    })));
  }

  function exportToCSV() {
    const csvData = Papa.unparse([...counterfeitData, ...recyclingData]);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "brand_protection_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report exported successfully!");
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🛡️ AI Brand & Asset Protection Dashboard</h1>

      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition-colors" onClick={exportToCSV}>
        📥 Export Report
      </button>

      <ToastContainer />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">⚠️ Counterfeit & Harmful Product Alerts</h2>
            {counterfeitData.length === 0 ? <p>No flagged items.</p> : 
              <ul className="list-disc pl-4">
                {counterfeitData.map((item, i) => (
                  <li key={i} className="text-red-600 font-semibold">
                    ❌ {item.product_name}: {item.risk_level} Risk
                  </li>
                ))}
              </ul>
            }
          </div>

          <div className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">♻️ Recycling Workflows</h2>
            {recyclingData.length === 0 ? <p>No recycling processes active.</p> : 
              <ul className="list-disc pl-4">
                {recyclingData.map((item, i) => (
                  <li key={i} className="text-green-600 font-semibold">
                    🔄 {item.product_name}: {item.status}
                  </li>
                ))}
              </ul>
            }
          </div>

          <div className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">📊 AI-Powered Counterfeit Risk Prediction</h2>
            <Radar
              data={{
                labels: fraudPredictions.map((item) => item.name),
                datasets: [{ label: "Risk Level", data: fraudPredictions.map((item) => (item.prediction === "High Risk" ? 1 : 0)), backgroundColor: "rgba(255, 99, 132, 0.2)" }],
              }}
            />
          </div>

          <div className="border p-4 rounded shadow col-span-1 md:col-span-2">
            <h2 className="text-lg font-bold mb-2">🏭 3D Recycling & Warehouse View</h2>
            <Canvas style={{ height: "300px" }}>
              <ambientLight />
              <pointLight position={[10, 10, 10]} />
              {recyclingData.map((r, i) => (
                <Box key={i} position={[i * 2, 0, 0]}>
                  <meshStandardMaterial attach="material" color={r.status === "Completed" ? "green" : "yellow"} />
                </Box>
              ))}
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
}