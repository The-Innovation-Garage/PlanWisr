import connectDB from '../../../middlewares/connectDB';
import { verifyToken } from '../../../utils/jwt';
import User from '../../../models/User';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed', type: 'error' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized', type: 'error' });
    }

    const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token', type: 'error' });
    }

    let userId = decoded.userId;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found', type: 'error' });
    }
    user.isPro = true;
    user.subscriptionStatus = 'active';
    user.paymentIntentId = req.body.subscriptionId || null;
    await user.save();

    return res.status(201).json({
      message: 'Subscription updated successfully',
      type: 'success'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({
      message: error.message || 'Error updating subscription',
      type: 'error'
    });
  }
};

export default connectDB(handler);