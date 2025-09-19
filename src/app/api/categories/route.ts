import { NextResponse } from 'next/server';
import { categoryService } from '@/lib/firebase-db';

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    
    return NextResponse.json({
      categories: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}