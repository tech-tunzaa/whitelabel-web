// app/actions/submitForm.ts (Server Action)
'use server';

export async function registerUser(formData: any) {
  try {
    console.log('Calling API for registration');
    console.log(JSON.stringify(formData));
    const res = await fetch(`${process.env.API_URL}/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    console.log(data);

    // Check if the response is OK and an user object is returned
    if (res.ok && data.user) {
      //has an organization, take to dashboard home
      return data.user;
    }

    return false;
    // return res.ok; // Returns true if successful, false otherwise
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
}

export async function verifyPhone(formData: any) {
  try {
    console.log('Calling API for verifyPhone');
    console.log(JSON.stringify(formData));
    const res = await fetch(`${process.env.API_URL}/auth/verify-phone/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    // Check if the response is OK and an user object is returned
    if (res.ok && data.user) {
      //has an organization, take to dashboard home
      return data.user;
    }

    return false;
    // return res.ok; // Returns true if successful, false otherwise
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
}

export async function completeSignUp(formData: any, userId: string) {
  try {
    console.log(JSON.stringify(formData));
    const res = await fetch(
      `${process.env.API_URL}/auth/complete-signup/${userId}/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }
    );

    const data = await res.json();

    console.log(data);
    // Check if the response is OK and an user object is returned
    if (res.ok && data.user) {
      //has an organization, take to dashboard home
      return data.user;
    }

    return false;
    // return res.ok; // Returns true if successful, false otherwise
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
}
