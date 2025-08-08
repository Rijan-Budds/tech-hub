"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

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
    categorySlug: "electronics",
    alt: "Electronics"
  },
  {
    image: "/home/slider2.jpg", 
    categorySlug: "beauty-health",
    alt: "Clothing"
  },
  {
    image: "/home/slider3.jpg",
    categorySlug: "clothing", 
    alt: "Clothing"
  },
  {
    image: "/home/slider4.jpg",
    categorySlug: "sports-fitness",
    alt: "Sports & Fitness"
  },
  {
    image: "/home/slider5.jpg",
    categorySlug: "automotive",
    alt: "Automotive"
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
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$129.99",
    slug: "smart-watch",
    image:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: "$39.99",
    slug: "gaming-mouse",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "$49.99",
    slug: "bluetooth-speaker",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
];

const featuredCategories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "/home/category1.jpg",
  },
  {
    id: 2,
    name: "Clothing",
    slug: "clothing",
    image: "/home/category2.jpg",
  },
  {
    id: 3,
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: "/home/category3.jpg",
  },
  {
    id: 4,
    name: "Sports & Fitness",
    slug: "sports-fitness",
    image: "/home/category4.jpg",
  },
  {
    id: 5,
    name: "Books & Media",
    slug: "books-media",
    image: "/home/category5.jpg",
  },
  {
    id: 6,
    name: "Beauty & Health",
    slug: "beauty-health",
    image: "/home/category6.jpg",
  },
  {
    id: 7,
    name: "Toys & Games",
    slug: "toys-games",
    image: "/home/category7.jpg",
  },
  {
    id: 8,
    name: "Automotive",
    slug: "automotive",
    image: "/home/category8.jpg",
  },
];

function Page() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

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
              <Link key={product.id} href={`/product/${product.slug}`}>
                <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-900 dark:text-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={192}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-orange-600 font-bold">{product.price}</p>
                  <button className="mt-3 w-full bg-[#f85606] text-white py-2 rounded hover:bg-[#e14e00] transition">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
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
