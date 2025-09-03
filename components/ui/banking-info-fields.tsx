import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RequiredField } from "@/components/ui/required-field";

interface BankingInfoFieldsProps {
  form: any; // react-hook-form instance
  fieldPrefix?: string; // e.g., 'bank_account'
}

const BANK_OPTIONS = [
  "CRDB Bank",
  "NMB Bank",
  "Stanbic Bank",
  "Absa Bank",
  "NBC Bank",
  "Equity Bank",
  "Standard Chartered",
  "DTB Bank",
  "Access Bank",
  "KCB Bank",
  "Exim Bank",
  "Other"
];

export function BankingInfoFields({ form, fieldPrefix = "bank_account" }: BankingInfoFieldsProps) {
  const name = (field: string) => `${fieldPrefix}.${field}`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name={name("bank_name")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name <RequiredField /></FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_OPTIONS.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={name("account_number")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Number <RequiredField /></FormLabel>
            <FormControl>
              <Input placeholder="Account Number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={name("account_name")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name <RequiredField /></FormLabel>
            <FormControl>
              <Input placeholder="Account Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={name("swift_code")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SWIFT Code (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="SWIFT Code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={name("branch_code")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch Code (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Branch Code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 