import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Product, ICartItem } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ items: [] });
  const user = await User.findById(auth.sub);
  const ids = user.cart.map((ci: ICartItem) => ci.productId);
  const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map(docs.map((d: any) => [(d._id as any).toString(), { id: (d._id as any).toString(), slug: d.slug, name: d.name, price: d.price, category: d.category, image: d.image }]));
  const detailed = user.cart.map((ci: ICartItem) => ({ ...ci, product: map.get(ci.productId) || null }));
  return NextResponse.json({ items: detailed });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { action } = body || {};
  const user = await User.findById(auth.sub);
  if (action === 'add') {
    const { productId, quantity = 1 } = body;
    if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
    const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
    if (existing) existing.quantity += Number(quantity);
    else user.cart.push({ productId, quantity: Number(quantity) });
    await user.save();
    return NextResponse.json({ message: 'Added to cart' });
  }
  if (action === 'update') {
    const { productId, quantity } = body;
    if (!productId || typeof quantity !== 'number') return NextResponse.json({ message: 'productId and quantity required' }, { status: 400 });
    const existing = user.cart.find((ci: ICartItem) => ci.productId === productId);
    if (!existing) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    if (quantity <= 0) user.cart = user.cart.filter((ci: ICartItem) => ci.productId !== productId);
    else existing.quantity = quantity;
    await user.save();
    return NextResponse.json({ message: 'Cart updated' });
  }
  if (action === 'remove') {
    const { productId } = body;
    if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
    user.cart = user.cart.filter((ci: ICartItem) => ci.productId !== productId);
    await user.save();
    return NextResponse.json({ message: 'Item removed' });
  }
  return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
}


