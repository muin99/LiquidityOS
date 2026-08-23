import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 border-b border-base-200 px-6">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold text-primary">
          Liquidity Lite
        </Link>
      </div>
      <div className="flex gap-2">
        <Link href="/login" className="btn btn-ghost btn-sm">
          Log in
        </Link>
        <Link href="/register" className="btn btn-primary btn-sm">
          Register
        </Link>
      </div>
    </div>
  );
}
