import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-gray-900">
      <div className="flex flex-col items-center px-4 py-20 text-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-gray-100">Liquidity Lite</h1>
          <p className="py-6 text-gray-400">
            A simple platform that connects field agents, liquidity
            coordinators, and mobile-money providers — so cash never
            runs dry in the field.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-800"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-6 pb-20">
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-100">
          Four roles, one platform
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-800 p-6 text-center shadow">
            <h3 className="font-semibold text-gray-100">Agent</h3>
            <p className="mt-1 text-sm text-gray-400">
              Cash drawer, e-cash wallets, and requests
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6 text-center shadow">
            <h3 className="font-semibold text-gray-100">Coordinator</h3>
            <p className="mt-1 text-sm text-gray-400">
              Fulfill requests, apply to providers
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6 text-center shadow">
            <h3 className="font-semibold text-gray-100">Provider</h3>
            <p className="mt-1 text-sm text-gray-400">
              Approve coordinators wanting to join
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6 text-center shadow">
            <h3 className="font-semibold text-gray-100">Admin</h3>
            <p className="mt-1 text-sm text-gray-400">
              Approve registrations
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
