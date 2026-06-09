# Loan Book — Design System

## Color Palette
- **Primary**: Deep Navy `#0F2044` — main backgrounds, headers, nav bar
- **Secondary**: Rich Navy `#1A3560` — card backgrounds, elevated surfaces
- **Accent / Alert**: Amber Gold `#F5A623` — CTAs, due date warnings, overdue badges, progress indicators
- **Success**: Emerald `#22C55E` — paid status, on-track payments
- **Danger**: Rose `#EF4444` — overdue status, missed payments
- **Background**: Off-white `#F8FAFC` — page background
- **Surface**: Pure white `#FFFFFF` — cards, modals
- **Text Primary**: `#0F172A` — body text on light backgrounds
- **Text Secondary**: `#64748B` — captions, labels, secondary info
- **Text on Dark**: `#FFFFFF` and `#94A3B8` — text on navy surfaces

## Typography
- **Font Family**: Inter (sans-serif), fallback system-ui
- **Display / Hero**: 32–40px, weight 700, navy or white
- **Section Headers**: 20–24px, weight 600
- **Card Titles**: 16–18px, weight 600
- **Body**: 14–15px, weight 400
- **Caption / Label**: 12px, weight 500, uppercase letter-spacing for labels

## Elevation & Surfaces
- **Page background**: Off-white `#F8FAFC`
- **Cards**: White with subtle shadow (`box-shadow: 0 1px 4px rgba(0,0,0,0.08)`) and `border-radius: 16px`
- **Modals**: Centered, white, `border-radius: 20px`, backdrop blur
- **Nav / Header**: Deep navy `#0F2044`, full-width, sticky

## Layout
- Max content width: 480px (mobile-first, centered)
- Bottom navigation bar (mobile pattern): 4 tabs — Dashboard, Loans, Calculator, Profile
- Generous padding: 20–24px horizontal gutters
- Card spacing: 12–16px gap between cards

## Components

### Loan Card
- White card, 16px radius, subtle shadow
- Left color strip (amber for lent, navy-light for borrowed)
- Counterparty avatar/initials circle (navy background, white text)
- Loan amount in bold (18px, navy)
- Due date with calendar icon; amber text if due within 7 days
- Repayment progress bar: thin, rounded, amber fill on grey track
- Status badge: pill shape — Active (navy), Overdue (red), Paid (green)

### Summary / Hero Card
- Full-width, deep navy background, white text
- Two columns: "You Owe" and "You're Owed" with large bold amounts
- Amber underline or divider accent
- Rounded corners 20px

### CTA Button (Primary)
- Background: Amber Gold `#F5A623`
- Text: Deep Navy `#0F2044`, weight 700
- Border-radius: 12px
- Padding: 14px 24px
- Hover: slightly darkened amber

### Secondary Button
- Border: 1.5px solid navy
- Text: navy
- Background: transparent

### Input Fields
- Border: 1.5px solid `#CBD5E1`
- Radius: 10px
- Focus: amber border `#F5A623`
- Label: 12px uppercase, `#64748B`

### Progress Bar
- Track: `#E2E8F0`
- Fill: Amber `#F5A623` (in progress), Green `#22C55E` (completed)
- Height: 6px, fully rounded

### Status Badges
- Active: navy bg `#1A3560`, white text
- Overdue: red bg `#FEE2E2`, red text `#DC2626`
- Paid: green bg `#DCFCE7`, green text `#16A34A`

## Motion & Interaction
- Subtle fade-in on page load (150ms ease)
- Card hover: slight lift (`transform: translateY(-2px)`, shadow deepens)
- Button press: scale down slightly (`transform: scale(0.97)`)
- Smooth transitions: 200ms ease for all interactive states

## Icons
- Use Lucide icons (consistent stroke style)
- Size: 20px in nav, 18px in cards, 16px inline
- Color: matches surrounding text or amber accent

## Dashboard Layout Order
1. Sticky top header with app name "Loan Book" and notification bell
2. Hero summary card (navy, full-width): totals owed vs. lent
3. "Upcoming Payments" section — next 3 due dates
4. "My Loans" section — scrollable list of loan cards
5. Bottom nav bar (fixed): Dashboard | Loans | Calculator | Profile
