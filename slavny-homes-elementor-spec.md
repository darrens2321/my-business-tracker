# Slavny Homes — Elementor Build Spec

---

## Brand Colours

| Name | Hex | Use |
|---|---|---|
| Navy | `#0A1931` | Primary background, dark sections |
| Dark Navy | `#060f1e` | Footer, bottom strip |
| Mid Navy | `#0d2040` | Stats bar background |
| Red | `#C8102E` | Accent colour, buttons, #WE highlight |
| White | `#FFFFFF` | Text on dark backgrounds |
| Off-White / Cream | `#F5F4F0` | Light section backgrounds, form inputs |
| Light Gray | `#F8F9FA` | Alternate section backgrounds |
| Gold | `#d4a017` | CLHMS badge accents |

---

## Typography

- **Font family:** Helvetica Neue, Arial, sans-serif (system font — no Google Fonts needed)
- **Headings:** Weight 900 (Black), tight letter-spacing (-1px to -3px for large headlines)
- **Body:** Weight 400–600, 14–16px, line-height 1.7
- **Labels / eyebrows:** Weight 700, 10–12px, letter-spacing 3px, ALL CAPS

---

## Global Nav (Fixed / Sticky)

- **Height:** 70px
- **Background:** `rgba(10,25,49,0.97)` — semi-transparent navy, full opacity on scroll
- **Bottom border on scroll:** 2px solid `#C8102E`
- **Logo:** RE/MAX balloon icon + "SLAVNY" (bold, 17px) + "HOMES" (light, 10px, letter-spacing 3px) — both white
- **Nav links:** "OUR DIFFERENCE" · "LISTINGS" · "CONTACT" — white, 11px, weight 700, letter-spacing 1px
- **CTA button (right):** "FREE HOME EVALUATION" — background `#C8102E`, white text, 11px bold, no border-radius (square edges)

---

## Section 1 — Hero

**Background:** Your team banner image (`hero-team.jpg`) — full width, `cover`, centered top
**Overlay:** Gradient left→right: `rgba(10,25,49,0.25)` → `rgba(10,25,49,0.82)`

### Layout
Two-column (50/50 on desktop, stack on mobile):
- **Left column:** Empty / shows team photo through overlay
- **Right column:** Text content (below)

### Right Column Text
```
SLAVNY                    [font: 42px, weight 900, white, letter-spacing 3px]
HOMES                     [font: 28px, weight 400, white, letter-spacing 6px]
#WEKNOWTHE                [font: 52px, weight 900 — #WE in #C8102E, KNOWTHE in white]
MARKET                    [font: 96px, weight 900, white, letter-spacing -3px]
```

**Behind the text:** "SLAVNY" in huge text ~260px, colour `rgba(255,255,255,0.04)` — decorative watermark

### Bottom Strip (dark bar, separate row below the split)
- **Background:** `#060f1e`
- **Top border:** 3px solid `#C8102E`
- **Padding:** 18px top/bottom

| Zone | Content |
|---|---|
| Left | Two gold circular badges: "CLHMS GUILD" + "CLHMS MARKETING SPECIALIST" |
| Centre-left | Three text stats: `— 500+ HOMES SOLD` · `— CERTIFIED LUXURY SPECIALISTS` · `— CLHMS GUILD` (white, 10px, bold) |
| Centre-right | Two buttons: **"GET YOUR FREE HOME EVALUATION"** (red) · **"SEE WHY WE'RE #1"** (dark with white border) |
| Right | "MILLION DOLLAR GUILD" gold badge + small RE/MAX balloon icon |

---

## Section 2 — Stats Bar

- **Background:** `#0d2040`
- **Bottom border:** 3px solid `#C8102E`
- **Layout:** 4 equal columns

| Stat | Label | Description |
|---|---|---|
| 500+ | HOMES SOLD | A track record built deal by deal, across the GTA. |
| #1 | RE/MAX TEAM | Ranked the top performing RE/MAX team in Thornhill for 5+ years. |
| 98% | LIST-TO-SALE RATIO | Our clients consistently get asking price — or above — every single time. |
| 15+ | YEARS OF EXPERTISE | We know what works in this market. We remember when it was being built. |

- **Stat number:** 44px, weight 900, white
- **Label:** 10px, weight 700, `#C8102E`, letter-spacing 1px
- **Description:** 11px, `rgba(255,255,255,0.45)`, line-height 1.55
- Thin white dividers between columns

---

## Section 3 — Credentials Bar

- **Background:** White
- **Border-bottom:** 1px solid `#e8e8e8`
- **Layout:** Flex row, space-between
- Items: `● CLHMS GUILD` · `● CERTIFIED CLHMS` · `● INSTITUTE FOR LUXURY` · `● CLHMS` + a filled navy pill "CLHMS"
- Bullet: 7px navy circle
- Text: 10px, weight 700, navy, letter-spacing 2px

---

## Section 4 — Red Ticker Bar

- **Background:** `#C8102E`
- **Content (centred, repeating):**
  `THORNHILL` · `#1 RE/MAX TEAM` · `VAUGHAN` · `RICHMOND HILL` · `AURORA` · `BUY · SELL · INVEST`
- **Text:** White, 11px, weight 700, letter-spacing 2px
- Optional: animate as a scrolling marquee

---

## Section 5 — Why Slavny Homes

- **Background:** White
- **Padding:** 90px top/bottom
- **Layout:** Two columns (50/50)

### Left Column
**Eyebrow:** `— WHY SLAVNY HOMES` (red, 11px, weight 700, letter-spacing 3px)
**Headline:** "This market is *our home.* We know every street."
- Font: 46px, weight 900, navy
- "our home." — italic, colour `#C8102E`

**Body text:** 14px, `#555`, line-height 1.8

**4 Numbered features:**
```
01  Hyperlocal Market Intelligence
    Neighbourhood-level data, school district performance, micro-market
    trends — we live here. Our clients receive information no one else has.

02  Record-Breaking Sale Prices
    We consistently achieve the highest prices per square foot in every
    neighbourhood we serve. Our multi-offer strategy and staging expertise
    turn listings into bidding wars.

03  An Elite Buyer Network
    Tens of relationships with qualified buyers across our listings often
    sell before they enter the open market. First-mover advantage for
    luxury clients.

04  Start-to-Close White Glove Service
    Staging. Trades. Negotiation. Experience. We handle every detail to
    ensure a smooth, thoughtful, completely stress-free transaction.
```
- Number: 26px, weight 900, colour `#e4e4e4`
- Feature title: 14px, weight 800, navy
- Description: 13px, `#777`, line-height 1.65
- Divider: 1px `#f0f0f0` between items

### Right Column — 2×2 Stat Grid

| Stat | Label | Description | Border colour |
|---|---|---|---|
| 500+ | HOMES SOLD | A track record built deal by deal, across the GTA | Navy |
| #1 | RE/MAX TEAM — THORNHILL | Ranked the top performing RE/MAX team in Thornhill | Navy |
| 98% | LIST-TO-SALE RATIO | — achieved on every single listing | Red |
| 15+ | YEARS OF EXPERTISE | We remember this market before they built most of it | Red |

- Box: 2px solid border (colour above), padding 22px
- Stat number: 46px, weight 900, navy
- Label: 9px, weight 700, red, letter-spacing 1.5px
- Description: 11px, `#888`

---

## Section 6 — Testimonial

- **Background:** `#0A1931` (navy)
- **Padding:** 80px
- **Layout:** Centred, max-width 720px

**Eyebrow:** `— CONSTELLATION CLIENT` (red, 11px, bold, letter-spacing 3px)

**Quote:**
> "Tatyana and Shayne don't just know the market — they know how to win in it. They negotiated the highest sale price for our lot size in the entire neighbourhood. We couldn't believe it."

- Font: 28px, weight 700, white, italic, line-height 1.55

**Attribution:** `— FRED · VERIFIED CLIENT · VAUGHAN` (red, 12px, bold, letter-spacing 2px)
**Stars:** ★★★★★ (gold `#f0a500`, 20px)

---

## Section 7 — Markets

- **Background:** `#F5F4F0`
- **Padding:** 80px
- **Layout:** Two columns

### Left Column
**Eyebrow:** `— OUR MARKETS` (red)
**Headline:** "*Everywhere* that matters in the GTA."
- "Everywhere" — italic, `#C8102E`
- Rest — navy, 46px, weight 900

**Body:** 14px, `#666`, line-height 1.75

### Right Column — 2×3 Grid of Cities

| City | Subtitle |
|---|---|
| Thornhill | Our home base |
| Vaughan | Premium communities |
| Richmond Hill | Deep local expertise |
| Aurora | Growing luxury market |
| Woodbridge | Family & investment |
| Maple | Emerging hotspot |

Each card: white background, 3px left border `#C8102E`, padding 18px 22px
- City name: 15px, weight 800, navy
- Subtitle: 11px, `#888`
- 3px gap between cards

---

## Section 8 — Listings

- **Background:** White
- **Padding:** 80px

**Eyebrow:** `— PROPERTIES` (red)
**Headline:** "Current & Upcoming Listings" (navy, 38px, weight 900)
**"VIEW ALL LISTINGS →"** link top-right (red, underline)

### 4 Listing Cards (4-column grid)

| Address | City | Status | Card BG tint |
|---|---|---|---|
| 105 Ferragine Crescent | Thornhill | ACTIVE LISTING | Light green `#e8f4e8` |
| 41 Cedarpoint Drive | Thornhill | ACTIVE LISTING | Light red `#fce8e8` |
| 304 Lauderdale Drive | Vaughan | ACTIVE LISTING | Light blue `#e8eef8` |
| 46 Glover Street | Aurora | UPCOMING | Light gold `#f8f4e8` |

Each card:
- Image area: 155px tall, tinted background with house icon centred
- Status badge: top-left, navy background, white text, 8px bold
- Address: 13px, weight 700, navy
- City: 11px, `#888`
- Button: "REQUEST DETAILS" / "VIEW BROCHURE" — outline red, full width

---

## Section 9 — Home Evaluation (Dark CTA + Form)

- **Background:** `#0A1931`
- **Padding:** 90px
- **Layout:** Two columns (50/50)

### Left Column
**Eyebrow:** `— FREE PRICING ANALYSIS` (red)
**Headline:** "What is your home worth right now?"
- "worth right now?" — italic, `#C8102E`
- Font: 44px, weight 900, white

**Body:** 14px, `rgba(255,255,255,0.65)`, line-height 1.8

**4 bullet points (▶ in red):**
- You'll have precise local knowledge — not generic estimates
- Response within 24 hours
- Absolutely zero obligation
- Powered by 500+ transactions of real data

### Right Column — Contact Form
- **Background:** White
- **Heading:** "Let's Talk — It's Free" (17px, weight 800, navy)
- **Subtext:** "Fill out the form and we'll be in touch within 24 hours" (12px, `#999`)

**Form fields (all: `#F5F4F0` background, 1px `#e0e0e0` border, no border-radius):**
1. Full Name *
2. Phone Number
3. Email Address *
4. Property Address
5. Dropdown: I'm Looking To → Sell my home / Buy a home / Get a free evaluation / Invest / Other

**Submit button:** Full width, navy background `#0A1931`, white text, "GET MY FREE EVALUATION →", 14px bold

---

## Footer

- **Background:** `#060f1e`
- **Top border:** 3px solid `#C8102E`
- **Padding:** 50px top, 24px bottom
- **Layout:** 4 columns

| Column | Content |
|---|---|
| Col 1 (wide) | RE/MAX balloon + "SLAVNY HOMES" logo, tagline "BE SURE TO DO MORE", short description paragraph |
| Col 2 | **Services:** Buying a Home · Selling a Home · Luxury Listings · Free Evaluation |
| Col 3 | **Markets:** Thornhill · Vaughan · Richmond Hill · Aurora |
| Col 4 | **Contact:** info@slavnyhomes.ca · slavnyhomes.ca · Thornhill, ON · RE/MAX Hallmark |

**Column headers:** 10px, weight 700, `rgba(255,255,255,0.35)`, letter-spacing 2px
**Links:** 12px, `rgba(255,255,255,0.55)`

**Bottom bar:** 1px `rgba(255,255,255,0.07)` divider
- Left: © 2025 Slavny Homes. RE/MAX Hallmark. All rights reserved.
- Right: Licensed Real Estate Brokerage · Ontario, Canada · slavnyhomes.ca
- Both: 11px, `rgba(255,255,255,0.3)`

---

## Mobile Breakpoints

| Breakpoint | Changes |
|---|---|
| < 900px | Hamburger nav, hero photo hidden, single-column layouts, listings 2-col |
| < 600px | Everything single column, listings 1-col |

---

## Quick-Reference Cheat Sheet

```
PRIMARY NAVY:     #0A1931
ACCENT RED:       #C8102E
WHITE:            #FFFFFF
DARK BG:          #060f1e
CREAM/INPUT:      #F5F4F0

HEADING FONT:     Helvetica Neue / Arial, weight 900
BODY FONT:        Helvetica Neue / Arial, weight 400
LABEL STYLE:      10-12px, weight 700, ALL CAPS, letter-spacing 3px

HERO IMAGE:       hero-team.jpg (team of 3 banner photo)
HERO OVERLAY:     gradient rgba(10,25,49,0.25) → rgba(10,25,49,0.82)
SECTION PADDING:  80-90px top/bottom, 5% left/right
```
