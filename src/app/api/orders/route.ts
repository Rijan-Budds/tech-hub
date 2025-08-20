import { NextResponse } from "next/server";
import { orderService, userService, productService, batchService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

const cityFees: Record<string, number> = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === 'admin') {
      return NextResponse.json({ orders: [] });
    }
    
    const orders = await orderService.getOrdersByUserId(auth.sub);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, email, address, paymentMethod } = body || {};
    if (!name || !email || !address?.city || !paymentMethod) {
      return NextResponse.json({ message: 'name, email, city, and paymentMethod are required' }, { status: 400 });
    }
    
    // Validate payment method
    if (!['esewa', 'cod'].includes(paymentMethod)) {
      return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 });
    }
    
    const user = await userService.getUserById(auth.sub);
    if (!user || user.cart.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // Get product details for cart items - optimized batch fetch
    const allProducts = await productService.getAllProducts();
    const productMap = new Map();
    allProducts.forEach(product => {
      if (product && product.id) {
        productMap.set(product.id, product);
      }
    });
    
    // Validate stock availability
    for (const cartItem of user.cart) {
      const product = productMap.get(cartItem.productId);
      if (!product) {
        return NextResponse.json({ message: `Product not found: ${cartItem.productId}` }, { status: 400 });
      }
      
      if (product.stockQuantity < cartItem.quantity) {
        return NextResponse.json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}` 
        }, { status: 400 });
      }
    }
    
    const subtotal = user.cart.reduce((sum, ci) => {
      const product = productMap.get(ci.productId);
      const price = product?.price || 0;
      return sum + price * ci.quantity;
    }, 0);
    
    const deliveryFee = cityFees[address.city] ?? 5.0;
    const grandTotal = subtotal + deliveryFee;

    const orderData = {
      items: user.cart.map((ci) => {
        const product = productMap.get(ci.productId);
        return {
          productId: ci.productId,
          quantity: ci.quantity,
          name: product?.name,
          image: product?.image,
          price: product?.price,
        };
      }),
      status: 'pending' as const,
      subtotal,
      deliveryFee,
      grandTotal,
      paymentMethod: paymentMethod as "esewa" | "cod",
      customer: {
        name,
        email,
        address: { street: address?.street || '', city: address.city },
      },
      userId: auth.sub,
      createdAt: new Date(),
    };
    
    // Create order and clear cart in one transaction
    const orderId = await batchService.createOrderAndClearCart(orderData, auth.sub);
    
    console.log("POST /api/orders - Order created with ID:", orderId);
    
    // Send order confirmation email
    const emailResult = await sendOrderConfirmationEmail(orderData, orderId);
    
    if (!emailResult.success) {
      console.error('Failed to send order confirmation email:', emailResult.error);
      // Don't fail the order if email fails, but log it
    }
    
    // Get updated orders for response
    const updatedOrders = await orderService.getOrdersByUserId(auth.sub);
    
    return NextResponse.json({ 
      message: 'Order placed', 
      orders: updatedOrders,
      emailSent: emailResult.success 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}


