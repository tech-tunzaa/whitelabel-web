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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { toast } from 'sonner';

const FormSchema = z.object({
  code: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.'
  })
});

export function PhoneVerificationForm({
  onSubmit,
  user
}: {
  user: any;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: ''
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

  return (
    <Card className='max-w-xl'>
      <CardHeader>
        <CardTitle>6 digit code</CardTitle>
        <CardDescription>
          Code sent to {user.phone} unless you already have an account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-row space-y-1.5'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP className='flex-1' maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your phone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>Resend code in 00:30</div>
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
