"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const masterIdParam = searchParams.get("master_id");

  const [master, setMaster] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  // Telegram user
  const tg =
    typeof window !== "undefined"
      ? (window as any).Telegram?.WebApp
      : null;

  const telegramId = tg?.initDataUnsafe?.user?.id;

  const loadData = async (id: string) => {
    const { data: masterData } = await supabase
      .from("masters")
      .select("*")
      .eq("id", id)
      .single();

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("master_id", id);

    setMaster(masterData);
    setServices(servicesData || []);
    setLoading(false);
  };

  const init = async () => {
    setLoading(true);

    let currentMasterId: string | null = masterIdParam;

    // 1. ищем по Telegram
    if (!currentMasterId && telegramId) {
      const { data } = await supabase
        .from("masters")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      if (data) {
        currentMasterId = data.id;
        localStorage.setItem("master_id", data.id);
      }
    }

    // 2. fallback localStorage
    if (!currentMasterId) {
      const saved = localStorage.getItem("master_id");
      if (saved) currentMasterId = saved;
    }

    // 3. если нет мастера
    if (!currentMasterId) {
      setLoading(false);
      return;
    }

    localStorage.setItem("master_id", currentMasterId);

    await loadData(currentMasterId);
  };

  useEffect(() => {
    init();
  }, []);

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

  const botLink = master
    ? `https://t.me/moinhelp_bot?startapp=${master.id}`
    : "";

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  if (!master) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Создай свою страницу записи</h2>
        <p>Похоже, у тебя ещё нет профиля мастера</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>💼 Твой кабинет мастера</h1>

      <h2>{master.name}</h2>

      {/* 🔗 ССЫЛКА */}
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

      {/* ➕ УСЛУГИ */}
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

      {/* 📋 СПИСОК */}
      <h3>Услуги</h3>

      {services.length === 0 && <div>Пока нет услуг</div>}

      {services.map((s) => (
        <div key={s.id}>
          <b>{s.name}</b> — {s.price}₽ — {s.duration_minutes} мин
        </div>
      ))}

      <hr />

      {/* 🧠 ИНСТРУКЦИЯ */}
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