"use client";

import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <DashboardContent />
    </Suspense>
  );
}