import { NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log the submission
    console.log("Contact form submission:", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message.substring(0, 100) + "...",
      timestamp: new Date().toISOString(),
    });

    // Example Resend integration (uncomment when ready):
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'RaDVaC Website <noreply@radvac.org>',
    //   to: ['info@radvac.org'],
    //   replyTo: data.email,
    //   subject: `[Contact Form] ${data.subject}`,
    //   text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
