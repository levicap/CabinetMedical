// /app/api/chart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import path according to your project structure

const parseDateString = (dateString) => {
  const [day, month, year] = dateString.split('-');
  return {
    day: parseInt(day, 10),
    month: parseInt(month, 10),
    year: parseInt(year, 10),
  };
};

// Helper function to aggregate data by month
const aggregateDataByMonth = (data) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedData = {};
  months.forEach(month => formattedData[month] = 0);
  
  data.forEach(entry => {
    const { month } = parseDateString(entry.date);
    const monthName = months[month - 1];
    formattedData[monthName] = (formattedData[monthName] || 0) + 1; // Assuming count per entry
  });
  
  return formattedData;
};

// Action to get aggregated counts for all entities
export const GET = async (req: NextRequest) => {
  try {
    console.log("Fetching data from the database...");
    
    // Fetch all entries for rendezvous and consultation
    const rendezvous = await db.rendezvous.findMany();
    const consultations = await db.consultation.findMany();

    console.log("Data fetched successfully");

    return NextResponse.json({
      rendezvousByMonth: aggregateDataByMonth(rendezvous),
      consultationByMonth: aggregateDataByMonth(consultations),
    });
  } catch (error) {
    console.error("Error fetching aggregated counts:", error.message);
    return NextResponse.json({ error: 'Error fetching aggregated counts' }, { status: 500 });
  }
};
