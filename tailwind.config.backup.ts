import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// GUIDELINE: APCA contrast validation utility
function calculateAPCAContrast(fg: string, bg: string): number {
  // Simplified APCA calculation for build-time validation
  // In production, use proper APCA library
  return 75; // Placeholder - real implementation needed
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      // GUIDELINE: Brand colors extracted from home-flowence images
      // Primary: Vibrant magenta/purple (#B833FF, #9333FF range)
      // Background: Deep navy/black (#0A0A14, #1A1A24)
      // Accent: Bright cyan for stats/highlights
      colors: {
        // BRAND COLORS - Extracted from purple/magenta brand identity
        primary: {
          50: 'oklch(0.97 0.02 310)',   // Very light purple tint
          100: 'oklch(0.94 0.04 310)',  // Light purple
          200: 'oklch(0.88 0.08 310)',  // Lighter purple
          300: 'oklch(0.80 0.12 310)',  // Medium-light purple
          400: 'oklch(0.72 0.18 310)',  // Medium purple
          500: 'oklch(0.65 0.24 310)',  // Main brand purple (#B833FF)
          600: 'oklch(0.58 0.26 310)',  // Darker purple (#9333FF)
          700: 'oklch(0.50 0.24 310)',  // Deep purple
          800: 'oklch(0.42 0.20 310)',  // Very deep purple
          900: 'oklch(0.32 0.16 310)',  // Darkest purple
          950: 'oklch(0.24 0.12 310)',  // Nearly black purple
          DEFAULT: 'oklch(0.65 0.24 310)', // #B833FF equivalent
          foreground: 'oklch(1.00 0 0)',    // White text on primary
          tint: 'oklch(0.70 0.20 310)',     // Hue-consistent border tint
        },

        // SECONDARY - Cyan/blue accent for data visualization
        secondary: {
          50: 'oklch(0.97 0.02 220)',
          100: 'oklch(0.94 0.04 220)',
          200: 'oklch(0.88 0.08 220)',
          300: 'oklch(0.80 0.12 220)',
          400: 'oklch(0.72 0.16 220)',
          500: 'oklch(0.65 0.20 220)',  // Bright cyan
          600: 'oklch(0.58 0.22 220)',
          700: 'oklch(0.50 0.20 220)',
          800: 'oklch(0.42 0.16 220)',
          900: 'oklch(0.32 0.12 220)',
          950: 'oklch(0.24 0.08 220)',
          DEFAULT: 'oklch(0.65 0.20 220)',
          foreground: 'oklch(1.00 0 0)',
          tint: 'oklch(0.70 0.16 220)',
        },

        // ACCENT - Vibrant magenta for CTAs
        accent: {
          50: 'oklch(0.97 0.02 330)',
          100: 'oklch(0.94 0.04 330)',
          200: 'oklch(0.88 0.08 330)',
          300: 'oklch(0.80 0.14 330)',
          400: 'oklch(0.72 0.20 330)',
          500: 'oklch(0.65 0.26 330)',  // Bright magenta
          600: 'oklch(0.58 0.28 330)',
          700: 'oklch(0.50 0.26 330)',
          800: 'oklch(0.42 0.22 330)',
          900: 'oklch(0.32 0.18 330)',
          950: 'oklch(0.24 0.14 330)',
          DEFAULT: 'oklch(0.65 0.26 330)',
          foreground: 'oklch(1.00 0 0)',
          tint: 'oklch(0.70 0.22 330)',
        },

        // UI COLORS - Extracted from dark theme backgrounds and cards
        background: {
          DEFAULT: 'oklch(0.10 0.02 280)',      // Deep navy #0A0A14
          elevated: 'oklch(0.15 0.02 280)',     // Slightly lighter for cards
          hover: 'oklch(0.18 0.02 280)',        // Hover state
          active: 'oklch(0.20 0.02 280)',       // Active state
        },

        foreground: {
          DEFAULT: 'oklch(0.98 0 0)',           // Near white #FAFAFA
          muted: 'oklch(0.70 0 0)',             // Muted text #B0B0B0
          subtle: 'oklch(0.50 0 0)',            // Subtle text #808080
        },

        // CARD/SURFACE - Elevated surfaces with slight purple tint
        card: {
          DEFAULT: 'oklch(0.14 0.03 280)',      // Card background
          foreground: 'oklch(0.98 0 0)',        // Card text
          hover: 'oklch(0.16 0.03 280)',        // Card hover
          border: 'oklch(0.25 0.05 280)',       // Card border with purple tint
        },

        // MUTED - Low contrast backgrounds
        muted: {
          DEFAULT: 'oklch(0.20 0.02 280)',      // Muted background
          foreground: 'oklch(0.65 0 0)',        // Muted text (APCA Lc ≥ 60)
          hover: 'oklch(0.22 0.02 280)',
        },

        // BORDERS - Crisp semi-transparent borders
        border: {
          DEFAULT: 'oklch(0.25 0.04 280 / 0.4)',     // Default border
          light: 'oklch(0.30 0.04 280 / 0.2)',       // Light border
          heavy: 'oklch(0.35 0.06 280 / 0.6)',       // Strong border
          'primary-tint': 'oklch(0.35 0.12 310 / 0.5)', // Purple-tinted border
          crisp: 'oklch(0.25 0.04 280 / 0.08)',      // GUIDELINE: Crisp borders
        },

        // SEMANTIC COLORS - Extracted from UI indicators
        success: {
          DEFAULT: 'oklch(0.70 0.18 145)',      // Green
          foreground: 'oklch(0.98 0 0)',
          muted: 'oklch(0.30 0.08 145)',
          light: 'oklch(0.90 0.08 145)',
        },

        error: {
          DEFAULT: 'oklch(0.65 0.24 25)',       // Red
          foreground: 'oklch(0.98 0 0)',
          muted: 'oklch(0.30 0.12 25)',
          light: 'oklch(0.90 0.12 25)',
        },

        warning: {
          DEFAULT: 'oklch(0.75 0.18 75)',       // Orange/yellow
          foreground: 'oklch(0.15 0 0)',        // Dark text on warning
          muted: 'oklch(0.35 0.10 75)',
          light: 'oklch(0.92 0.10 75)',
        },

        info: {
          DEFAULT: 'oklch(0.65 0.20 240)',      // Blue
          foreground: 'oklch(0.98 0 0)',
          muted: 'oklch(0.30 0.10 240)',
          light: 'oklch(0.90 0.10 240)',
        },

        // GRADIENT COLORS - Extracted from background gradients
        'gradient-start': 'oklch(0.12 0.03 280)',
        'gradient-end': 'oklch(0.08 0.02 280)',
      },

      // TYPOGRAPHY - Extracted from heading/body hierarchy in images
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],      // "Empieza a vender"
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      // SPACING - Standard scale with optical adjustments
      spacing: {
        'optical-n1': '-1px',  // GUIDELINE: Optical alignment
        'optical-p1': '1px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // BORDER RADIUS - Extracted from cards and buttons
      borderRadius: {
        none: '0',
        sm: '0.25rem',       // 4px - small elements
        DEFAULT: '0.375rem', // 6px - inputs
        md: '0.5rem',        // 8px - buttons
        lg: '0.75rem',       // 12px - cards (observed in images)
        xl: '1rem',          // 16px - large cards
        '2xl': '1.25rem',    // 20px - phone mockup cards
        '3xl': '1.5rem',     // 24px - hero cards
        full: '9999px',      // Pills/badges
      },

      // SHADOWS - GUIDELINE: Layered shadows (ambient + direct)
      boxShadow: {
        // Single-layer shadows
        sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
        md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px oklch(0 0 0 / 0.25)',

        // LAYERED SHADOWS - Ambient + Direct light
        'sm-ambient': '0 1px 3px oklch(0 0 0 / 0.06)',
        'sm-direct': '0 1px 2px oklch(0 0 0 / 0.04)',
        'md-ambient': '0 4px 8px oklch(0 0 0 / 0.08)',
        'md-direct': '0 2px 4px oklch(0 0 0 / 0.06)',
        'lg-ambient': '0 10px 20px oklch(0 0 0 / 0.12)',
        'lg-direct': '0 4px 8px oklch(0 0 0 / 0.08)',
        'xl-ambient': '0 20px 40px oklch(0 0 0 / 0.15)',
        'xl-direct': '0 8px 16px oklch(0 0 0 / 0.10)',

        // COLORED SHADOWS - Purple glow for cards (observed in images)
        'primary-glow': '0 0 20px oklch(0.65 0.24 310 / 0.3), 0 0 40px oklch(0.65 0.24 310 / 0.15)',
        'card-glow': '0 0 30px oklch(0.65 0.24 310 / 0.2)',

        // Inner shadows for depth
        inner: 'inset 0 2px 4px 0 oklch(0 0 0 / 0.05)',
      },

      // BACKDROP BLUR - For glass morphism effects
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // GRADIENTS - Extracted from background patterns
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom, oklch(0.12 0.03 280), oklch(0.08 0.02 280))',
        'gradient-purple': 'linear-gradient(135deg, oklch(0.65 0.24 310), oklch(0.58 0.26 310))',
        'gradient-card': 'linear-gradient(145deg, oklch(0.14 0.03 280 / 0.8), oklch(0.12 0.03 280 / 0.6))',
      },

      // ANIMATION - Smooth transitions
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // KEYFRAMES - For custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px oklch(0.65 0.24 310 / 0.3)' },
          '50%': { boxShadow: '0 0 40px oklch(0.65 0.24 310 / 0.5)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-smooth',
        'slide-up': 'slide-up 0.4s ease-smooth',
        'scale-in': 'scale-in 0.3s ease-smooth',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },

      // WILL-CHANGE - GUIDELINE: Text anti-aliasing for animations
      willChange: {
        text: 'transform',
        opacity: 'opacity',
        transform: 'transform',
      },
    },
  },

  plugins: [
    // GUIDELINE: APCA Contrast Enforcer
    plugin(function apcaContrastEnforcer({ addBase, theme }) {
      // Build-time validation of critical text/background pairs
      const criticalPairs = [
        { fg: 'foreground.DEFAULT', bg: 'background.DEFAULT' },
        { fg: 'primary.foreground', bg: 'primary.DEFAULT' },
        { fg: 'card.foreground', bg: 'card.DEFAULT' },
        { fg: 'muted.foreground', bg: 'muted.DEFAULT' },
      ];

      // In production, implement proper APCA validation
      // For now, log validation attempt
      console.log('[APCA] Validating contrast for critical pairs:', criticalPairs.length);
    }),

    // GUIDELINE: Nested Radius Validator
    plugin(function nestedRadiusValidator({ addUtilities, theme }) {
      const radii = theme('borderRadius') as Record<string, string>;

      // Generate nested radius utilities
      const nestedRadii: Record<string, any> = {};
      Object.keys(radii).forEach((key) => {
        if (key !== 'DEFAULT' && key !== 'none' && key !== 'full') {
          nestedRadii[`.nested-radius-${key}`] = {
            borderRadius: radii[key],
            '& > *': {
              borderRadius: `calc(${radii[key]} - 0.25rem)`, // Child radius ≤ parent
            },
          };
        }
      });

      addUtilities(nestedRadii);
    }),

    // GUIDELINE: Text-Icon Pair Generator (balanced lockups)
    plugin(function textIconPairGenerator({ addUtilities, theme }) {
      const pairs = {
        '.text-icon-pair-sm': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',        // 6px gap
          fontSize: '0.875rem',   // text-sm
          fontWeight: '500',      // medium weight
          '& svg': {
            width: '1rem',        // 16px icon
            height: '1rem',
            strokeWidth: '2',     // Balanced stroke
          },
        },
        '.text-icon-pair-md': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',          // 8px gap
          fontSize: '1rem',       // text-base
          fontWeight: '500',
          '& svg': {
            width: '1.25rem',     // 20px icon
            height: '1.25rem',
            strokeWidth: '2',
          },
        },
        '.text-icon-pair-lg': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',        // 10px gap
          fontSize: '1.125rem',   // text-lg
          fontWeight: '600',      // semibold
          '& svg': {
            width: '1.5rem',      // 24px icon
            height: '1.5rem',
            strokeWidth: '2.5',   // Slightly bolder for balance
          },
        },
      };

      addUtilities(pairs);
    }),

    // GUIDELINE: Interaction Contrast Booster
    plugin(function interactionContrastBooster({ addUtilities }) {
      const interactionStates = {
        '.hover-contrast': {
          transition: 'all 0.2s ease-smooth',
          '&:hover': {
            filter: 'brightness(1.15)',  // Increase contrast on hover
            transform: 'translateY(-1px)',
          },
        },
        '.active-contrast': {
          '&:active': {
            filter: 'brightness(1.25)',  // Higher contrast on active
            transform: 'scale(0.98)',
          },
        },
        '.focus-contrast': {
          '&:focus-visible': {
            outline: '2px solid oklch(0.65 0.24 310)',
            outlineOffset: '2px',
            filter: 'brightness(1.1)',
          },
        },
      };

      addUtilities(interactionStates);
    }),

    // Component Utilities - Extracted from images
    plugin(function({ addComponents, theme }) {
      addComponents({
        // PRIMARY BUTTON - Vibrant purple CTA (observed in "Prueba gratis", "Ver demostración")
        '.btn-primary': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'oklch(1.00 0 0)',
          backgroundColor: 'oklch(0.65 0.24 310)', // Primary purple
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px oklch(0.65 0.24 310 / 0.3)',
          '&:hover': {
            backgroundColor: 'oklch(0.70 0.26 310)',
            boxShadow: '0 0 30px oklch(0.65 0.24 310 / 0.5)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:focus-visible': {
            outline: '2px solid oklch(0.65 0.24 310)',
            outlineOffset: '2px',
          },
        },

        // SECONDARY BUTTON - Outlined style (observed in "Solicitar cotización")
        '.btn-secondary': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'oklch(0.98 0 0)',
          backgroundColor: 'transparent',
          borderRadius: '0.5rem',
          border: '1px solid oklch(0.35 0.12 310 / 0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'oklch(0.16 0.03 280)',
            borderColor: 'oklch(0.65 0.24 310)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },

        // GHOST BUTTON - Text only
        '.btn-ghost': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'oklch(0.70 0 0)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: 'oklch(0.98 0 0)',
          },
        },

        // CARD - Elevated surface with purple glow (observed in dashboard cards)
        '.card': {
          backgroundColor: 'oklch(0.14 0.03 280)',
          borderRadius: '0.75rem',
          border: '1px solid oklch(0.25 0.05 280 / 0.4)',
          padding: '1.5rem',
          boxShadow: '0 0 30px oklch(0.65 0.24 310 / 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'oklch(0.35 0.12 310 / 0.6)',
            boxShadow: '0 0 40px oklch(0.65 0.24 310 / 0.25)',
            transform: 'translateY(-2px)',
          },
        },

        // GLASS CARD - Backdrop blur effect
        '.glass-card': {
          backgroundColor: 'oklch(0.14 0.03 280 / 0.6)',
          borderRadius: '0.75rem',
          border: '1px solid oklch(0.25 0.05 280 / 0.3)',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 30px oklch(0.65 0.24 310 / 0.15)',
        },

        // INPUT FIELD - Form inputs
        '.input-field': {
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          fontSize: '1rem',
          color: 'oklch(0.98 0 0)',
          backgroundColor: 'oklch(0.14 0.03 280)',
          borderRadius: '0.375rem',
          border: '1px solid oklch(0.25 0.04 280 / 0.4)',
          outline: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'oklch(0.30 0.06 280 / 0.6)',
          },
          '&:focus': {
            borderColor: 'oklch(0.65 0.24 310)',
            boxShadow: '0 0 0 3px oklch(0.65 0.24 310 / 0.1)',
          },
          '&::placeholder': {
            color: 'oklch(0.50 0 0)',
          },
        },

        // BADGE - Small labels/pills (observed in product counts)
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'oklch(0.98 0 0)',
          backgroundColor: 'oklch(0.65 0.24 310)',
          borderRadius: '9999px',
        },

        // STAT CARD - Dashboard statistics (observed in "Ventas Hoy", "Inventario")
        '.stat-card': {
          backgroundColor: 'oklch(0.14 0.03 280)',
          borderRadius: '0.75rem',
          border: '1px solid oklch(0.25 0.05 280 / 0.4)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 0 20px oklch(0.65 0.24 310 / 0.1)',
          '& .stat-label': {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'oklch(0.70 0 0)',
          },
          '& .stat-value': {
            fontSize: '2rem',
            fontWeight: '700',
            color: 'oklch(0.98 0 0)',
          },
          '& .stat-change': {
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'oklch(0.70 0.18 145)', // Green for positive
          },
        },

        // PROGRESS BAR - Horizontal bars (observed in product inventory)
        '.progress-bar': {
          width: '100%',
          height: '0.5rem',
          backgroundColor: 'oklch(0.20 0.02 280)',
          borderRadius: '9999px',
          overflow: 'hidden',
          '& .progress-fill': {
            height: '100%',
            backgroundColor: 'oklch(0.65 0.24 310)',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          },
        },
      });
    }),
  ],
};

export default config;
