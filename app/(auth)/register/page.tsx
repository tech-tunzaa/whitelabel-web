import RegisterViewPage from "@/features/register/components/register-view";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register",
  description: "Sign Up page for authentication.",
};

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { organizationType } = await searchParams;

  if (organizationType) console.log(organizationType);

  if (!organizationType) {
    redirect("/");
  }

  return <RegisterViewPage organizationType={organizationType as string} />;
}
