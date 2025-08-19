import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaEye } from "react-icons/fa";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { productService } from "@/lib/firebase-db";

interface ProductDisplay {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  stockQuantity: number;
  inStock: boolean;
  purchaseCount?: number;
}

async function fetchAllProducts(): Promise<ProductDisplay[]> {
  try {
    const allProducts = await productService.getAllProducts();
    
    return allProducts
      .filter((product) => product.id) // Ensure id exists
      .map((product) => ({
        id: product.id!,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        discountPercentage:
          product.discountPercentage && product.discountPercentage > 0
            ? product.discountPercentage
            : undefined,
        stockQuantity: product.stockQuantity || 0,
        inStock: (product.stockQuantity || 0) > 0,
        purchaseCount: (product as {purchaseCount?: number}).purchaseCount,
      }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

const AllProductsPage = async () => {
  const products = await fetchAllProducts();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-12">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <FaArrowLeft className="text-xs" />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 dark:text-white font-medium">All Products</li>
              </ol>
            </nav>

            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                All <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Products</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover our complete collection of premium tech products. From CPUs to peripherals, find everything you need for your setup.
              </p>
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                Showing {products.length} products
              </div>
            </div>
          </div>

          {/* Products Section */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaEye className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Products Found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  We couldn&apos;t find any products at the moment. Please check back later.
                </p>
                <Link 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                >
                  <FaArrowLeft className="text-sm" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Category Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link
                  href="/all"
                  className="px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                >
                  All Categories
                </Link>
                {['cpu', 'keyboard', 'monitor', 'speaker', 'mouse'].map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category}`}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 capitalize"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => (
                  <div key={product.id} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                      <Link href={`/product/${product.slug}`}>
                        <div className="relative overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                          {/* Discount Badge */}
                          {product.discountPercentage && product.discountPercentage > 0 && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{product.discountPercentage}%
                              </span>
                            </div>
                          )}

                          {/* Stock Status Badge */}
                          {!product.inStock && (
                            <div className="absolute top-4 right-4">
                              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Out of Stock
                              </span>
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0D3B66] transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              {product.discountPercentage && product.discountPercentage > 0 ? (
                                <>
                                  <span className="text-2xl font-bold text-[#0D3B66]">
                                    रु{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                                  </span>
                                  <span className="text-lg text-gray-500 line-through">
                                    रु{product.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-[#0D3B66]">
                                  रु{product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/product/${product.slug}`}
                            className="flex-1 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-4 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ pointerEvents: !product.inStock ? 'none' : 'auto' }}
                          >
                            <FaEye className="text-sm" />
                            <span>View Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Navigation */}
              <div className="text-center mt-12">
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 flex items-center space-x-2"
                  >
                    <FaArrowLeft className="text-sm" />
                    <span>Back to Home</span>
                  </Link>
                  <Link
                    href="/categories/trending"
                    className="px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                  >
                    View Trending Products
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllProductsPage;