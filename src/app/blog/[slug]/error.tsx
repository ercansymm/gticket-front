"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <h2>Blog yazısı yüklenemedi.</h2>
      <Link href="/blog">Blog'a Dön</Link>
    </div>
  );
}
