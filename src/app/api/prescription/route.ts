import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { PDFDocument, rgb } from "pdf-lib";
import path from "path";
import fs from "fs";

// Action to fetch prescriptions based on patient ID
export const GET = async (req: NextRequest) => {
    try {
        const patientId = new URL(req.url).searchParams.get("patientId");

        if (!patientId) {
            return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
        }

        const prescriptions = await db.prescription.findMany({
            where: { patientId: patientId },
        });

        if (!prescriptions.length) {
            return NextResponse.json({ error: "No prescriptions found for this patient" }, { status: 404 });
        }

        return NextResponse.json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json({ error: "Error fetching prescriptions" }, { status: 500 });
    }
};

// Function to split medication string into individual items
function splitMedications(medicationsString) {
    const trimmedString = medicationsString.trim();
    const medicationArray = trimmedString.split(/\s+|,\s*/).filter(Boolean);
    return medicationArray;
}

// Action to generate a PDF with a specific prescription data
export const POST = async (req: NextRequest) => {
    try {
        const { prescriptionId, patientId } = await req.json();

        if (!prescriptionId || !patientId) {
            return NextResponse.json({ error: "Prescription ID and Patient ID are required" }, { status: 400 });
        }

        const patient = await db.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const prescription = await db.prescription.findUnique({
            where: { id: prescriptionId },
        });

        if (!prescription) {
            return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
        }

        const pdfTemplatePath = path.resolve(process.cwd(), "public/doctor2.pdf");
        if (!fs.existsSync(pdfTemplatePath)) {
            console.error("PDF template file does not exist at path:", pdfTemplatePath);
            return NextResponse.json({ error: "PDF template file not found" }, { status: 500 });
        }

        const pdfBytes = fs.readFileSync(pdfTemplatePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add patient's name to the PDF
        firstPage.drawText(` ${patient.nom} ${patient.prenom}`, {
            x: 68,
            y: 675,
            size: 14,
            color: rgb(0, 0, 0),
        });

        // Add prescription data to the PDF
        firstPage.drawText(`: ${prescription.date}`, {
            x: 480,
            y: 675,
            size: 12,
            color: rgb(0, 0, 0),
        });

        const medications = splitMedications(prescription.medication);
        medications.forEach((medication, medIndex) => {
            const yPosition = 600 - 30 * medIndex;
            firstPage.drawText(`${medication}`, {
                x: 50,
                y: yPosition,
                size: 18,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytesUpdated = await pdfDoc.save();

        return new NextResponse(pdfBytesUpdated, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="prescription-${prescriptionId}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating prescription PDF:", error);
        return NextResponse.json({ error: "Error generating prescription PDF" }, { status: 500 });
    }
};
