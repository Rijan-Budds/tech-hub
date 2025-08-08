import React from "react";
import { useParams } from "next/navigation";

const CategoryPage = ({ params }: { params: { slug: string } }) => {
  const { slug } = params;

  // You can fetch products here based on slug (e.g., from API or database)

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug.replace("-", " ")}</h1>
      
      {/* Fetch and display products in this category */}
      <p>Display products from category: <strong>{slug}</strong></p>
    </main>
  );
};

export default CategoryPage;
