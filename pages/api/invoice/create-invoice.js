import connectDB from '../../../middlewares/connectDB';
import { verifyToken } from '../../../utils/jwt';
import Invoice from '../../../models/Invoice';

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

    // Extract data from request body
    const {
      projectId,
      number,
      date,
      dueDate,
      sender,
      client,
      items,
      tax,
      discount,
      notes,
      terms,
        subtotal,
        total
    } = req.body;

    // Validate required fields
    if ( !projectId || !number || !date || !dueDate || !client.name || !items.length) {
      return res.status(400).json({
        message: 'Missing required fields',
        type: 'error'
      });
    }


    // Create new invoice

    const invoiceId = await generateInvoiceId();
    const invoice = new Invoice({
      projectId,
      invoiceId,
      invoiceDate: date,
      dueDate,
      sender,
      client,
      items: items.map(item => ({
        feature: item.feature,
        description: item.description,
        hours: item.hours,
        rate: item.rate,
        total: item.hours * item.rate
      })),
      tax: tax || 0,
      discount: discount || 0,
      notes,
      terms,
      createdBy: decoded.userId,
      status: 'draft',
      subtotal,
      total

    });

    // Save invoice
    await invoice.save();

    return res.status(200).json({
      message: 'Invoice created successfully',
      type: 'success',
      invoice
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({
      message: error.message || 'Error creating invoice',
      type: 'error'
    });
  }
};

export async function generateInvoiceId() {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Find the latest invoice for the current year
    const latestInvoice = await Invoice.findOne({
      invoiceId: new RegExp(`INV-${year}-`, 'i')
    }).sort({ invoiceId: -1 });
  
    let sequence = '0001';
    if (latestInvoice) {
      const lastSequence = parseInt(latestInvoice.invoiceId.split('-')[2]);
      sequence = (lastSequence + 1).toString().padStart(4, '0');
    }
  
    return `INV-${year}${month}-${sequence}`;
  }

export default connectDB(handler);