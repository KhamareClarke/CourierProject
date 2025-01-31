'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const courierFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z.string().url('Please enter a valid image URL'),
  currentLocation: z.string().min(2, 'Current location is required'),
  destination: z.string().min(2, 'Destination is required'),
  status: z.enum(['active', 'inactive']),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  vehicle: z.string().min(2, 'Vehicle information is required'),
});

interface CourierFormProps {
  courier?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function CourierForm({ courier, onSubmit, isLoading }: CourierFormProps) {
  const [stops, setStops] = useState<string[]>(courier?.stops || []);
  const [newStop, setNewStop] = useState('');

  const form = useForm<z.infer<typeof courierFormSchema>>({
    resolver: zodResolver(courierFormSchema),
    defaultValues: {
      name: courier?.name || '',
      image: courier?.image || '',
      currentLocation: courier?.currentLocation || '',
      destination: courier?.destination || '',
      status: courier?.status || 'active',
      phone: courier?.phone || '',
      vehicle: courier?.vehicle || '',
    },
  });

  const handleAddStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop('');
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: z.infer<typeof courierFormSchema>) => {
    await onSubmit({
      ...values,
      stops,
      coordinates: {
        current: [51.5074, -0.1278], // Default to London
        destination: [52.4862, -1.8904], // Default to Birmingham
        stops: stops.map(() => [52.0406, -0.7594]), // Default to Milton Keynes for all stops
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.watch('image')} alt="Preview" />
              <AvatarFallback>
                {form.watch('name')?.split(' ').map(n => n[0]).join('') || 'CN'}
              </AvatarFallback>
            </Avatar>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+44 123 456 7890" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <FormControl>
                    <Input placeholder="Van - AB12 XYZ" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Location</FormLabel>
                <FormControl>
                  <Input placeholder="London, UK" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Stops</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add a stop"
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddStop}
                disabled={isLoading || !newStop.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-secondary rounded-md">
                    {stop}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStop(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Destination</FormLabel>
                <FormControl>
                  <Input placeholder="Manchester, UK" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {courier ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            courier ? 'Update Courier' : 'Add Courier'
          )}
        </Button>
      </form>
    </Form>
  );
}