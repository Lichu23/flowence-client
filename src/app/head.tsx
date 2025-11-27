// PERFORMANCE: Critical resource hints for landing page
export default function Head() {
  return (
    <>
      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"} />

      {/* Preconnect to API domain for faster requests */}
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"} />

      {/* Viewport meta for proper mobile rendering */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

      {/* Theme color for mobile browsers */}
      <meta name="theme-color" content="#000000" />
    </>
  );
}
