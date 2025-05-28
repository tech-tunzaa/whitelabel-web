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
  payment_frequency: z.enum(['weekly', 'semi-monthly', 'monthly', 'quarterly', 'semi-annually', 'annually']),
  min_amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Minimum amount must be a positive number' }
  ),
  max_amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Maximum amount must be a positive number' }
  ),
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
                    <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
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
          name="term_options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term Options (Months)</FormLabel>
              <div className="space-y-4">
                {/* Selected terms display */}
                <div className="flex flex-wrap gap-2">
                  {termOptions.length > 0 ? (
                    termOptions.map((term) => (
                      <div 
                        key={term} 
                        className="flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full"
                      >
                        <span className="text-sm font-medium">{term} {term === 1 ? 'month' : 'months'}</span>
                        <button 
                          type="button"
                          className="ml-2 text-primary/70 hover:text-primary focus:outline-none"
                          onClick={() => toggleTermOption(term)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No term options selected</div>
                  )}
                </div>

                {/* Custom term option */}
                <div>
                  <button
                    type="button"
                    className="flex items-center px-3 py-1.5 border border-dashed border-primary/40 text-primary/70 rounded-full hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      const newTerm = window.prompt('Enter a term length in months (1-120)');
                      if (newTerm) {
                        const termValue = parseInt(newTerm, 10);
                        if (!isNaN(termValue) && termValue > 0 && termValue <= 120 && !termOptions.includes(termValue)) {
                          toggleTermOption(termValue);
                        }
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span className="text-sm">Add custom term</span>
                  </button>
                </div>

                {/* Suggested term options */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Suggested terms (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 6, 8, 9, 12, 15, 18, 24, 30, 36, 48, 60].map((term) => (
                      !termOptions.includes(term) && (
                        <button
                          key={term}
                          type="button"
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-muted/80 transition-colors"
                          onClick={() => toggleTermOption(term)}
                        >
                          {term} {term === 1 ? 'month' : 'months'}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
              {form.formState.errors.term_options && (
                <FormMessage>{form.formState.errors.term_options.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

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
