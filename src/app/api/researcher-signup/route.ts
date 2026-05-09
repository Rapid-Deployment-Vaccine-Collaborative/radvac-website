import { NextResponse } from "next/server";

interface ResearcherSignup {
  identifier: string;
  email: string;
  city: string;
  state: string;
  country: string;
  scienceDegree?: "Yes" | "No" | "";
  labSkills?: "Yes" | "No" | "";
  labSpace?: "Yes" | "No" | "";
  otherInfo?: string;
  securityQuestion: string;
  acceptance: boolean;
}

export async function POST(request: Request) {
  try {
    const data: ResearcherSignup = await request.json();

    const required: (keyof ResearcherSignup)[] = [
      "identifier",
      "email",
      "city",
      "state",
      "country",
      "securityQuestion",
    ];
    for (const f of required) {
      if (!data[f] || String(data[f]).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 }
        );
      }
    }

    if (!data.acceptance) {
      return NextResponse.json(
        { error: "You must accept the public-visibility notice." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.) and/or persist
    // for an admin to add to src/data/researchers.ts.
    console.log("Researcher signup:", {
      ...data,
      otherInfo: data.otherInfo?.substring(0, 200),
      timestamp: new Date().toISOString(),
    });

    // Example Resend integration (uncomment when ready):
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'RaDVaC Website <noreply@radvac.org>',
    //   to: ['info@radvac.org'],
    //   replyTo: data.email,
    //   subject: `[Researchers Map] New signup: ${data.identifier}`,
    //   text: [
    //     `Identifier: ${data.identifier}`,
    //     `Email: ${data.email}`,
    //     `Location: ${data.city}, ${data.state}, ${data.country}`,
    //     `Science degree: ${data.scienceDegree || '-'}`,
    //     `Lab skills:    ${data.labSkills || '-'}`,
    //     `Lab space:     ${data.labSpace || '-'}`,
    //     `Other info: ${data.otherInfo || '-'}`,
    //     `Security answer: ${data.securityQuestion}`,
    //   ].join('\n'),
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
