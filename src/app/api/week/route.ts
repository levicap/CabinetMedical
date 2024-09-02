import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import path according to your project structure

// Helper function to parse a date string formatted as 'dd-mm-yyyy'
const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  console.log(`Parsed Date: ${parsedDate.toDateString()} from ${dateString}`);
  return parsedDate;
};

// Helper function to get the start and end dates for the week
const getStartAndEndDates = (weekStart: string) => {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // End date is 6 days after start date
  console.log(`Week Start Date: ${startDate.toDateString()}`);
  console.log(`Week End Date: ${endDate.toDateString()}`);
  return { startDate, endDate };
};

// Map day numbers to day names
const dayOfWeekMap = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

// Aggregates data by day of the week
const aggregateDataByDay = (data: { date: string }[], startDate: Date, endDate: Date) => {
  const formattedData: { [key: string]: number } = {};

  data.forEach(entry => {
    const entryDate = parseDateString(entry.date); // Use date field for parsing

    // Debug log for entry date and filtering
    console.log(`Processing entry date: ${entryDate.toDateString()}`);
    console.log(`Start Date: ${startDate.toDateString()}`);
    console.log(`End Date: ${endDate.toDateString()}`);

    if (entryDate >= startDate && entryDate <= endDate) {
      const dayOfWeek = entryDate.getDay();
      const dayLabel = dayOfWeekMap[dayOfWeek];
      formattedData[dayLabel] = (formattedData[dayLabel] || 0) + 1;
    }
  });

  return formattedData;
};

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const weekStart = searchParams.get("weekStart"); // e.g., '2024-08-24'

    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart query parameter is required' }, { status: 400 });
    }

    console.log("Fetching data from the database...");

    const { startDate, endDate } = getStartAndEndDates(weekStart);

    const rendezvous = await db.rendezvous.findMany();
    const consultations = await db.consultation.findMany();
    
    // Debug logs for fetched data
    console.log("Rendezvous Data:", rendezvous);
    console.log("Consultations Data:", consultations);

    const rendezvousByDay = aggregateDataByDay(rendezvous, startDate, endDate);
    const consultationByDay = aggregateDataByDay(consultations, startDate, endDate);
    
    // Debug logs for aggregated data
    console.log("Rendezvous By Day:", rendezvousByDay);
    console.log("Consultation By Day:", consultationByDay);

    return NextResponse.json({
      rendezvousByDay,
      consultationByDay,
    });
  } catch (error) {
    console.error("Error fetching aggregated counts:", error.message);
    return NextResponse.json({ error: 'Error fetching aggregated counts' }, { status: 500 });
  }
};
