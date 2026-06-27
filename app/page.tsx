"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const tg = (window as any).Telegram?.WebApp;

      tg?.ready();
      tg?.expand();

      const userId = tg?.initDataUnsafe?.user?.id;

      console.log("TG USER:", userId);

      // ❗ нет Telegram → create master
      if (!userId) {
        router.replace("/create-master");
        return;
      }

      // 🔍 проверяем есть ли мастер
      const { data } = await supabase
        .from("masters")
        .select("*")
        .eq("telegram_id", userId)
        .maybeSingle();

      console.log("MASTER CHECK:", data);

      if (data) {
        router.replace("/dashboard");
      } else {
        router.replace("/create-master");
      }
    };

    run();
  }, []);

  return <div>Loading...</div>;
}