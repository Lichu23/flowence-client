interface PricingCardProps {
  name: string
  description: string
  price: string
  priceSubtext?: string
  features: string[]
  buttonText: string
  isPopular?: boolean
}

export function PricingCard({ 
  name, 
  description, 
  price, 
  priceSubtext,
  features, 
  buttonText, 
  isPopular = false 
}: PricingCardProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 relative transition-all ${
      isPopular 
        ? 'border-2 border-purple-500/50 shadow-xl shadow-purple-500/20 md:-mt-4 md:mb-4' 
        : 'border border-white/10 hover:border-white/20'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full text-xs font-medium whitespace-nowrap">
          Más popular
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      
      <div className="mb-6">
        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
          {price}
        </span>
        {priceSubtext && <span className="text-gray-400">{priceSubtext}</span>}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-3 rounded-lg font-medium transition-all ${
        isPopular 
          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}>
        {buttonText}
      </button>
    </div>
  )
}
