// A plain card with a title and a line under it, then whatever you
// put inside. Copied from the daisyUI admin template's "TitleCard"
// idea, just simpler — no extra props, just a title and children.

export default function TitleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card dashboard-card w-full bg-base-100">
      <div className="card-body p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="card-title text-lg font-bold">{title}</h2>
        </div>
        <div className="divider my-1"></div>
        {children}
      </div>
    </div>
  );
}
