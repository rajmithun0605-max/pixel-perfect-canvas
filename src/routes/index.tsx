import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The real competition project is a pure HTML/CSS/JS app served from
// /public/site/. The index route redirects to it so the preview shows
// the actual deliverable.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chrona — Letters to your future self" },
      {
        name: "description",
        content:
          "A personal time capsule. Write letters to your future self, seal memories, and rediscover them when the time is right.",
      },
      { property: "og:title", content: "Chrona — Letters to your future self" },
      {
        property: "og:description",
        content: "A quiet home for your memories. Seal them today, open them tomorrow.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#faf7f2", color: "#1a1a1a", fontFamily: "system-ui, sans-serif" }}>
      <p>Opening Chrona…</p>
    </div>
  );
}
