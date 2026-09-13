// The left side of the login/register card. Just a plain intro
// panel — a logo, a line about the app, and a few points. Plain
// Tailwind, no component library. A shade darker than the form
// panel next to it, so you can still see the two halves split.

export default function AuthIntro() {
  return (
    <div className="flex h-full min-h-full items-center justify-center rounded-l-xl bg-gray-900 px-8 py-12">
      <div className="max-w-md">
        <h1 className="text-center text-3xl font-bold text-blue-400">
          Liquidity Lite
        </h1>

        <p className="mt-4 text-center text-gray-400">
          Connects field agents, coordinators, and mobile-money providers
          so cash never runs dry.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-gray-300">
          <li>💵 Agents track cash and e-cash in one place</li>
          <li>🤝 Coordinators top up agents who are running low</li>
          <li>✅ Providers approve who works on their behalf</li>
        </ul>
      </div>
    </div>
  );
}
