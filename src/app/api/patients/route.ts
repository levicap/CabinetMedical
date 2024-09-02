import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import crypto from 'crypto';  // Import crypto for generating ObjectID


const generateObjectId = () => {
  return crypto.randomBytes(12).toString('hex'); // Generates a 24-character hex string
};


// Action to read all patients
export const GET = async (req: NextRequest) => {
  try {
    const patients = await db.patient.findMany({});
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching patients' }, { status: 500 });
  }
};

// Action to create a new patient
export const POST = async (req: NextRequest) => {
  try {
    const { nom, prenom, adresse, email, telephone } = await req.json();

    const result = await db.$transaction(async (tx) => {
      const newuser = await tx.user.create({
        data: { name: nom, email: email, role: "patient", image: "/uploads/rv.png" }
      });

      const newPatient = await tx.patient.create({
        data: { nom, prenom, adresse, email, telephone, userId: newuser.id },
      });

      const dossier = await tx.dossier.create({
        data: { patientId: newPatient.id ,diagnostic:""}
      });

      return { newPatient, dossier };
    });

    return NextResponse.json(result.newPatient);
  } catch (error) {
    console.error('Error creating patient and dossier:', error);
    return NextResponse.json({ error: 'Error creating patient and dossier' }, { status: 500 });
  }
};



export const DELETE = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Perform the deletion operation
    await db.patient.delete({
      where: { id: id },  // Use the id directly since it's already a string
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Error deleting patient' }, { status: 500 });
  }
};

// Action to update a patient by ID
export const PUT = async (req: NextRequest) => {
  try {
    // Extract the id from the query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Parse the request body
    const { nom, prenom, adresse, email, telephone } = await req.json();

    // Perform the update operation
    const updatedPatient = await db.patient.update({
      where: { id: id },  // Convert id to number
      data: { nom, prenom, adresse, email, telephone }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: 'Error updating patient' }, { status: 500 });
  }
};