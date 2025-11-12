"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

export function useRazorpay() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.Razorpay) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setIsReady(true);
    };

    script.onerror = () => {
      setError("Failed to load Razorpay checkout. Please try again later.");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { isReady, error };
}

