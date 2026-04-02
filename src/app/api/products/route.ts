import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 400 });
  }
}
