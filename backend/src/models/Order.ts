import mongoose, { Document, Schema } from 'mongoose';

interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    items: IOrderItem[];
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    totalAmount: number;
    paymentIntentId: string;
    status: 'pending' | 'completed' | 'failed';
}

const OrderSchema = new Schema<IOrder>({
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);