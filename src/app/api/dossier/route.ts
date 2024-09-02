import { NextResponse } from 'next/server';

import { db } from '@/db';



export async function GET(req: NextRequest) {
  try {
    // Fetch all dossiers with related patient information
    const dossiers = await db.dossier.findMany({
      select: {
        id: true,
        diagnostic: true,
        notes: true,
        files: true,
        patient: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    // Return the dossiers as a JSON response
    return NextResponse.json(dossiers);
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    return NextResponse.json({ error: 'Failed to fetch dossiers' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dossierId = url.searchParams.get('dossierId');

    if (!dossierId) {
      return NextResponse.json({ error: 'Dossier ID is required' }, { status: 400 });
    }

    const { newDiagnostic, notes } = await req.json();

    // Fetch the existing dossier
    const existingDossier = await db.dossier.findUnique({
      where: { id: dossierId },
    });

    if (!existingDossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    // Prepare the update data
    const updateData: {
      notes?: string;
      
      diagnostic?: string;
    } = {};

    if (notes) {
      updateData.notes = existingDossier.notes 
        ? `${existingDossier.notes}\n${notes}` 
        : notes;
    }
   
    if (newDiagnostic) {
      updateData.diagnostic = existingDossier.diagnostic 
        ? `${existingDossier.diagnostic}\n${newDiagnostic}` 
        : newDiagnostic;
    }

    // Update the dossier
    const updatedDossier = await db.dossier.update({
      where: { id: dossierId },
      data: updateData,
    });

    return NextResponse.json({ message: 'Dossier updated successfully', dossier: updatedDossier }, { status: 200 });
  } catch (error) {
    console.error('Error updating dossier:', error);
    return NextResponse.json({ error: 'Failed to update dossier' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dossierId = url.searchParams.get('dossierId');

    if (!dossierId) {
      return NextResponse.json({ error: 'Dossier ID is required' }, { status: 400 });
    }

    // Delete the dossier
    await db.dossier.delete({
      where: { id: dossierId },
    });

    return NextResponse.json({ message: 'Dossier deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting dossier:', error);
    return NextResponse.json({ error: 'Failed to delete dossier' }, { status: 500 });
  }
}