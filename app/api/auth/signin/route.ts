import { NextRequest, NextResponse } from 'next/server';
import { signIn, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For MVP, we accept any email/password combination
    // In a real app, you'd validate credentials properly
    const authResult = await signIn(email, password);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { user, token } = authResult;

    // Set session cookie
    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
      token
    });

    response.cookies.set('applyflow_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
