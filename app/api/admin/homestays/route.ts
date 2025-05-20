import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure you have Prisma setup and configured

export async function GET() {
    try {
        const homestays = await prisma.homestay.findMany(); // Adjust the model name if necessary
        
        const formattedHomestays = homestays.map(homestay => ({
            id: homestay.id,
            name: homestay.name,
            address: homestay.address,
            price: homestay.price,
            rating: homestay.rating,
            status: homestay.status,
        }));
        return NextResponse.json({
            homestays: formattedHomestays
        });
    } catch (error) {
        console.error('Error fetching homestays:', error);
        return NextResponse.json({ error: 'Failed to fetch homestays' }, { status: 500 });
    }
}