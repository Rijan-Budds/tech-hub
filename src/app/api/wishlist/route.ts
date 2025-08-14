import { NextResponse } from "next/server";
import { userService, productService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const auth = await getAuth();
  console.log("GET /api/wishlist - Auth result:", auth);
  if (!auth || auth.role === 'admin') return NextResponse.json({ items: [] });
  
  const user = await userService.getUserById(auth.sub);
  if (!user || !user.wishlist || user.wishlist.length === 0) {
    return NextResponse.json({ items: [] });
  }
  
  // Get products by IDs
  const productPromises = user.wishlist.map(id => productService.getProductById(id));
  const products = await Promise.all(productPromises);
  const validProducts = products.filter(product => product !== null);
  
  const items = validProducts.map(product => ({ 
    id: product!.id, 
    slug: product!.slug, 
    name: product!.name, 
    price: product!.price, 
    category: product!.category, 
    image: product!.image 
  }));
  
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await getAuth();
  console.log("POST /api/wishlist - Auth result:", auth);
  if (!auth || auth.role === 'admin') {
    console.log("User not authenticated, returning 401");
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const productId = body?.productId as string;
  if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
  
  const user = await userService.getUserById(auth.sub);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  
  const wishlist = user.wishlist || [];
  const index = wishlist.indexOf(productId);
  
  if (index >= 0) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }
  
  await userService.updateUserWishlist(auth.sub, wishlist);
  return NextResponse.json({ wishlist });
}


