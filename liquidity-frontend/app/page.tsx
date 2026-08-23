import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col bg-base-200">
      <div className="hero py-20">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold">Liquidity Lite</h1>
            <p className="py-6 text-base-content/70">
              A simple platform that connects field agents, liquidity
              coordinators, and mobile-money providers — so cash never
              runs dry in the field.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="btn btn-primary">
                Log in
              </Link>
              <Link href="/register" className="btn btn-outline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 pb-20">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Preview a dashboard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/agent" className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Agent</h3>
              <p className="text-sm text-base-content/60">
                Cash drawer, e-cash wallets, and requests
              </p>
            </div>
          </Link>
          <Link href="/dashboard/coordinator" className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Coordinator</h3>
              <p className="text-sm text-base-content/60">
                Fulfill requests, track provider applications
              </p>
            </div>
          </Link>
          <Link href="/dashboard/admin" className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Admin</h3>
              <p className="text-sm text-base-content/60">
                Approve registrations and applications
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
