import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, products, categories } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const auth = await getAuth();
  if (!auth || auth.role === "admin") return NextResponse.json({ items: [] });

  const result = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  const user = result[0];
  if (!user) return NextResponse.json({ items: [] });

  let wishlist: string[] = [];
  try { wishlist = JSON.parse(user.wishlist || "[]"); } catch { wishlist = []; }

  if (wishlist.length === 0) return NextResponse.json({ items: [] });

  const productList = await db.select({
    product: products,
    category: categories,
  })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, wishlist));

  const items = productList.map(({ product, category }) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    category: category?.name,
    image: product.image,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await getAuth();
  if (!auth || auth.role === "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const productId = body?.productId as string;
  if (!productId)
    return NextResponse.json(
      { message: "productId required" },
      { status: 400 },
    );

  const result = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  const user = result[0];
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  let wishlist: string[] = [];
  try { wishlist = JSON.parse(user.wishlist || "[]"); } catch { wishlist = []; }

  const index = wishlist.indexOf(productId);

  if (index >= 0) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }

  await db.update(users)
    .set({ wishlist: JSON.stringify(wishlist) })
    .where(eq(users.id, user.id));

  return NextResponse.json({ wishlist });
}
