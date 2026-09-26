
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
          error:
            "Thiếu API key hoặc prompt"
        },
        { status: 400 }
      );
    }

    // OpenAI / OpenAI-compatible
    if (provider === "openai") {
      const res = await fetch(
        `${String(baseUrl).replace(
          /\/$/,
          ""
        )}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
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
        text:
          data?.choices?.[0]?.message
            ?.content ||
          JSON.stringify(data)
      });
    }

    // Claude
    if (provider === "claude") {
      const res = await fetch(
        `${String(baseUrl).replace(
          /\/$/,
          ""
        )}/v1/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version":
              "2023-06-01"
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
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
        text:
          data?.content
            ?.map(
              (x: any) => x.text || ""
            )
            .join("") ||
          JSON.stringify(data)
      });
    }

    // Gemini
    if (provider === "gemini") {
      const url =
        `${String(baseUrl).replace(
          /\/$/,
          ""
        )}/models/` +
        `${encodeURIComponent(
          model
        )}:generateContent?key=` +
        `${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
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
        text:
          data?.candidates?.[0]
            ?.content?.parts
            ?.map(
              (x: any) => x.text || ""
            )
            .join("") ||
          JSON.stringify(data)
      });
    }

    // Custom / OpenAI-compatible
    const res = await fetch(
      `${String(baseUrl).replace(
        /\/$/,
        ""
      )}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
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
      text:
        data?.choices?.[0]?.message
          ?.content ||
        JSON.stringify(data)
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
