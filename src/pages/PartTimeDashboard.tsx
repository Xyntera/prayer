import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import type { PrayerKey } from "../prayers";

type RequestDoc = {
  id: string;
  masjidName: string;
  masjidLocation: string;
  masjidMapLink?: string;
  dateFrom: string;
  dateTo: string;
  prayers: PrayerKey[];
  amountType: string;
  amountValue: number;
  imamPhone: string;
  imamWhatsapp?: string;
  paymentInfo?: string;
};

const PartTimeDashboard: React.FC = () => {
  const user = auth.currentUser;
  const nav = useNavigate();
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }

    const q = query(
      collection(db, "requests"),
      where("status", "==", "OPEN")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: RequestDoc[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        list.push({
          id: docSnap.id,
          masjidName: data.masjidName,
          masjidLocation: data.masjidLocation,
          masjidMapLink: data.masjidMapLink,
          dateFrom: data.dateFrom,
          dateTo: data.dateTo,
          prayers: data.prayers ?? [],
          amountType: data.amountType,
          amountValue: data.amountValue,
          imamPhone: data.imamPhone,
          imamWhatsapp: data.imamWhatsapp,
          paymentInfo: data.paymentInfo,
        });
      });
      setRequests(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user, nav]);

  const openCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // WhatsApp imam with auto-filled message including part-time imam profile info
  const handleWhatsAppImam = async (req: RequestDoc) => {
    if (!user) {
      nav("/login");
      return;
    }

    const imamNumberRaw = req.imamWhatsapp || req.imamPhone;
    if (!imamNumberRaw) {
      alert("Imam has not provided a WhatsApp or phone number.");
      return;
    }
    const imamNumber = imamNumberRaw.replace(/[^0-9]/g, "");

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const profile = (userSnap.exists() ? userSnap.data() : {}) as any;

      const ptName =
        profile.name || user.displayName || user.email || "Part-time imam";
      const ptPhone = profile.phone || user.phoneNumber || "Not provided";
      const ptWhatsapp = profile.whatsapp || ptPhone;
      const ptLocation = profile.location || "Not specified";

      const prayersText =
        req.prayers && req.prayers.length > 0
          ? req.prayers.join(", ")
          : "Not specified";

      const amountText = `₹${req.amountValue} (${req.amountType})`;

      const message = [
        "Assalamu alaikum,",
        "",
        `I am ${ptName}, a part-time imam using the Masjid Connect app.`,
        "",
        "I am interested in helping with your request:",
        `• Masjid: ${req.masjidName}`,
        `• Location: ${req.masjidLocation}`,
        `• Dates: ${req.dateFrom} → ${req.dateTo}`,
        `• Prayers: ${prayersText}`,
        `• Amount: ${amountText}`,
        "",
        "My details:",
        `• Name: ${ptName}`,
        `• Phone: ${ptPhone}`,
        `• WhatsApp: ${ptWhatsapp}`,
        `• Location: ${ptLocation}`,
        "",
        "Please let me know if this is suitable for you.",
      ].join("\n");

      const url = `https://wa.me/${imamNumber}?text=${encodeURIComponent(
        message
      )}`;

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Could not prepare WhatsApp message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Available requests
        </h1>
        <p className="text-sm text-slate-600">
          Check details and contact the imam directly on WhatsApp or call.
        </p>
      </div>

      {requests.length === 0 && (
        <p className="rounded-lg border border-dashed border-emerald-200 bg-white p-4 text-sm text-slate-500">
          No open requests right now. Please check again later.
        </p>
      )}

      <div className="grid gap-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="rounded-3xl border border-emerald-50 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {req.masjidName}
                </h2>
                <p className="text-xs text-slate-500">{req.masjidLocation}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                OPEN
              </span>
            </div>

            <div className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-700">Dates:</span>{" "}
                {req.dateFrom} → {req.dateTo}
              </p>
              <p>
                <span className="font-medium text-slate-700">Amount:</span> ₹
                {req.amountValue} ({req.amountType})
              </p>
              <p className="sm:col-span-2">
                <span className="font-medium text-slate-700">Prayers:</span>{" "}
                {req.prayers && req.prayers.length > 0
                  ? req.prayers.join(", ")
                  : "—"}
              </p>
              {req.paymentInfo && (
                <p className="sm:col-span-2">
                  <span className="font-medium text-slate-700">Payment:</span>{" "}
                  {req.paymentInfo}
                </p>
              )}
              {req.masjidMapLink && (
                <p className="sm:col-span-2">
                  <span className="font-medium text-slate-700">Maps:</span>{" "}
                  <a
                    href={req.masjidMapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 underline"
                  >
                    Open in Google Maps
                  </a>
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => openCall(req.imamPhone)}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 sm:flex-none sm:px-4"
              >
                Call imam
              </button>
              <button
                onClick={() => handleWhatsAppImam(req)}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 sm:flex-none sm:px-4"
              >
                WhatsApp imam with my info
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartTimeDashboard;
