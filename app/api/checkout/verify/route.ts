import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLAR_API =
  process.env.POLAR_MODE === 'sandbox'
    ? 'https://sandbox-api.polar.sh'
    : 'https://api.polar.sh';

const PRODUCT_PLAN: Record<string, 'starter' | 'pro'> = {
  [process.env.POLAR_STARTER_PRODUCT_ID ?? '']: 'starter',
  [process.env.POLAR_PRO_PRODUCT_ID ?? '']: 'pro',
};

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

    const { checkoutId } = await req.json() as { checkoutId?: string };
    if (!checkoutId) {
      return NextResponse.json({ error: 'checkoutId required' }, { status: 400 });
    }

    // Fetch the checkout from Polar to confirm it was paid
    const polarRes = await fetch(`${POLAR_API}/v1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}` },
    });

    if (!polarRes.ok) {
      const err = await polarRes.text();
      console.error('[Verify] Polar fetch error:', polarRes.status, err);
      return NextResponse.json({ error: 'Could not verify checkout', detail: err }, { status: 502 });
    }

    const checkout = await polarRes.json() as {
      status?: string;
      product_id?: string;
      customer_email?: string;
    };

    if (checkout.status !== 'confirmed' && checkout.status !== 'succeeded') {
      return NextResponse.json({ verified: false, status: checkout.status });
    }

    const plan = PRODUCT_PLAN[checkout.product_id ?? ''] ?? 'starter';

    await connectDB();
    const user = await User.findOneAndUpdate(
      { uid: decoded.uid },
      { $set: { plan } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[Verify] ✅ ${decoded.uid} upgraded to ${plan} via checkout ${checkoutId}`);
    return NextResponse.json({ verified: true, plan, user });
  } catch (err: any) {
    console.error('[Verify] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
