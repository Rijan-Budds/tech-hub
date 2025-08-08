import Image from "next/image";
import { notFound } from "next/navigation";

const trendingProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$59.99",
    slug: "wireless-headphones",
    description:
      "High-quality wireless headphones with noise cancellation and up to 20 hours of playtime.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$129.99",
    slug: "smart-watch",
    description:
      "Stylish smartwatch with heart-rate monitor and fitness tracking features.",
    image:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: "$39.99",
    slug: "gaming-mouse",
    description:
      "Ergonomic gaming mouse with customizable buttons and RGB lighting.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "$49.99",
    slug: "bluetooth-speaker",
    description:
      "Portable Bluetooth speaker with rich bass and waterproof design.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = trendingProducts.find((p) => p.slug === slug);

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
      <p className="text-xl text-orange-600 font-semibold mb-4">
        {product.price}
      </p>
      <p className="text-gray-700 leading-relaxed">{product.description}</p>
    </div>
  );
}
