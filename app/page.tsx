"use client";

import { useEffect, useMemo, useState } from "react";

type Provider = {
  id: string;
  name: string;
  kind: "chat" | "image" | "video";
  baseUrl: string;
  model: string;
  key: string;
};

const defaults: Provider[] = [
  {
    id: "openai",
    name: "OpenAI / ChatGPT",
    kind: "chat",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    key: ""
  },
  {
    id: "claude",
    name: "Claude",
    kind: "chat",
    baseUrl: "https://api.anthropic.com",
    model: "claude-3-5-sonnet-latest",
    key: ""
  },
  {
    id: "gemini",
    name: "Gemini",
    kind: "chat",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
    key: ""
  },
  {
    id: "image",
    name: "OpenAI Image",
    kind: "image",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-image-1",
    key: ""
  },
  {
    id: "video",
    name: "Custom Video / Seedance / Omni",
    kind: "video",
    baseUrl: "",
    model: "",
    key: ""
  }
];

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>(defaults);
  const [tab, setTab] = useState<
    "chat" | "image" | "video" | "settings"
  >("chat");

  const [selected, setSelected] = useState("openai");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("playersgame_ai_keys");
    const hist = localStorage.getItem("playersgame_ai_history");

    if (saved) {
      setProviders(JSON.parse(saved));
    }

    if (hist) {
      setHistory(JSON.parse(hist));
    }
  }, []);

  const current = useMemo(
    () =>
      providers.find((p) => p.id === selected) ||
      providers[0],
    [providers, selected]
  );

  function saveProviders(next: Provider[]) {
    setProviders(next);
    localStorage.setItem(
      "playersgame_ai_keys",
      JSON.stringify(next)
    );
  }

  function updateProvider(
    id: string,
    patch: Partial<Provider>
  ) {
    saveProviders(
      providers.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      )
    );
  }

  async function run() {
    if (!prompt.trim()) return;

    if (!current.key) {
      setAnswer(
        "Hãy vào ⚙ API Keys và nhập API key trước."
      );
      setTab("settings");
      return;
    }

    setBusy(true);
    setAnswer("");

    try {
      const endpoint =
        tab === "chat"
          ? "/api/chat"
          : tab === "image"
          ? "/api/image"
          : "/api/video";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: current.id,
          baseUrl: current.baseUrl,
          model: current.model,
          apiKey: current.key,
          prompt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "API request failed"
        );
      }

      setAnswer(
        data.text ||
          data.url ||
          JSON.stringify(data, null, 2)
      );

      const nextHistory = [
        prompt,
        ...history
      ].slice(0, 30);

      setHistory(nextHistory);

      localStorage.setItem(
        "playersgame_ai_history",
        JSON.stringify(nextHistory)
      );
    } catch (e: any) {
      setAnswer(
        "Lỗi: " +
          (e?.message || "Không xác định")
      );
    } finally {
      setBusy(false);
    }
  }

  const chatProviders = providers.filter(
    (p) => p.kind === "chat"
  );

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">PG</div>

          <div>
            <b>PLAYERSGAME AI</b>
            <span>AI Studio</span>
          </div>
        </div>

        <nav>
          <button
            className={
              tab === "chat"
                ? "nav active"
                : "nav"
            }
            onClick={() => {
              setTab("chat");
              setSelected(
                chatProviders[0]?.id ||
                  "openai"
              );
            }}
          >
            💬 Chat
          </button>

          <button
            className={
              tab === "image"
                ? "nav active"
                : "nav"
            }
            onClick={() => {
              setTab("image");
              setSelected("image");
            }}
          >
            🎨 Tạo ảnh
          </button>

          <button
            className={
              tab === "video"
                ? "nav active"
                : "nav"
            }
            onClick={() => {
              setTab("video");
              setSelected("video");
            }}
          >
            🎬 Tạo video
          </button>

          <button
            className={
              tab === "settings"
                ? "nav active"
                : "nav"
            }
            onClick={() =>
              setTab("settings")
            }
          >
            ⚙ API Keys
          </button>
        </nav>

        <div className="sideBottom">
          <div className="mini">
            Miễn phí hosting
            <br />
            Không cần mua domain
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>
              Chào mừng đến với AI của Playersgame
            </h1>

            <p>
              Chat, tạo ảnh và kết nối các AI
              model bằng API key của bạn.
            </p>
          </div>

          <button
            className="settingsBtn"
            onClick={() => setTab("settings")}
          >
            🔑 API
          </button>
        </header>

        {tab === "settings" ? (
          <div className="card settings">
            <h2>🔑 Kết nối API</h2>

            <p className="muted">
              API key được lưu trong trình
              duyệt của bạn ở V1. Không chia sẻ
              key cho người khác.
            </p>

            {providers.map((p) => (
              <div
                className="provider"
                key={p.id}
              >
                <div className="providerTitle">
                  <b>{p.name}</b>
                  <span>{p.kind}</span>
                </div>

                <label>API Key</label>

                <input
                  type="password"
                  value={p.key}
                  onChange={(e) =>
                    updateProvider(
                      p.id,
                      {
                        key: e.target.value
                      }
                    )
                  }
                  placeholder="Dán API key tại đây..."
                />

                <div className="two">
                  <div>
                    <label>Base URL</label>

                    <input
                      value={p.baseUrl}
                      onChange={(e) =>
                        updateProvider(
                          p.id,
                          {
                            baseUrl:
                              e.target.value
                          }
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label>Model</label>

                    <input
                      value={p.model}
                      onChange={(e) =>
                        updateProvider(
                          p.id,
                          {
                            model:
                              e.target.value
                          }
                        )
                      }
                      placeholder="model-name"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="notice">
              Custom Base URL cho phép kết
              nối các gateway/OpenAI-compatible
              API của bên thứ ba. Endpoint video
              tùy nhà cung cấp.
            </div>
          </div>
        ) : (
          <div className="workspace">
            <div className="toolbar">
              <label>Model</label>

              <select
                value={selected}
                onChange={(e) =>
                  setSelected(e.target.value)
                }
              >
                {(
                  tab === "chat"
                    ? chatProviders
                    : providers.filter(
                        (p) =>
                          p.kind === tab ||
                          (tab === "video" &&
                            p.id === "video")
                      )
                ).map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.name} —{" "}
                    {p.model || "custom"}
                  </option>
                ))}
              </select>

              <span className="status">
                {current.key
                  ? "● Đã nhập key"
                  : "○ Chưa có key"}
              </span>
            </div>

            <div className="welcome">
              <div className="welcomeIcon">
                {tab === "chat"
                  ? "💬"
                  : tab === "image"
                  ? "🎨"
                  : "🎬"}
              </div>

              <h2>
                {tab === "chat"
                  ? "Bạn muốn hỏi gì?"
                  : tab === "image"
                  ? "Tạo hình ảnh bằng AI"
                  : "Tạo video bằng AI"}
              </h2>

              <p>
                {tab === "chat"
                  ? "Nhập yêu cầu bên dưới để bắt đầu."
                  : "Mô tả nội dung bạn muốn tạo."}
              </p>
            </div>

            <div className="result">
              {busy ? (
                <div className="loading">
                  Đang xử lý…
                </div>
              ) : answer ? (
                <pre>{answer}</pre>
              ) : (
                <div className="empty">
                  Kết quả sẽ hiển thị ở đây.
                </div>
              )}
            </div>

            <div className="composer">
              <textarea
                value={prompt}
                onChange={(e) =>
                  setPrompt(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    run();
                  }
                }}
                placeholder={
                  tab === "chat"
                    ? "Nhập câu hỏi..."
                    : tab === "image"
                    ? "Mô tả hình ảnh muốn tạo..."
                    : "Mô tả video muốn tạo..."
                }
              />

              <button
                onClick={run}
                disabled={busy}
              >
                {busy ? "..." : "➤"}
              </button>
            </div>

            <div className="hint">
              Enter để gửi • Shift + Enter
              xuống dòng
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
