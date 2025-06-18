import Invoice from "../../../models/Invoice"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
    if (req.method == "PUT") {
        try {
            const { invoice } = req.body;
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }
            
            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;

            if (!invoice || !invoice._id) {
                return res.status(400).json({
                    type: 'error',
                    message: 'Invoice data and ID are required'
                });
            }

            // Find the existing invoice
            const existingInvoice = await Invoice.findOne({ _id: invoice._id, createdBy: userId });
            if (!existingInvoice) {
                return res.status(404).json({
                    type: 'error',
                    message: 'Invoice not found or you are not authorized to update this invoice'
                });
            }

            // Calculate item totals and prepare items
            const updatedItems = invoice.items.map(item => ({
                feature: item.feature || '',
                description: item.description || '',
                hours: parseFloat(item.hours) || 0,
                rate: parseFloat(item.rate) || 0,
                total: (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)
            }));

            // Calculate subtotal
            const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

            // Calculate tax and discount amounts
            const taxRate = parseFloat(invoice.tax) || 0;
            const discountRate = parseFloat(invoice.discount) || 0;
            const taxAmount = subtotal * (taxRate / 100);
            const discountAmount = subtotal * (discountRate / 100);
            const total = subtotal + taxAmount - discountAmount;

            // Prepare update data
            const updateData = {
                invoiceDate: new Date(invoice.invoiceDate),
                dueDate: new Date(invoice.dueDate),
                client: {
                    name: invoice.client.name || '',
                    email: invoice.client.email || '',
                    company: invoice.client.company || '',
                    address: invoice.client.address || ''
                },
                items: updatedItems,
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax: taxRate,
                discount: discountRate,
                total: parseFloat(total.toFixed(2)),
                notes: invoice.notes || '',
                terms: invoice.terms || 'Net 30',
                status: invoice.status || 'draft'
            };

            // Update the invoice
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                invoice._id,
                updateData,
                { 
                    new: true, // Return updated document
                    runValidators: true // Run mongoose validators
                }
            );

            if (!updatedInvoice) {
                return res.status(500).json({
                    type: 'error',
                    message: 'Failed to update invoice'
                });
            }

            return res.status(200).json({
                type: 'success',
                message: 'Invoice updated successfully',
                invoice: updatedInvoice
            });

        } catch (error) {
            console.error("Error updating invoice:", error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    type: 'error',
                    message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
                });
            }

            if (error.name === 'CastError') {
                return res.status(400).json({
                    type: 'error',
                    message: 'Invalid invoice ID format'
                });
            }

            return res.status(500).json({ 
                message: "Internal Server Error", 
                type: "error" 
            });
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
}

export default connectDB(handler);