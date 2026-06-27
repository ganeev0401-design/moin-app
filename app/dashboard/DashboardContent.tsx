"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function DashboardContent() {
  const masterIdParam = null;

  const [master, setMaster] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const [booting, setBooting] = useState(true);

  

  // ✅ Telegram ID теперь через state (ВАЖНО FIX)
  const [telegramId, setTelegramId] = useState<string | null>(null);

  // =========================
  // 🔥 TELEGRAM INIT FIX
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tg = (window as any).Telegram?.WebApp;

    tg?.ready();
    tg?.expand();

    const userId = tg?.initDataUnsafe?.user?.id;

    if (userId) {
      setTelegramId(userId);
    } else {
      setBooting(false);
    }
  }, []);

  // =========================
  // 📦 LOAD MASTER + SERVICES
  // =========================
  const loadData = async (id: string) => {
    const { data: masterData } = await supabase
      .from("masters")
      .select("*")
      .eq("id", id)
      .single();
      console.log("LOAD MASTER ID:", id);

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("master_id", id);

    setMaster(masterData);
    setServices(servicesData || []);
    setLoading(false);
  };

  // =========================
  // 🚀 INIT LOGIC FIXED
  // =========================
 const init = async (tgUserId: string | null) => {
  setLoading(true);

  let currentMasterId: string | null = null;

  console.log("TG USER:", tgUserId);
  console.log("PARAM:", masterIdParam);

  // 1. ИЩЕМ ПО TELEGRAM ID → ПОЛУЧАЕМ UUID
  if (tgUserId) {
    const { data } = await supabase
      .from("masters")
      .select("*")
      .eq("telegram_id", tgUserId)
      .single();

    if (data) {
      currentMasterId = data.id; // ⚠️ ВОТ ЭТО КЛЮЧ
      localStorage.setItem("master_id", data.id);
    }
  }

  // 2. PARAM = UUID мастера (НЕ telegram_id)
  if (!currentMasterId && masterIdParam) {
    currentMasterId = masterIdParam;
  }

  // 3. fallback
  if (!currentMasterId) {
    const saved = localStorage.getItem("master_id");
    if (saved) currentMasterId = saved;
  }

  console.log("FINAL MASTER ID:", currentMasterId);

  if (!currentMasterId) {
    setLoading(false);
    return;
  }

  await loadData(currentMasterId);

  setBooting(false);
  setLoading(false);
};

  // ⚠️ FIX: init ждёт telegramId
  useEffect(() => {
      if (telegramId !== null) {
        init(telegramId);
      }
    }, [telegramId]);

  // =========================
  // ➕ ADD SERVICE
  // =========================
  const addService = async () => {
    if (!serviceName || !price || !duration) {
      alert("Заполни все поля");
      return;
    }

    await supabase.from("services").insert({
      master_id: master.id,
      name: serviceName,
      price: Number(price),
      duration_minutes: Number(duration),
    });

    setServiceName("");
    setPrice("");
    setDuration("");

    alert("Услуга добавлена ✅");

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("master_id", master.id);

    setServices(servicesData || []);
  };

  // =========================
  // 🔗 BOT LINK FIX
  // =========================
  const botLink = master
    ? `https://t.me/MoinHelh_bot?startapp=${master.id}`
    : "";

  // =========================
  // LOADING STATE
  // =========================
  if (booting || loading) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  // =========================
  // NO MASTER STATE
  // =========================
  if (!master) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Создай свою страницу записи</h2>
        <p>Похоже, у тебя ещё нет профиля мастера</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h1>💼 Твой кабинет мастера</h1>

      <h2>{master.name}</h2>

      {/* 🔗 LINK */}
      <div style={{ marginTop: 20 }}>
        <h3>🔗 Твоя ссылка для клиентов</h3>

        <div style={{ padding: 10, background: "#f5f5f5" }}>
          <a href={botLink} target="_blank">
            {botLink}
          </a>
        </div>

        <button
          disabled={!botLink}
          onClick={() => {
            navigator.clipboard.writeText(botLink);
            alert("Ссылка скопирована!");
          }}
          style={{ marginTop: 10 }}
        >
          📋 Скопировать ссылку
        </button>
      </div>

      <hr />

      {/* ➕ SERVICES */}
      <h3>Добавить услугу</h3>

      <input
        placeholder="Название"
        value={serviceName}
        onChange={(e) => setServiceName(e.target.value)}
      />

      <input
        placeholder="Цена"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="Длительность (мин)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <button onClick={addService}>➕ Добавить</button>

      <hr />

      {/* 📋 LIST */}
      <h3>Услуги</h3>

      {services.length === 0 && <div>Пока нет услуг</div>}

      {services.map((s) => (
        <div key={s.id}>
          <b>{s.name}</b> — {s.price}₽ — {s.duration_minutes} мин
        </div>
      ))}

      <hr />

      {/* 🧠 HELP */}
      <div>
        <h3>Как это работает:</h3>
        <p>1. Добавь услуги</p>
        <p>2. Скопируй ссылку</p>
        <p>3. Отправь клиентам</p>
        <p>4. Получай записи в Telegram 🚀</p>
      </div>
    </div>
  );
}