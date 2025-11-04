import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { paymentsApi } from '@/lib/api';

interface StripeCardPaymentProps {
  amount: number;
  storeId: string;
  receiptNumber?: string;
  saleData: {
    items: Array<{ product_id: string; quantity: number }>;
    payment_method: 'card';
    discount?: number;
    notes?: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const StripeCardPayment: React.FC<StripeCardPaymentProps> = ({
  amount,
  storeId,
  receiptNumber,
  saleData,
  onSuccess,
  onError,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe no está disponible');
      return;
    }

    setProcessing(true);

    try {
      // Create PaymentIntent
      const cents = Math.round(amount * 100);
      const intent = await paymentsApi.createIntent(storeId, {
        amount_cents: cents,
        currency: 'usd',
        receipt_number: receiptNumber
      });

      if (!intent.client_secret) {
        throw new Error('No se recibió client_secret');
      }

      // Confirm payment with Stripe Elements
      const { error, paymentIntent } = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        onError(error.message || 'Error en el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, now confirm the sale with the backend
        try {
          console.log('💳 Stripe payment succeeded, confirming sale...');
          console.log('💳 Payment Intent ID:', paymentIntent.id);
          console.log('💳 Store ID:', storeId);
          console.log('💳 Sale Data:', saleData);
          
          await paymentsApi.confirmPayment(storeId, {
            payment_intent_id: paymentIntent.id,
            sale_data: saleData
          });
          
          // Call success callback with payment intent ID
          onSuccess(paymentIntent.id);
        } catch (confirmError) {
          // Payment succeeded but sale confirmation failed
          onError(`Pago exitoso pero error al confirmar venta: ${confirmError instanceof Error ? confirmError.message : 'Error desconocido'}`);
        }
      } else {
        onError('El pago no fue procesado correctamente');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de la Tarjeta
        </label>
        <CardElement
          options={cardElementOptions}
          className="p-3 border border-gray-300 rounded bg-white"
        />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total a cobrar:</span>
          <span className="font-semibold text-lg">${amount.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Procesando pago...' : `Cobrar $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};
