import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "./user-auth-form";
import Image from "next/image";
import logo from "./../../../../public/logo.svg";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function SignInViewPage({ stars }: { stars: number }) {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 hidden md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        {/* <div className='absolute inset-0 bg-zinc-900' /> */}
        <img
          src="./coverimage.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={logo} alt="Meneja" />
          </Link>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <Card className="rounded-xs shadow-none">
            <CardHeader>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                  Log In to Meneja
                </h1>
                <p className="text-xs">Enter your credentials below</p>
              </div>
            </CardHeader>

            <CardContent>
              <UserAuthForm />
              <div className="p-3">
                <p className="text-center text-sm">
                  Not registered?{" "}
                  <Link
                    className="font-semibold"
                    href="/register?organizationType=CSO"
                  >
                    Create an Account
                  </Link>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="px-8 text-center text-xs text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
