"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Role, Permission } from "../types/role"
import { useRoleStore } from "../stores/role-store"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { RequiredField } from "@/components/ui/required-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Form schema
const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  permissions: z.array(z.string())
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface RoleFormProps {
  onSubmit: (data: RoleFormValues) => void
  onCancel?: () => void
  initialData?: Partial<RoleFormValues> & { id?: string }
}

export function RoleForm({ onSubmit, onCancel, initialData }: RoleFormProps) {
  const { permissions } = useRoleStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Group permissions by module
  const permissionsByModule: Record<string, Permission[]> = {}
  permissions.forEach(permission => {
    if (!permissionsByModule[permission.module]) {
      permissionsByModule[permission.module] = []
    }
    permissionsByModule[permission.module].push(permission)
  })
  
  // Sort modules by name
  const modules = Object.keys(permissionsByModule).sort()
  
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      permissions: initialData?.permissions || []
    }
  })

  const handleSubmit = async (data: RoleFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-4">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Role Information</h3>
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Admin" {...field} />
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
                      <FormLabel>Description <RequiredField /></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the role and its responsibilities" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permissions</h3>
                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormDescription>
                          Select the permissions to assign to this role
                        </FormDescription>
                      </div>
                      
                      <Tabs defaultValue={modules[0]} className="w-full">
                        <TabsList className="mb-4 flex flex-wrap h-auto">
                          {modules.map(module => (
                            <TabsTrigger 
                              key={module} 
                              value={module}
                              className="capitalize"
                            >
                              {module.replace('_', ' ')}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {modules.map(module => (
                          <TabsContent key={module} value={module} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {permissionsByModule[module].map(permission => (
                                <FormField
                                  key={permission.id}
                                  control={form.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={permission.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, permission.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== permission.id
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="text-sm font-medium">
                                            {permission.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                          </FormLabel>
                                          <FormDescription className="text-xs">
                                            {permission.description}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData?.id ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
