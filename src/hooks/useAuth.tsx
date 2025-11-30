import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Role = "imam" | "part_time" | null;

export type AppUser = {
  uid: string;
  role: Role;
  name?: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
};

type AuthContextType = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      // Clear old profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      // Live subscribe to Firestore user document
      const userRef = doc(db, "users", user.uid);
      unsubscribeProfile = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any;
            setAppUser({
              uid: user.uid,
              role: data.role ?? null,
              name: data.name ?? undefined,
              phone: data.phone ?? undefined,
              whatsapp: data.whatsapp ?? undefined,
              location: data.location ?? undefined,
            });
          } else {
            // Auth user exists, but no Firestore profile yet
            setAppUser({
              uid: user.uid,
              role: null,
            });
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to user profile:", error);
          setAppUser({
            uid: user.uid,
            role: null,
          });
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
