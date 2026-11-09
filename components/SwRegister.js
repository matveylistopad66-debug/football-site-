"use client";

import { useEffect } from "react";

// Регистрирует служебный файл, чтобы сайт можно было установить на экран телефона
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
