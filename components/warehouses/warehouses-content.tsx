"use client";

import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WarehouseForm } from "./warehouse-form";
import dynamic from "next/dynamic";
import { rolePermissions } from "@/lib/types/roles";

// Dynamically import the Map component
const WarehouseMap = dynamic(() => import("../dashboard/warehouse-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
      Loading map...
    </div>
  ),
});

// Generate large mock dataset
const generateMockWarehouses = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `W${(i + 1).toString().padStart(5, "0")}`,
    name: `Warehouse ${i + 1}`,
    location: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"][
      Math.floor(Math.random() * 5)
    ],
    coordinates: [
      51.5074 + (Math.random() - 0.5) * 2,
      -0.1278 + (Math.random() - 0.5) * 2,
    ] as [number, number],
    capacity: Math.floor(Math.random() * 50000) + 10000,
    utilization: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 100000),
    products: Math.floor(Math.random() * 5000),
    manager: `Manager ${i + 1}`,
    contact: `+44 ${Math.floor(Math.random() * 10000000000)}`,
    status: Math.random() > 0.2 ? "active" : "maintenance",
  }));
};

const ITEMS_PER_PAGE = 10;
const mockWarehouses = generateMockWarehouses(1000); // Generate 1000 warehouses for testing

export function WarehousesContent() {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<"admin" | "staff" | "viewer">("admin"); // In real app, get from auth context

  const permissions = rolePermissions[userRole];

  // Filter warehouses
  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredWarehouses.length / ITEMS_PER_PAGE);
  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleAddWarehouse = async (data: any) => {
    if (!permissions.canCreateWarehouse) {
      toast({
        title: "Permission Denied",
        content: "You do not have permission to create warehouses.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newWarehouse = {
        ...data,
        id: `W${warehouses.length + 1}`,
        revenue: 0,
        products: 0,
      };

      setWarehouses([...warehouses, newWarehouse]);
      setShowAddDialog(false);
      toast({
        title: "Warehouse Added",
        content: "The warehouse has been successfully added.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        content: "Failed to add warehouse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWarehouse = async (data: any) => {
    if (!permissions.canEditWarehouse) {
      toast({
        title: "Permission Denied",
        content: "You do not have permission to edit warehouses.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setWarehouses(
        warehouses.map((w) =>
          w.id === editingWarehouse.id ? { ...w, ...data } : w
        )
      );
      setEditingWarehouse(null);
      toast({
        title: "Warehouse Updated",
        content: "The warehouse has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        content: "Failed to update warehouse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!permissions.canDeleteWarehouse) {
      toast({
        title: "Permission Denied",
        content: "You do not have permission to delete warehouses.",
        variant: "destructive",
      });
      return;
    }

    if (deletingWarehouseId) {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setWarehouses(warehouses.filter((w) => w.id !== deletingWarehouseId));
        setDeletingWarehouseId(null);
        toast({
          title: "Warehouse Deleted",
          content: "The warehouse has been successfully deleted.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          content: "Failed to delete warehouse. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Warehouse Management</h1>
        {permissions.canCreateWarehouse && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Warehouse</DialogTitle>
              </DialogHeader>
              <WarehouseForm
                onSubmit={handleAddWarehouse}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Map View */}
      <div className="h-[400px] rounded-lg border bg-card">
        <WarehouseMap
          locations={paginatedWarehouses.map((w) => ({
            name: w.name,
            coordinates: w.coordinates,
            products: w.products,
            revenue: w.revenue,
            utilization: w.utilization,
          }))}
        />
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredWarehouses.length)} of{" "}
          {filteredWarehouses.length} warehouses
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWarehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {warehouse.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{warehouse.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${warehouse.utilization}%` }}
                      />
                    </div>
                    <span className="text-sm">{warehouse.utilization}%</span>
                  </div>
                </TableCell>
                <TableCell>£{warehouse.revenue.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(warehouse.status)}</TableCell>
                <TableCell>{warehouse.manager}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {permissions.canEditWarehouse && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingWarehouse(warehouse)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Warehouse</DialogTitle>
                          </DialogHeader>
                          <WarehouseForm
                            warehouse={editingWarehouse}
                            onSubmit={handleEditWarehouse}
                            isLoading={isLoading}
                          />
                        </DialogContent>
                      </Dialog>
                    )}

                    {permissions.canDeleteWarehouse && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingWarehouseId(warehouse.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Warehouse
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this warehouse?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeletingWarehouseId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteWarehouse}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
