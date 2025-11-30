import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PRAYER_OPTIONS } from "../prayers";
import type { PrayerKey } from "../prayers";

const CreateRequestPage: React.FC = () => {
  const user = auth.currentUser;
  const nav = useNavigate();

  const [masjidName, setMasjidName] = useState("");
  const [masjidLocation, setMasjidLocation] = useState("");
  const [masjidMapLink, setMasjidMapLink] = useState("");
  const [imamPhone, setImamPhone] = useState("");
  const [imamWhatsapp, setImamWhatsapp] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountType, setAmountType] = useState<"per_day" | "total">("per_day");
  const [amountValue, setAmountValue] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [note, setNote] = useState("");
  const [selectedPrayers, setSelectedPrayers] = useState<PrayerKey[]>([]);
  const [saving, setSaving] = useState(false);

  if (!user) {
    nav("/login");
  }

  const togglePrayer = (key: PrayerKey) => {
    setSelectedPrayers((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      !masjidName ||
      !masjidLocation ||
      !imamPhone ||
      !dateFrom ||
      !dateTo ||
      !amountValue
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (selectedPrayers.length === 0) {
      alert("Select at least one prayer.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "requests"), {
        imamId: user.uid,
        masjidName,
        masjidLocation,
        masjidMapLink,
        imamPhone,
        imamWhatsapp,
        dateFrom,
        dateTo,
        prayers: selectedPrayers,
        amountType,
        amountValue: Number(amountValue),
        paymentInfo,
        note,
        status: "OPEN",
        acceptedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      alert("Request created.");
      nav("/imam");
    } catch (err: any) {
      console.error(err);
      alert("Error creating request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">
        Create leave request
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Masjid name *
            </label>
            <input
              value={masjidName}
              onChange={(e) => setMasjidName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Masjid location (area / city) *
            </label>
            <input
              value={masjidLocation}
              onChange={(e) => setMasjidLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Google Maps link (optional)
            </label>
            <input
              value={masjidMapLink}
              onChange={(e) => setMasjidMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=Masjid+Name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Imam phone (for calls) *
            </label>
            <input
              value={imamPhone}
              onChange={(e) => setImamPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Imam WhatsApp (optional)
            </label>
            <input
              value={imamWhatsapp}
              onChange={(e) => setImamWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Date from *
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Date to *
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Prayers needed *
          </label>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRAYER_OPTIONS.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() => togglePrayer(p.key as PrayerKey)}
                className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                  selectedPrayers.includes(p.key as PrayerKey)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Amount type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmountType("per_day")}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  amountType === "per_day"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                Per day
              </button>
              <button
                type="button"
                onClick={() => setAmountType("total")}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  amountType === "total"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                Total
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Amount ({amountType}) *
            </label>
            <input
              type="number"
              value={amountValue}
              onChange={(e) => setAmountValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Payment info (UPI / cash)
          </label>
          <input
            value={paymentInfo}
            onChange={(e) => setPaymentInfo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[70px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => nav("/imam")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Saving..." : "Create request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestPage;
