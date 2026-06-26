"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateMasterPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);

  // 💡 получаем Telegram user
  useEffect(() => {
  const tg =
    typeof window !== "undefined"
      ? (window as any).Telegram?.WebApp
      : null;

  if (!tg) return;

  tg.ready();
  tg.expand();

  const tryGetUser = () => {
    const user = tg.initDataUnsafe?.user;

    if (user?.id) {
      setTelegramId(String(user.id));
      console.log("✅ Telegram user:", user.id);
    } else {
      console.log("⏳ Waiting for Telegram user...");
      setTimeout(tryGetUser, 300);
    }
  };

  tryGetUser();
}, []);
  

  const handleCreate = async () => {
    if (!name) {
      alert("Введите имя");
      return;
    }

    setLoading(true);

    // 💥 ВАЖНО: защита от дублей (если уже есть мастер)
    if (telegramId) {
      const { data: existing } = await supabase
        .from("masters")
        .select("*")
        .eq("telegram_id", telegramId)
        .maybeSingle();

      if (existing) {
        localStorage.setItem("master_id", existing.id);
        window.location.href = `/dashboard?master_id=${existing.id}`;
        return;
      }
    }

    // 💡 создаём мастера
    const { data, error } = await supabase
      .from("masters")
      .insert([
        {
          name,
          telegram_id: telegramId, // 🔥 ВОТ ГЛАВНЫЙ ФИКС
        },
      ])
      .select()
      .single();

    setLoading(false);

    console.log("TG OBJECT:", (window as any).Telegram?.WebApp);
    console.log("USER:", (window as any).Telegram?.WebApp?.initDataUnsafe?.user);

    if (error) {
      console.log(error);
      alert("Ошибка при создании");
      return;
    }

    // 💾 сохраняем локально
    localStorage.setItem("master_id", data.id);

    alert("Мастер создан!");

    // 🚀 переход в кабинет
    window.location.href = `/dashboard?master_id=${data.id}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Создай свою страницу записи</h1>

      {!telegramId && (
        <div style={{ color: "red", marginBottom: 10 }}>
          ⚠️ Открой это внутри Telegram Mini App
        </div>
      )}

      <input
        placeholder="Твоё имя (например: Алина)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          display: "block",
          marginBottom: 10,
          padding: 10,
          width: "100%",
        }}
      />

      <button onClick={handleCreate} disabled={loading}>
        {loading ? "Создаем..." : "Создать профиль"}
      </button>
    </div>
  );
}