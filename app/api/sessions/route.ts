import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    // Create a new anonymous session
    const result = await sql`
      INSERT INTO sessions (input_mode)
      VALUES ('chat')
      RETURNING id
    `;

    return NextResponse.json({ sessionId: result[0].id });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
