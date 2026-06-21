import { Suspense } from "react";
import BookPage from "./BookPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookPage />
    </Suspense>
  );
}