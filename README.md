# EcoPantry Hub

Build a complete, fully functional, production-ready web application called "EcoPantry" designed to combat food waste with an eco-friendly green and clean aesthetic (Tailwind CSS, shadcn/ui components, Lucide icons). 

CRITICAL RESPONSIVENESS REQUIREMENT:

The layout must be 100% responsive and optimized for all screen sizes:

- Mobile phones: Single-column stacked layout, bottom navigation or easily accessible drawer/menu, touch-friendly buttons, and vertical scrolling cards.

- Tablets & Laptops: Multi-column grid layouts (2 to 3 columns for pantry cards), spacious headers, side navigation or top header bars, and comfortable padding.

The app must have zero placeholder bugs and include the following views and features fully wired up:

1. AUTHENTICATION & ONBOARDING VIEW:

- A clean login and signup screen with tab switching, fully centered and responsive on all viewports.

- Support persistent state simulation or Supabase auth connection so users can log in and view their personal dashboard.

2. THE MAIN DASHBOARD:

- Top stats bar showing: Total Items in Pantry, Items Expiring Soon (next 3 days), and Expired Items count (adaptable grid that stacks on mobile and spreads horizontally on desktop).

- A search bar and category filter (All, Produce, Dairy, Pantry, Meat, Beverages) that wraps cleanly on smaller screens.

- Responsive grid layout of Food Inventory Cards. Each card must display: Item Name, Category badge, Purchase Date, Expiry Date, and a dynamic status indicator pill (Green for fresh, Yellow for "Expiring Soon", Red for "Expired").

- Action buttons on each card: "Delete" and "Generate Recipe".

- A prominent "Add Item" button that opens a responsive modal/dialog with a manual form (Name, Category, Purchase Date, Expiry Date) and an alternative "Scan Receipt" tab.

3. THE AI RECEIPT SCANNER SIMULATION FEATURE:

- Inside the "Add Item" modal, provide a tab called "Scan Receipt (AI)".

- Users can upload or drag-and-drop a receipt image (with file picker support for mobile cameras/galleries). 

- Include a realistic "Scanning..." loading state with a progress indicator.

- Upon completion, automatically parse and populate a preview list of extracted items with pre-calculated mock expiry dates, allowing the user to click "Import to Pantry" to save them instantly to the dashboard list.

4. THE AI RECIPE GENERATOR MODAL:

- When a user clicks "Generate Recipe" on an item, open a full-screen or large responsive modal.

- Show a loading state: "Chef AI is whipping up a sustainable recipe...".

- Display a structured recipe card containing: Recipe Title, Prep Time, Difficulty, a list of required ingredients (highlighting the expiring ones), and step-by-step cooking instructions with readable typography on mobile and desktop.

5. POLISH & EMPTY STATES:

- Beautiful empty states with icons and descriptive text if the user's pantry has no items or search returns nothing.

- Smooth transitions, clean spacing, and modern card shadows.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ccfb3b6-9edf-48fa-83a3-70c7dc34a193).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
