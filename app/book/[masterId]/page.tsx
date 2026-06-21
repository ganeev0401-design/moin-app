"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { getTelegramUser } from "@/lib/telegram";

export default function BookPage() {
  const { masterId } = useParams();

  const [master, setMaster] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [tgUser, setTgUser] = useState<any>(null);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [clientName, setClientName] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);

  // -----------------------------
  // LOAD MASTER + SERVICES
  // -----------------------------
  useEffect(() => {
    if (!masterId) return;
    loadMaster();
  }, [masterId]);

  useEffect(() => {
    const user = getTelegramUser();
    setTgUser(user);

    if (user?.first_name) {
      setClientName(user.first_name);
    }
  }, []);


  const loadMaster = async () => {
    const m = await supabase
      .from("masters")
      .select("*")
      .eq("id", masterId)
      .single();

    const s = await supabase
      .from("services")
      .select("*")
      .eq("master_id", masterId);

    setMaster(m.data);
    setServices(s.data || []);
  };

  // -----------------------------
  // GENERATE SLOTS (SIMPLE MVP)
  // -----------------------------
  const generateSlots = () => {
    const WORK_START = 10;
    const WORK_END = 20;

    const result = [];

    for (let h = WORK_START; h < WORK_END; h++) {
      result.push(`${h}:00`);
    }

    setSlots(result);
  };

  // -----------------------------
  // LOAD BOOKINGS FOR DATE
  // -----------------------------
  const loadBookings = async (selectedDate: string) => {
    const res = await supabase
      .from("bookings")
      .select("*")
      .eq("master_id", masterId);

    setBookings(res.data || []);
  };

  // -----------------------------
  // CHECK SLOT
  // -----------------------------
  const isSlotTaken = (time: string) => {
    return bookings.some((b) => {
      const bookingTime = new Date(b.start_time).getHours();
      return `${bookingTime}:00` === time;
    });
  };

  // -----------------------------
  // BOOK APPOINTMENT
  // -----------------------------
  const book = async () => {
    if (!selectedService || !selectedTime || !date || !clientName) return;

    const start = new Date(`${date}T${selectedTime}:00`);

    const end = new Date(start);
    end.setMinutes(
      start.getMinutes() + selectedService.duration_minutes
    );

    const { error } = await supabase.from("bookings").insert({
      master_id: masterId,
      service_id: selectedService.id,
      client_name: clientName,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    if (error) {
      console.log(error);
      return;
    }

    alert("Вы записаны!");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Запись к {master?.name}</h1>

      {/* SERVICES */}
      <h3>Услуги</h3>
      {services.map((s) => (
        <button
          key={s.id}
          onClick={() => setSelectedService(s)}
          style={{
            display: "block",
            marginBottom: 8,
            padding: 10,
            border:
              selectedService?.id === s.id
                ? "2px solid green"
                : "1px solid #ccc",
            background:
              selectedService?.id === s.id ? "#eaffea" : "white",
          }}
        >
          {s.name} — {s.price}₽ — {s.duration_minutes} мин
        </button>
      ))}

      <hr />

      {/* DATE */}
      <h3>Дата</h3>
      <input
        type="date"
        onChange={(e) => {
          setDate(e.target.value);
          loadBookings(e.target.value);
          generateSlots();
          setSelectedTime("");
        }}
      />

      <hr />

      {/* SLOTS */}
      <h3>Время</h3>

      {slots.map((slot) => (
        <button
          key={slot}
          disabled={isSlotTaken(slot)}
          onClick={() => setSelectedTime(slot)}
          style={{
            margin: 5,
            padding: 10,
            background: isSlotTaken(slot)
              ? "#ddd"
              : selectedTime === slot
              ? "#b3e5ff"
              : "white",
            cursor: isSlotTaken(slot) ? "not-allowed" : "pointer",
          }}
        >
          {slot}
        </button>
      ))}

      <hr />

      <h3>Ваше имя</h3>

      <input
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder={
          tgUser
            ? "Имя из Telegram (можно изменить)"
            : "Введите имя"
        }
        style={{ padding: 10 }}
      />

      <br />

      {/* BOOK BUTTON */}
      <button
        onClick={book}
        style={{
          padding: 15,
          background: "black",
          color: "white",
          border: "none",
        }}
      >
        Записаться
      </button>
    </div>
  );
}