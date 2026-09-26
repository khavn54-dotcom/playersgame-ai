import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      provider,
      baseUrl,
      model,
      apiKey,
      prompt
    } = await req.json();

    if (!apiKey || !prompt) {
      return NextResponse.json(
        {
          error: "Thiếu API key hoặc prompt"
        },
        { status: 400 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        {
          error: "Chưa nhập Base URL của API video"
        },
        { status: 400 }
      );
    }

    const url =
      `${String(baseUrl).replace(/\/$/, "")}/videos/generations`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            JSON.stringify(data)
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Server error"
      },
      { status: 500 }
    );
  }
}
