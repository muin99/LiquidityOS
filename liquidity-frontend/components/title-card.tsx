// A plain card with a title and a line under it, then whatever you
// put inside. Just plain Tailwind utility classes, no component
// library — a white box, a shadow, rounded corners, some padding.

export default function TitleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <hr className="my-3 border-gray-200" />
      {children}
    </div>
  );
}
