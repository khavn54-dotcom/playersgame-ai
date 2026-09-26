import { NextRequest, NextResponse } from "next/server";

function cleanUrl(url: string) {
  return String(url).replace(/\/$/, "");
}

function getField(
  result: any,
  names: string[]
): string {
  if (!result || typeof result !== "object") {
    return "";
  }

  for (const name of names) {
    const value = result[name];

    if (
      (typeof value === "string" ||
        typeof value === "number") &&
      String(value).trim()
    ) {
      return String(value).trim();
    }
  }

  for (const key of [
    "data",
    "task",
    "result",
    "content",
    "output"
  ]) {
    const value = getField(
      result[key],
      names
    );

    if (value) {
      return value;
    }
  }

  return "";
}

export async function POST(
  req: NextRequest
) {
  try {
    const {
      provider,
      baseUrl,
      model,
      apiKey,
      prompt,
      duration,
      resolution,
      ratio
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
          error: "Thiếu Base URL"
        },
        { status: 400 }
      );
    }

    const base = cleanUrl(baseUrl);

    // Qiandream Video API
    if (
      provider === "video" ||
      provider === "qiandream" ||
      base.includes("qiandream.com")
    ) {
      const res = await fetch(
        `${base}/v1/video/generations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            model:
              model || "seedance-2.0-mini",
            prompt,
            duration:
              duration || 5,
            resolution:
              resolution || "720p",
            ratio:
              ratio || "16:9"
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          {
            error:
              data?.error?.message ||
              data?.message ||
              JSON.stringify(data)
          },
          { status: res.status }
        );
      }

      const taskId = getField(
        data,
        [
          "task_id",
          "taskId",
          "id"
        ]
      );

      if (!taskId) {
        return NextResponse.json({
          data,
          message:
            "API không trả về task ID"
        });
      }

      return NextResponse.json({
        taskId,
        status:
          getField(data, [
            "status",
            "task_status",
            "taskStatus",
            "state"
          ]) || "processing",
        data
      });
    }

    // Generic video API
    const res = await fetch(
      `${base}/videos/generations`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          prompt
        })
      }
    );

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
