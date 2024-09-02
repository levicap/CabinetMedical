import { db } from '@/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Retrieve all events
export async function GET(request: NextRequest) {
  try {
    const events = await db.event.findMany();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.error();
  }
}

// POST: Create a new event
export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { title, doctor, start, end } = body;
  
      // Validate input if necessary
      if (!title || !doctor || !start || !end) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
  
      const newEvent = await prisma.event.create({
        data: {
          title,
          doctor,
          start: new Date(start),
          end: new Date(end),
        },
      });
  
      return NextResponse.json(newEvent);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
  }

// PUT: Update an existing event
export async function PUT(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      const body = await request.json();
  
      if (!id) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
      }
  
      // Destructure the required fields from the request body
      const { title, doctor, start, end } = body;
  
      // Prepare the data object for updating
      const updateData = { title, doctor, start, end };
  
      const event = await db.event.update({
        where: { id: id },
        data: updateData,
      });
  
      return NextResponse.json(event);
    } catch (error) {
      console.error('Failed to update event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
  }
  

// DELETE: Delete an event by ID
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    await db.event.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.error();
  }
}
