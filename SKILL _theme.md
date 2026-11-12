---
name: xperience-theme
description: Apply the Xperience brand (teal + lime job-board theme, Bricolage Grotesque/Manrope, Xperience logo) to any page, component, deck or mockup.
---

# Xperience theme

Use this skill whenever you build UI, pages, slides or graphics for **Xperience** (Moroccan job board: "Emplois, CV ATS & accompagnement carrière"). Extracted from the landing page of the Lovable prototype "Morocco HR Jobs".

## Logo

- File: `assets/xperience-logo.png` (979×240, transparent PNG). Keep it next to this SKILL.md.
- Wordmark: a lime **X** whose top-right stroke becomes an upward arrow (growth), followed by "perience" in heavy dark-teal geometric sans.
- Logo colors: lime `#C6EB31`, teal `#063D3A`.
- Header usage: `<img src="xperience-logo.png" alt="Xperience" class="h-9 w-auto object-contain">` (36px high), left-aligned, links to `/`.
- Use on white / very light backgrounds only. Don't recolor, stretch, or add effects.

## Colors (CSS variables, light theme)

Paste into `:root` (shadcn/Tailwind v4 compatible). Hex in comments.

```css
:root {
  --radius: .5rem;
  --background: oklch(100% 0 0);              /* #FFFFFF */
  --foreground: oklch(24% .045 188);          /* #002623 deep teal text */
  --primary: oklch(33% .055 188);             /* #053E3B brand teal (buttons) */
  --primary-foreground: oklch(98% .01 120);   /* #F7FAF2 */
  --ink: oklch(33% .055 188);
  --ink-foreground: oklch(98% .01 120);
  --accent: oklch(90% .2 122);                /* #C8F23C lime */
  --accent-foreground: oklch(24% .04 226);    /* #05232E */
  --secondary: oklch(95% .03 125);            /* #EAF2DD pale lime */
  --secondary-foreground: oklch(28% .05 188); /* #00312D */
  --card: oklch(97.5% .008 160);              /* #F2F8F5 */
  --card-foreground: oklch(24% .045 188);
  --popover: oklch(99.5% .005 180);           /* #FAFFFD */
  --popover-foreground: oklch(24% .045 188);
  --muted: oklch(96% .008 160);               /* #EDF3F0 */
  --muted-foreground: oklch(47% .03 188);     /* #48615E */
  --border: oklch(33% .055 188 / .14);
  --input: oklch(40% .05 225 / .22);
  --ring: oklch(55% .1 200);                  /* #008388 */
  --coral: oklch(69% .19 35);                 /* #FA6540 eyebrow labels */
  --coral-foreground: oklch(99% .01 35);
  --violet: oklch(52% .18 300);               /* #7B47BF */
  --success: oklch(56% .13 151);              /* #2A894B */
  --warning: oklch(66% .14 70);               /* #C8800D */
  --destructive: oklch(55% .2 25);            /* #CC272E */
  --destructive-foreground: oklch(98.5% .012 92);
  --chart-1: oklch(64.6% .222 41.116);
  --chart-2: oklch(60% .118 184.704);
  --chart-3: oklch(39.8% .07 227.392);
  --chart-4: oklch(82.8% .189 84.429);
  --chart-5: oklch(76.9% .188 70.08);

  --gradient-hero: linear-gradient(130deg, oklch(97.5% .015 190), oklch(94.5% .04 200) 58%, oklch(95% .03 300));
  --gradient-score: linear-gradient(135deg, var(--primary), var(--accent));
  --hero-veil: linear-gradient(90deg, oklch(99% .005 180/.97) 0%, oklch(99% .005 180/.93) 35%, oklch(99% .005 180/.15) 65%, transparent 100%);
  --hero-veil-mobile: linear-gradient(90deg, oklch(99% .005 180/.97), oklch(99% .005 180/.88));

  --shadow-card: 0 2px 6px oklch(30% .04 225/.03);
  --shadow-lift: 0 4px 16px oklch(30% .04 225/.09);
  --shadow-neon: 0 0 28px oklch(50% .08 210/.16), 0 0 44px oklch(52% .15 300/.1);

  --display-family: "Bricolage Grotesque", "Cairo", system-ui, sans-serif;
  --body-family: "Manrope", "Cairo", system-ui, sans-serif;
}
```

Color rules: white page, teal for text and primary actions, lime only as a highlight (logo X, score gradients, small badges) — never lime text on white. Coral is reserved for small uppercase eyebrow labels.

## Typography

Google Fonts: `Bricolage Grotesque` (700, 800), `Manrope` (400, 500, 700), `Cairo` (Arabic fallback).

| Element | Font | Size / line-height | Weight | Color |
|---|---|---|---|---|
| H1 hero | Bricolage Grotesque | 72px / 72px (mobile ~44px) | 800 | foreground |
| H2 section | Bricolage Grotesque | 36px / 45px | 700 | foreground |
| Hero subtitle | Bricolage Grotesque | ~36px, two short lines | 700 | foreground |
| Body / lead | Manrope | 16–18px / 1.5 | 400 | muted-foreground or foreground |
| Eyebrow | Manrope | 12px uppercase | 700 | coral (or primary) |
| Small print | Manrope | 12–14px | 400 | muted-foreground |
| Big stat ("2 244") | Bricolage Grotesque | ~32px | 800 | foreground |

## Components

- **Header**: sticky, `bg-white/95` + blur, logo left, nav center (Opportunités, Ma carrière, Ressources, Entreprises with chevrons; Formules), primary CTA right ("Trouver une offre ↗").
- **Primary button**: bg `--primary`, text `--primary-foreground`, radius 6px, height 44px, padding 0 32px, 14px/500, `shadow-sm`, trailing arrow icon.
- **Outline button**: white bg, 1px `--input` border, foreground text, same size.
- **Cards**: bg `--card` or white, 1px `--border`, radius 8px, `--shadow-card`; hover `--shadow-lift`.
- **Icons**: lucide-react, 16px, stroke 2.

## Landing page layout (reference)

1. **Hero**: full-width photo (Moroccan professionals at a laptop, bright office, Casablanca in the background) under `--hero-veil` so the left side stays readable. Left column: eyebrow "LES CARRIÈRES SUPPORT · MAROC", H1 "Xperience", subtitle "Votre prochaine opportunité. / Votre prochaine étape.", lead text, buttons "Explorer les offres →" + "Voir la démo", small print "Recherche gratuite · Sans paiement en ligne".
2. **Stats strip**: white band with top/bottom borders; big number "2 244" + "offres actives dans notre collection"; right side lists categories separated by "·" (RH & administration · Finance · Juridique · Achats · IT · Marketing · Qualité · Formation · Conseil & gestion de projet).
3. **Value section**: coral eyebrow "UNE RECHERCHE PLUS CLAIRE", H2 on two lines "Moins de dispersion. / Plus de place pour votre avenir.", lead paragraph, then a 3-column feature row separated by thin top borders.

Spacing: container max ~1100px with 48px side padding on desktop, sections ~96px vertical padding, generous whitespace. Language: French first (Arabic via Cairo font).
