import { LandingIcon } from './LandingIcon';

interface FeatureCardProps {
  iconType: 'cart' | 'inventory' | 'users' | 'analytics' | 'security' | 'mobile';
  title: string;
  description: string;
}

export function FeatureCard({ iconType, title, description }: FeatureCardProps) {
  return (
    <div className="glass-card p-6 hover-contrast">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4">
        <LandingIcon type={iconType} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted leading-relaxed">{description}</p>
    </div>
  );
}
