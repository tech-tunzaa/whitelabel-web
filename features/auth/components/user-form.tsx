"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { User, UserRole } from "../types/user"
import { useRoleStore } from "../stores/role-store"
import { ImageUpload } from "@/components/ui/image-upload"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PhoneInput } from "@/components/ui/phone-input"
import { RequiredField } from "@/components/ui/required-field"
import { Switch } from "@/components/ui/switch"

// Form schema
const userFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters."
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone_number: z.string().optional(),
  role: z.enum(["super_owner", "admin", "sub_admin", "support", "vendor", "buyer"], {
    required_error: "Please select a role."
  }),
  is_active: z.boolean().default(true),
  avatar: z.string().optional()
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  onSubmit: (data: UserFormValues) => void
  onCancel?: () => void
  initialData?: Partial<UserFormValues> & { id?: string }
}

export function UserForm({ onSubmit, onCancel, initialData }: UserFormProps) {
  const { roles } = useRoleStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      role: initialData?.role || "support",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      avatar: initialData?.avatar || "",
    }
  })

  const handleSubmit = async (data: UserFormValues) => {
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
              <h3 className="text-lg font-medium">User Information</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <RequiredField /></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl className="h-36 w-36">
                        <ImageUpload
                          id="user-avatar-upload"
                          value={field.value}
                          onChange={field.onChange}
                          previewAlt="User Avatar Preview"
                          onFileChange={(file: File) => {
                            // In a real app, you would upload the file to your server/cloud storage
                            console.log('Avatar file to upload:', file);
                            // Then update the field with the URL once uploaded
                          }}
                          height="h-36"
                          width="w-36"
                          buttonText="Upload Photo"
                          className="mx-auto sm:mx-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Access Control</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role <RequiredField /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="super_owner">Super Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="sub_admin">Sub Admin</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines what permissions the user has
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Whether the user can log in and access the system
                        </FormDescription>
                      </div>
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
                {isSubmitting ? "Saving..." : initialData?.id ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
