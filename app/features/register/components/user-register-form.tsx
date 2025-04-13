'use client';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'First Name must be at least 2 characters.'
  }),
  lastName: z.string().min(2, {
    message: 'Last Name must be at least 2 characters.'
  }),
  phone: z.string().min(9, {
    message: 'Phone Number must be at least 9 characters.'
  }),
  country: z.string({
    required_error: 'Please select country of operation.'
  }),
  password: z.string({
    required_error: 'Password is required'
  })
});

export function UserRegisterForm({
  onSubmit
}: {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      phone: '',
      country: '',
      password: ''
    }
  });

  // // 2. Define a submit handler.
  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   // Do something with the form values.
  //   // ✅ This will be type-safe and validated.
  //   console.log(values);

  //   //verify phone number
  // }

  return (
    <Card className='max-w-xl'>
      <CardHeader>
        <CardTitle>
          Tell us a little bit about you starting with your name
        </CardTitle>
        <CardDescription>
          Please write your first and last names exactly as they appear on your
          National ID
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-col space-y-1.5'>
                <div className='flex flex-row gap-4'>
                  <div className='flex-1'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder='' {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='flex-1'>
                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder='' {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-col space-y-1.5'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder='0700 000 000' {...field} />
                      </FormControl>
                      <FormDescription>
                        Your phone number will be used for verification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex flex-col space-y-1.5'>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type='password' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex flex-col space-y-1.5'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select country of operation' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Tanzania'>Tanzania</SelectItem>
                          <SelectItem value='Kenya'>Kenya</SelectItem>
                          <SelectItem value='Uganda'>Uganda</SelectItem>
                          <SelectItem value='Rwanda'>Rwanda</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex flex-row justify-between gap-4'>
            <Button className='flex-1' variant='outline'>
              Back
            </Button>
            <Button type='submit' className='flex-1'>
              Next
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
