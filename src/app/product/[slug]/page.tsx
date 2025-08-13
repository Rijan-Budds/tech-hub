import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ProductActions from "./ProductActions"; // import client component

async function fetchProduct(slug: string) {
  try {
    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      return null
    }
    
    // Get the host from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/products/${slug}`, { cache: 'no-store' })
    
    if (!res.ok) return null
    const data = await res.json()
    return data.product as { id: string; name: string; price: number; slug: string; image: string; category: string }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Image
        src={product.image}
        alt={product.name}
        width={800}
        height={500}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="text-sm text-gray-500 mb-2 capitalize">Category: {product.category.replace('-', ' ')}</p>
      <p className="text-xl text-secondary font-semibold mb-4">${product.price.toFixed(2)}</p>
      <p className="text-gray-700 leading-relaxed">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, aspernatur praesentium. Quis dolorem voluptates id tempora vel vero quo exercitationem iste, eligendi ad expedita, qui non beatae nisi aliquid ut?</p>

      {/* Render client component and pass correct props */}
      <ProductActions productId={product.id} slug={product.slug} />
    </div>
  );
}
