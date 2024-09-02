import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const nomPatient = url.searchParams.get('nomPatient');
    const prenomPatient = url.searchParams.get('prenomPatient');

    if (!nomPatient || !prenomPatient) {
      return NextResponse.json({ error: 'Nom and prenom are required' }, { status: 400 });
    }

    const patient = await db.patient.findFirst({
      where: {
        nom: nomPatient,
        prenom: prenomPatient
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ phoneNumber: patient.telephone });
  } catch (error) {
    console.error('Error fetching patient phone number:', error);
    return NextResponse.json({ error: 'Error fetching phone number' }, { status: 500 });
  }
};
