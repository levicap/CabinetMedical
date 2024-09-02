import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const CONSULTATION_PRICE = 70;
const TAX_RATE = 0.35; // 35% tax rate

// Helper function to create a PDF document using a template
const createPdf = async (data) => {
  console.log("Creating PDF with the following data:", data);

  // Path to the template
  const templatePath = path.resolve('./public/report.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();

  const fontSize = 12; // Adjust font size as needed

  // Define positions for your data
  const positions = {
    dateDebut: { x: 50, y: height - 100 },
    dateFin: { x: 50, y: height - 130 },
    critere: { x: 50, y: height - 160 },
    totalCount: { x: 50, y: height - 200 },
    confirmedCount: { x: 50, y: height - 230 },
    pendingCount: { x: 50, y: height - 260 },
    dailyCountsStart: { x: 50, y: height - 300 },
    totalConsultations: { x: 50, y: height - 200 },
    revenue: { x: 50, y: height - 230 },
    revenueAfterTax: { x: 50, y: height - 260 }
  };

  // Draw text on the template
  page.drawText(`Date Debut: ${data.dateDebut}`, { ...positions.dateDebut, size: fontSize });
  page.drawText(`Date Fin: ${data.dateFin}`, { ...positions.dateFin, size: fontSize });
  page.drawText(`Critere: ${data.critere}`, { ...positions.critere, size: fontSize });

  if (data.critere === 'Rendez-vous') {
    page.drawText(`Total rendez-vous: ${data.totalCount}`, { ...positions.totalCount, size: fontSize, color: rgb(1, 0, 0) });
    page.drawText(`Confirmed rendez-vous: ${data.confirmedCount}`, { ...positions.confirmedCount, size: fontSize, color: rgb(0, 1, 0) });
    page.drawText(`Pending rendez-vous: ${data.pendingCount}`, { ...positions.pendingCount, size: fontSize, color: rgb(0, 0, 1) });

    let yPosition = positions.dailyCountsStart.y;
    data.dailyCounts.forEach(day => {
      page.drawText(`${day.date}:`, { x: positions.dailyCountsStart.x, y: yPosition, size: fontSize });
      page.drawText(`Confirmed: ${day.confirmedCount}`, { x: positions.dailyCountsStart.x + 100, y: yPosition, size: fontSize, color: rgb(0, 1, 0) });
      page.drawText(`Pending: ${day.pendingCount}`, { x: positions.dailyCountsStart.x + 250, y: yPosition, size: fontSize, color: rgb(0, 0, 1) });
      yPosition -= 20; // Adjust spacing as needed
    });
  } else if (data.critere === 'Consultation') {
    page.drawText(`Total consultations: ${data.totalConsultations}`, { ...positions.totalConsultations, size: fontSize, color: rgb(1, 0, 0) });
    page.drawText(`Revenue: ${data.revenue} TND`, { ...positions.revenue, size: fontSize, color: rgb(0, 1, 0) });
    page.drawText(`Estimated Revenue after Taxes: ${data.revenueAfterTax} TND`, { ...positions.revenueAfterTax, size: fontSize, color: rgb(0, 0, 1) });
  }

  const pdfBytes = await pdfDoc.save();
  console.log("PDF creation successful.");
  return pdfBytes;
};

// Helper functions
const isDateInRange = (date, startDate, endDate) => {
  return date >= startDate && date <= endDate;
};

const parseDateString = (dateString) => {
  // Expect dateString in 'DD-MM-YYYY' format
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // JavaScript months are 0-based
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { dateDebut, dateFin, critere } = data;

    console.log("Received request with data:", data);

    let totalCount = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let dailyCounts = [];
    let totalConsultations = 0;
    let revenue = 0;
    let revenueAfterTax = 0;

    const startDate = parseDateString(dateDebut);
    const endDate = parseDateString(dateFin);

    console.log("Parsed startDate:", startDate);
    console.log("Parsed endDate:", endDate);
    console.log("Critere:", critere);

    if (critere === 'Rendez-vous') {
      const allRendezvous = await db.rendezvous.findMany();
      console.log("Total rendezvous fetched from DB:", allRendezvous.length);

      const filteredRendezvous = allRendezvous.filter(rdv => {
        const rendezvousDate = parseDateString(rdv.date); // Use 'date' for the date
        return isDateInRange(rendezvousDate, startDate, endDate);
      });
      console.log("Filtered rendezvous within date range:", filteredRendezvous.length);

      totalCount = filteredRendezvous.length;
      confirmedCount = filteredRendezvous.filter(rdv => rdv.etat === 'confirmed').length;
      pendingCount = filteredRendezvous.filter(rdv => rdv.etat === 'pending').length;

      console.log("Total rendezvous count:", totalCount);
      console.log("Confirmed rendezvous count:", confirmedCount);
      console.log("Pending rendezvous count:", pendingCount);

      const dateMap = {};
      filteredRendezvous.forEach(rdv => {
        const formattedDate = rdv.date; // Use 'date' for the date
        if (!dateMap[formattedDate]) {
          dateMap[formattedDate] = { confirmedCount: 0, pendingCount: 0 };
        }
        if (rdv.etat === 'confirmed') {
          dateMap[formattedDate].confirmedCount++;
        } else if (rdv.etat === 'pending') {
          dateMap[formattedDate].pendingCount++;
        }
      });

      dailyCounts = Object.entries(dateMap).map(([date, counts]) => ({
        date,
        confirmedCount: counts.confirmedCount,
        pendingCount: counts.pendingCount
      }));

      console.log("Daily rendezvous counts:", dailyCounts);
    } else if (critere === 'Consultation') {
      const allConsultations = await db.consultation.findMany();
      console.log("Total consultations fetched from DB:", allConsultations.length);

      const filteredConsultations = allConsultations.filter(consultation => {
        const consultationDate = parseDateString(consultation.date);
        return isDateInRange(consultationDate, startDate, endDate);
      });
      console.log("Filtered consultations within date range:", filteredConsultations.length);

      totalConsultations = filteredConsultations.length;
      revenue = totalConsultations * CONSULTATION_PRICE;
      revenueAfterTax = revenue * (1 - TAX_RATE);

      console.log("Total consultations:", totalConsultations);
      console.log("Revenue before tax:", revenue);
      console.log("Revenue after tax:", revenueAfterTax.toFixed(2));
    } else {
      console.error('Unknown critere:', critere);
      return NextResponse.json({ error: 'Unknown critere' }, { status: 400 });
    }

    const pdfBytes = await createPdf({
      dateDebut,
      dateFin,
      critere,
      totalCount,
      confirmedCount,
      pendingCount,
      dailyCounts,
      totalConsultations,
      revenue,
      revenueAfterTax: revenueAfterTax.toFixed(2),
    });

    console.log("Sending PDF response...");
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rapport.pdf"',
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
};
