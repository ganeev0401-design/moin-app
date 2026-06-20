"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const masterId = searchParams.get("master_id");

  const [master, setMaster] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!masterId) return;
    loadData();
  }, [masterId]);

  const loadData = async () => {
    const masterRes = await supabase
      .from("masters")
      .select("*")
      .eq("id", masterId)
      .single();

    const servicesRes = await supabase
      .from("services")
      .select("*")
      .eq("master_id", masterId);

    setMaster(masterRes.data);
    setServices(servicesRes.data || []);
  };

  const addService = async () => {
    await supabase.from("services").insert({
      master_id: masterId,
      name: serviceName,
      price: Number(price),
      duration_minutes: Number(duration),
    });

    setServiceName("");
    setPrice("");
    setDuration("");

    loadData();
  };

  if (!master) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard мастера</h1>

      <h2>{master.name}</h2>

      <hr />

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

      <button onClick={addService}>
        Добавить
      </button>

      <hr />

      <h3>Услуги</h3>

      {services.map((s) => (
        <div key={s.id}>
          {s.name} — {s.price}₽ — {s.duration_minutes} мин
        </div>
      ))}
    </div>
  );
}