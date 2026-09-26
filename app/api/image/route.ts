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

    const url =
      `${String(baseUrl).replace(/\/$/, "")}/images/generations`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: "1024x1024"
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

    const image =
      data?.data?.[0]?.url ||
      data?.data?.[0]?.b64_json ||
      "";

    return NextResponse.json({
      image
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
