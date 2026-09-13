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
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-3 shadow-md">
      <Link href="/" className="text-xl font-bold text-blue-600">
        Liquidity Lite
      </Link>

      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm capitalize text-gray-600">
            {user.fullName} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
