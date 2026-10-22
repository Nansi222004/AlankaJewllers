# ALANKA JEWELLERS — Complete Admin, Shiprocket, Return, Exchange & Performance Audit

**Audit date:** 2026-10-07  
**Project:** `D:\Appzeto_Projects\AlankaJewllers`  
**Scope:** Customer website, admin panel, backend, MongoDB, Shiprocket, Razorpay, API Mitra, Firebase, and browser performance. There is **no vendor application or vendor panel**. Legacy seller/commission fields and services still exist in the backend.

## 1. Executive Summary

**Final readiness: ❌ FAIL — not production-ready for a fully automated return/exchange/refund promise.**

The core catalogue/admin read APIs are reachable and the tested read-only Shiprocket account authentication works. Normal Razorpay verification has meaningful server-side safeguards. However, the following release blockers remain:

1. Return approval does not create a Shiprocket reverse shipment and its refund fields are bookkeeping only; it does not call Razorpay.
2. “Exchange” is implemented as same-item replacement. Replacement product/variant selection, price differences, additional payment/refund, reverse Shiprocket pickup, and replacement Shiprocket shipment creation are not implemented.
3. Paid order cancellation is disconnected from Razorpay refund. Admin cancellation also does not restore product inventory.
4. Order creation, gift-card redemption, and multi-item stock changes are not transactional; partial state is possible after a mid-flow failure.
5. Gold/home and silver pages transfer approximately 15.6 MB and 20.6 MB respectively in a cold local run. Mobile receives essentially the same payload.

Confirmed fixes were applied for false-success Shiprocket pickup/cancellation, missing-AWB persistence, webhook retry behavior, startup index deletion, API Mitra fallback, return transition bypasses, rejected-request retry behavior, duplicate settings requests, eager anonymous Firebase, and the full-page silver loader.

No real shipment, pickup, cancellation, reverse shipment, payment, refund, order, return, replacement, or customer-record mutation was made during this audit.

## 2. Admin Panel Audit

Legend: “Read” means a read-only authenticated API smoke test completed. Create/update/delete workflows remain blocked unless explicitly stated.

| Feature | UI | API | DB | Integration | Tested | Status | Issue |
|---|---|---|---|---|---|---|---|
| Admin login/session/logout | Exists | Exists | User lookup | JWT | Source + protected-route checks | ⚠️ PARTIAL | Production credential submission/logout mutation not performed |
| Dashboard | Exists | 200 | Reads aggregates | — | Read; 334.5 ms warm | ✅ PASS | Cold run reached 13.9 s; investigate connection/query warm-up |
| Analytics | Exists | 200 | Reads analytics/orders | geo/track | Read; 666 ms | ⚠️ PARTIAL | Browser audit blocked analytics POST deliberately |
| Orders/list/summary | Exists | 200 | Reads orders | Shipping/payment links | Read; 165.7/50.7 ms | ⚠️ PARTIAL | Status/refund writes not live-tested |
| Order detail/invoice | Exists | Exists | Read plus notification side effect | Invoice | Source only | ⚠️ PARTIAL | Detail GET marks matching admin notifications read |
| Products/editor/pricing | Exists | 200 | 265.6 KB response | Metal resolver | Read; 527.1 ms | ⚠️ PARTIAL | Write validation not exercised against live DB |
| Product barcodes | Exists | Exists | Product read | Barcode library | Source | ⚠️ PARTIAL | No print/scanner hardware test |
| Metal pricing | Exists | 200 | Settings read | API Mitra/fallback | Read; 178.3 ms | ⚠️ PARTIAL | Update reprices every product sequentially |
| Tax settings | Exists | 200 | Settings read | Repricing | Read; 248.3 ms | ⚠️ PARTIAL | Update also reprices all products sequentially |
| Categories | Exists | 200 | Read | — | Read; 150.9 ms | ✅ PASS | Write flow not live-tested |
| Coupons | Exists | 200 | Read | Checkout | Read; 81.7 ms | ⚠️ PARTIAL | Redemption write not live-tested |
| Customers | Exists | 200 | Read | — | Read; 148.2 ms | ⚠️ PARTIAL | Detail/edit not live-tested |
| Returns | Exists | 200 | Read/write code | Manual logistics/refund | Read + source + transition tests | ❌ FAIL | No reverse Shiprocket API or real online refund |
| Replacements (“Exchanges”) | Exists | 200 | Read/write code | Manual logistics | Read + source | ❌ FAIL | Same-item replacement only; no priced exchange |
| Inventory/history/alerts/reports | Exists | 200 | Reads products/logs | — | Read; 549/408/162 ms | ⚠️ PARTIAL | Responses 355.6/396.3 KB; write paths non-transactional |
| Shipping/Shiprocket | Exists | 200 | Shipment read | Shiprocket | Read + mocked writes | ⚠️ PARTIAL | Forward write calls fixed but controlled real order required |
| Pickup locations | Exists | 200 | Read | Shiprocket separate read passed | Read | ✅ PASS | Sync/create remains a write operation |
| Gift cards | Exists | 200 | Read | Checkout | Read; 142.6 ms | ⚠️ PARTIAL | Redemption ordering can leave invalid tender state |
| Payments/refunds | In order detail | Exists | Order fields | Razorpay | Source/mocked safeguards | ❌ FAIL | Cancellation/return refund paths disconnected; partial refund model limited |
| Support/inquiries | Exists | 200 | Read | Email/upload | Read; 71/362 ms | ⚠️ PARTIAL | Ticket writes not live-tested |
| Reviews | Exists | 200 | Read | — | Read; 70.1 ms | ⚠️ PARTIAL | Moderation write not live-tested |
| Notifications/broadcasts | Exists | 200 | Read | Socket/FCM | Read; 142.1 ms | ⚠️ PARTIAL | Broadcast/push write not sent |
| FAQ | Exists | 200 | Read | Public FAQ | Read | ⚠️ PARTIAL | Admin write not live-tested |
| CMS/pages/sections | Exists | 200 | Read | Storefront CMS | Read; 63–144 ms | ⚠️ PARTIAL | Section response is 80.2 KB; writes not live-tested |
| Dynamic promo banners | Exists | Exists | Validation/sanitization tested | Storefront renderer | 15 related tests | ✅ PASS | Desktop and mobile required; optional content omitted correctly |
| Global settings/SEO | Exists | 200 | Read | Storefront | Read; 63.2 ms | ⚠️ PARTIAL | Update not live-tested |
| Media | Embedded in editors | Upload routes | Cloudinary URLs | Cloudinary | Source | 🚫 BLOCKED | Uploading would create external assets |
| Reports/audit logs | Exists | 200 | Read | Export | Read; 80 ms | ⚠️ PARTIAL | Export/UI interaction not exercised |
| Direct sales | Exists | 200 | Read | Inventory/order | Read; 79.1 ms | ⚠️ PARTIAL | Sale creation would mutate stock/order data |
| Admin profile | No dedicated route found | Auth `/me` exists | User read | — | Source | ⏭️ NOT IMPLEMENTED | No distinct admin profile/settings page |
| Vendor panel | None | Legacy seller code only | Legacy fields | Commission remnants | Inventory | ⏭️ NOT IMPLEMENTED | Correctly excluded from product scope; dead code remains |

All 30 selected admin list/settings/report GET endpoints returned HTTP 200 on the warmed read-only audit server. That does **not** establish create/edit/delete success.

## 3. Shiprocket Audit

### Configuration and safe account check

- Required Shiprocket environment entries are present. Values were never printed.
- **SAFE / READ ONLY:** authentication returned a token successfully and pickup-location GET succeeded with two configured locations.
- Token caching is in-memory for 24 hours with a five-minute refresh buffer. Multi-instance processes do not share the cache.
- Auth timeout is 15 seconds; authenticated client timeout is 30 seconds.

### Capability matrix

| Capability | Result | Evidence |
|---|---|---|
| Authentication/token refresh | ✅ PASS | Read-only live authentication |
| Serviceability/rates | ⚠️ PARTIAL | Implemented; no controlled postcode/order assertion |
| Forward order creation | 🚫 BLOCKED | Code exists; requires controlled real order |
| AWB assignment | 🚫 BLOCKED | Code exists; missing AWB now fails instead of persisting broken shipment |
| Label/invoice | 🚫 BLOCKED | Code exists; generation failures remain non-critical |
| Pickup request | ⚠️ PARTIAL | Fixed to call provider with Shiprocket shipment ID; mocked test passed |
| Tracking | 🚫 BLOCKED | Read method exists; no safe known audit AWB used |
| Manifest | 🚫 BLOCKED | Code exists; requires real shipment |
| Cancellation | ⚠️ PARTIAL | Fixed to pass Shiprocket order ID and reject upstream failure; mocked test passed |
| Webhook | ⚠️ PARTIAL | Signature/secret path exists; processing error now returns 500 for retry |
| Reverse/return shipment | ⏭️ NOT IMPLEMENTED | No reverse-order API call found |
| NDR handling | ⏭️ NOT IMPLEMENTED | No NDR workflow found |
| Persistent dedup/retry queue | ⏭️ NOT IMPLEMENTED | Dedup is process memory only |

Before the fix, admin “request pickup” only changed MongoDB to `PICKUP_SCHEDULED`. Cancellation omitted `shiprocketOrderId`, ignored `{cancelled:false}`, and still marked the local shipment cancelled. Both were false-success integrity defects.

## 4. Normal Order Flow

Actual principal statuses are `Pending → Processing → Confirmed → Packed → Shipped → Out for Delivery → Delivered`, with `Cancelled`, `Return Requested`, `Returned`, `Partially Shipped`, and `Partially Returned` also in the schema. The admin transition table omits both partial statuses.

| Step | Trigger | Persistence/integration | Result |
|---|---|---|---|
| Cart/quote | Customer | Server recalculates current products, discounts, shipping, GST snapshots | ✅ PASS by automated pricing tests |
| COD create | Customer | Order created, then stock deducted sequentially | ⚠️ PARTIAL — no transaction |
| Razorpay initiate | Customer | 15-minute immutable PaymentQuote + gateway order | ✅ PASS by tests |
| Razorpay verify | Customer callback | Timing-safe signature, gateway fetch, amount/currency/status checks, atomic quote claim | ✅ PASS by tests |
| Admin confirmation/packing | Admin | Order/timeline/notifications | ⚠️ PARTIAL — writes not live-tested |
| Shipment create/AWB | Admin | Shiprocket then Shipment/Order | 🚫 BLOCKED — controlled order needed |
| Pickup | Admin | Shiprocket call then local status | ⚠️ PARTIAL — mocked, not live write |
| Tracking/delivery | Webhook/admin sync | Shipment and order cascade | 🚫 BLOCKED — controlled shipment needed |

Status can still diverge because manual admin order status and shipment-derived status are separate mechanisms.

## 5. Return Flow

The implemented flow is delivered order → request one item → admin approve/reject → manually record pickup → manually record refund → inventory restore → order update.

- ✅ Delivered-only request and item ownership checks exist.
- ✅ Backend reason validation added.
- ✅ Active/completed duplicate and cross-flow requests are blocked; a rejected request can now be retried.
- ⚠️ Void-tag image/decision validation exists only for tagged items.
- ❌ No configured return-window/date validation was found.
- ❌ No Shiprocket reverse shipment, reverse AWB, or reverse tracking call exists.
- ❌ Online refund is not sent to Razorpay by the return controller.
- ❌ COD refund is manual metadata; no payout service exists.
- ✅ Unsafe shortcuts `Approved → Refunded` and `Pickup Completed → Refunded` were removed. Required order is now pickup scheduled → completed → refund initiated → refunded.
- ⚠️ Inventory restores on “Refunded”; actual product receipt/verification is represented only by admin status/seal inputs.
- ⚠️ Refund allocation across coupon, shipping, gift card, and partial item value is not authoritatively calculated.

**Result: ❌ FAIL.** The database workflow is not a verified logistics-and-payment return.

## 6. Exchange Flow

The feature is a **replacement**, not a commercial exchange:

- Original item selection and delivered-order validation exist.
- No replacement product or variant selection exists.
- `replacementItems` exists in the schema but is not populated by the customer request.
- Replacement stock is deducted from the original product/variant.
- Pickup and outbound courier/AWB fields are manually entered.
- No Shiprocket reverse pickup or outbound replacement shipment is created.
- No price comparison, additional payment, lower-value refund, or same-price branch exists.

| Required case | Result |
|---|---|
| Higher-price exchange | ⏭️ NOT IMPLEMENTED |
| Lower-price exchange | ⏭️ NOT IMPLEMENTED |
| Same-price exchange | ⏭️ NOT IMPLEMENTED as product/variant exchange |

**Result: ❌ FAIL.** Do not market this implementation as a full exchange feature.

## 7. Payment and Refund Audit

Razorpay creation/verification is comparatively strong: immutable quote, exact gateway order/amount/currency checks, captured-status check, and atomic quote consumption are tested.

Confirmed defects:

- ❌ Customer cancellation of a paid Razorpay order marks it cancelled and restores stock but does not call Razorpay refund.
- ❌ Admin cancellation does not call Razorpay refund and does not restore product inventory.
- ❌ Return “Refunded” can record a transaction ID without invoking/verifying Razorpay.
- ⚠️ Admin refund endpoint can call Razorpay and caps amount at order total, but one partial refund marks the refund record processed and prevents a later remainder. It also historically marked payment status fully refunded for a partial amount.
- ⚠️ Gift-card redemption occurs after order/stock creation; failure is stored in notes instead of rolling back the order.
- ⚠️ Exact partial-return allocation for coupon/gift-card/shipping is undefined, so an automatic return refund was not invented during this audit.

No real refund was created. All payment/refund E2E tests remain **🚫 BLOCKED — REQUIRES CONTROLLED REAL ORDER**.

## 8. Inventory Audit

- Normal COD and verified online purchases decrement stock, including serialized-unit handling.
- Customer cancellation restores stock once because an already-cancelled order cannot transition again.
- Return restock has an idempotency timestamp, but is tied to manual `Refunded` status.
- Replacement pickup can restock/discard the original, and replacement shipment deducts the original variant.
- Stock/order/gift-card operations span multiple sequential saves without a MongoDB transaction. A mid-loop failure can leave partial item mutations.
- Admin cancellation does not restore product stock.

**Result: ❌ FAIL** for failure-safe inventory integrity.

## 9. Website Performance Audit

Lab method: local production build, installed Chrome headless, cold cache per page, local frontend, configured remote backend, unthrottled machine/network. POST requests were blocked. “Elapsed” is network-idle completion, not a standards-compliant TTI. Results are diagnostic, not field Core Web Vitals.

| Page (1440px) | FCP | LCP | TBT | CLS | Transfer/image dominant | Requests | Network-idle |
|---|---:|---:|---:|---:|---:|---:|---:|
| Homepage | 1,076 ms | 1,772 ms | 359 ms | 0.5 | 15.59 MB / ~15.0 MB | 94 | 3,004 ms |
| Gold | 632 ms | 1,400 ms | 400 ms | 0.5 | 15.59 MB / ~15.0 MB | 89 | 2,943 ms |
| Silver | 652 ms | 652 ms | 429 ms | 0.5 | 20.59 MB / ~20.0 MB | 131 | 3,202 ms |
| Diamond | 640 ms | 1,508 ms | 231 ms | 1.5 | 7.15 MB / ~6.6 MB | 75 | 2,554 ms |
| Gems | 612 ms | 896 ms | 145 ms | 0.5 | 4.54 MB / ~4.0 MB | 61 | 2,479 ms |
| Shop | 548 ms | 1,200 ms | 83 ms | 0.2 | 3.97 MB / ~3.4 MB | 52 | 2,141 ms |
| PDP | 556 ms | 1,240 ms | 136 ms | 0.7 | 1.29 MB / ~0.7 MB | 39 | 2,176 ms |
| Cart | 584 ms | 584 ms | 104 ms | 0.1 | 0.77 MB | 25 | 1,914 ms |
| Checkout | 532 ms | 532 ms | 63 ms | 0.3 | 0.79 MB | 28 | 2,190 ms |

At 390px the post-fix homepage FCP/LCP were 440/440 ms and TBT 183 ms, but it still transferred about 15.59 MB. Silver transferred about 20.61 MB. This proves responsive layout is not preventing desktop-scale image download.

Final build artifacts: main entry 211.38 KB (54.49 KB gzip), React 193.04 KB (60.56 KB gzip), generic vendor 345.43 KB (115.80 KB gzip), UI/lucide chunk 596.98 KB (160.24 KB gzip), and CSS 350.89 KB (45.27 KB gzip). Route chunks are additional.

### Top 10 causes, ranked

1. **Eager/hidden image payload** — 15–20 MB on the primary collection pages, also on mobile.
2. **No effective responsive image selection** for many static collection/CMS assets; mobile downloads the same files.
3. **Large shared JavaScript** — about 1.35 MB minified across critical shared chunks before route code.
4. **Severe layout shift** — CLS ranged 0.5–1.5 on several desktop pages.
5. **Global 60-product catalogue request** (278 KB API body) plus page-specific product queries.
6. **Many below-fold modules/assets imported eagerly** despite comments describing them as lazy.
7. **Remote DB/API concurrency and cold-start latency**; first product list was 2.8 s and first dashboard aggregate 13.9 s.
8. **Root page fetches both home and gold-collection CMS**, plus multiple product lists.
9. **Third-party font, Razorpay, and analytics resources are globally attempted** and can create errors/delay when unavailable.
10. **Large admin list payloads** (inventory/history 356–396 KB) and broad populated responses.

## 10. API Performance and Homepage Network

Warmed sequential API measurements:

| Request | Method | Time | Size | Count after fix | Blocking/Status |
|---|---|---:|---:|---:|---|
| `/public/settings` | GET | 103.9 ms sequential; 831 ms under concurrency | 5.3 KB | **1** | Shared settings; 200 |
| `/public/categories` | GET | 54.7 ms | 13.0 KB | 1 | Navbar/catalogue; 200 |
| `/public/products?…limit=60` | GET | 350.1 ms | 278.1 KB | 1 | Global catalogue; 200 |
| `/public/products/search?q=ring` | GET | 104.7 ms | 2.8 KB | page-specific | 200 |
| `/public/coupons` | GET | 62.1 ms | 88 B | 1 | Not required for first paint |
| `/public/cms/pages/home` | GET | 64.8 ms | 38.5 KB | 1 | Enhancement/fallback exists |
| `/public/cms/pages/gold-collection` | GET | 69.0 ms | 11.4 KB | 1 | Root gold content |
| `/public/metal-rates` | GET | 151.5 ms after fallback warm | 369 B | 1–2 by city | Non-blocking section; 200 |

Before the fix, `public/settings` was called 3–5 times per navigation. After consolidating consumers into `SettingsContext`, the final homepage trace has one call and no duplicate GET requests.

## 11. MongoDB Performance

Read-only `explain("executionStats")` was run with auto-index/auto-create disabled.

| Query | Documents | Execution | Examined/returned | Plan | Assessment |
|---|---:|---:|---:|---|---|
| Active products, newest, limit 60 | 56 | 30 ms | 54/54 | IXSCAN + FETCH + SORT | Current scale acceptable; sort/index predicate mismatch |
| Active home sections | 68 | 8 ms | 26/26 | IXSCAN + FETCH + SORT | Acceptable |
| Active categories | 25 | 3 ms | 25/25 | COLLSCAN + SORT | Small now |
| Processing orders | 19 | 3 ms | 19/13 | COLLSCAN + SORT | Add index only before meaningful growth |
| Pending returns | 1 | 3 ms | 1/1 | COLLSCAN + SORT | Small now |
| Pending replacements | 1 | 3 ms | 1/1 | COLLSCAN + SORT | Small now |
| In-transit shipments | 1 | 8 ms | 1/0 | IXSCAN | Indexed |

No indexes were added blindly. Growth candidates, tied to actual list queries, are `{status:1, createdAt:-1}` on orders/returns/replacements, `{isActive:1, sortOrder:1}` on categories, and `{pageKey:1, isActive:1, sortOrder:1}` on homepage sections. Re-run explain with production-scale cardinality first.

The server previously attempted to drop the users `email_1` index on every startup. This dangerous schema mutation was removed.

## 12. Image Performance

Top source assets (largest first):

| Asset | Size | Usage found |
|---|---:|---|
| `bbb.png` | 1,853 KB | No source reference found |
| `products/image.png` | 1,715 KB | No source reference found |
| `ban 33.png` | 1,703 KB | No source reference found |
| `my ban.png` | 1,668 KB | No source reference found |
| `banner.png` | 1,584 KB | No exact source reference found |
| `ban.png` | 1,497 KB | No exact source reference found |
| UUID PNG | 1,492 KB | No source reference found |
| `bannerrr.png` | 1,470 KB | No source reference found |
| `com.png` | 1,398 KB | No source reference found |
| `Alankar jewllers.png` | 1,340 KB | No source reference found |
| `logo-emblem.png` | 1,340 KB | Admin invoice |
| `promos/girl section.png` | 1,272 KB | No direct source reference found |
| `girl hand.png` | 1,272 KB | No direct source reference found |
| `videoframe_23898.png` | 1,132 KB | Shared product editor/family media |
| `home_haldi_editorial.jpg` | 920 KB | Occasion section, CMS fallback/admin defaults |
| `home_reception_editorial.jpg` | 914 KB | Occasion section, CMS fallback/admin defaults |
| `home_sangeet_editorial.jpg` | 906 KB | Occasion section, CMS fallback/admin defaults |
| Screen-recording MP4 | 877 KB | Static collection media |
| `pure_silver_atelier_hero.jpg` | 800 KB | Silver CMS fallback/admin defaults |
| `curated_video.mp4` | 800 KB | Static collection media |

Runtime largest files included gold launch images around 713–787 KB each and occasion images around 906–921 KB each. Many images lack a responsive `srcset/sizes` strategy. No assets were replaced blindly.

## 13. React/JavaScript Performance

- Settings were independently fetched by context, announcement bar, footer, trust markers, PDP, and help center. Consolidated to one context request.
- Firebase/push was statically pulled into auth and initialized for anonymous visitors. It is now dynamically loaded only after authentication; FCM tokens are no longer printed to console.
- The silver page used a global catalogue loading flag for a full-page loader. The blocking return was removed; sections can render with existing empty/fallback states.
- `ShopContext` still loads categories, up to 60 products, and coupons globally for all storefront routes.
- `OrderContext` and `SupportContext` both fetch support data after login.
- Several Hook dependency warnings remain, notably in checkout, PDP, shop, help, and profile.
- Comments claim below-fold components are lazy, but many are ordinary static imports wrapped only by viewport rendering.

## 14. Loading-State Investigation

The visible full-page silver loader was controlled by the aggregate catalogue query: categories + 60 products + coupons + settings. Any slow/failing member kept the page at `Loader`. Settings was duplicated and API Mitra could fail independently in its section.

Applied behavior:

- Page shell and fallback sections render without waiting for the entire catalogue.
- Settings consumers share cached context data.
- API Mitra failure returns cached data when available, otherwise configured admin fallback; source is displayed honestly.
- Anonymous Firebase no longer participates in initial navigation.

Remaining loading risks:

- Suspense route loader can cover the main content while a large route chunk evaluates.
- Authenticated support/order requests are duplicated.
- Checkout/payment loaders remain appropriately blocking but were not live-failure tested.
- External resources and image decode can still delay meaningful completion.

## 15. Third-Party Services

| Service | Initial-page risk | Result |
|---|---|---|
| Shiprocket | Should not be on homepage | No homepage call found |
| API Mitra | Metal-rate section | Live call currently unavailable; admin fallback now returns 200 |
| Firebase | Previously anonymous startup work | Fixed: authenticated dynamic load only |
| Razorpay checkout script | Globally attempted | ⚠️ Should be loaded only for payment interaction |
| Socket.IO | Separate chunk/auth usage | ⚠️ Authenticated only by design; not profiled logged-in |
| Google fonts | Render/network dependency | ⚠️ Failed in restricted lab; use local/system fallback strategy |
| Analytics/GTM | Global request | ⚠️ POST blocked in audit; must remain non-blocking |
| Cloudinary | Product/CMS image delivery | ⚠️ Existing URLs not systematically transformed with responsive widths |
| Email/SMTP | Notification side effect | Safe connection check succeeded; no email sent |

## 16. Bugs Found

| Priority | Bug | State |
|---|---|---|
| P0 | Shiprocket pickup only changed DB | ✅ Fixed |
| P0 | Failed Shiprocket cancel still marked local cancelled | ✅ Fixed |
| P0 | Return has no reverse shipment/Razorpay refund | ❌ Open |
| P0 | Full exchange price/product/logistics flow absent | ⏭️ Not implemented |
| P0 | Paid cancellation does not refund; admin cancel does not restock | ❌ Open |
| P0 | Order/stock/gift-card operations are non-transactional | ❌ Open |
| P1 | Startup drops user email index | ✅ Fixed |
| P1 | Return status could bypass pickup/verification | ✅ Fixed |
| P1 | Rejected claim permanently blocked retry | ✅ Fixed |
| P1 | Webhook errors returned 200, suppressing retry | ✅ Fixed |
| P1 | API Mitra outage returned 503 with no admin fallback | ✅ Fixed |
| P1 | Settings fetched 3–5 times | ✅ Fixed (one request) |
| P1 | Anonymous Firebase loaded/registered and token logged | ✅ Fixed |
| P1 | Silver full-page loader coupled to aggregate catalogue | ✅ Fixed |
| P1 | Admin order commission hooks reference undeclared symbols | ❌ Open legacy code |
| P1 | Very large image payload/CLS | ❌ Open |
| P2 | One-shot partial-refund model | ❌ Open |
| P2 | In-memory webhook dedup/token cache only | ❌ Open |

## 17. Fixes Applied

1. Removed startup `dropIndex("email_1")`.
2. Shiprocket pickup now calls the provider using `shiprocketShipmentId` and fails closed.
3. Shiprocket cancellation receives `shiprocketOrderId` and fails closed.
4. Shipment creation refuses to persist a blank AWB.
5. Webhook processing errors return HTTP 500 for provider retry.
6. Added required backend reason validation and precise product/variant duplicate matching for returns/replacements; rejected requests can retry.
7. Enforced sequential return pickup/refund transitions in backend and admin UI.
8. Added API Mitra → in-memory cache → admin fallback behavior to the public endpoint, with honest source labels.
9. Consolidated all settings consumers into `SettingsContext`.
10. Deferred Firebase until authentication, removed duplicate registration calls, sanitized token logging, and hardened missing notification payloads.
11. Removed the silver page’s aggregate full-page loader.
12. Preserved the requested desktop/mobile dynamic promo-banner validation and conditional rendering behavior.

## 18. Tests Performed

- Shiprocket account: **SAFE / READ ONLY** authentication + pickup-location GET — ✅ PASS.
- MongoDB: read-only listCollections/index/explain — ✅ PASS.
- Public API: 9 GET endpoints; metal endpoints initially 503, then 200 with admin fallback — ✅ PASS after fix.
- Admin API: 30 authenticated read-only GET endpoints — all HTTP 200.
- Browser: 1440, 1280, 430, 390 widths; homepage, gold, silver, diamond, gems, shop, search, PDP, cart, checkout, login.
- Frontend Node tests: **15 passed, 0 failed**.
- Final focused backend suites: **84 passed, 0 failed** (shipping safety, banner, filters, metal rates, checkout, zero-price, and stone pricing).
- Backend combined tests: **109 total; 106 passed, 3 failed**. Failures were `pricingAudit.spec.js` static/source-contract checks 8, 17, and 22; they expect older exact implementation text and require reconciliation with the current pricing controller/service. Runtime pricing suites and the 25-check pricing script otherwise passed.
- New Shiprocket safety tests: **3 passed**.
- Backend syntax checks: ✅ PASS.
- `git diff --check`: ✅ PASS (line-ending warnings only).
- ESLint: ❌ FAIL — 20 errors and 392 warnings, including four duplicate keys in `legacyCmsAssets.js`; these pre-existing broad issues were not mass-edited.
- Final required `npm run build`: ✅ PASS — Vite 7.3.2, 4,327 modules transformed, completed in 42.11 seconds.

## 19. Blocked Tests

All are marked honestly and were not treated as passes:

- 🚫 Forward Shiprocket order/AWB/label/manifest/pickup/cancel — **REQUIRES CONTROLLED REAL ORDER**.
- 🚫 Reverse Shiprocket shipment — not implemented; then requires controlled order.
- 🚫 Razorpay payment/refund and payment-failure callbacks — **REQUIRES CONTROLLED TEST PAYMENT/ORDER**.
- 🚫 COD cash collection/refund payout — no payout integration and requires controlled order.
- 🚫 Admin/customer create-edit-delete E2E — would mutate production-like data.
- 🚫 Return/replacement inventory mutation and duplicate-race tests — require isolated test DB fixtures.
- 🚫 Field performance/RUM and production CDN/cache behavior — no deployed URL/RUM dataset supplied.

## 20. Before/After Performance

| Metric | Before | After | Interpretation |
|---|---:|---:|---|
| Settings requests/homepage | 4 (3–5 by route) | 1 | Confirmed fix |
| Anonymous Firebase network attempts | Multiple config/install/SW attempts | 0 | Confirmed fix |
| Main entry JS | 216.14 KB | 211.38 KB | 4.76 KB smaller; Firebase now optional chunk |
| Homepage 1440 LCP | 2,352 ms indicative | 1,772 ms indicative | Improved, but runs had different backend conditions |
| Homepage 1440 TBT | 555 ms indicative | 359 ms indicative | Improved, not a controlled benchmark |
| Homepage image payload | ~14.46–15.0 MB | ~15.0 MB | Not fixed; dominant risk |
| Silver image payload | ~19.8 MB | ~20.0 MB | Not fixed; dominant risk |

The before/after browser values are directional because the initial production preview could not proxy `/api`, while the final run used the real read-only backend. Request-count and API-latency comparisons across those two runs should not be treated as controlled scientific deltas.

## 21. Remaining Risks

1. Money and inventory can diverge on cancellation/return/order failure.
2. Exchange requirements are materially absent.
3. Reverse logistics is absent.
4. Image payload and CLS are unacceptable for mobile production performance.
5. Cold API/database latency is unstable despite small collections.
6. Partial refund accounting is not extensible or cumulative.
7. Manual order status can disagree with shipment status.
8. Webhook dedup is not durable across restarts/instances.
9. Legacy seller/commission code is inconsistent with the no-vendor architecture and contains undeclared references.
10. Lint and three static pricing-audit failures remain.

## 22. Final Production Readiness

**❌ FAIL** for a production launch claiming complete order → Shiprocket → return → refund and full exchange behavior.

The storefront/admin read surface is broadly present, Shiprocket credentials authenticate, and several dangerous false-success/performance defects were fixed. Production approval should wait for:

1. A defined, implemented, idempotent refund orchestration used by cancellation and return.
2. Transactional or compensating stock/gift-card/order operations.
3. A real exchange data model and higher/lower/same-price workflows, or product copy/UI renamed to “replacement.”
4. Shiprocket reverse logistics.
5. Controlled sandbox/real-order E2E evidence for every blocked test.
6. Responsive image generation/loading and CLS remediation.
7. Resolution of lint and pricing-audit failures.

## End-to-End Test Matrix

| Test | Expected | Actual | Status | Evidence |
|---|---|---|---|---|
| 1 Online payment | Verified captured payment creates one order | Guarded code/tests; no live payment | ⚠️ PARTIAL | Pricing/payment tests |
| 2 COD | Order + stock decrement | Code/tests; no live write | ⚠️ PARTIAL | Source/tests |
| 3 Normal shipment | Shiprocket order + AWB | Implemented, not invoked | 🚫 BLOCKED | Controlled order required |
| 4 Tracking | Shiprocket status sync | Endpoint/webhook exists | 🚫 BLOCKED | Controlled AWB required |
| 5 Delivered | Shipment/order/UI agree | Not safely exercised | 🚫 BLOCKED | Controlled shipment required |
| 6 Return request | Eligible request stored once | Source validated; no live write | ⚠️ PARTIAL | Controller trace |
| 7 Admin approval | Valid transition | Implemented | ⚠️ PARTIAL | Source/UI trace |
| 8 Reverse shipment | Shiprocket reverse order/AWB | Absent | ⏭️ NOT IMPLEMENTED | No API call found |
| 9 Return pickup | Tracked reverse pickup | Manual fields only | ❌ FAIL | Controller/model trace |
| 10 Verification | Receipt/seal decision | Manual status/seal | ⚠️ PARTIAL | Controller trace |
| 11 Refund | Gateway/COD payout + state | Manual return metadata only | ❌ FAIL | No gateway call |
| 12 Exchange request | Replacement choice + eligibility | Original item only | ❌ FAIL | Request UI/controller |
| 13 Exchange approval | Review decision | Replacement approve/reject exists | ⚠️ PARTIAL | Source |
| 14 Exchange reverse shipment | Reverse Shiprocket | Absent | ⏭️ NOT IMPLEMENTED | No API call found |
| 15 Exchange verification | Received/verified | Manual pickup action | ⚠️ PARTIAL | Source |
| 16 Replacement shipment | New AWB/tracking | Manual fields only | ❌ FAIL | Source |
| 17 Higher-price exchange | Collect difference | Absent | ⏭️ NOT IMPLEMENTED | No price branch |
| 18 Lower-price exchange | Refund difference | Absent | ⏭️ NOT IMPLEMENTED | No price branch |
| 19 Same-price exchange | Allocate/send selected item | Absent as selection workflow | ⏭️ NOT IMPLEMENTED | No selection model use |
| 20 Shiprocket unavailable | No false local success | Provider now throws | ✅ PASS | Mocked tests |
| 21 Payment failure | No order/stock corruption | Quote retry path exists | ⚠️ PARTIAL | Unit/source; no gateway test |
| 22 Refund failure | Retryable, no false processed state | Admin endpoint marks failed; other paths disconnected | ⚠️ PARTIAL | Source |
| 23 Invalid return | Rejected | Delivered/item/reason checks | ✅ PASS | Source/static verification |
| 24 Invalid exchange | Rejected | Delivered/item/reason checks | ✅ PASS | Source/static verification |
| 25 Out-of-stock exchange | No replacement shipment | Same-item precheck exists | ⚠️ PARTIAL | Source only |
| 26 Duplicate request | Active/completed duplicate blocked; rejected retry allowed | Implemented | ✅ PASS | Controller query trace |
