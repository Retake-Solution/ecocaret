# EcoCaret

EcoCaret is a Next.js storefront for ethical jewelry, focused on lab-grown diamond products, configurable metal options, ring sizing, cart interactions, wishlist state, and product detail pages backed by the product API.

## Tech Stack

- Next.js 16.2.7 with the App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Redux Toolkit and React Redux for cart, profile, and wishlist state
- Axios for API requests
- Google fonts through `next/font`
- Material Symbols for iconography

## Project Structure

```text
app/
  collections/              Product listing and product detail routes
  custom/                   Custom jewelry page
  orders/                   Orders pages
  our-story/                Brand story page
  profile/                  Profile page
components/                 Shared header, footer, cart, profile, and auth UI
lib/features/               Redux slices for cart, profile, and wishlist
services/                   Axios API client and product API helpers
types/                      Shared API response types
```

## Routes

- `/` - homepage with brand content and featured static product cards
- `/collections` - live product grid loaded from the API
- `/collections/[id]` - live product detail page
- `/custom` - custom jewelry experience
- `/orders` and `/orders/[id]` - order pages
- `/profile` - profile page
- `/our-story` - brand story page

## API Integration

Product data is loaded through `services/api.ts` using the Axios client in `services/apiClient.ts`.

Current API base URL:

```ts
http://localhost:3002/api/v1
```

Current product endpoints:

```text
GET /products
GET /products/:id
```

Both helpers expect the backend response shape:

```ts
{
  success: boolean;
  data: ApiProduct | ApiProduct[];
}
```

The frontend uses the returned product payload directly. The current `ApiProduct` contract includes fields such as:

- `name`, `slug`, `description`, `shortDescription`
- `category`, `subCategory`, `collection`, `gender`, `shape`, `occasion`, `tags`
- `stoneType`, `totalStoneCaratWeight`, `productStones`
- `metalOptions` with active metal color, purity, and price-per-gram data
- `sizeMatrix` with available sizes, inventory, and purity-based metal weights
- `images`, `colorImages`, `makingChargeUSD`, `discountPercent`
- merchandising flags such as `isReadyToShip`, `isMadeToOrder`, `isFeatured`, and `isNewArrival`

Deprecated product fields such as `metal`, `specifications`, `sizes`, `jewelryType`, `status`, and `isDeleted` are not used by the current collection/detail UI.

## Product Pricing

Collection and detail pages calculate a fallback product price when `displayPrice` is not provided.

The implemented formula is:

```text
stone total + metal total + making charge - discount
```

Where:

- stone total is `stone.priceUSD * productStone.caratWeight`
- metal total is `metalOption.pricePerGram * selected metalWeightGrams`
- making charge comes from `makingChargeUSD`
- discount comes from `discountPercent`

On the detail page, price updates from the selected purity, metal color, and ring size when those options are available.

## State Management

Redux Toolkit manages:

- Cart drawer state and cart items
- Profile dialog/user state
- Wishlist product IDs

The app persists state in `localStorage` using these keys:

- `eco_caret_cart_v2`
- `eco_caret_wishlist`
- `eco_caret_user`

## Product Detail UI

The product detail page supports:

- Product image gallery with fallback empty-image state
- Ready-to-ship, made-to-order, and new-arrival badges
- Purity selector from active `metalOptions`
- Metal color selector from active `metalOptions`
- Ring size dropdown from available `sizeMatrix` rows
- Inventory checks for selected purity, metal color, and size
- Compact specification display above the Add to Bag button
- Suggested products from the collection API

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

For collection pages to show live data, run the backend API on:

```text
http://localhost:3002/api/v1
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Useful local verification:

```bash
npx tsc --noEmit --pretty false
npx eslint app/collections/page.tsx app/collections/[id]/page.tsx app/collections/[id]/ProductDetailsClient.tsx types/index.ts
```

On Windows PowerShell, use `npm.cmd` or `npx.cmd` if script execution policy blocks `npm` or `npx`.

## Notes for Future Updates

- Keep `types/index.ts` aligned with the backend product response.
- Update `services/apiClient.ts` if the API base URL changes.
- Avoid reintroducing legacy product fields that are no longer returned by the API.
- Product detail pricing depends on the selected size and active metal option, so changes to `metalOptions` or `sizeMatrix` should be reflected in both list and detail price helpers.
