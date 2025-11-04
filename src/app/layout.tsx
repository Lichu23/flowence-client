import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { CartProvider } from "@/contexts/CartContext";
import { StripeProvider } from "@/components/common/StripeProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Flowence - Multi-Store Management",
  description: "All-in-one solution for managing multiple stores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html >
      <body className="antialiased overflow-x-hidden">
        <ToastProvider>
          <AuthProvider>
            <StoreProvider>
              <SettingsProvider>
                <CartProvider>
                  <StripeProvider>
                    {children}
                  </StripeProvider>
                </CartProvider>
              </SettingsProvider>
            </StoreProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
