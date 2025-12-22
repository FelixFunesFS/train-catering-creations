
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
					dark: 'hsl(var(--primary-dark))',
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
				},
				// Ruby & Pearl luxury supporting colors
				ruby: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))',
					glow: 'hsl(var(--primary-glow))',
					50: 'hsl(var(--primary-light))',
					100: 'hsl(var(--primary-light))',
					200: 'hsl(var(--primary-light))',
					300: 'hsl(var(--primary))',
					400: 'hsl(var(--primary))',
					500: 'hsl(var(--primary))',
					600: 'hsl(var(--primary-dark))',
					700: 'hsl(var(--primary-dark))',
					800: 'hsl(var(--primary-dark))',
					900: 'hsl(var(--primary-dark))'
				},
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--gold-foreground))',
					light: 'hsl(var(--gold-light))',
					dark: 'hsl(var(--gold-dark))'
				},
				navy: {
					DEFAULT: 'hsl(var(--navy))',
					foreground: 'hsl(var(--navy-foreground))',
					light: 'hsl(var(--navy-light))',
					dark: 'hsl(var(--navy-dark))'
				},
				platinum: {
					DEFAULT: 'hsl(var(--platinum))',
					foreground: 'hsl(var(--platinum-foreground))',
					light: 'hsl(var(--platinum-light))',
					dark: 'hsl(var(--platinum-dark))'
				},
				cream: {
					DEFAULT: 'hsl(var(--cream))',
					foreground: 'hsl(var(--cream-foreground))'
				},
				category: {
					appetizers: 'hsl(var(--category-appetizers))',
					'appetizers-foreground': 'hsl(var(--category-appetizers-foreground))',
					entrees: 'hsl(var(--category-entrees))',
					'entrees-foreground': 'hsl(var(--category-entrees-foreground))',
					sides: 'hsl(var(--category-sides))',
					'sides-foreground': 'hsl(var(--category-sides-foreground))',
					desserts: 'hsl(var(--category-desserts))',
					'desserts-foreground': 'hsl(var(--category-desserts-foreground))',
				},
				service: {
					wedding: 'hsl(var(--service-wedding))',
					'wedding-foreground': 'hsl(var(--service-wedding-foreground))',
					corporate: 'hsl(var(--service-corporate))',
					'corporate-foreground': 'hsl(var(--service-corporate-foreground))',
					family: 'hsl(var(--service-family))',
					'family-foreground': 'hsl(var(--service-family-foreground))',
				}
			},
			fontFamily: {
				'elegant': ['Playfair Display', 'serif'],
				'clean': ['Inter', 'sans-serif'],
				'script': ['Dancing Script', 'cursive']
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-ruby-primary)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-navy': 'var(--gradient-navy)',
				'gradient-platinum': 'var(--gradient-platinum)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-pattern-a': 'var(--gradient-pattern-a)',
				'gradient-pattern-b': 'var(--gradient-pattern-b)',
				'gradient-pattern-c': 'var(--gradient-pattern-c)',
				'gradient-pattern-d': 'var(--gradient-pattern-d)',
				'gradient-nav': 'var(--gradient-nav)',
				'gradient-ruby-primary': 'var(--gradient-ruby-primary)',
				'gradient-ruby-accent': 'var(--gradient-ruby-accent)',
				'gradient-ruby-subtle': 'var(--gradient-ruby-subtle)',
				'gradient-ruby-overlay': 'var(--gradient-ruby-overlay)'
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'elegant': 'var(--shadow-elegant)',
				'elevated': 'var(--shadow-elevated)',
				'float': 'var(--shadow-float)',
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'glow-strong': 'var(--shadow-glow-strong)',
				'gold-glow': 'var(--shadow-gold-glow)',
				'neumorphic-inset': 'var(--shadow-neumorphic-inset)',
				'neumorphic-outset': 'var(--shadow-neumorphic-outset)',
				'neumorphic-soft': 'var(--shadow-neumorphic-soft)',
				'neumorphic-elevated': 'var(--shadow-neumorphic-elevated)',
				'nav-floating': 'var(--shadow-nav-floating)',
				'nav-link': 'var(--shadow-nav-link)',
				'nav-active': 'var(--shadow-nav-active)'
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
			},
			'slide-in-right': {
				'0%': {
					opacity: '0',
					transform: 'translateX(100%)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateX(0)'
				}
			},
			'slide-out-left': {
				'0%': {
					opacity: '1',
					transform: 'translateX(0)'
				},
				'100%': {
					opacity: '0',
					transform: 'translateX(-100%)'
				}
			},
			'slide-in-left': {
				'0%': {
					opacity: '0',
					transform: 'translateX(-100%)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateX(0)'
				}
			},
			'slide-out-right': {
				'0%': {
					opacity: '1',
					transform: 'translateX(0)'
				},
				'100%': {
					opacity: '0',
					transform: 'translateX(100%)'
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
			'flip-in': 'flip-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			'slide-out-left': 'slide-out-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			'slide-out-right': 'slide-out-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
		}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
