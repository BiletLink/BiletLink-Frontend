"use client";

import { AlertTriangle } from "lucide-react";

export default function MaintenanceBanner() {
  return (
    <div className="bg-amber-600 text-white px-4 py-3 shadow-lg relative z-50">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <p className="font-medium text-center text-sm md:text-base">
          Sistemlerimizde planlı bakım çalışması yapılmaktadır. Etkinlik verileri kısa süreliğine görüntülenemeyebilir.
        </p>
      </div>
    </div>
  );
}
