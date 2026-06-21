"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ padding: 20 }}>
      <h1>MoniApp MVP</h1>

      <button onClick={() => router.push("/create-master")}>
        Создать профиль мастера
      </button>
    </div>
  );
}