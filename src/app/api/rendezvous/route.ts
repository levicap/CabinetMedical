import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

// Utility function to get patient ID by name
const getPatientIdByName = async (nom: string, prenom: string): Promise<string | null> => {
  try {
    const patient = await db.patient.findFirst({
      where: {
        nom,
        prenom
      }
    });
    return patient ? patient.id : null;
  } catch (error) {
    console.error('Error fetching patient ID:', error);
    throw new Error('Unable to fetch patient ID');
  }
};

// Action to read all rendezvous including related patient data
export const GET = async (req: NextRequest) => {
  try {
    const rendezvous = await db.rendezvous.findMany({
      include: {
        patient: true,
      },
    });
    return NextResponse.json(rendezvous);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching rendezvous' }, { status: 500 });
  }
};

// Action to create a new rendezvous
export const POST = async (req: NextRequest) => {
  try {
    const { date, time, nomPatient, prenomPatient, etat } = await req.json();

    // Get patient ID
    const patientId = await getPatientIdByName(nomPatient, prenomPatient);
    if (!patientId) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create new rendezvous
    const newRendezvous = await db.rendezvous.create({
      data: { date, time, nomPatient, prenomPatient, etat, patientId }
    });

    return NextResponse.json(newRendezvous);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating rendezvous' }, { status: 500 });
  }
};

// Action to delete a rendezvous by ID
export const DELETE = async (req: NextRequest) => {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rendezvous ID is required' }, { status: 400 });
    }

    await db.rendezvous.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Rendezvous deleted successfully' });
  } catch (error) {
    console.error('Error deleting rendezvous:', error);
    return NextResponse.json({ error: 'Error deleting rendezvous' }, { status: 500 });
  }
};

// Action to update a rendezvous by ID
export const PUT = async (req: NextRequest) => {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rendezvous ID is required' }, { status: 400 });
    }

    const { date, time, nomPatient, prenomPatient, etat } = await req.json();

    // Get patient ID
    const patientId = await getPatientIdByName(nomPatient, prenomPatient);
    if (!patientId) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Update rendezvous
    const updatedRendezvous = await db.rendezvous.update({
      where: { id: id },
      data: { date, time, nomPatient, prenomPatient, etat, patientId }
    });

    return NextResponse.json(updatedRendezvous);
  } catch (error) {
    console.error('Error updating rendezvous:', error);
    return NextResponse.json({ error: 'Error updating rendezvous' }, { status: 500 });
  }
};
