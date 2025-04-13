import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function VerifyEmail({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  //   const session = await auth();

  const { slug } = await params;
  const { email, code } = await searchParams;

  console.log('Search Params are here::');
  console.log(slug);
  console.log(email);
  console.log(code);

  if (!email && !code) {
    //no user verification details
    return redirect('/');
  }

  //Call API with email and code from url query
  const res = await fetch(`${process.env.API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      code
    })
  });

  const data = await res.json();

  if (res.ok && data.user && data.user?.emailVerification.verified) {
    return redirect('/'); //redirect to login
  } else {
    return (
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>Email Verification Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email verification failed.</p>
        </CardContent>
      </Card>
    );
  }
}
