'use client';
import { Metadata } from 'next';
import Link from 'next/link';
import { UserRegisterForm } from './user-register-form';
import { PhoneVerificationForm } from './phone-verification-form';
import { RegisterEmailForm } from './email-form';
import { useEffect, useState, useTransition } from 'react';
import useRegisterStore from '../store';
import { completeSignUp, registerUser, verifyPhone } from '../actions';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function RegisterViewPage({
  organizationType
}: {
  organizationType: string;
}) {
  // const [isSubmitted, setIsSubmitted] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [user, setUser]

  const {
    user,
    token,
    loading,
    phoneVerified,
    emailVerified,
    setUser,
    setToken,
    setLoading,
    setPhoneVerified,
    setEmailVerified
  } = useRegisterStore();

  const [isPending, startTransition] = useTransition();

  async function handleRegistration(formData: any) {
    console.log('Handling registration');
    startTransition(async () => {
      //append the organization Type
      formData.organizationType = organizationType;
      const userResponse = await registerUser(formData); // Call Server Action

      if (userResponse) {
        setUser(userResponse);
      }
    });
  }

  async function handlePhoneVerification(formData: any) {
    startTransition(async () => {
      formData.phone = user.phone;
      const phoneVerificationResponse = await verifyPhone(formData); // Call Server Action

      if (phoneVerificationResponse) {
        if (phoneVerificationResponse?.phoneVerification.verified) {
          setPhoneVerified(true);
          setUser(phoneVerificationResponse);
        }
      }
    });
  }

  async function initiateEmailVerification(formData: any) {
    startTransition(async () => {
      console.log(formData);
      const updatedUser = await completeSignUp(formData, user._id); // Call Server Action

      if (updatedUser) {
        setUser(updatedUser);
      }
    });
  }

  useEffect(() => {
    // setIsSubmitted(false);
  }, []);

  return (
    <section className='container'>
      <div className='grid gap-6 pb-8 pt-6 md:py-10'>
        <div className='flex content-center justify-center'>
          <div className='flex-col'>
            {!user && !phoneVerified && !emailVerified && (
              <UserRegisterForm onSubmit={handleRegistration} />
            )}

            {user && !phoneVerified && (
              <PhoneVerificationForm
                onSubmit={handlePhoneVerification}
                user={user}
              />
            )}

            {user && phoneVerified && !emailVerified && (
              <RegisterEmailForm
                onSubmit={initiateEmailVerification}
                user={user}
              />
            )}

            {/* <CreateProfileForm /> */}
            {/* <CollaborationHistoryForm /> */}
            <div className='pt-5 text-center'>
              <p>
                Already have an account? <Link href='/'>LOG IN</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
