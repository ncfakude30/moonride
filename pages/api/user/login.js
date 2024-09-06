// pages/api/storeUser.js

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, displayName, photoURL } = await req.json();

    // Make sure you replace YOUR_LAMBDA_ENDPOINT with your Lambda function's endpoint URL
    const lambdaEndpoint = `${process.env.API_BASE_URL}/login`;
    
    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        displayName,
        photoURL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store user data');
    }

    return NextResponse.json({ message: 'User data stored successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
