import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-surface flex-1 flex flex-col">
      <div className="hero py-20 sm:py-28">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <div className="badge badge-primary badge-outline mb-4">Mobile financial services liquidity</div>
            <h1 className="text-4xl font-bold sm:text-5xl">Liquidity, kept moving.</h1>
            <p className="py-6 text-base-content/70 text-lg">
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

      <div className="max-w-5xl mx-auto w-full px-6 pb-20">
        <h2 className="text-xl font-bold mb-6 text-center">
          Four roles, one platform
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card dashboard-card bg-base-100">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Agent</h3>
              <p className="text-sm text-base-content/60">
                Cash drawer, e-cash wallets, and requests
              </p>
            </div>
          </div>
          <div className="card dashboard-card bg-base-100">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Coordinator</h3>
              <p className="text-sm text-base-content/60">
                Fulfill requests, apply to providers
              </p>
            </div>
          </div>
          <div className="card dashboard-card bg-base-100">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Provider</h3>
              <p className="text-sm text-base-content/60">
                Approve coordinators wanting to join
              </p>
            </div>
          </div>
          <div className="card dashboard-card bg-base-100">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Admin</h3>
              <p className="text-sm text-base-content/60">
                Approve registrations
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
