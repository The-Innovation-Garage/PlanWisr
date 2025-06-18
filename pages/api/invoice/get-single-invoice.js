import Invoice from "../../../models/Invoice"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const {invoiceId} = req.body;
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
        const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
        const userId = decoded.userId;
        console.log(invoiceId, userId);
       const invoice = await Invoice.findOne({ _id: invoiceId, createdBy: userId });
        return res.status(200).json({ type: "success", invoice: invoice });
    }
    catch (error) {
        console.error("Error getting invoice:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
    }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}

export default connectDB(handler);