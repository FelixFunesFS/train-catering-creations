import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			fontFamily: {
				'elegant': ['Playfair Display', 'serif'],
				'clean': ['Inter', 'sans-serif'],
				'script': ['Dancing Script', 'cursive']
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)'
			},
			spacing: {
				'section': 'var(--spacing-section)',
				'section-sm': 'var(--spacing-section-sm)',
				'section-lg': 'var(--spacing-section-lg)',
				'card': 'var(--spacing-card)',
				'card-sm': 'var(--spacing-card-sm)',
				'card-lg': 'var(--spacing-card-lg)',
				'touch': 'var(--touch-target-min)',
				'touch-comfortable': 'var(--touch-target-comfortable)'
			},
			fontSize: {
				'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
				'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
				'base-mobile': ['0.875rem', { lineHeight: '1.375rem' }],
				'lg-mobile': ['1rem', { lineHeight: '1.5rem' }],
				'xl-mobile': ['1.125rem', { lineHeight: '1.75rem' }],
				'responsive-xs': ['0.75rem', { lineHeight: '1rem' }],
				'responsive-sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'responsive-base': ['0.875rem', { lineHeight: '1.375rem' }],
				'responsive-lg': ['1rem', { lineHeight: '1.5rem' }],
				'responsive-xl': ['1.125rem', { lineHeight: '1.75rem' }]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
