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

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Coming Soon</h1>
      <p className="text-lg">We are working on something great.</p>
    </div>
  );
}
