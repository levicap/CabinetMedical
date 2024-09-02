import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

// Action to read all personel
export const GET = async (req: NextRequest) => {
  try {
    const personel = await db.personel.findMany({});
    return NextResponse.json(personel);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching personel' }, { status: 500 });
  }
};

// Action to create a new personel
export const POST = async (req: NextRequest) => {
  try {
    const { nom, prenom, adresse, telephone } = await req.json();
    const newPersonel = await db.personel.create({
      data: { nom, prenom, adresse, telephone }
    });
    return NextResponse.json(newPersonel);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating personel' }, { status: 500 });
  }
};

// Action to delete a personel by ID
export const DELETE = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Personel ID is required' }, { status: 400 });
    }

    // Perform the deletion operation
    await db.personel.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Personel deleted successfully' });
  } catch (error) {
    console.error('Error deleting personel:', error);
    return NextResponse.json({ error: 'Error deleting personel' }, { status: 500 });
  }
};

// Action to update a personel by ID
export const PUT = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Personel ID is required" }, { status: 400 });
    }

    // Parse the request body
    const { nom, prenom, adresse, telephone } = await req.json();

    // Perform the update operation
    const updatedPersonel = await db.personel.update({
      where: { id: id },
      data: { nom, prenom, adresse, telephone }
    });

    return NextResponse.json(updatedPersonel);
  } catch (error) {
    console.error("Error updating personel:", error);
    return NextResponse.json({ error: 'Error updating personel' }, { status: 500 });
  }
};
