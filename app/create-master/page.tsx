"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateMasterPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) {
      alert("Введите имя");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("masters")
      .insert([{ name }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Ошибка при создании");
      return;
    }

    // сохраняем мастера
    localStorage.setItem("master_id", data.id);

    alert("Мастер создан!");

    // редирект в кабинет
    window.location.href = `/dashboard?master_id=${data.id}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Создай свою страницу записи</h1>

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