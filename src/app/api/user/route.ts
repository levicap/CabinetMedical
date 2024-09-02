import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import bcrypt from "bcryptjs";


// Action to read all users
export const GET = async (req: NextRequest) => {
  try {
    const roles = ["ADMIN", "medecin", "secretaire"];
    
    // Query users with roles in the specified list
    const users = await db.user.findMany({
      where: {
        role: {
          in: roles,
        },
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
};

// Action to create a new user
export const POST = async (req: NextRequest) => {
  try {
    const { email, username, password, role, name } = await req.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: { email, username, password: hashedPassword, role, name ,image:"/uploads/rv.png"},
    });
    
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
};

// Action to delete a user by ID
export const DELETE = async (req: NextRequest) => {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
};

// Action to update a user by ID
export const PUT = async (req: NextRequest) => {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { email, username, password, role, name } = await req.json();

    // Hash the password if it's provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        email,
        username,
        password: hashedPassword, // Only update the password if it's provided
        role,
        name,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
};