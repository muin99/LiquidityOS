"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  // We dont know if anyone is logged in until the page actually
  // loads in the browser, so this starts as null and gets filled
  // in by the effect below.
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  return (
    <div className="navbar bg-base-100 border-b border-base-200 px-6">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold text-primary">
          Liquidity Lite
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-base-content/70 capitalize">
            {user.fullName} ({user.role})
          </span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Log out
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
