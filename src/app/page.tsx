"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  FaShoppingCart,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const sliderData = [
  {
    image: "/home/slider1.jpg",
    categorySlug: "keyboard",
    alt: "keyboard",
    title: "Premium Keyboards",
    subtitle: "Experience the perfect typing sensation",
  },
  {
    image: "/home/slider2.jpg",
    categorySlug: "mouse",
    alt: "Mouse",
    title: "Gaming Mouse",
    subtitle: "Precision and speed for every click",
  },
  {
    image: "/home/slider3.jpg",
    categorySlug: "speaker",
    alt: "Speaker",
    title: "High-Fidelity Speakers",
    subtitle: "Crystal clear sound quality",
  },
  {
    image: "/home/slider4.jpg",
    categorySlug: "monitor",
    alt: "Monitor",
    title: "Ultra HD Monitors",
    subtitle: "Stunning visuals for work and play",
  },
];

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  inStock?: boolean;
  purchaseCount?: number;
  averageRating?: number;
  totalReviews?: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

function Page() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  );

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load trending products
        const productsRes = await fetch("/api/products?category=trending", {
          cache: "no-store",
        });
        const productsData = await productsRes.json();
        const productsList: Product[] = Array.isArray(productsData.products)
          ? productsData.products
          : [];
        setTrendingProducts(productsList.slice(0, 4));

        // Load categories
        const categoriesRes = await fetch("/api/categories", {
          cache: "no-store",
        });
        const categoriesData = await categoriesRes.json();
        const categoriesList: Category[] = Array.isArray(
          categoriesData.categories,
        )
          ? categoriesData.categories
          : [];

        // Take only the first 6 categories for the carousel (or all if less than 6)
        setFeaturedCategories(categoriesList.slice(0, 6));
      } catch (error) {
        console.error("Error loading data:", error);
        setTrendingProducts([]);
        setFeaturedCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      console.log("Adding to cart for product:", productId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "add", productId, quantity: 1 }),
      });
      const data = await res.json();
      console.log("Cart response status:", res.status);
      console.log("Cart response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your cart");
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success("Added to cart");
    } catch (error: unknown) {
      console.log("Cart error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      console.log("Toggling wishlist for product:", productId);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      console.log("Wishlist response status:", res.status);
      console.log("Wishlist response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your wishlist");
          return;
        }
        throw new Error(data.message || "Failed to update wishlist");
      }
      toast.success("Wishlist updated");
    } catch (error: unknown) {
      console.log("Wishlist error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Carousel */}
        <section className="relative">
          <Carousel plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent>
              {sliderData.map((slider, i) => (
                <CarouselItem key={i} className="basis-full">
                  <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
                    <Image
                      src={slider.image}
                      alt={slider.alt}
                      width={1400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
                        <div className="text-white max-w-lg">
                          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4">
                            {slider.title}
                          </h1>
                          <p className="text-sm sm:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-200">
                            {slider.subtitle}
                          </p>
                          <Link
                            href={`/categories/${slider.categorySlug}`}
                            className="inline-flex items-center space-x-2 bg-white text-black px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm sm:text-base"
                          >
                            <span>Shop Now</span>
                            <FaArrowRight className="text-xs sm:text-sm" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        {/* Trending Products */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                Trending Products
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                Discover our most popular products loved by customers worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {trendingProducts.map((product) => (
                <div key={product.id} className="group h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Discount Badge */}
                        {product.discountPercentage &&
                          product.discountPercentage > 0 && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                                -{product.discountPercentage}%
                              </span>
                            </div>
                          )}

                        {/* Stock Status Badge */}
                        {product.inStock === false && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                          {product.name}
                        </h3>


                        <div className="flex items-baseline space-x-2">
                          {product.discountPercentage &&
                            product.discountPercentage > 0 ? (
                            <>
                              <span className="text-lg font-bold text-gray-400 dark:text-gray-500 line-through">
                                रु{product.price.toFixed(2)}
                              </span>
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                रु
                                {(
                                  product.price *
                                  (1 - product.discountPercentage / 100)
                                ).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              रु{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.inStock === false}
                          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${product.inStock === false
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            }`}
                        >
                          <FaShoppingCart />
                          <span>
                            {product.inStock === false
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(product.id)}
                          className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-black transition-all duration-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <FaHeart />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Carousel Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                Shop by Category
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                Explore our wide range of products organized by category
              </p>
            </div>

            {/* Loading State */}
            {categoriesLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">
                  Loading categories...
                </span>
              </div>
            )}

            {/* Empty State */}
            {!categoriesLoading && featuredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  No categories available at the moment.
                </p>
              </div>
            )}

            {/* Category Carousel */}
            {!categoriesLoading && featuredCategories.length > 0 && (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featuredCategories.map((cat, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <Link
                        key={`${cat.id}-${index}`}
                        href={`/categories/${cat.slug}`}
                      >
                        <div className="group flex-shrink-0 select-none">
                          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              width={300}
                              height={200}
                              className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              draggable={false}
                            />
                            <div className="absolute inset-0 bg-black/50">
                              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                                <h3 className="text-white text-sm sm:text-base lg:text-xl font-bold mb-1 sm:mb-2">
                                  {cat.name}
                                </h3>
                                <p className="text-gray-200 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block">
                                  {cat.description}
                                </p>
                                <div className="flex items-center text-white text-xs sm:text-sm font-semibold">
                                  <span>Explore</span>
                                  <FaArrowRight className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-200 text-xs" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Ready to Transform Your Setup?
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-300 max-w-2xl mx-auto px-2">
                Join thousands of satisfied customers who have upgraded their
                tech experience with our premium products.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/all"
                  className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>View All Products</span>
                  <FaArrowRight className="text-xs sm:text-sm" />
                </Link>
                <Link
                  href="/about"
                  className="border border-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Page;