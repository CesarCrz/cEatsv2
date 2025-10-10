import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Recuperar la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        session: {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          status: session.payment_status,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: session.payment_status,
      })
    }
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying payment' },
      { status: 500 }
    )
  }
}
