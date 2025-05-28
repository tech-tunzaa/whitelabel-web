"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/core";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string({
    required_error: "Password is required",
  }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const defaultValues = {
    email: "",
    password: "",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Using NextAuth for authentication instead of direct API calls
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Watch for auth error changes
  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  // Get the session data to detect changes
  const { data: session } = useSession();
  
  // Synchronize tokens when session changes
  useEffect(() => {
    // Check for session and attempt to extract tokens
    if (session) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Session detected, checking for tokens');
        // @ts-ignore - NextAuth custom session type includes accessToken
        const accessToken = session.accessToken;
        // @ts-ignore - Our custom user type includes token for refresh token
        const refreshToken = session.user?.token;
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          console.log('Token set from session');
        }
        
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
          console.log('Refresh token set from session');
        }
      }
    }
  }, [session]);

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        // First authenticate directly with our API to get tokens
        // This ensures we have the tokens in localStorage
        try {
          const apiAuthResult = await api.auth.login(data.email, data.password);
          console.log('API Auth result:', apiAuthResult);
          
          // Store tokens directly in localStorage
          if (apiAuthResult.access_token) {
            localStorage.setItem('token', apiAuthResult.access_token);
            localStorage.setItem('refresh_token', apiAuthResult.refresh_token);
            console.log('Tokens stored in localStorage:', {
              token: apiAuthResult.access_token.slice(0, 10) + '...',
              refresh: apiAuthResult.refresh_token.slice(0, 10) + '...'
            });
          }
        } catch (apiError) {
          console.error('Direct API auth failed (will try NextAuth):', apiError);
        }
        
        // Then proceed with NextAuth to set up the session
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          callbackUrl: callbackUrl ?? "/dashboard",
          redirect: false,
        });

        if (result?.error) {
          setAuthError(result.error);
          toast.error(result.error);
        } else if (result?.ok) {
          // Double-check that we have tokens in localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('Token not found after successful login, fetching directly');
            // As a last resort, try to get the token from the session
            try {
              const apiAuthResult = await api.auth.login(data.email, data.password);
              if (apiAuthResult.access_token) {
                localStorage.setItem('token', apiAuthResult.access_token);
                localStorage.setItem('refresh_token', apiAuthResult.refresh_token);
                console.log('Tokens fetched and stored');
              }
            } catch (e) {
              console.error('Failed to fetch tokens directly:', e);
            }
          } else {
            console.log('Token found in localStorage after login');
          }
          
          toast.success("Signed in successfully");
          router.push(callbackUrl ?? "/dashboard");
        }
      } catch (error: any) {
        const errorMessage = error.message || "Authentication failed";
        setAuthError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={loading}
            className="ml-auto w-full text-xs font-bold uppercase"
            type="submit"
          >
            Login
          </Button>
        </form>
      </Form>
      {/* <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>
      <GithubSignInButton /> */}
    </>
  );
}
