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
				'card': 'var(--shadow-card)',
				'elegant': 'var(--shadow-elegant)',
				'elevated': 'var(--shadow-elevated)',
				'glow': 'var(--shadow-glow)',
				'glow-strong': 'var(--shadow-glow-strong)',
				'float': 'var(--shadow-float)'
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
			transitionDuration: {
				'250': '250ms',
				'floating': 'var(--floating-duration)'
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
				},
				'marquee': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'fade-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'zoom-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'bounce-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.8)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'translateY(-10px) scale(1.05)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'rotate-in': {
					'0%': {
						opacity: '0',
						transform: 'rotate(-10deg) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'rotate(0deg) scale(1)'
					}
				},
				'flip-in': {
					'0%': {
						opacity: '0',
						transform: 'rotateY(90deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'rotateY(0deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'marquee': 'marquee 15s linear infinite',
				'marquee-slow': 'marquee 25s linear infinite',
				'marquee-fast': 'marquee 8s linear infinite',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in-left': 'fade-in-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in-right': 'fade-in-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'zoom-in': 'zoom-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'rotate-in': 'rotate-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'flip-in': 'flip-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
