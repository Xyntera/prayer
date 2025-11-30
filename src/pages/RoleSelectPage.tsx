import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const RoleSelectPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const run = async () => {
      if (!user) {
        nav("/login");
        return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.role === "imam") {
          nav("/imam");
          return;
        }
        if (data.role === "part_time") {
          nav("/part-time");
          return;
        }
      }
      setLoading(false);
    };
    run();
  }, [user, nav]);

  const setRole = async (role: "imam" | "part_time") => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(
      ref,
      {
        role,
        name: user.email?.split("@")[0] || "User",
        phone: "",
        whatsapp: "",
        location: "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    if (role === "imam") nav("/imam");
    else nav("/part-time");
  };

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">
          Choose your role
        </h1>
        <p className="text-sm text-slate-600">
          You can change this later by contacting the admin.
        </p>
        <button
          className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          onClick={() => setRole("imam")}
        >
          I am an Imam
        </button>
        <button
          className="w-full rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          onClick={() => setRole("part_time")}
        >
          I am a Part-time Imam
        </button>
      </div>
    </div>
  );
};

export default RoleSelectPage;
