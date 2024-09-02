import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

// Action to read all medecins
export const GET = async (req: NextRequest) => {
  try {
    const medecins = await db.medecin.findMany({});
    return NextResponse.json(medecins);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching medecins' }, { status: 500 });
  }
};

// Action to create a new medecin
export const POST = async (req: NextRequest) => {
  try {
    const { nom, prenom, specialite, email, telephone } = await req.json();
    const newMedecin = await db.medecin.create({
      data: { nom, prenom, specialite, email, telephone }
    });
    return NextResponse.json(newMedecin);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating medecin' }, { status: 500 });
  }
};

// Action to delete a medecin by ID
export const DELETE = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Medecin ID is required' }, { status: 400 });
    }

    // Perform the deletion operation
    await db.medecin.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Medecin deleted successfully' });
  } catch (error) {
    console.error('Error deleting medecin:', error);
    return NextResponse.json({ error: 'Error deleting medecin' }, { status: 500 });
  }
};

// Action to update a medecin by ID
export const PUT = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Medecin ID is required" }, { status: 400 });
    }

    // Parse the request body
    const { nom, prenom, specialite, email, telephone } = await req.json();

    // Perform the update operation
    const updatedMedecin = await db.medecin.update({
      where: { id: id },
      data: { nom, prenom, specialite, email, telephone }
    });

    return NextResponse.json(updatedMedecin);
  } catch (error) {
    console.error("Error updating medecin:", error);
    return NextResponse.json({ error: 'Error updating medecin' }, { status: 500 });
  }
};
