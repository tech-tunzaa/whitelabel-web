'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  email: z.string().email({ message: 'Email is required' })
});

export function RegisterEmailForm({
  user,
  onSubmit
}: {
  user: any;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: ''
    }
  });

  // function onSubmit(data: z.infer<typeof FormSchema>) {
  //   toast('You submitted the following values:', {
  //     description: (
  //       <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
  //         <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     )
  //   });
  // }

  if (user?.email) {
    return (
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>Confim your email address</CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            To verify your email address, follow the instructions we've sent to{' '}
            {user?.email}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='max-w-xl'>
      <CardHeader>
        <CardTitle>What’s your email address?</CardTitle>
        <CardDescription>
          We’ll use it to send you important information about your application
          and account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-row space-y-1.5'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='' {...field} />
                      </FormControl>

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
