// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
// @ts-expect-error dkj
import { saveAs } from "file-saver";
import { supabase } from "./SupabaseClient";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Eye } from "lucide-react";

const expectedHeaders = [
  "customer_name",
  "address",
  "product_name",
  "quantity",
  "status",
  "delivery_date (YYYY-MM-DD)",
  "email",
  "phone",
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  shipped: { label: "Shipped", className: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
} as const;

export function OrdersUploadContent() {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<
    { row: number; message: string; type: "success" | "error" }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name");
      if (error:any) {
        console.error("Error fetching products:", error:any);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFile(event.target.files[0]);
      setValidationResults([]);
    }
  };

  const handleDownload = async () => {
    if (!selectedProduct) {
      alert("Please select a product!");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");
    worksheet.addRow(expectedHeaders);

    const statuses = ["Shipped", "Delivered", "Pending"];
    statuses.forEach((status) => {
      worksheet.addRow(["", "", product.name, 1, status, "", "", ""]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "order_template.xlsx");
  };

  const saveData = async () => {
    if (!uploadedFile) {
      alert("Please upload a file first!");
      return;
    }

    setIsProcessing(true);
    setValidationResults([]);
    setProgress(0);

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const worksheet = workbook.getWorksheet(1);

      const fileHeaders = worksheet.getRow(1).values.slice(1);
      if (JSON.stringify(fileHeaders) !== JSON.stringify(expectedHeaders)) {
        setValidationResults([
          { row: 0, message: "Template headers do not match.", type: "error" },
        ]);
        setIsProcessing(false);
        return;
      }

      const rows = worksheet.getSheetValues();
      const results = [];
      const totalRows = rows.length - 2; // Exclude header row and empty rows
      let successCount = 0;
      let errorCount = 0;

      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        const customerName = row[1];
        const address = row[2];
        const productName = row[3];
        const quantity = row[4];
        const status = row[5];
        const deliveryDate = row[6];
        const email = row[7];
        const phone = row[8];

        // Validation check
        const missingFields = [];
        if (!customerName) missingFields.push("Customer Name");
        if (!address) missingFields.push("Address");
        if (!productName) missingFields.push("Product Name");
        if (!quantity) missingFields.push("Quantity");
        if (!status) missingFields.push("Status");
        if (!deliveryDate) missingFields.push("Delivery Date");
        if (!email) missingFields.push("Email");
        if (!phone) missingFields.push("Phone");

        if (missingFields.length > 0) {
          results.push({
            row: i,
            message: `Missing fields: ${missingFields.join(", ")}`,
            type: "error",
          });
          errorCount++;
          continue;
        }

        try {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .upsert(
              { name: customerName, address, email, phone },
              { onConflict: "email" }
            )
            .select("id")
            .single();

          if (customererror:any) {
            results.push({
              row: i,
              message: `Failed to save customer for ${customerName}: ${customerError.message}`,
              type: "error",
            });
            errorCount++;
            continue;
          }

          const customerId = customerData.id;

          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("id")
            .eq("name", productName)
            .single();

          if (producterror:any) {
            results.push({
              row: i,
              message: `Product "${productName}" not found.`,
              type: "error",
            });
            errorCount++;
            continue;
          }

          const productId = productData.id;

          const { error: orderError } = await supabase.from("orders").insert({
            customer_id: customerId,
            product_id: productId,
            quantity,
            status,
            delivery_date: deliveryDate,
          });

          if (ordererror:any) {
            results.push({
              row: i,
              message: `Failed to save order for ${customerName}: ${orderError.message}`,
              type: "error",
            });
            errorCount++;
            continue;
          }

          results.push({
            row: i,
            message: `✔ Your order for ${customerName} has been saved successfully.`,
            type: "success",
          });
          successCount++;
        } catch (error:any) {
          results.push({
            row: i,
            message: `Row ${i}: ${error.message || "Unknown error occurred."}`,
            type: "error",
          });
          errorCount++;
        }

        // Update progress
        setProgress(Math.round(((i - 1) / totalRows) * 100));
      }

      setValidationResults(results);
      setIsProcessing(false);
    };

    fileReader.readAsArrayBuffer(uploadedFile);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Product and Orders Management</h1>

      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="productDropdown">Select a Product:</label>
          <select
            id="productDropdown"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="ml-2 p-2 text-lg"
          >
            <option value="">-- Select a Product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Button onClick={handleDownload} className="ml-2">
            Download Template
          </Button>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upload Completed File</h2>
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <Button onClick={saveData} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Save Data"}
        </Button>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <h3>Processing...</h3>
          <progress value={progress} max="100" className="w-full"></progress>
        </div>
      )}

      {!isProcessing && validationResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Validation Results:</h3>
          <ul>
            {validationResults.map((result, index) => (
              <li
                key={index}
                className={`mb-2 ${
                  result.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {result.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
