import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { chatId, text } = body;

    if (!chatId || !text) {
      return NextResponse.json(
        { error: "Missing chatId or text" },
        { status: 400 }
      );
    }

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    const data = await telegramRes.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}