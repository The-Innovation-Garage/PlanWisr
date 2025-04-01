import connectDB from "../../middlewares/connectDB";

const handler = (req, res) =>{
    res.status(200).json({ message: 'DB connected!' });
}

export default connectDB(handler);