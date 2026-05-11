import Stripe from 'stripe';

const getStripe = () => {
  // Lazy initialize to ensure env vars are loaded
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing. Add it to Backend/.env');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
};

export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { amount, productName, metadata, successUrl, cancelUrl } = req.body;

    if (!amount || !productName) {
      return res.status(400).json({ success: false, message: 'Amount and productName are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(amount * 100), // convert rupees to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
      client_reference_id: req.user._id.toString()
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifySession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({ success: true, session });
    } else {
      res.json({ success: false, message: 'Payment not completed', session });
    }
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
