import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export const POST = async (req: NextRequest) => {
  try {
    const { nom, prenom, date, time } = await req.json();

    // Validate required fields
    if (!nom || !prenom || !date || !time) {
      return NextResponse.json({ success: false, message: 'Tous les champs sont requis' }, { status: 400 });
    }

    // Check if the patient exists
    const patient = await db.patient.findFirst({
      where: {
        nom,
        prenom,
      },
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient non trouvé dans la base de données' }, { status: 404 });
    }

    // Check if rendezvous already exists
    const existingRendezvous = await db.rendezvous.findFirst({
      where: {
        nomPatient: nom,
        prenomPatient: prenom,
        date,
        time,
      },
    });

    if (existingRendezvous) {
      return NextResponse.json({ success: false, message: 'Votre rendez-vous est déjà enregistré' }, { status: 409 });
    }

    // Create the reservation
    await db.rendezvous.create({
      data: {
        date,
        time,
        nomPatient: nom,
        prenomPatient: prenom,
        etat: 'confirmed',
        patientId: patient.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ success: false, message: 'Erreur de création du rendez-vous' }, { status: 500 });
  }
};

