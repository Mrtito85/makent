import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = await prisma.customer.create({ data: body });
    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 400 });
  }
}
