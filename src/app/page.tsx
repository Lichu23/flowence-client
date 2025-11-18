"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { AppMockup } from "@/components/landing/AppMockup";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StepsSection } from "@/components/landing/StepsSection";
import { PricingCard } from "@/components/landing/PricingCard";
import { Footer } from "@/components/landing/Footer";
import { features, pricingPlans } from "../../constants/landingpage";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-foreground-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative bg-grid">
      <Navigation />

      <HeroSection />

      <AppMockup />

      {/* Features Section */}
      <section
        id="caracteristicas"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-purple-950/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Todo lo que necesitas para gestionar tu negocio
            </h2>
            <p className="text-lg text-foreground-muted max-w-3xl mx-auto leading-relaxed">
              Una plataforma completa con todas las herramientas para operar tu
              supermercado o almacén de manera eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <StepsSection />

      {/* Pricing Section */}
      <section
        id="precios"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-950/10 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Precios transparentes para cada etapa
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-8">
              Comienza gratis durante 14 días. Sin tarjeta de crédito requerida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
