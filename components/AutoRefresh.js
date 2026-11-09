"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Раз в минуту незаметно обновляет данные страницы, пока вкладка открыта.
// Показывается только когда на странице есть идущий матч (active = true).
export default function AutoRefresh({ active, label, seconds = 60 }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [active, seconds, router]);
  if (!active) return null;
  return (
    <p className="muted small autoref">
      <span className="livedot" /> {label}
    </p>
  );
}
