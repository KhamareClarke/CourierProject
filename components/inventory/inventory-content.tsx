"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddBinForm from "@/components/inventory/AddBinForm";
import AddPalletForm from "@/components/inventory/AddPalletForm";
import AddQuarantineForm from "@/components/inventory/AddQuarantineForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for inventory items
const mockInventory = Array.from({ length: 20 }, (_, i) => ({
  id: `SKU${(i + 1).toString().padStart(5, "0")}`,
  name: `Product ${i + 1}`,
  category: ["Electronics", "Clothing", "Books", "Home & Garden"][
    Math.floor(Math.random() * 4)
  ],
  totalStock: Math.floor(Math.random() * 1000) + 100,
  warehouse: {
    London: Math.floor(Math.random() * 300),
    Manchester: Math.floor(Math.random() * 300),
    Birmingham: Math.floor(Math.random() * 300),
  },
  status: Math.random() > 0.8 ? "Low Stock" : "In Stock",
  lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
}));

// Mock data for recent orders
const mockOrders = Array.from({ length: 10 }, (_, i) => ({
  id: `ORD${(i + 1).toString().padStart(5, "0")}`,
  product: mockInventory[Math.floor(Math.random() * mockInventory.length)].name,
  quantity: Math.floor(Math.random() * 50) + 1,
  status: ["Pending", "Processing", "Shipped", "Delivered"][
    Math.floor(Math.random() * 4)
  ],
  warehouse: ["London", "Manchester", "Birmingham"][
    Math.floor(Math.random() * 3)
  ],
  updatedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
}));

export function InventoryContent() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState(mockInventory);
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update random inventory item
      setInventory((current) => {
        const newInventory = [...current];
        const randomIndex = Math.floor(Math.random() * newInventory.length);
        const item = { ...newInventory[randomIndex] };

        // Randomly update stock levels
        const warehouse = ["London", "Manchester", "Birmingham"][
          Math.floor(Math.random() * 3)
        ] as keyof typeof item.warehouse;
        const change = Math.floor(Math.random() * 10) - 5;
        item.warehouse[warehouse] = Math.max(
          0,
          item.warehouse[warehouse] + change
        );
        item.totalStock = Object.values(item.warehouse).reduce(
          (a, b) => a + b,
          0
        );
        item.status = item.totalStock < 100 ? "Low Stock" : "In Stock";
        item.lastUpdated = new Date();

        newInventory[randomIndex] = item;
        return newInventory;
      });

      // Update random order status
      setOrders((current) => {
        const newOrders = [...current];
        const randomIndex = Math.floor(Math.random() * newOrders.length);
        const order = { ...newOrders[randomIndex] };
        const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
        const currentIndex = statuses.indexOf(order.status);
        if (currentIndex < statuses.length - 1) {
          order.status = statuses[currentIndex + 1];
          order.updatedAt = new Date();
        }
        newOrders[randomIndex] = order;
        return newOrders;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Low Stock":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </Badge>
        );
      case "In Stock":
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "Shipped":
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === "all" ||
        item.warehouse[warehouseFilter as keyof typeof item.warehouse] > 0;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesWarehouse && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      // @ts-expect-error
      const aValue = key === "totalStock" ? a[key] : a[key].toString();
      // @ts-expect-error
      const bValue = key === "totalStock" ? b[key] : b[key].toString();

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      <section>
        <h2 className="text-lg font-bold">Add Inventory</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <AddBinForm />
          <AddPalletForm />
          <AddQuarantineForm />
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {inventory.filter((i) => i.status === "Low Stock").length} items
              low on stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status !== "Delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {orders.filter((o) => o.status === "Processing").length} orders in
              progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £
              {(
                inventory.reduce((sum, item) => sum + item.totalStock, 0) * 100
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all warehouses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Books">Books</SelectItem>
            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
          </SelectContent>
        </Select>
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            <SelectItem value="London">London</SelectItem>
            <SelectItem value="Manchester">Manchester</SelectItem>
            <SelectItem value="Birmingham">Birmingham</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("id")}
                      className="hover:bg-transparent"
                    >
                      SKU
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="hover:bg-transparent"
                    >
                      Product
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalStock")}
                      className="hover:bg-transparent"
                    >
                      Total Stock
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Warehouse Distribution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.totalStock}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(item.warehouse).map(([name, stock]) => (
                          <div key={name} className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {name}: {stock}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lastUpdated.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.warehouse}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.updatedAt.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
