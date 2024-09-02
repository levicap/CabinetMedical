import twilio from 'twilio';
import { NextRequest, NextResponse } from 'next/server';


const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);
export async function POST(req: NextRequest) {
    try {
      const { phoneNumber, message } = await req.json();
  
      // Validate input
      if (!phoneNumber || !message) {
        return new NextResponse(JSON.stringify({ error: 'Phone number and message are required' }), { status: 400 });
      }
  
      // Send SMS using Twilio
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
  
      return new NextResponse(JSON.stringify({ success: true, messageSid: response.sid }), { status: 200 });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }