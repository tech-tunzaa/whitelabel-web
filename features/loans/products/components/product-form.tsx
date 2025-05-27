import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
// Using a simple div instead of Accordion which isn't available

import { LoanProduct, LoanProductFormValues } from '../types';
import { LoanProvider } from '../../providers/types';

const formSchema = z.object({
  tenant_id: z.string(),
  provider_id: z.string().min(1, 'Provider is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  interest_rate: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 
    { message: 'Interest rate must be a valid number' }
  ),
  term_options: z.array(z.number()).min(1, 'At least one term option is required'),
  payment_frequency: z.enum(['weekly', 'bi-weekly', 'monthly']),
  min_amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Minimum amount must be a positive number' }
  ),
  max_amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Maximum amount must be a positive number' }
  ),
  processing_fee: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface ProductFormProps {
  initialValues: LoanProductFormValues;
  onSubmit: (values: LoanProductFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  providers: LoanProvider[];
  defaultProviderId?: string;
}

export function ProductForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  providers,
  defaultProviderId
}: ProductFormProps) {
  const [termOptions, setTermOptions] = useState<number[]>(initialValues.term_options || [3, 6, 12]);

  const form = useForm<LoanProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // Update the form when initialValues change
  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key) => {
        form.setValue(key as keyof LoanProductFormValues, initialValues[key as keyof LoanProductFormValues]);
      });
      
      if (initialValues.term_options) {
        setTermOptions(initialValues.term_options);
      }
    }
  }, [form, initialValues]);

  // Set default provider if provided
  useEffect(() => {
    if (defaultProviderId) {
      form.setValue('provider_id', defaultProviderId);
    }
  }, [defaultProviderId, form]);

  const handleFormSubmit = async (values: LoanProductFormValues) => {
    // Ensure term options are included
    const updatedValues = {
      ...values,
      term_options: termOptions,
    };
    
    await onSubmit(updatedValues);
  };

  const toggleTermOption = (term: number) => {
    setTermOptions((current) => {
      if (current.includes(term)) {
        return current.filter((t) => t !== term);
      } else {
        return [...current, term].sort((a, b) => a - b);
      }
    });

    // Update form values as well
    form.setValue('term_options', termOptions.includes(term) 
      ? termOptions.filter((t) => t !== term)
      : [...termOptions, term].sort((a, b) => a - b)
    );
  };

  const isTermSelected = (term: number) => {
    return termOptions.includes(term);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="provider_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.provider_id} value={provider.provider_id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interest_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 5.5"
                    step="0.01"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Loan Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    step="100"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Loan Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    step="100"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="processing_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processing Fee (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  step="0.01"
                  min="0"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <label className="text-sm font-medium">Term Options (Months)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
            {[1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60].map((term) => (
              <div key={term} className="flex items-center space-x-2">
                <Checkbox
                  id={`term-${term}`}
                  checked={isTermSelected(term)}
                  onCheckedChange={() => toggleTermOption(term)}
                />
                <label
                  htmlFor={`term-${term}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {term} {term === 1 ? 'month' : 'months'}
                </label>
              </div>
            ))}
          </div>
          {form.formState.errors.term_options && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.term_options.message}
            </p>
          )}
        </div>

        <div className="w-full border rounded-md p-4 mt-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Status Settings</h3>
          </div>
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Make this product available to vendors
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
