// pages/api/webhook.js
import connectDB from "../../middlewares/connectDB";
import User from "../../models/User"

const handler = async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
        const eventType = req.headers['x-pocketsflow-event']; // ✅ this is where the event type lives
        const payload = req.body;
  
      console.log("📦 Webhook Event:", payload);
      console.log("📩 Event received:", eventType);

      let data = extractSubscriptionData(payload);
      const {stripeCustomerId, stripeSubscriptionId, userId} = data;
     
    
      switch (eventType) {
        case 'order.completed':
          console.log("✅ New Order Completed:", userId);
  
          // Update user as premium or create a subscription record
          // Example:
          await User.updateOne({ _id: userId }, { isPro: true, subscriptionStatus: 'active', subscriptionId: orderId });
  
          break;
  
        case 'order.refunded':
          console.log("💸 Order Refunded:", userId);
  
          // Downgrade user or revoke access
          // Example:
          await User.updateOne({ _id: userId }, { isPro: false, subscriptionStatus: 'refunded' });
  
          break;
  
        case 'customer.subscription.deleted':
          console.log("⛔ Subscription Cancelled:", userId);
  
          // Mark user as cancelled
          await User.updateOne({ _id: userId }, { isPro: false, subscriptionStatus: 'cancelled' });
  
          break;
  
        case 'customer.subscription.updated':
          console.log("🔄 Subscription Updated:", userId);
  
          // You can update the status if changed
          await User.updateOne({ _id:userId }, { subscriptionStatus: 'updated' });
  
          break;
  
        case 'invoice.payment_succeeded':
          console.log("💳 Subscription Renewed (Payment Succeeded):", userId);
  
          // Ensure premium access stays active
          await User.updateOne({ _id:userId }, { isPro: true, subscriptionStatus: 'active', subscriptionId: stripeSubscriptionId, stripeCustomerId, aiLimit: 500 });
  
          break;
  
        case 'invoice.payment_failed':
          console.log("❌ Payment Failed:", userId);
  
          // Optionally mark user as inactive or notify them
          await User.updateOne({ _id:userId }, { isPro: false, subscriptionStatus: 'payment_failed' });
  
          break;
  
        default:
          console.log("ℹ️ Ignored event:", eventType);
      }
  
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("❌ Webhook error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  

  const extractSubscriptionData = (webhookBody) => {
    const metadata = webhookBody.subscription_details?.metadata || {};
  
    // Extract from webhookMetadata string (if available)
    const rawWebhookMetadata = metadata.webhookMetadata?.replace(/^"|"$/g, "") || "";
    const parsedMetadata = new URLSearchParams(rawWebhookMetadata);
  
    return {
      userId: parsedMetadata.get("userId") || metadata.userId || null,
      stripeSubscriptionId: webhookBody.subscription || metadata.subscription || null,
      stripeCustomerId: webhookBody.customer || metadata.stripeCustomerId || null,
    };
  };


  export default connectDB(handler);

  