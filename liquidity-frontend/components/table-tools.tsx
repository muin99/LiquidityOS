"use client";

export function CsvButton({ fileName, rows }: { fileName: string; rows: any[] }) {
  function download() {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const text = [headers.join(","), ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return <button onClick={download} disabled={!rows.length} className="btn btn-outline btn-sm">Download CSV</button>;
}

export function PageControls({ page, total, setPage }: { page: number; total: number; setPage: (page: number) => void }) {
  if (total <= 20) return null;
  const pages = Math.ceil(total / 20);
  return <div className="join mt-4"><button onClick={() => setPage(page - 1)} disabled={page === 0} className="btn btn-sm join-item">Previous</button><button className="btn btn-sm join-item">{page + 1} / {pages}</button><button onClick={() => setPage(page + 1)} disabled={page + 1 === pages} className="btn btn-sm join-item">Next</button></div>;
}
