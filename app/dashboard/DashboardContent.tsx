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

  // ✅ берем master_id из URL или localStorage
  const masterId =
    masterIdParam || (typeof window !== "undefined"
      ? localStorage.getItem("master_id")
      : null);

  // ✅ ссылка для клиента
  const botLink = master
  ? `https://t.me/moinhelp_bot?startapp=${master.id}`
  : "";

  useEffect(() => {
    if (!masterId) return;
    localStorage.setItem("master_id", masterId);
    loadData();
  }, [masterId]);

  const loadData = async () => {
    setLoading(true);

    const { data: masterData } = await supabase
      .from("masters")
      .select("*")
      .eq("id", masterId)
      .single();

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("master_id", masterId);

    setMaster(masterData);
    setServices(servicesData || []);

    setLoading(false);
  };

  const addService = async () => {
    if (!serviceName || !price || !duration) {
      alert("Заполни все поля");
      return;
    }

    await supabase.from("services").insert({
      master_id: masterId,
      name: serviceName,
      price: Number(price),
      duration_minutes: Number(duration),
    });

    setServiceName("");
    setPrice("");
    setDuration("");

    alert("Услуга добавлена ✅");

    loadData();
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (!master) return <div style={{ padding: 20 }}>Мастер не найден</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>💼 Твой кабинет мастера</h1>

      <h2>{master.name}</h2>

      {/* 🔥 ГЛАВНОЕ — ССЫЛКА */}
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

      {/* ➕ ДОБАВЛЕНИЕ УСЛУГИ */}
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

      <div>
        <button onClick={addService}>
          ➕ Добавить
        </button>
      </div>

      <hr />

      {/* 📋 СПИСОК УСЛУГ */}
      <h3>Услуги</h3>

      {services.length === 0 && <div>Пока нет услуг</div>}

      {services.map((s) => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <b>{s.name}</b> — {s.price}₽ — {s.duration_minutes} мин
        </div>
      ))}

      <hr />

      {/* 🧠 ONBOARDING */}
      <div style={{ marginTop: 20 }}>
        <h3>Как это работает:</h3>
        <p>1. Добавь услуги</p>
        <p>2. Скопируй ссылку</p>
        <p>3. Отправь клиентам</p>
        <p>4. Получай записи в Telegram 🚀</p>
      </div>
    </div>
  );
}