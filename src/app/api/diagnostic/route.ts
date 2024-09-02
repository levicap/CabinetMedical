import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import according to your project structure

export const GET = async (req: NextRequest) => {
  try {
    const patientId = new URL(req.url).searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const diagnoses = await db.diagnosis.findMany({
      where: { patientId: patientId },
    });

    if (!diagnoses.length) {
      return NextResponse.json({ error: "No diagnoses found for this patient" }, { status: 404 });
    }

    return NextResponse.json(diagnoses);
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return NextResponse.json({ error: "Error fetching diagnoses" }, { status: 500 });
  }
};
