"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.from("masters").select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    check();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test Page</h1>
      <p>Открой консоль (DevTools)</p>
    </div>
  );
}