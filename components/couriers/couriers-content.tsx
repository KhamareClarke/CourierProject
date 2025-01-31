'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Package, Clock, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { CourierForm } from './courier-form';

// Dynamically import the Map component
const CourierMap = dynamic(() => import('./courier-map'), { 
  ssr: false,
  loading: () => <LoadingSpinner />
});

// Mock data for couriers
const mockCouriers = [
  {
    id: 'C1',
    name: 'John Doe',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    currentLocation: 'Leicester, UK',
    destination: 'Manchester, UK',
    stops: ['Derby, UK', 'Sheffield, UK'],
    coordinates: {
      current: [52.6369, -1.1398],
      destination: [53.4808, -2.2426],
      stops: [
        [52.9225, -1.4746],
        [53.3811, -1.4701]
      ]
    },
    eta: new Date(Date.now() + 120 * 60000), // 2 hours from now
    status: 'active',
    vehicle: 'Van - LD21 XYZ',
    phone: '+44 7700 900123',
    lastUpdate: new Date(),
    deliveries: 5,
    totalDistance: '127 miles'
  },
  {
    id: 'C2',
    name: 'Jane Smith',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    currentLocation: 'London, UK',
    destination: 'Birmingham, UK',
    stops: ['Watford, UK', 'Milton Keynes, UK'],
    coordinates: {
      current: [51.5074, -0.1278],
      destination: [52.4862, -1.8904],
      stops: [
        [51.6565, -0.3903],
        [52.0406, -0.7594]
      ]
    },
    eta: new Date(Date.now() + 180 * 60000), // 3 hours from now
    status: 'active',
    vehicle: 'Van - LS21 ABC',
    phone: '+44 7700 900456',
    lastUpdate: new Date(),
    deliveries: 3,
    totalDistance: '163 miles'
  },
  {
    id: 'C3',
    name: 'Michael Brown',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
    currentLocation: 'Glasgow, UK',
    destination: 'Edinburgh, UK',
    stops: ['Falkirk, UK'],
    coordinates: {
      current: [55.8642, -4.2518],
      destination: [55.9533, -3.1883],
      stops: [
        [56.0019, -3.7839]
      ]
    },
    eta: new Date(Date.now() + 60 * 60000), // 1 hour from now
    status: 'inactive',
    vehicle: 'Van - GS21 XYZ',
    phone: '+44 7700 900789',
    lastUpdate: new Date(),
    deliveries: 2,
    totalDistance: '47 miles'
  }
];

export function CouriersContent() {
  const { toast } = useToast();
  const [couriers, setCouriers] = useState(mockCouriers);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourier, setEditingCourier] = useState<any | null>(null);
  const [deletingCourierId, setDeletingCourierId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatETA = (eta: Date) => {
    const now = new Date();
    const diffInMinutes = Math.round((eta.getTime() - now.getTime()) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleAddCourier = async (data: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCourier = {
        ...data,
        id: `C${couriers.length + 1}`,
        eta: new Date(Date.now() + 120 * 60000),
        lastUpdate: new Date(),
        deliveries: 0,
        totalDistance: '0 miles'
      };
      
      setCouriers([...couriers, newCourier]);
      setShowAddDialog(false);
      toast({
        title: 'Courier Added',
        description: 'The courier has been successfully added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add courier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourier = async (data: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCouriers(couriers.map(c => 
        c.id === editingCourier.id ? { ...c, ...data } : c
      ));
      setEditingCourier(null);
      toast({
        title: 'Courier Updated',
        description: 'The courier has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update courier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourier = async () => {
    if (deletingCourierId) {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCouriers(couriers.filter(c => c.id !== deletingCourierId));
        setDeletingCourierId(null);
        toast({
          title: 'Courier Deleted',
          description: 'The courier has been successfully deleted.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete courier. Please try again.',
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
        <h1 className="text-2xl font-bold">Courier Management</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Courier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Courier</DialogTitle>
            </DialogHeader>
            <CourierForm onSubmit={handleAddCourier} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Map View */}
      <div className="h-[400px] rounded-lg border bg-card">
        <CourierMap couriers={couriers.filter(c => c.status === 'active')} />
      </div>

      {/* Couriers List */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Courier</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deliveries</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {couriers.map((courier) => (
              <TableRow key={courier.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={courier.image} alt={courier.name} />
                      <AvatarFallback>{courier.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{courier.name}</div>
                      <div className="text-sm text-muted-foreground">{courier.vehicle}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {courier.currentLocation}
                  </div>
                </TableCell>
                <TableCell>{courier.destination}</TableCell>
                <TableCell>{getStatusBadge(courier.status)}</TableCell>
                <TableCell>{courier.deliveries} completed</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedCourier(courier)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Courier Details</DialogTitle>
                        </DialogHeader>
                        {selectedCourier && (
                          <div className="space-y-6">
                            {/* Courier Information */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={selectedCourier.image} alt={selectedCourier.name} />
                                  <AvatarFallback>{selectedCourier.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedCourier.name}</h3>
                                  <p className="text-sm text-muted-foreground">{selectedCourier.vehicle}</p>
                                  {getStatusBadge(selectedCourier.status)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Phone</div>
                                  <div className="font-medium">{selectedCourier.phone}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Deliveries</div>
                                  <div className="font-medium">{selectedCourier.deliveries} completed</div>
                                </div>
                              </div>
                            </div>

                            {/* Route Information */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Route Details</h4>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-1 text-green-600" />
                                  <div>
                                    <div className="font-medium">Current Location</div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedCourier.currentLocation}
                                    </div>
                                  </div>
                                </div>
                                {selectedCourier.stops.map((stop: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Package className="h-4 w-4 mt-1 text-blue-600" />
                                    <div>
                                      <div className="font-medium">Stop {index + 1}</div>
                                      <div className="text-sm text-muted-foreground">{stop}</div>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-1 text-red-600" />
                                  <div>
                                    <div className="font-medium">Final Destination</div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedCourier.destination}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Journey Information */}
                            <div className="space-y-2">
                              <h4 className="font-semibold">Journey Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">ETA</div>
                                  <div className="font-medium">{formatETA(selectedCourier.eta)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Total Distance</div>
                                  <div className="font-medium">{selectedCourier.totalDistance}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCourier(courier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Courier</DialogTitle>
                        </DialogHeader>
                        <CourierForm
                          courier={editingCourier}
                          onSubmit={handleEditCourier}
                          isLoading={isLoading}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCourierId(courier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Courier</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this courier? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingCourierId(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteCourier}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}