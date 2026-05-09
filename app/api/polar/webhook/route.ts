import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import crypto from 'crypto';

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-polar-signature');
    const body = await req.text();

    if (POLAR_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', POLAR_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    await connectDB();

    // Handle subscription events
    if (event.type === 'checkout.completed' || event.type === 'subscription.created') {
      const { customer_email } = event.data;

      // Update user plan to Pro
      await User.findOneAndUpdate(
        { email: customer_email },
        { $set: { plan: 'pro' } }
      );

      console.log(`✅ User ${customer_email} upgraded to Pro`);
    }

    if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired') {
      const { customer_email } = event.data;

      // Downgrade to free
      await User.findOneAndUpdate(
        { email: customer_email },
        { $set: { plan: 'free' } }
      );

      console.log(`ℹ️ User ${customer_email} downgraded to Free`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
