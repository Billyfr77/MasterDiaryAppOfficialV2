// Safe Initialization
let stripe;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('PLACEHOLDER')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn("⚠️ Stripe API Key missing or invalid. Stripe features will be disabled.");
    stripe = {
        customers: { create: async () => ({ id: 'cus_mock' }) },
        checkout: { sessions: { create: async () => ({ url: '#' }) } },
        billingPortal: { sessions: { create: async () => ({ url: '#' }) } },
        webhooks: { constructEvent: () => { throw new Error("Stripe Mock: Webhooks disabled"); } }
    };
}

const { Subscription, User } = require('../models');

const DOMAIN = process.env.CLIENT_URL || 'http://localhost:5173';

// Map App Plans to Stripe Price IDs
const PLANS = {
    'starter': process.env.STRIPE_PRICE_STARTER,
    'pro': process.env.STRIPE_PRICE_PRO,
    'enterprise': process.env.STRIPE_PRICE_ENTERPRISE
};

exports.createCheckoutSession = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!PLANS[plan]) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        // Get or Create Stripe Customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: userId }
            });
            customerId = customer.id;
            // Update User model to store stripeCustomerId (Ensure model has this field)
            user.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: PLANS[plan],
                    quantity: 1,
                },
            ],
            customer: customerId,
            success_url: `${DOMAIN}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/subscription/cancel`,
            metadata: {
                userId: userId,
                plan: plan
            }
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createPortalSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user.stripeCustomerId) {
            return res.status(400).json({ error: 'No billing account found.' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${DOMAIN}/subscription`,
        });

        res.json({ url: portalSession.url });

    } catch (error) {
        console.error('Stripe Portal Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.rawBody is needed here. 
        // We will configure the route/middleware to provide it.
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata.userId;
                const plan = session.metadata.plan;
                const subscriptionId = session.subscription;

                // Update DB
                await Subscription.upsert({
                    userId: userId,
                    plan: plan,
                    status: 'active',
                    stripeSubscriptionId: subscriptionId,
                    startDate: new Date(),
                    // We might need to fetch the sub from Stripe to get real end date
                });
                console.log(`User ${userId} subscribed to ${plan}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                // Find DB record by stripeSubscriptionId
                const dbSub = await Subscription.findOne({ where: { stripeSubscriptionId: subscription.id } });
                if (dbSub) {
                    dbSub.status = 'cancelled';
                    dbSub.endDate = new Date();
                    await dbSub.save();
                    console.log(`Subscription ${subscription.id} cancelled.`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const dbSub = await Subscription.findOne({ where: { stripeSubscriptionId: subscription.id } });
                if (dbSub) {
                    // Check status (active, past_due, etc)
                    dbSub.status = subscription.status === 'active' ? 'active' : 'inactive';
                    // Map Price ID back to Plan name if needed, or just trust status
                    await dbSub.save();
                }
                break;
            }
        }
    } catch (err) {
        console.error(`Webhook Handler Error: ${err.message}`);
        return res.status(500).send('Webhook handler failed');
    }

    res.json({ received: true });
};
