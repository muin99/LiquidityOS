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
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg">{title}</h2>
        <div className="divider mt-1 mb-2"></div>
        {children}
      </div>
    </div>
  );
}
