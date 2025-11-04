import React, { useState } from 'react';
import { paymentsApi } from '@/lib/api';
import * as QRCode from 'qrcode';
import Image from 'next/image';

interface StripeQRPaymentProps {
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

export const StripeQRPayment: React.FC<StripeQRPaymentProps> = ({
  amount,
  storeId,
  receiptNumber,
  saleData,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [processing, setProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [polling, setPolling] = useState(false);

  const generateQRPayment = async () => {
    if (processing) return;

    setProcessing(true);

    try {
      // Create PaymentIntent for QR payment
      const cents = Math.round(amount * 100);
      const intent = await paymentsApi.createIntent(storeId, {
        amount_cents: cents,
        currency: 'usd', // TODO: Get from store settings
        receipt_number: receiptNumber,
        metadata: {
          payment_type: 'qr',
          store_id: storeId
        }
      });

      if (!intent.client_secret) {
        throw new Error('No se recibió client_secret');
      }

      setPaymentIntentId(intent.payment_intent_id);

      // Generate QR code with payment link
      // For Stripe, we'll create a payment link that can be scanned
      const paymentUrl = `${window.location.origin}/payment/${intent.payment_intent_id}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
      
      // Start polling for payment status
      startPaymentPolling(intent.payment_intent_id);
      
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error al generar pago QR');
    } finally {
      setProcessing(false);
    }
  };

  const startPaymentPolling = (intentId: string) => {
    setPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        // Check payment status with backend
        const status = await paymentsApi.getPaymentStatus(storeId, intentId);
        
        if (status.status === 'succeeded') {
          clearInterval(pollInterval);
          setPolling(false);
          
          // Payment succeeded, confirm the sale
          try {
            console.log('💳 QR payment succeeded, confirming sale...');
            console.log('💳 Payment Intent ID:', intentId);
            console.log('💳 Store ID:', storeId);
            console.log('💳 Sale Data:', saleData);
            
            await paymentsApi.confirmPayment(storeId, {
              payment_intent_id: intentId,
              sale_data: saleData
            });
            
            onSuccess(intentId);
            setShowQR(false);
          } catch (confirmError) {
            onError(`Pago exitoso pero error al confirmar venta: ${confirmError instanceof Error ? confirmError.message : 'Error desconocido'}`);
          }
        } else if (status.status === 'canceled' || status.status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          onError('El pago fue cancelado o falló');
          setShowQR(false);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Auto-stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
      if (showQR) {
        onError('Tiempo de espera agotado. Por favor intente nuevamente.');
        setShowQR(false);
      }
    }, 5 * 60 * 1000);
  };

  const cancelPayment = () => {
    setShowQR(false);
    setQrCodeUrl('');
    setPaymentIntentId('');
    setPolling(false);
  };

  return (
    <div className="space-y-4">
      {!showQR ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pago con Código QR</h3>
            <p className="text-sm text-gray-600 mb-4">
              Escanea el código QR con tu aplicación de pago para completar la transacción
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total a cobrar:</span>
              <span className="font-semibold text-lg">${amount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={generateQRPayment}
            disabled={processing || disabled}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Generando código QR...' : 'Generar Código QR'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Escanea el Código QR</h3>
            <p className="text-sm text-gray-600">
              Usa la cámara de tu teléfono o aplicación de pago para escanear este código
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Image src={qrCodeUrl} alt="Payment QR Code" width={256} height={256} className="rounded-lg" />
            </div>
          </div>

          {polling && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Esperando pago...</span>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Monto:</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">ID de Pago:</span>
              <span className="font-mono text-xs">{paymentIntentId.slice(-8)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cancelPayment}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={generateQRPayment}
              disabled={processing}
              className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
            >
              Regenerar QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
