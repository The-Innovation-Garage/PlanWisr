

import Invoice from "../../../models/Invoice"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
import mongoose from 'mongoose';
const handler = async (req, res) => {
    if (req.method == "POST") {
        try {
            
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }
            
            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            if (!decoded || !decoded.userId) {
                return res.status(401).json({ message: "Invalid token", type: "error" });
            }
            const userId = decoded.userId;
            let convertedUserId = new mongoose.Types.ObjectId(userId);
            
            const now = new Date();

            // 1. Total Invoices
            const totalInvoices = await Invoice.countDocuments({ createdBy: convertedUserId });

            // 2. Total Earnings
            const earnings = await Invoice.aggregate([
                { $match: { createdBy: convertedUserId, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);
            const totalEarnings = earnings[0]?.total || 0;

            // 3. Pending Earnings
            const pending = await Invoice.aggregate([
                { $match: { createdBy: convertedUserId, status: { $in: ['sent', 'draft'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);
            const pendingEarnings = pending[0]?.total || 0;

            // 4. Overdue Invoices
            const overdue = await Invoice.aggregate([
                { $match: { createdBy: convertedUserId, status: 'sent', dueDate: { $lt: now } } },
                { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } }
            ]);
            const overdueCount = overdue[0]?.count || 0;
            const overdueTotal = overdue[0]?.total || 0;

            console.log({
                totalInvoices,
                totalEarnings,
                pendingEarnings,
                overdueCount,
                overdueTotal
            });

            return res.status(200).json({
                totalInvoices,
                totalEarnings,
                pendingEarnings,
                overdueCount,
                overdueTotal,
                type: "success",
                message: "Invoice analytics retrieved successfully"
            });

        }
        catch (error) {
            console.error("Error getting invoice analytics:", error);
            return res.status(500).json({ message: "Error getting invoice analytics", type: "error" });
        }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" });
    }
}

export default connectDB(handler);