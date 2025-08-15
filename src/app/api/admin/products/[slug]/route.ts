import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

interface ProductUpdates {
  name?: string;
  price?: number;
  category?: string;
  image?: string;
  discountPercentage?: number;
  stockQuantity?: number;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { slug } = await params;
    const { name, price, category, image, discountPercentage, stockQuantity } = await req.json();

    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Check if name change conflicts with existing product
    if (name && name.trim().toLowerCase() !== product.name.trim().toLowerCase()) {
      const allProducts = await productService.getAllProducts();
      const existingByName = allProducts.find(p =>
        p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== product.id
      );
      if (existingByName) {
        return NextResponse.json({ message: 'Product name already exists' }, { status: 400 });
      }
    }

    const updates: ProductUpdates = {};
    if (name != null) updates.name = String(name).trim();
    if (price != null) updates.price = Number(price);
    if (category != null) updates.category = String(category).toLowerCase().trim();
    if (image != null) updates.image = String(image).trim();
    if (discountPercentage != null) updates.discountPercentage = Number(discountPercentage);
    if (stockQuantity != null) updates.stockQuantity = Number(stockQuantity);

    if (!product.id) {
      return NextResponse.json({ message: 'Product ID not found' }, { status: 404 });
    }

    await productService.updateProduct(product.id, updates);

    // Get updated product
    const updatedProduct = await productService.getProductById(product.id);

    return NextResponse.json({
      message: 'Product updated',
      product: {
        id: updatedProduct?.id || product.id,
        slug: updatedProduct?.slug || product.slug,
        name: updatedProduct?.name || product.name,
        price: updatedProduct?.price || product.price,
        category: updatedProduct?.category || product.category,
        image: updatedProduct?.image || product.image,
        discountPercentage: updatedProduct?.discountPercentage && updatedProduct.discountPercentage > 0 ? updatedProduct.discountPercentage : undefined,
        stockQuantity: updatedProduct?.stockQuantity ?? product.stockQuantity
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { slug } = await params;
    const product = await productService.getProductBySlug(slug);
    if (!product || !product.id) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    await productService.deleteProduct(product.id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
}


