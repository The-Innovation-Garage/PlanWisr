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
     
    
      switch (eventType) {
        case 'order.completed':
          console.log("✅ New Order Completed:", email);
  
          // Update user as premium or create a subscription record
          // Example:
          await User.updateOne({ email }, { isPro: true, subscriptionStatus: 'active', subscriptionId: orderId });
  
          break;
  
        case 'order.refunded':
          console.log("💸 Order Refunded:", email);
  
          // Downgrade user or revoke access
          // Example:
          await User.updateOne({ email }, { isPro: false, subscriptionStatus: 'refunded' });
  
          break;
  
        case 'customer.subscription.deleted':
          console.log("⛔ Subscription Cancelled:", email);
  
          // Mark user as cancelled
          await User.updateOne({ email }, { isPro: false, subscriptionStatus: 'cancelled' });
  
          break;
  
        case 'customer.subscription.updated':
          console.log("🔄 Subscription Updated:", email);
  
          // You can update the status if changed
          await User.updateOne({ email }, { subscriptionStatus: 'updated' });
  
          break;
  
        case 'invoice.payment_succeeded':
          console.log("💳 Subscription Renewed (Payment Succeeded):", email);
  
          // Ensure premium access stays active
          await User.updateOne({ email }, { isPro: true, subscriptionStatus: 'active' });
  
          break;
  
        case 'invoice.payment_failed':
          console.log("❌ Payment Failed:", email);
  
          // Optionally mark user as inactive or notify them
          await User.updateOne({ email }, { isPro: false, subscriptionStatus: 'payment_failed' });
  
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
  
  export default connectDB(handler);
  