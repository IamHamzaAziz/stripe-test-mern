export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CustomerInfo {
    name: string;
    email: string;
    address: string;
}

export interface Order {
    _id: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    totalAmount: number;
    paymentIntentId: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}