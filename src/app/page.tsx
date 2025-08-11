"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

// Carousel images with their corresponding category slugs
const sliderData = [
  {
    image: "/home/slider1.jpg",
    categorySlug: "keyboard",
    alt: "keyboard"
  },
  {
    image: "/home/slider2.jpg", 
    categorySlug: "mouse",
    alt: "Mouse"
  },
  {
    image: "/home/slider3.jpg",
    categorySlug: "speaker", 
    alt: "Speaker"
  },
  {
    image: "/home/slider4.jpg",
    categorySlug: "monitor",
    alt: "Monitor"
  },
];

// Dummy Data
const trendingProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$59.99",
    slug: "wireless-headphones",
    image:
      "/home/slider4.jpg",
  },
  {
    id: 2,
    name: "Gaming Laptop",
    price: "$129.99",
    slug: "gaming-mouse",
    image:
      "/home/slider1.jpg",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: "$39.99",
    slug: "gaming-mouse",
    image:
      "/home/slider2.jpg",
  },
  {
    id: 4,
    name: "Gaming Speaker",
    price: "$49.99",
    slug: "bluetooth-speaker",
    image:
      "/home/slider3.jpg",
  },
];

// Map slug to backend productId (for demo trending items)
const slugToId: Record<string, string> = {
  "wireless-headphones": "p1",
  "smart-watch": "p2",
  "gaming-mouse": "p3",
  "bluetooth-speaker": "p4",
};

const featuredCategories = [
  {
    id: 1,
    name: "CPUs",
    slug: "cpu",
    image: "/home/category1.jpg",
  },
  {
    id: 2,
    name: "Keyboard",
    slug: "keyboard",
    image: "/home/category2.jpg",
  },
  {
    id: 3,
    name: "Monitor",
    slug: "monitor",
    image: "/home/category3.jpg",
  },
  {
    id: 4,
    name: "Speakers",
    slug: "speaker",
    image: "/home/category4.jpg",
  },
  {
    id: 5,
    name: "Mouse",
    slug: "mouse",
    image: "/home/category5.jpg",
  },
];

function Page() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  const handleAddToCart = async (slug: string) => {
    const productId = slugToId[slug];
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      toast.success("Added to cart");
    } catch (e: any) {
      toast.error(e.message || "Failed to add to cart");
    }
  };

  const handleToggleWishlist = async (slug: string) => {
    const productId = slugToId[slug];
    try {
      const res = await fetch("http://localhost:5000/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
      toast.success("Wishlist updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update wishlist");
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 bg-white dark:bg-black transition-colors">
        {/* Carousel */}
        <Carousel plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
          <CarouselContent>
            {sliderData.map((slider, i) => (
              <CarouselItem key={i} className="basis-full">
                <Link href={`/categories/${slider.categorySlug}`}>
                  <Image
                    src={slider.image}
                    alt={slider.alt}
                    width={1200}
                    height={400}
                    className="w-full h-64 object-cover object-center mb-4 rounded cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Trending Products */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Trending Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-900 dark:text-white">
                <Link href={`/product/${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={192}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                </Link>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-orange-600 font-bold">{product.price}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => handleAddToCart(product.slug)} className="w-full bg-[#f85606] text-white py-2 rounded hover:bg-[#e14e00] transition">
                    Add to Cart
                  </button>
                  <button onClick={() => handleToggleWishlist(product.slug)} className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredCategories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <div className="relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-md">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2 font-semibold text-sm">
                    {cat.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default Page;
