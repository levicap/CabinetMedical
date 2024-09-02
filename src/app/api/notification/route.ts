import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const isTimeClose = (currentTime: string, appointmentTime: string) => {
  const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
  const [appointmentHours, appointmentMinutes] = appointmentTime.split(':').map(Number);

  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  const appointmentTimeInMinutes = appointmentHours * 60 + appointmentMinutes;

  return (appointmentTimeInMinutes - currentTimeInMinutes <= 15) && (appointmentTimeInMinutes - currentTimeInMinutes >= 0);
};

export const GET = async (req: NextRequest) => {
  try {
    const currentDate = new Date();
    const formattedCurrentDate = formatDate(currentDate);

    // Current time in hh:mm format
    const currentTimeString = currentDate.toTimeString().split(' ')[0].slice(0, 5);

    // Fetch today's rendezvous
    const todaysRendezvous = await db.rendezvous.findMany({
      where: {
        date: formattedCurrentDate,
      },
      include: {
        patient: true,
      },
    });

    // Filter rendezvous that are close (within 15 minutes)
    const upcomingRendezvous = todaysRendezvous.filter(rdv =>
      isTimeClose(currentTimeString, rdv.time)
    );

    // Construct the response for notifications
    const notifications = upcomingRendezvous.map(rdv => ({
      message: `Votre prochain rendez-vous est dans 15 minutes avec ${rdv.patient.nom} ${rdv.patient.prenom}.`,
      rendezvousId: rdv.id,
    }));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching upcoming rendezvous:', error);
    return NextResponse.json({ error: 'Error fetching upcoming rendezvous' }, { status: 500 });
  }
};
