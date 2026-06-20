import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
                display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(0 0% 100%)",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    foreground: "hsl(0 0% 100%)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                brand: {
                    from: "hsl(var(--brand-from))",
                    via: "hsl(var(--brand-via))",
                    to: "hsl(var(--brand-to))",
                },
            },
            borderRadius: {
                xl: "calc(var(--radius) + 4px)",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                soft: "0 2px 12px -4px hsl(var(--foreground) / 0.08), 0 4px 24px -8px hsl(var(--foreground) / 0.06)",
                elevated: "0 8px 30px -12px hsl(var(--foreground) / 0.18)",
                glow: "0 8px 30px -8px hsl(var(--primary) / 0.45)",
                "glow-lg": "0 12px 50px -10px hsl(var(--primary) / 0.55)",
            },
            backgroundImage: {
                "brand-gradient":
                    "linear-gradient(120deg, hsl(var(--brand-from)), hsl(var(--brand-via)), hsl(var(--brand-to)))",
                "brand-radial":
                    "radial-gradient(circle at 30% 20%, hsl(var(--brand-from) / 0.18), transparent 60%)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "gradient-x": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-6px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.35)" },
                    "50%": { boxShadow: "0 0 0 8px hsl(var(--primary) / 0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "gradient-x": "gradient-x 6s ease infinite",
                float: "float 5s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
