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
  // GUIDELINE: LCP optimization - preconnect to API and font CDNs
  other: {
    // Preconnect to API domain to reduce connection time
    "link-preconnect-api": process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* GUIDELINE: Font optimization - system fonts with fallback */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"} />
      </head>
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
