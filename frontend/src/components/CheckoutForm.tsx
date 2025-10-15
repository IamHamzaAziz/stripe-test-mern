import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  clearCart: () => void;
}

const CheckoutForm = ({ orderId, clearCart }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update order status
        await axios.post(
          `${import.meta.env.VITE_API_URL}/orders/${orderId}/complete`
        );
        
        clearCart();
        navigate('/success', { state: { orderId } });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Test Mode: Use card number 4242 4242 4242 4242 with any future date and CVC
      </p>
    </form>
  );
};

export default CheckoutForm;