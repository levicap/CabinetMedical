import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db';

export const POST = async (req: NextRequest) => {
  try {
    // Parse the JSON request body
    const { email, telephone, password } = await req.json();

    // Check if email and telephone are provided
    if (!email || !telephone || !password) {
      return NextResponse.json({ error: 'Email, telephone number, and password are required' }, { status: 400 });
    }

    // Step 1: Check if a patient exists with the given email or telephone
    const existingPatient = await db.patient.findFirst({
      where: {
        OR: [
          { email: email },
          { telephone: telephone }
        ]
      }
    });

    if (existingPatient) {
      // Step 2: If a patient is found, find the associated user
      const existingUser = await db.user.findUnique({
        where: { email: email }
      });

      if (existingUser) {
        // Step 3: If the user exists, hash the password and update the user's record
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
          where: { email: email },
          data: { email:email,password: hashedPassword }
        });

        return NextResponse.json({ message: 'Password updated successfully' });
      } else {
        return NextResponse.json({ error: 'User record not found' }, { status: 404 });
      }
    } else {
      // Step 4: If no patient is found, return an error message
      return NextResponse.json({ error: 'Invalid email or phone number' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating user password:', error);
    return NextResponse.json({ error: 'Error updating user password' }, { status: 500 });
  }
};
