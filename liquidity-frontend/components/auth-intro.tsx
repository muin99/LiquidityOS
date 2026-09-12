// The left side of the login/register card. Just a plain intro
// panel, copied in spirit from the daisyUI admin template's
// "LandingIntro" — a logo, a line about the app, and a few points.

export default function AuthIntro() {
  return (
    <div className="hero min-h-full rounded-l-xl bg-base-200">
      <div className="hero-content py-12">
        <div className="max-w-md">
          <h1 className="text-3xl text-center font-bold text-primary">
            Liquidity Lite
          </h1>

          <p className="text-center mt-4 text-base-content/70">
            Connects field agents, coordinators, and mobile-money providers
            so cash never runs dry.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <li>💵 Agents track cash and e-cash in one place</li>
            <li>🤝 Coordinators top up agents who are running low</li>
            <li>✅ Providers approve who works on their behalf</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
