import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    const backendUrl = `http://localhost:5000/search?q=${encodeURIComponent(q)}`;
    const res = await fetch(backendUrl, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data.products) && data.products.length > 0) {
      return NextResponse.json(data);
    }
    // Fallback: fetch all products and filter here
    const allRes = await fetch("http://localhost:5000/products", { cache: "no-store" });
    const allData = await allRes.json();
    const query = (q || "").toLowerCase().trim();
    const filtered = (allData.products || []).filter((p: any) =>
      `${p.name} ${p.slug} ${p.category}`.toLowerCase().includes(query)
    );
    return NextResponse.json({ products: filtered });
  } catch (e: any) {
    return NextResponse.json({ products: [], error: e?.message || "Search failed" }, { status: 200 });
  }
}


