import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const user = auth.currentUser;
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user) return nav("/login");

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const d = snap.data() as any;
        setName(d.name || "");
        setPhone(d.phone || "");
        setWhatsapp(d.whatsapp || "");
        setLocation(d.location || "");
      }

      setLoading(false);
    };
    run();
  }, [user, nav]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !phone) {
      alert("Name & phone required");
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        phone,
        whatsapp,
        location,
        updatedAt: serverTimestamp(),
      });

      nav("/role");
    } catch (err) {
      alert("Cannot save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-700" />
      </div>
    );

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">
        Create your profile
      </h1>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100"
      >
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Full name *
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Phone number *
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            WhatsApp
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp number"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Your location
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
