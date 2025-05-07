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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone: z.string().optional(),
  role: z.enum(["super_owner", "admin", "sub_admin", "support"], {
    required_error: "Please select a role."
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status."
  }),
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
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      role: initialData?.role || "support",
      status: initialData?.status || "active",
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <RequiredField /></FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput placeholder="+1 (555) 000-0000" value={field.value} onChange={field.onChange} />
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <RequiredField /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormDescription>
                        Whether the user can log in and access the system
                      </FormDescription>
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
