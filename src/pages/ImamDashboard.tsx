import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  updateDoc,
  doc,
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
  status: "OPEN" | "CLOSED";
};

const ImamDashboard: React.FC = () => {
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
      where("imamId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: RequestDoc[] = [];
      snap.forEach((d) => {
        const x = d.data() as any;
        list.push({
          id: d.id,
          masjidName: x.masjidName,
          masjidLocation: x.masjidLocation,
          masjidMapLink: x.masjidMapLink,
          dateFrom: x.dateFrom,
          dateTo: x.dateTo,
          prayers: x.prayers ?? [],
          amountType: x.amountType,
          amountValue: x.amountValue,
          status: x.status || "OPEN",
        });
      });
      setRequests(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user, nav]);

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) {
      alert("You must be logged in.");
      return;
    }

    const yes = window.confirm("Are you sure you want to delete this request?");
    if (!yes) return;

    try {
      await deleteDoc(doc(db, "requests", id));
      // Firestore onSnapshot will auto-remove it from UI
    } catch (err: any) {
      console.error("Delete error:", err);
      if (err?.code === "permission-denied") {
        alert(
          "Delete is not allowed by Firestore rules. Please update your rules to allow the imam to delete their own request."
        );
      } else {
        alert("Could not delete request. Check console for details.");
      }
    }
  };

  const handleToggleStatus = async (req: RequestDoc) => {
    if (!auth.currentUser) {
      alert("You must be logged in.");
      return;
    }
    try {
      await updateDoc(doc(db, "requests", req.id), {
        status: req.status === "OPEN" ? "CLOSED" : "OPEN",
      });
    } catch (err) {
      console.error("Status update error:", err);
      alert("Could not update status.");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Imam Dashboard
          </h1>
          <p className="text-xs text-slate-600">
            Create, edit, close or delete your leave requests.
          </p>
        </div>

        <button
          onClick={() => nav("/imam/create")}
          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          + New Request
        </button>
      </div>

      {requests.length === 0 && (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-5 text-sm text-slate-500">
          You haven't created any requests yet.
        </p>
      )}

      <div className="grid gap-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="rounded-3xl border border-emerald-50 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {req.masjidName}
                </h2>
                <p className="text-xs text-slate-500">{req.masjidLocation}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  req.status === "OPEN"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {req.status}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              <strong className="text-slate-800">Dates:</strong>{" "}
              {req.dateFrom} → {req.dateTo}
            </p>

            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">Prayers:</strong>{" "}
              {req.prayers.join(", ") || "—"}
            </p>

            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">Amount:</strong> ₹
              {req.amountValue} ({req.amountType})
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => nav(`/imam/edit/${req.id}`)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 hover:bg-slate-50"
              >
                Edit
              </button>

              <button
                onClick={() => handleToggleStatus(req)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
              >
                {req.status === "OPEN" ? "Close" : "Reopen"}
              </button>

              <button
                onClick={() => handleDelete(req.id)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImamDashboard;
