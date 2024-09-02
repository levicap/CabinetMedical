import { Resend } from 'resend';
import { NextRequest, NextResponse } from "next/server";


const resend = new Resend(process.env.RESENDAPIKEY);

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json(); 
    console.log(req.json())// Extract email, username, and password from the request body

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email, // Send to the email provided in the request
      subject: 'Your Credentials',
      html: `
        <h1>salut ${username},c est Cabinet Medical </h1>
        <p>votre compte a ete cree. voici credentials:</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>faire attention a votre login</p>
      `,
    });

    if (error) {
      return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }

    return new NextResponse(JSON.stringify(data));
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

