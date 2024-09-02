import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

// Action to create a new consultation, associated diagnosis, and manage 
export const GET = async (req: NextRequest) => {
  try {
    // Fetch all consultations with related patient details and their specific prescriptions
    const consultations = await db.consultation.findMany({
      include: {
        patient: {
          select: {
            nom: true,
            prenom: true
          }
        },
        prescriptions: {
          select: {
            medication: true,
            instructions: true
          }
        }
      }
    });

    // Format the response to include consultation details, patient name, and prescription details
    const formattedConsultations = consultations.map(consultation => ({
      id: consultation.id, 
      consultationDetails: {
        date: consultation.date,
        diagnosis: consultation.diagnosis,
        notes: consultation.notes
      },
      patientName: `${consultation.patient.nom} ${consultation.patient.prenom}`,
      prescriptions: consultation.prescriptions.map(prescription => ({
        medication: prescription.medication,
        instructions: prescription.instructions
      }))
    }));

    return NextResponse.json(formattedConsultations);
  } catch (error) {
    console.error('Error fetching all consultations:', error);
    return NextResponse.json({ error: 'Error fetching all consultations', details: error.message }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { nom, prenom, date, diagnostic, notes, medication, instructions } = await req.json();
    console.log('Request body:', { nom, prenom, date, diagnostic, notes, medication, instructions });


    // Step 1: Check if the patient exists
    const patient = await db.patient.findFirst({
      where: {
        nom: nom,
        prenom: prenom,
      },
    });

    if (!patient) {
      // If patient does not exist, return an error response
      return NextResponse.json({ error: 'Patient does not exist' }, { status: 404 });
    }

    // Step 2: Fetch the existing dossier for the patient
    let dossier = await db.dossier.findFirst({
      where: {
        patientId: patient.id,
      },
    });

    if (dossier) {
      // Append new diagnosis and notes to the existing dossier
      await db.dossier.update({
        where: { id: dossier.id },
        data: {
          diagnostic: {
            set: dossier.diagnostic + '\n' + diagnostic // Append new diagnosis
          },
          notes: {
            set: dossier.notes ? dossier.notes + '\n' + notes : notes // Append new notes
          },
        },
      });
    } else {
      // Create new dossier if none exists
      dossier = await db.dossier.create({
        data: {
          diagnostic: diagnostic,
          notes: notes,
          patientId: patient.id,
          files: [], // Initialize with an empty array or your default value
        },
      });
    }

    // Step 3: Create a new diagnosis
    const newDiagnosis = await db.diagnosis.create({
      data: {
        doctorName: `${nom} ${prenom}`, // Assuming the doctor's name is the same as the consultation's nom and prenom
        date,
        diagnosis: diagnostic,
        notes,
        patientId: patient.id,
      },
    });

    // Step 4: Create the new consultation
    const newConsultation = await db.consultation.create({
      data: {
        nom,
        prenom,
        date,
        diagnosis: diagnostic,
        notes,
        patientId: patient.id, // Link the consultation to the patient
        dossirId: dossier.id, // Link the consultation to the dossier
        diagnosisId: newDiagnosis.id, // Link the consultation to the diagnosis
      },
    });

    // Step 5: Create the associated prescription
    const newPrescription = await db.prescription.create({
      data: {
        doctorName: `${nom} ${prenom}`,
        date,
        medication,
        instructions,
        patientId: patient.id,
        consultationId: newConsultation.id, // Link the prescription to the consultation
      },
    });

    // Return the created consultation, diagnosis, and prescription
    return NextResponse.json({
      consultation: newConsultation,
      diagnosis: newDiagnosis,
      prescription: newPrescription,
    });
  } catch (error) {
    console.error('Error creating consultation, diagnosis, and dossier:', error);
    return NextResponse.json({ error: 'Error creating consultation, diagnosis, and dossier', details: error.message }, { status: 500 });
  }
};
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
export const PUT = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const consultationId = url.searchParams.get('consultationId');
    console.log('Consultation ID:', consultationId);

    if (!consultationId || !isValidObjectId(consultationId)) {
      return NextResponse.json({ error: 'Invalid or missing Consultation ID' }, { status: 400 });
    }

    const { date, diagnosis, notes, medication, instructions } = await req.json();
    console.log('Request Body:', { date, diagnosis, notes, medication, instructions });

    // Step 1: Check if the consultation exists
    const consultation = await db.consultation.findUnique({
      where: { id: consultationId },
      include: {
        prescriptions: true,
        dossir: true, // Include the related dossier
      }
    });

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Step 2: Update the consultation details
    await db.consultation.update({
      where: { id: consultationId },
      data: {
        date,
        diagnosis,
        notes,
      }
    });

    // Step 3: Update the prescription if medication and instructions are provided
    if (medication && instructions) {
      const existingPrescription = await db.prescription.findFirst({
        where: {
          consultationId: consultationId,
        }
      });

      if (existingPrescription) {
        await db.prescription.update({
          where: { id: existingPrescription.id },
          data: { medication, instructions }
        });
        console.log('Prescription updated:', existingPrescription.id);
      } else {
        return NextResponse.json({ error: 'No matching prescription found for this consultation' }, { status: 404 });
      }
    }

    // Step 4: Update the dossier's diagnosis and notes if the consultation is associated with a dossier
    if (consultation.dossir) {
      // Replace the existing diagnosis and notes with the new ones in the dossier
      const updatedDiagnostic = consultation.dossir.diagnostic.replace(consultation.diagnosis, diagnosis).trim();
      const updatedNotes = consultation.dossir.notes ? consultation.dossir.notes.replace(consultation.notes ?? '', notes) : notes;

      await db.dossier.update({
        where: { id: consultation.dossir.id },
        data: {
          diagnostic: updatedDiagnostic,
          notes: updatedNotes,
        }
      });
      console.log('Dossier updated:', consultation.dossir.id);
    }

    return NextResponse.json({ message: 'Consultation, related prescription, and dossier updated successfully' });
  } catch (error) {
    console.error('Error updating consultation, prescription, and dossier:', error);
    return NextResponse.json({ error: 'Error updating consultation, prescription, and dossier', details: error.message }, { status: 500 });
  }
};


export const DELETE = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const consultationId = url.searchParams.get('consultationId');
    // Fetch the consultation along with its related dossier
    const consultation = await db.consultation.findUnique({
      where: {
        id: consultationId,
      },
      include: {
        dossir: true,  // Load related dossier
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // If there's a dossier, remove the consultation's diagnosis and notes from it
    if (consultation.dossir) {
      // Update the dossier by removing the specific diagnosis and notes related to the consultation
      const updatedDiagnostic = consultation.dossir.diagnostic.replace(consultation.diagnosis, '').trim();
      const updatedNotes = consultation.dossir.notes ? consultation.dossir.notes.replace(consultation.notes ?? '', '').trim() : '';

      await db.dossier.update({
        where: { id: consultation.dossir.id },
        data: {
          diagnostic: updatedDiagnostic,
          notes: updatedNotes,
        },
      });
    }

    // Delete the consultation (Cascade will delete the related Diagnosis and Prescriptions)
    await db.consultation.delete({
      where: { id: consultationId },
    });

    return NextResponse.json({ message: 'Consultation and associated data deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error deleting consultation and associated data',
        details: error.message,
      },
      { status: 500 }
    );
  }
};
