'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WarehouseForm } from './warehouse-form';
import dynamic from 'next/dynamic';
import { rolePermissions } from '@/lib/types/roles';

// Dynamically import the Map component
const WarehouseMap = dynamic(() => import('../dashboard/warehouse-map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">Loading map...</div>
});

// Generate large mock dataset
const generateMockWarehouses = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `W${(i + 1).toString().padStart(5, '0')}`,
    name: `Warehouse ${i + 1}`,
    location: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'][Math.floor(Math.random() * 5)],
    coordinates: [
      51.5074 + (Math.random() - 0.5) * 2,
      -0.1278 + (Math.random() - 0.5) * 2
    ] as [number, number],
    capacity: Math.floor(Math.random() * 50000) + 10000,
    utilization: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 100000),
    products: Math.floor(Math.random() * 5000),
    manager: `Manager ${i + 1}`,
    contact: `+44 ${Math.floor(Math.random() * 10000000000)}`,
    status: Math.random() > 0.2 ? 'active' : 'maintenance',
    assignedStocks: [], // Add assignedStocks field
  }));
};

const ITEMS_PER_PAGE = 10;
const mockWarehouses = generateMockWarehouses(1000); // Generate 1000 warehouses for testing

// Fixed products
const FIXED_PRODUCT_NAMES = [
  'ARMY PUFFER JACKET FEMALE(RMAS Sandhurst)',
  'ARMY PUFFER JACKET MALE(RMAS Sandhurst)',
  'ARMY SOFTSHELL JACKET FEMALE(RMAS Sandhurst)',
  'ARMY SOFTSHELL JACKET MALE(RMAS Sandhurst)',
  'ARMY PT WICKING T SHIRT FEMALE(RMAS Sandhurst)',
  'ARMY PT WICKING T SHIRT MALE(RMAS Sandhurst)',
  'ARMY THERMAL BASE LAYER FEMALE(RMAS Sandhurst)',
  'ARMY THERMAL BASE LAYER MALE(RMAS Sandhurst)',
];

const FIXED_PRODUCTS = FIXED_PRODUCT_NAMES.map((name, index) => ({
  id: `P${(index + 1).toString().padStart(5, '0')}`,
  name,
  quantity: Math.floor(Math.random() * 200) + 1, // Random initial stock
}));

// Stock assignment type
type StockAssignment = {
  id: string; // Unique ID for each assignment
  productId: string;
  warehouseId: string;
  quantity: number;
};

export function WarehousesContent() {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<'admin' | 'staff' | 'viewer'>('admin'); // In real app, get from auth context

  const permissions = rolePermissions[userRole];

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [assignedStocks, setAssignedStocks] = useState<StockAssignment[]>([]);
  const [products, setProducts] = useState(FIXED_PRODUCTS); // Track available stock
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentSummary, setAssignmentSummary] = useState<{
    assigned: { productId: string; quantity: number; warehouseName: string }[];
    remaining: { productId: string; quantity: number }[];
  } | null>(null);
  const [stockMovements, setStockMovements] = useState<{ id: string; action: string; details: string; timestamp: Date }[]>([]);

  const logStockMovement = (action: string, details: string) => {
    setStockMovements((prev) => [
      ...prev,
      { id: `${Date.now()}`, action, details, timestamp: new Date() },
    ]);
  };

  const handleAssignStock = () => {
    if (!selectedWarehouse) {
      alert('Please select a warehouse.');
      return;
    }

    const newAssignments = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0) // Only consider positive quantities
      .map(([productId, quantity]) => ({
        id: `${productId}-${selectedWarehouse}-${Date.now()}`, // Unique ID for each assignment
        productId,
        warehouseId: selectedWarehouse,
        quantity,
      }));

    // Update available stock and assignments
    const updatedProducts = [...products];
    const updatedAssignments = [...assignedStocks];
    const assigned: { productId: string; quantity: number; warehouseName: string }[] = [];
    const remaining: { productId: string; quantity: number }[] = [];

    newAssignments.forEach((newAssignment) => {
      const product = updatedProducts.find((p) => p.id === newAssignment.productId);
      const warehouse = warehouses.find((w) => w.id === newAssignment.warehouseId);
      if (product && warehouse) {
        // Deduct assigned quantity from available stock
        const assignedQuantity = Math.min(newAssignment.quantity, product.quantity);
        product.quantity -= assignedQuantity;

        // Add to assigned list
        assigned.push({ productId: newAssignment.productId, quantity: assignedQuantity, warehouseName: warehouse.name });

        // Add to remaining list if there's leftover stock
        if (newAssignment.quantity > assignedQuantity) {
          remaining.push({ productId: newAssignment.productId, quantity: newAssignment.quantity - assignedQuantity });
        }

        // Merge with existing assignments
        const existingAssignment = updatedAssignments.find(
          (a) => a.productId === newAssignment.productId && a.warehouseId === newAssignment.warehouseId
        );
        if (existingAssignment) {
          existingAssignment.quantity += assignedQuantity;
        } else {
          updatedAssignments.push({ ...newAssignment, quantity: assignedQuantity });
        }

        // Log the stock assignment
        logStockMovement('Assign', `Assigned ${assignedQuantity} of ${product.name} to ${warehouse.name}`);

        // Update warehouse assigned stocks
        // @ts-expect-error jkhkj kj
        warehouse.assignedStocks.push({ ...newAssignment, quantity: assignedQuantity });
      }
    });

    // Update state
    setProducts(updatedProducts);
    setAssignedStocks(updatedAssignments);
    setWarehouses([...warehouses]);

    // Show assignment summary
    setAssignmentSummary({ assigned, remaining });

    // Show success toast
    toast({
      title: 'Success',
      content: 'Stocks have been assigned successfully.',
    });

    // Clear form
    setSelectedWarehouse('');
    setQuantities({});

    // Close the dialog
    setIsDialogOpen(false);
  };

  const handleEditAssignment = (assignmentId: string) => {
    const assignment = assignedStocks.find((a) => a.id === assignmentId);
    if (assignment) {
      setSelectedWarehouse(assignment.warehouseId);
      setQuantities({ [assignment.productId]: assignment.quantity });
      setEditingAssignmentId(assignmentId);
      setIsDialogOpen(true);
    }
  };

  const handleUpdateAssignment = () => {
    if (!selectedWarehouse) {
      setAssignmentSummary({
        assigned: [],
        remaining: [],
      });
      return;
    }

    const updatedAssignments = assignedStocks.map((assignment) => {
      if (assignment.id === editingAssignmentId) {
        return {
          ...assignment,
          warehouseId: selectedWarehouse,
          quantity: quantities[assignment.productId] || 0,
        };
      }
      return assignment;
    });

    setAssignedStocks(updatedAssignments);

    // Log the stock update
    const assignment = assignedStocks.find((a) => a.id === editingAssignmentId);
    if (assignment) {
      const product = products.find((p) => p.id === assignment.productId);
      const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
      if (product && warehouse) {
        logStockMovement('Update', `Updated ${quantities[assignment.productId]} of ${product.name} in ${warehouse.name}`);
      }
    }

    // Clear form
    setSelectedWarehouse('');
    setQuantities({});
    setEditingAssignmentId(null);

    // Show success message
    setAssignmentSummary({
      assigned: [{ productId: editingAssignmentId!.split('-')[0], quantity: quantities[editingAssignmentId!.split('-')[0]], warehouseName: warehouses.find((w) => w.id === selectedWarehouse)?.name || '' }],
      remaining: [],
    });

    // Close the dialog
    setIsDialogOpen(false);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    const assignment = assignedStocks.find((a) => a.id === assignmentId);
    if (assignment) {
      // Return the assigned quantity to available stock
      const updatedProducts = products.map((product) => {
        if (product.id === assignment.productId) {
          return { ...product, quantity: product.quantity + assignment.quantity };
        }
        return product;
      });
      setProducts(updatedProducts);

      // Remove the assignment
      setAssignedStocks(assignedStocks.filter((a) => a.id !== assignmentId));

      // Log the stock deletion
      const product = products.find((p) => p.id === assignment.productId);
      const warehouse = warehouses.find((w) => w.id === assignment.warehouseId);
      if (product && warehouse) {
        logStockMovement('Delete', `Deleted ${assignment.quantity} of ${product.name} from ${warehouse.name}`);
      }

      // Show success message
      setAssignmentSummary({
        assigned: [],
        remaining: [{ productId: assignment.productId, quantity: assignment.quantity }],
      });
    }
  };

  // Filter warehouses
  const filteredWarehouses = warehouses.filter(warehouse =>
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
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleAddWarehouse = async (data: any) => {
    if (!permissions.canCreateWarehouse) {
      toast({
        title: 'Permission Denied',
        content: 'You do not have permission to create warehouses.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWarehouse = {
        ...data,
        id: `W${warehouses.length + 1}`,
        revenue: 0,
        products: 0,
        assignedStocks: [], // Initialize assignedStocks
      };
      
      setWarehouses([newWarehouse, ...warehouses]);
      setShowAddDialog(false);
      toast({
        title: 'Warehouse Added',
        content: 'The warehouse has been successfully added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        content: 'Failed to add warehouse. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWarehouse = async (data: any) => {
    if (!permissions.canEditWarehouse) {
      toast({
        title: 'Permission Denied',
        content: 'You do not have permission to edit warehouses.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWarehouses(warehouses.map(w => 
        w.id === editingWarehouse.id ? { ...w, ...data } : w
      ));
      setEditingWarehouse(null);
      toast({
        title: 'Warehouse Updated',
        content: 'The warehouse has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        content: 'Failed to update warehouse. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!permissions.canDeleteWarehouse) {
      toast({
        title: 'Permission Denied',
        content: 'You do not have permission to delete warehouses.',
        variant: 'destructive',
      });
      return;
    }

    if (deletingWarehouseId) {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setWarehouses(warehouses.filter(w => w.id !== deletingWarehouseId));
        setDeletingWarehouseId(null);
        toast({
          title: 'Warehouse Deleted',
          content: 'The warehouse has been successfully deleted.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          content: 'Failed to delete warehouse. Please try again.',
          variant: 'destructive',
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
        <div className="flex gap-2">
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
                <WarehouseForm onSubmit={handleAddWarehouse} isLoading={isLoading} />
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Assign Stocks to Warehouse</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl z-50">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignmentId ? 'Edit Stock Assignment' : 'Assign Stocks to Warehouse'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Warehouse Selection */}
                <Select onValueChange={setSelectedWarehouse} value={selectedWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location} (Utilization: {warehouse.utilization}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Product Quantities */}
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Available: {product.quantity}</p>
                      </div>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={quantities[product.id] || 0}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [product.id]: Math.max(0, parseInt(e.target.value, 10)),
                          })
                        }
                        className="w-24"
                        min={0}
                        max={product.quantity}
                      />
                    </div>
                  ))}
                </div>

                {/* Assign/Update Button */}
                <Button onClick={editingAssignmentId ? handleUpdateAssignment : handleAssignStock}>
                  {editingAssignmentId ? 'Update Stock' : 'Assign Stock'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Assignment Summary */}
      {assignmentSummary && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
          <h3 className="font-bold">Assignment Summary:</h3>
          <ul>
          {assignmentSummary.assigned.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <li key={item.productId}>
                  Assigned {item.quantity} of {product?.name} to {item.warehouseName}.
                </li>
              );
            })}
            {assignmentSummary.remaining.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <li key={item.productId}>
                  {item.quantity} of {product?.name} could not be assigned due to insufficient stock.
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Stock Movements Log */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Stock Movements</h2>
        <ul>
          {stockMovements.map((movement) => (
            <li key={movement.id}>
              {movement.timestamp.toLocaleString()}: {movement.action} - {movement.details}
            </li>
          ))}
        </ul>
      </div>

      {/* Assigned Stocks Table */}
      {assignedStocks.length > 0 && (
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Assigned Stocks</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(
                assignedStocks.reduce((acc, assignment) => {
                  const warehouse = warehouses.find((w) => w.id === assignment.warehouseId);
                  if (warehouse) {
                    if (!acc[warehouse.name]) {
                      acc[warehouse.name] = [];
                    }
                    acc[warehouse.name].push(assignment);
                  }
                  return acc;
                }, {} as { [warehouseName: string]: StockAssignment[] })
              ).map(([warehouseName, assignments]) => (
                <React.Fragment key={warehouseName}>
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold">
                      {warehouseName}
                    </TableCell>
                  </TableRow>
                  {assignments.map((assignment) => {
                    const product = products.find((p) => p.id === assignment.productId);
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>{warehouseName}</TableCell>
                        <TableCell>{product?.name}</TableCell>
                        <TableCell>{assignment.quantity}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAssignment(assignment.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Map View */}
      <div className="h-[400px] rounded-lg border bg-card relative z-10">
        <WarehouseMap locations={paginatedWarehouses.map(w => ({
          name: w.name,
          coordinates: w.coordinates,
          products: w.products,
          revenue: w.revenue,
          utilization: w.utilization
        }))} />
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
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredWarehouses.length)} of{' '}
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
              <TableHead>Stocks Assigned</TableHead>
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
                      <div className="text-sm text-muted-foreground">ID: {warehouse.id}</div>
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
                  {warehouse.assignedStocks.length > 0 ? (
                    <ul>
                      {warehouse.assignedStocks.map((stock) => (
                        // @ts-expect-error jh hj
                        <li key={stock.id}>
                           {/* @ts-expect-error jh hj */}
                          {stock.quantity} of {products.find((p) => p.id === stock.productId)?.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No stock assigned yet'
                  )}
                </TableCell>
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
                            <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this warehouse? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingWarehouseId(null)}>
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
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
             