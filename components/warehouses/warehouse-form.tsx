'use client';

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
import { Loader2 } from 'lucide-react';

const warehouseFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.string().transform(Number).pipe(z.number().min(0)),
  utilization: z.string().transform(Number).pipe(z.number().min(0).max(100)),
  manager: z.string().min(2, 'Manager name is required'),
  contact: z.string().min(10, 'Contact number must be at least 10 characters'),
  status: z.enum(['active', 'maintenance']),
});

interface WarehouseFormProps {
  warehouse?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function WarehouseForm({ warehouse, onSubmit, isLoading }: WarehouseFormProps) {
  const form = useForm<z.infer<typeof warehouseFormSchema>>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: warehouse?.name || '',
      location: warehouse?.location || '',
      capacity: warehouse?.capacity?.toString() || '',
      utilization: warehouse?.utilization?.toString() || '',
      manager: warehouse?.manager || '',
      contact: warehouse?.contact || '',
      status: warehouse?.status || 'active',
    },
  });

  const handleSubmit = async (values: z.infer<typeof warehouseFormSchema>) => {
    await onSubmit({
      ...values,
      coordinates: warehouse?.coordinates || [51.5074, -0.1278], // Default to London if no coordinates
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse Name</FormLabel>
              <FormControl>
                <Input placeholder="London Warehouse" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="London, UK" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (units)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="utilization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Utilization (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="manager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manager</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+44 20 1234 5678" {...field} disabled={isLoading} />
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {warehouse ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            warehouse ? 'Update Warehouse' : 'Add Warehouse'
          )}
        </Button>
      </form>
    </Form>
  );
}