'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Barcode from 'react-barcode'; // Import the Barcode component

const ITEMS_PER_PAGE = 10;
const LOCATIONS = ['London', 'Manchester', 'Birmingham'];
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
const CONDITIONS = ['New', 'Used', 'Refurbished'];

const FIXED_PRODUCT_NAMES = [
  'ARMY PUFFER JACKET FEMALE(RMAS Sandhurst)',
  'ARMY PUFFER JACKET MALE(RMAS Sandhurst)',
  'ARMY SOFTSHELL JACKET FEMALE(RMAS Sandhurst)',
  'ARMY SOFTSHELL JACKET MALE(RMAS Sandhurst)',
  'ARMY PT WICKING T SHIRT FEMALE(RMAS Sandhurst)',
  'ARMY PT WICKING T SHIRT MALE(RMAS Sandhurst)',
  'ARMY THERMAL BASE LAYER FEMALE(RMAS Sandhurst)',
  'ARMY THERMAL BASE LAYER MALE(RMAS Sandhurst)'
];

const FIXED_PRODUCT_DATA = Array.from({ length: 80 }, (_, i) => ({
  id: `P${(i + 1).toString().padStart(5, '0')}`,
  sku: `SKU${(i + 1).toString().padStart(5, '0')}`,
  barcode: `1234567890${(i + 1).toString().padStart(2, '0')}`, // Unique barcode value
  name: FIXED_PRODUCT_NAMES[i % FIXED_PRODUCT_NAMES.length],
  price: (Math.random() * 100).toFixed(2),
  quantity: Math.floor(Math.random() * 200) + 1,
  category: 'Select Value',
  location: 'Select Value',
  condition: 'Select Value',
}));

const DEFAULT_PRODUCTS = [
  {
    id: 'P00001',
    sku: 'SKU00001',
    barcode: '123456789001',
    name: 'Product 1',
    category: 'Home & Garden',
    price: '963.00',
    quantity: 120,
    location: 'Birmingham',
    condition: 'Used',
  },
  {
    id: 'P00002',
    sku: 'SKU00002',
    barcode: '123456789002',
    name: 'Product 2',
    category: 'Books',
    price: '754.00',
    quantity: 318,
    location: 'Birmingham',
    condition: 'New',
  },
  // Add other products similarly
];

export function ProductsContent() {
  const [showData, setShowData] = useState(true);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [fileChosen, setFileChosen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Select Value',
    location: 'Select Value',
    condition: 'Select Value',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [highlightedProducts, setHighlightedProducts] = useState([]);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  // Load default products when the component mounts
  useEffect(() => {
    setProducts(DEFAULT_PRODUCTS);
  }, []);

    {/* @ts-expect-error jkhj jkh */}
  const handleFileSelection = (event) => {
    if (event.target.files.length > 0) {
      setFileChosen(true);
    }
  };

  const handleFileUpload = () => {
    if (!fileChosen) {
      alert('Please upload a file first.');
      return;
    }

    const newFixedProducts = FIXED_PRODUCT_DATA.map((product, index) => ({
      ...product,
      id: `P${(products.length + index + 1).toString().padStart(5, '0')}`,
      sku: `SKU${(products.length + index + 1).toString().padStart(5, '0')}`,
      barcode: `1234567890${(products.length + index + 1).toString().padStart(2, '0')}`,
    }));

    setProducts([...newFixedProducts, ...products]);
    // @ts-expect-error jkhj jkh
    setHighlightedProducts(newFixedProducts.map(p => p.id));
    setShowData(true);
    setIsSuccessPopupOpen(true);
  };

    // @ts-expect-error jkhj jkh
  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    alert('Product deleted successfully!');
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert('All fields are required.');
      return;
    }

    // Generate a unique SKU and barcode
    const newId = `P${(products.length + 1).toString().padStart(5, '0')}`;
    const newSku = `SKU${(products.length + 1).toString().padStart(5, '0')}`;
    const newBarcode = `1234567890${(products.length + 1).toString().padStart(2, '0')}`;

    const updatedProducts = [
      ...products,
      {
        id: newId,
        sku: newSku,
        barcode: newBarcode,
        ...newProduct,
      },
    ];

    // @ts-expect-error jkhj jkh
    setProducts(updatedProducts);
    setNewProduct({
      name: '',
      price: '',
      quantity: '',
      category: 'Select Value',
      location: 'Select Value',
      condition: 'Select Value',
    });
    setIsAddDialogOpen(false);
    alert('Product added successfully!');
    setShowData(true);
  };

    // @ts-expect-error jkhj jkh
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = () => {
    // @ts-expect-error jkhj jkh
    if (!editingProduct.name || !editingProduct.price || !editingProduct.quantity) {
      alert('All fields are required.');
      return;
    }

    const updatedProducts = products.map(p =>
    // @ts-expect-error jkhj jkh
      p.id === editingProduct.id ? editingProduct : p
    );

    // @ts-expect-error jkhj jkh
    setProducts(updatedProducts);
    setEditingProduct(null);
    alert('Product updated successfully!');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ? true : product.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" ? true : product.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="space-y-6 p-4">
      {/* Success Popup */}
      <Dialog open={isSuccessPopupOpen} onOpenChange={setIsSuccessPopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
          </DialogHeader>
          <p>PRODUCTS IN YOUR FILE ADDED SUCCESSFULLY</p>
          <Button onClick={() => setIsSuccessPopupOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              <Input placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              <Input placeholder="Quantity" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} />
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Select Value">Select Category</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newProduct.location} onValueChange={(value) => setNewProduct({ ...newProduct, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Select Value">Select Location</SelectItem>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newProduct.condition} onValueChange={(value) => setNewProduct({ ...newProduct, condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Select Value">Select Condition</SelectItem>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddProduct} className="mt-2">Add Product</Button>
            </DialogContent>
          </Dialog>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileSelection} className="w-full md:w-auto" />
          <Button onClick={handleFileUpload} className="w-full md:w-auto">Submit File</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      {showData && (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
    // @ts-expect-error jkhj jkh
                  className={highlightedProducts.includes(product.id) ? 'bg-yellow-100 dark:bg-yellow-800' : ''}
                >
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    {product.barcode && (
                      <Barcode value={product.barcode} height={30} width={1.5} /> // Display barcode
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Select
                      value={product.category}
                      onValueChange={(value) => {
                        const updatedProducts = products.map(p =>
                          p.id === product.id ? { ...p, category: value } : p
                        );
                        setProducts(updatedProducts);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select Value">Select Category</SelectItem>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>£{product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Select
                      value={product.location}
                      onValueChange={(value) => {
                        const updatedProducts = products.map(p =>
                          p.id === product.id ? { ...p, location: value } : p
                        );
                        setProducts(updatedProducts);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select Value">Select Location</SelectItem>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={product.condition}
                      onValueChange={(value) => {
                        const updatedProducts = products.map(p =>
                          p.id === product.id ? { ...p, condition: value } : p
                        );
                        setProducts(updatedProducts);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select Value">Select Condition</SelectItem>
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
    {/* @ts-expect-error jkhj jkh */}
                        <Button variant="ghost" size="sm" onClick={() => setDeleteProductId(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProduct(deleteProductId)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-[90vw] md:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
    {/* @ts-expect-error jkhj jkh */}

            <Input placeholder="Product Name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
    {/* @ts-expect-error jkhj jkh */}
            <Input placeholder="Price" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
    {/* @ts-expect-error jkhj jkh */}
            <Input placeholder="Quantity" value={editingProduct.quantity} onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })} />
    {/* @ts-expect-error jkhj jkh */}
            <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Select Value">Select Category</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
    {/* @ts-expect-error jkhj jkh */}
            <Select value={editingProduct.location} onValueChange={(value) => setEditingProduct({ ...editingProduct, location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Select Value">Select Location</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
    {/* @ts-expect-error jkhj jkh */}
            <Select value={editingProduct.condition} onValueChange={(value) => setEditingProduct({ ...editingProduct, condition: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Select Value">Select Condition</SelectItem>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateProduct} className="mt-2">Update Product</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}