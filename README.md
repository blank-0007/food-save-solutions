# EcoPantry

A smart, responsive web application that helps households reduce food waste by tracking pantry items, scanning receipts with AI, generating rescue recipes from expiring food, managing a shopping list, and tracking waste over time.

> **Live preview:** Run the dev server and open `http://localhost:8080` in your browser.

---

## What EcoPantry does

EcoPantry turns a receipt photo (or a manual entry) into a tracked pantry inventory. It then keeps an eye on expiry dates and helps you act before food goes bad:

- **Track food inventory** with name, category, purchase date, expiry date, and price.
- **See status at a glance** — fresh (green), expiring soon ≤ 3 days (yellow), expired (red).
- **Search and filter** items by name and by category (Produce, Dairy, Pantry, Meat, Beverages).
- **Scan receipts with AI OCR** — upload or drag-and-drop a receipt image and EcoPantry extracts items, prices, and dates.
- **Review before importing** — every scanned line is editable so you can fix names, categories, purchase dates, and expiry dates before adding them.
- **Generate rescue recipes** — one click turns an expiring item into a step-by-step recipe.
- **Expiry alerts** — get notified before items expire, with configurable lead time.
- **Same-day expiry alerts** — additional alert fires on the actual expiry date.
- **Shopping list** — add items you need to buy, including suggestions from recipes and low-stock items.
- **Waste tracker** — log wasted food, view trends over time, and track progress against a monthly waste-reduction goal.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| Icons | Lucide React |
| Backend / Auth / DB | Lovable Cloud (Supabase) |
| Server functions | `createServerFn` from `@tanstack/react-start` |
| Charts | Recharts |
| Toasts | Sonner |

---

## Project structure

```text
src/
  components/pantry/      # Pantry, dashboard, dialogs, and cards
  components/ui/          # shadcn/ui building blocks
  hooks/useAuth.tsx       # Authentication state hook
  integrations/supabase/  # Auto-generated Supabase client + auth middleware
  lib/
    pantry.ts             # Core types, helpers, recipe generation, shelf life
    db.ts                 # Cloud database read/write functions
    receipt.functions.ts  # Server function: AI receipt OCR
    reminders.ts          # Browser notification + in-app reminder logic
  routes/
    __root.tsx            # App shell, fonts, global providers, Toaster
    index.tsx             # Dashboard (home)
    auth.tsx              # Sign-in / sign-up page
    shopping.tsx          # Shopping list page
    waste.tsx             # Waste tracker page with charts
```

---

## How to run locally

1. **Install dependencies** (the project uses `bun`):

   ```sh
   bun install
   ```

2. **Start the dev server**:

   ```sh
   bun run dev
   ```

3. **Open the app** in your browser:

   ```sh
   http://localhost:8080
   ```

The Lovable Cloud backend is already configured, so sign-up, sign-in, and data sync work without extra environment setup.

---

## Quick guide for judges

### 1. Create an account
- Open the app.
- Go to **Sign Up** on the auth page.
- Enter your email, name, and password.
- Confirm your email if required, then sign in.
- Your profile and default reminder settings are created automatically on first sign-up.

### 2. Add pantry items
- On the dashboard, tap **Add item**.
- **Manual tab:** fill in name, category, purchase date, and expiry date.
- **Scan Receipt (AI) tab:** upload or drag-and-drop a receipt image.
- Wait for the AI scan to finish, review the extracted lines, edit any field, remove unwanted lines, then click **Import to pantry**.

### 3. Browse and manage items
- The dashboard shows a stats bar (total items, expiring soon, expired).
- Use the search bar or category chips to filter.
- Each card shows a status pill: green = fresh, yellow = expiring soon, red = expired.
- Click **Edit** to update category, purchase date, or expiry date.
- Click **Generate Recipe** to turn an item into a rescue recipe.
- Click **Delete** to remove an item.

### 4. Set reminders
- Click the **bell icon** in the header.
- Toggle reminders on/off.
- Choose how many days ahead you want to be alerted.
- Enable **Expiry day alerts** if you want an extra notification on the actual expiry date.
- Reminders arrive as browser notifications when allowed, otherwise as in-app toasts.

### 5. Shopping list
- Navigate to the **Shopping** page via the top nav (desktop) or bottom nav (mobile).
- Add items manually.
- Items can be marked as checked, deleted individually, or bulk-cleared once bought.

### 6. Waste tracker
- Navigate to the **Waste** page.
- View a chart of wasted food over time.
- Track your monthly waste total against the goal set in reminder settings.
- Deleting an item can optionally log it as waste.

---

## Key design decisions

- **Responsive layout:** single-column stack on mobile, multi-column grids on tablet/desktop, with a bottom navigation bar on small screens and a top navigation bar on larger screens.
- **Cloud-first persistence:** all pantry, shopping, waste, alert, and settings data is tied to the authenticated user and stored in Lovable Cloud so it loads on any device.
- **Real receipt OCR:** uploaded receipt images are sent to an AI vision model via the Lovable AI Gateway and returned as structured grocery lines.
- **In-app alerts by default:** browser notifications and Sonner toasts are used for reminders. Email sending requires a verified custom domain on a paid plan, so it is treated as an optional future upgrade.
- **Security:** Row-Level Security (RLS) ensures users can only read and write their own rows.

---

## Notes and known limitations

- Email confirmation may be required for new accounts depending on the current Lovable Cloud auth configuration.
- Email alerts require a verified custom domain and a paid workspace plan; the app uses browser/in-app notifications instead.
- The receipt AI works best on clear photos of printed receipts. Handwritten or heavily crumpled receipts may produce imperfect results, but every line is editable before import.
- Chart data in the waste tracker depends on waste log entries; an empty log shows an inviting empty state.

---

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bunx tsgo --noEmit` | Type-check the project without emitting files |
| `bun run build` | Build the app for production |

---

Built with ❤️ to fight food waste.