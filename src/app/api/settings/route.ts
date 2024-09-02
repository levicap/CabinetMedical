import { NextRequest, NextResponse } from 'next/server';
import {db}from '@/db'; // Adjust the path according to your Prisma setup

export async function PUT(req: NextRequest) {
    const userId = new URL(req.url).searchParams.get('userId');
    const { name,email, username, password } = await req.json();

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        username,
        password,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}
