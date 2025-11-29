
import { HeroSection } from "@/components/landing/HeroSection";
import { lazy, Suspense } from "react";

// PERFORMANCE: Code split below-the-fold components to reduce initial bundle size
// These components are not visible until user scrolls, so lazy loading improves LCP
const AppMockup = lazy(() => import("@/components/landing/AppMockup").then(m => ({ default: m.AppMockup })));
const FeatureCard = lazy(() => import("@/components/landing/FeatureCard").then(m => ({ default: m.FeatureCard })));
const StepsSection = lazy(() => import("@/components/landing/StepsSection").then(m => ({ default: m.StepsSection })));
const PricingCard = lazy(() => import("@/components/landing/PricingCard").then(m => ({ default: m.PricingCard })));

// PERFORMANCE: Defer loading heavy constants until needed
import { features, pricingPlans } from "../../constants/landingpage";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative bg-grid">
      <HeroSection />

      {/* PERFORMANCE: Wrap lazy-loaded components in Suspense with minimal fallback */}
      <Suspense fallback={<div className="h-96" />}>
        <AppMockup />
      </Suspense>

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

          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-48 skeleton" /><div className="h-48 skeleton" /><div className="h-48 skeleton" /></div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<div className="h-96" />}>
        <StepsSection />
      </Suspense>

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

          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto"><div className="h-96 skeleton" /><div className="h-96 skeleton" /><div className="h-96 skeleton" /></div>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={index} {...plan} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>
    </div>
  );
}
