"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "../types/role";
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";

export type RoleFormValues = {
  role: string;
  description?: string;
  permissions: string[];
};

const roleFormSchema: z.ZodType<RoleFormValues> = z.object({
  role: z.string().min(2, { message: "Role name must be at least 2 characters." }),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, { message: "At least one permission must be selected." }),
});

interface RoleFormProps {
  initialData?: Role | null;
  onSubmit: (values: RoleFormValues) => void;
  isLoading: boolean;
  availablePermissions: string[];
}

export function RoleForm({ initialData, onSubmit, isLoading, availablePermissions }: RoleFormProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      role: initialData?.role || "",
      description: initialData?.description || "",
      permissions: initialData?.permissions?.map(p => typeof p === 'string' ? p : p.name) || [],
    },
  });

  const filteredPermissions = availablePermissions.filter(permission => typeof permission === 'string' && permission);

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, permission) => {
      // Guard against undefined or non-string permissions to prevent crashes.
      if (typeof permission !== 'string' || !permission) {
        return acc;
      }
      const module = permission.split(':')[0] || 'general';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, string[]>);
  }, [filteredPermissions]);

  const filteredGroupedPermissions = useMemo(() => {
    if (!searchTerm) {
      return groupedPermissions;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = Object.entries(groupedPermissions).reduce((acc, [module, permissions]) => {
      const matchingPermissions = permissions.filter(p => p.toLowerCase().includes(lowercasedFilter));
      if (matchingPermissions.length > 0) {
        acc[module] = matchingPermissions;
      }
      return acc;
    }, {} as Record<string, string[]>);
    return filtered;
  }, [groupedPermissions, searchTerm]);

  const defaultAccordionOpen = useMemo(() => {
    return searchTerm ? Object.keys(filteredGroupedPermissions) : [];
  }, [searchTerm, filteredGroupedPermissions]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Define the name and description for this role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., store_manager" {...field} disabled={isLoading} />
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
                      <Textarea placeholder="A brief description of the role's responsibilities." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <Separator className="my-6" />

          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Select the permissions for this role. You can search for specific permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <ScrollArea className="h-[450px] pr-4 border rounded-md">
                    <Accordion type="multiple" value={defaultAccordionOpen.length > 0 ? defaultAccordionOpen : undefined} onValueChange={searchTerm ? () => {} : undefined} className="w-full">
                      {Object.keys(filteredGroupedPermissions).length > 0 ? (
                        Object.entries(filteredGroupedPermissions).map(([module, permissionsInModule]) => (
                          <AccordionItem value={module} key={module}>
                            <AccordionTrigger className="px-4 hover:no-underline">
                              <div className="flex w-full items-center justify-between">
                                <h3 className="font-semibold capitalize">{module.replace(/_/g, ' ')}</h3>
                                <div className="flex items-center space-x-2 mr-4">
                                  <Controller
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                      <Checkbox
                                        checked={permissionsInModule.every(p => field.value.includes(p))}
                                        onCheckedChange={(checked) => {
                                          const currentPermissions = new Set(field.value);
                                          if (checked) {
                                            permissionsInModule.forEach(p => currentPermissions.add(p));
                                          } else {
                                            permissionsInModule.forEach(p => currentPermissions.delete(p));
                                          }
                                          field.onChange(Array.from(currentPermissions));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                  />
                                  <span className="text-sm font-normal">Select All</span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-2 bg-muted/40">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {permissionsInModule.map((permission) => (
                                  <FormField
                                    key={permission}
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 hover:bg-accent/50 transition-colors">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, permission])
                                                : field.onChange(field.value?.filter((value) => value !== permission));
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal capitalize cursor-pointer w-full">
                                          {(permission.split(':')[1] || permission).replace(/_/g, ' ')}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground p-8">
                          No permissions found for &quot;{searchTerm}&quot;.
                        </div>
                      )}
                    </Accordion>
                  </ScrollArea>
                  <FormMessage className="pt-2" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isLoading} className="ml-auto">
              {isLoading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Role')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
