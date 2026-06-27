"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;

    if (!userId) {
      router.push("/create-master");
      return;
    }

    router.push("/dashboard");
  }, []);

  return <div>Loading...</div>;
}