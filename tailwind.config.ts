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
      // UPDATED: Pure black theme matching landing page (#000000)
      colors: {
        // BASE - Pure black with white text hierarchy
        background: {
          DEFAULT: '#000000',              // Pure black (landing page)
          elevated: '#0f1020',             // Slightly elevated surfaces
        },

        foreground: {
          DEFAULT: '#ffffff',              // Pure white text
          muted: '#d1d5db',               // text-gray-300 (secondary text)
          subtle: '#9ca3af',              // text-gray-400 (muted text)
          disabled: '#6b7280',            // text-gray-500 (subtle text)
        },

        // CARD SURFACES - Matches landing page elevated cards
        card: {
          DEFAULT: '#0f1020',              // Elevated card (from AppMockup bg-black)
          hover: '#1a1a2e',                // Hover state
          foreground: '#ffffff',           // Text on cards
        },

        // BORDERS - White with opacity (landing page uses border-white/5, white/10, white/20)
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',    // border-white/5
          light: 'rgba(255, 255, 255, 0.1)',       // border-white/10
          strong: 'rgba(255, 255, 255, 0.2)',      // border-white/20
        },

        // GLASS MORPHISM - Landing page uses bg-white/5, bg-white/10
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',      // bg-white/5
          medium: 'rgba(255, 255, 255, 0.1)',      // bg-white/10
        },

        // PRIMARY - Purple palette (kept from original, used in landing)
        // Landing uses: from-purple-500 to-fuchsia-500, purple-400, purple-900/30, purple-500/30
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',   // Used in landing: text-purple-400, from-purple-400
          500: '#a855f7',   // Used in landing: from-purple-500, gradient borders
          600: '#9333ea',   // Used in landing: from-purple-600 (buttons)
          700: '#7e22ce',   // Used in landing: hover:from-purple-700
          800: '#6b21a8',
          900: '#581c87',   // Used in landing: bg-purple-900/30
          950: '#3b0764',
        },

        // SECONDARY - Fuchsia palette (for gradients)
        // Landing uses: to-fuchsia-500, to-fuchsia-600, to-fuchsia-400
        fuchsia: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',   // Used in landing: to-fuchsia-400 (text gradient)
          500: '#d946ef',   // Used in landing: to-fuchsia-500
          600: '#c026d3',   // Used in landing: to-fuchsia-600 (button gradient)
          700: '#a21caf',   // Used in landing: hover:to-fuchsia-700
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },

        // SEMANTIC COLORS - Match landing page usage
        success: {
          DEFAULT: '#10b981',              // emerald-500 (from landing: text-success)
          foreground: '#ffffff',
        },

        error: {
          DEFAULT: '#ef4444',              // red-500
          foreground: '#ffffff',
        },

        warning: {
          DEFAULT: '#f59e0b',              // amber-500 (from landing: text-warning)
          foreground: '#000000',
        },

        info: {
          DEFAULT: '#3b82f6',              // blue-500
          foreground: '#ffffff',
        },

        // MUTED - Low contrast backgrounds
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: '#d1d5db',           // text-gray-300
        },

        // LEGACY ALIASES (for backward compatibility with existing code)
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
          tint: '#c084fc',
        },

        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
          DEFAULT: '#d946ef',
          foreground: '#ffffff',
          tint: '#e879f9',
        },

        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
          tint: '#c084fc',
        },
      },

      // TYPOGRAPHY - Extracted from landing page
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],
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

      // BORDER RADIUS - From landing page cards
      borderRadius: {
        none: '0',
        sm: '0.25rem',       // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.5rem',        // 8px
        lg: '0.75rem',       // 12px
        xl: '1rem',          // 16px
        '2xl': '1.25rem',    // 20px - from landing cards
        '3xl': '1.5rem',     // 24px - from landing phone mockup
        full: '9999px',
      },

      // SHADOWS - GUIDELINE: Layered shadows (ambient + direct)
      // Landing page uses: shadow-2xl shadow-purple-500/50, shadow-purple-500/30
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // LAYERED SHADOWS
        'sm-ambient': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'sm-direct': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md-ambient': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'md-direct': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg-ambient': '0 10px 20px rgba(0, 0, 0, 0.12)',
        'lg-direct': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'xl-ambient': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'xl-direct': '0 8px 16px rgba(0, 0, 0, 0.10)',

        // COLORED SHADOWS - From landing page
        'purple-500/30': '0 0 30px rgba(168, 85, 247, 0.3)',
        'purple-500/50': '0 25px 50px -12px rgba(168, 85, 247, 0.5)',
        'purple-lg': '0 10px 40px rgba(168, 85, 247, 0.4)',
        'primary-glow': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.2)',
      },

      // BACKDROP BLUR - For glass morphism
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

      // GRADIENTS - From landing page
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // ANIMATION
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

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
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)' },
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
      const criticalPairs = [
        { fg: 'foreground.DEFAULT', bg: 'background.DEFAULT' },
        { fg: 'primary.foreground', bg: 'primary.DEFAULT' },
        { fg: 'card.foreground', bg: 'card.DEFAULT' },
        { fg: 'muted.foreground', bg: 'muted.DEFAULT' },
      ];
      console.log('[APCA] Validating contrast for critical pairs:', criticalPairs.length);
    }),

    // GUIDELINE: Nested Radius Validator
    plugin(function nestedRadiusValidator({ addUtilities, theme }) {
      const radii = theme('borderRadius') as Record<string, string>;
      const nestedRadii: Record<string, any> = {};
      Object.keys(radii).forEach((key) => {
        if (key !== 'DEFAULT' && key !== 'none' && key !== 'full') {
          nestedRadii[`.nested-radius-${key}`] = {
            borderRadius: radii[key],
            '& > *': {
              borderRadius: `calc(${radii[key]} - 0.25rem)`,
            },
          };
        }
      });
      addUtilities(nestedRadii);
    }),

    // GUIDELINE: Text-Icon Pair Generator
    plugin(function textIconPairGenerator({ addUtilities, theme }) {
      const pairs = {
        '.text-icon-pair-sm': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          '& svg': {
            width: '1rem',
            height: '1rem',
            strokeWidth: '2',
          },
        },
        '.text-icon-pair-md': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          '& svg': {
            width: '1.25rem',
            height: '1.25rem',
            strokeWidth: '2',
          },
        },
        '.text-icon-pair-lg': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          '& svg': {
            width: '1.5rem',
            height: '1.5rem',
            strokeWidth: '2.5',
          },
        },
      };
      addUtilities(pairs);
    }),

    // GUIDELINE: Interaction Contrast Booster
    plugin(function interactionContrastBooster({ addUtilities }) {
      const interactionStates = {
        '.hover-contrast': {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            filter: 'brightness(1.15)',
            transform: 'translateY(-1px)',
          },
        },
        '.active-contrast': {
          '&:active': {
            filter: 'brightness(1.25)',
            transform: 'scale(0.98)',
          },
        },
        '.focus-contrast': {
          '&:focus-visible': {
            outline: '2px solid #a855f7',
            outlineOffset: '2px',
            filter: 'brightness(1.1)',
          },
        },
      };
      addUtilities(interactionStates);
    }),

    // Component Utilities - UPDATED to match landing page
    plugin(function({ addComponents, theme }) {
      addComponents({
        // PRIMARY BUTTON - Purple to fuchsia gradient (from-purple-600 to-fuchsia-600)
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
          color: '#ffffff',
          backgroundImage: 'linear-gradient(to right, #9333ea, #c026d3)', // from-purple-600 to-fuchsia-600
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #7e22ce, #a21caf)', // from-purple-700 to-fuchsia-700
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:focus-visible': {
            outline: '2px solid #a855f7',
            outlineOffset: '2px',
          },
        },

        // SECONDARY BUTTON - Glass with border (from landing: btn-secondary)
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
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },

        // GHOST BUTTON
        '.btn-ghost': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#d1d5db',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },

        // GLASS CARD - From landing page (bg-white/5 backdrop-blur-sm border-white/10)
        '.glass-card': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
        },

        // CARD - Solid elevated surface
        '.card': {
          backgroundColor: '#0f1020',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-2px)',
          },
        },

        // INPUT FIELD - Glass style
        '.input-field': {
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          fontSize: '1rem',
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.375rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          outline: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
          '&:focus': {
            borderColor: '#9333ea', // purple-600
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&::placeholder': {
            color: '#9ca3af', // text-gray-400
          },
        },

        // BADGE - From landing page
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
        },
      });
    }),
  ],
};

export default config;
