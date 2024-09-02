import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import path according to your project structure

// Action to get aggregated counts for all entities
export const GET = async (req: NextRequest) => {
  try {
    // Fetch counts for each entity
    const [consultationsCount, patientsCount, medecinCount,  personnelCount,rendezvousCount,dossierCount] = await Promise.all([
      db.consultation.count(),
      db.patient.count(),
      db.medecin.count(),
     db.personel.count() ,
     db.rendezvous.count() ,
     db.dossier.count() // Replace with the actual personnel count logic
    ]);

    // Return the counts in the response
    return NextResponse.json({
      totalConsultations: consultationsCount,
      totalPatients: patientsCount,
      totalMedecin: medecinCount,
      totalPersonnel: personnelCount,
      totalrendezvous: rendezvousCount,
      totalDossier: dossierCount,
    });
  } catch (error) {
    console.error("Error fetching aggregated counts:", error);
    return NextResponse.json({ error: 'Error fetching aggregated counts' }, { status: 500 });
  }
};
