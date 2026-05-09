import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Product IDs must be created in your Polar dashboard and added to .env
const PRODUCT_IDS: Record<string, string> = {
  starter: process.env.POLAR_STARTER_PRODUCT_ID ?? '',
  pro: process.env.POLAR_PRO_PRODUCT_ID ?? '',
};

const POLAR_API =
  process.env.POLAR_MODE === 'sandbox'
    ? 'https://sandbox-api.polar.sh'
    : 'https://api.polar.sh';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { plan } = await req.json() as { plan?: string };
    if (!plan || !PRODUCT_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const productId = PRODUCT_IDS[plan];
    if (!productId) {
      return NextResponse.json(
        { error: `POLAR_${plan.toUpperCase()}_PRODUCT_ID is not set in environment` },
        { status: 500 }
      );
    }

    await connectDB();
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a Polar checkout session
    const polarRes = await fetch(`${POLAR_API}/v1/checkouts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        customer_email: user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?checkout_id={CHECKOUT_ID}`,
      }),
    });

    if (!polarRes.ok) {
      const err = await polarRes.text();
      console.error('[Checkout] Polar API error:', polarRes.status, err);
      return NextResponse.json({ error: 'Failed to create checkout', detail: err }, { status: 502 });
    }

    const checkout = await polarRes.json() as { url?: string; id?: string };
    return NextResponse.json({ url: checkout.url, id: checkout.id });
  } catch (err: any) {
    console.error('[Checkout] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
