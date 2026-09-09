"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // This navbar never unmounts as you click around the app (its
  // outside the page content, in the root layout), so we have to
  // check localStorage again every time the url changes — otherwise
  // it would keep showing whatever it saw on the very first page
  // load, even after logging in or out on a different page.
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      setUser(null);
    }
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  return (
    <div className="navbar sticky top-0 z-10 border-b border-base-300/70 bg-base-100/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex-1 gap-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-content">L</span>
          <span>Liquidity<span className="text-base-content">OS</span></span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="text-xs text-base-content/60 capitalize">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm text-base-content/70">
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
