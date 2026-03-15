# Employee Insights Dashboard

A 4-screen React application built with Vite featuring authentication, a custom-virtualized data grid, camera-based identity verification with signature overlay, and interactive data visualization with SVG charts and geospatial mapping.

> **Built with:** React 19 + Vite | React Router v7 | Leaflet | Raw CSS Modules  
> **Zero UI Libraries** — No MUI, Ant Design, Bootstrap, or pre-made component libraries  
> **Zero Virtualization Libraries** — All scroll/virtualization math is hand-rolled

---

## Features

### A. Secure Authentication (`/`)
- **Credentials:** `testuser` / `Test123`
- Auth Context Provider with `localStorage` persistence
- Protected route redirection — navigating to `/list` without login redirects to `/`
- Session survives page refresh via localStorage hydration on mount

### B. High-Performance Virtualized Grid (`/list`)
- Fetches data via POST to `https://backend.jotish.in/backend_dev/gettabledata.php`
- **Custom virtualization** — only renders visible rows + buffer (see technical details below)
- Search/filter by name, city, or email
- Stats cards showing total employees, cities, and salary

### C. Identity Verification (`/details/:id`)
- Shows employee info from API data
- **Camera API** — native `getUserMedia` for live camera preview and capture
- **Canvas Signature** — HTML5 Canvas overlay on the captured photo with mouse/touch support
- **Blob Merge** — programmatically merges photo + signature into a single combined image

### D. Data Visualization (`/analytics`)
- Displays the final merged "Audit Image" (photo + signature)
- **Custom SVG Bar Chart** — salary distribution per city using raw `<svg>` elements (no Chart.js/D3)
- **Leaflet Map** — cities plotted using a hardcoded coordinate lookup table with circle markers

---

## 🐛 Intentional Bug — Stale Closure in Virtual Scroll

### What
The `onScroll` handler in `useVirtualScroll.js` has a **stale closure bug**. It captures the `items` array from the initial render and does not update when `items` changes.

### Where
**File:** `src/hooks/useVirtualScroll.js`, line ~39

```javascript
const onScroll = useCallback((e) => {
  setScrollTop(e.target.scrollTop);
}, []); // <-- BUG: missing `items` in dependency array
```

### Why
This is a **realistic, subtle bug** that mimics what happens in production React apps. The `useCallback` with an empty dependency array means the scroll handler never re-creates when the `items` array changes. If the data is refetched or filtered while the user is mid-scroll, the virtualized rows may briefly render stale data from the old array until a new scroll event forces a re-render with current state. This represents a common React anti-pattern where developers forget to include closure dependencies.

### Fix
Add `items` to the dependency array: `useCallback((e) => { ... }, [items])`

---

## 📐 Custom Virtualization Math

### Overview
Instead of using `react-window` or `react-virtualized`, all virtualization logic is implemented from scratch in `src/hooks/useVirtualScroll.js`.

### Algorithm

Given:
| Variable | Description |
|---|---|
| `totalItems` | Total number of rows in the dataset |
| `rowHeight` | Fixed height per row in pixels (50px) |
| `containerHeight` | Viewport height of the scrollable container (500px) |
| `buffer` | Extra rows rendered above/below viewport (5 rows) |
| `scrollTop` | Current scroll position from the container's `onScroll` event |

### Calculations

```
totalHeight = totalItems × rowHeight
visibleCount = ⌈containerHeight / rowHeight⌉
startIndex  = max(0, ⌊scrollTop / rowHeight⌋ - buffer)
endIndex    = min(totalItems - 1, startIndex + visibleCount + 2 × buffer)
offsetY     = startIndex × rowHeight
```

**How it works:**
1. A spacer `div` is set to `totalHeight` to create the full scrollable area
2. Only `items[startIndex…endIndex]` are actually rendered as DOM nodes (~20-25 rows vs potentially thousands)
3. The rendered slice is positioned using `transform: translateY(offsetY)` 
4. As the user scrolls, `scrollTop` changes → recalculates visible window → swaps DOM nodes

### Buffer
5 extra rows are rendered above and below the viewport to prevent white flashing during fast scrolls.

---

## 🖼️ Image Merging — Technical Explanation

The photo+signature merge happens in `src/utils/api.js` → `mergePhotoAndSignature()`:

1. The captured photo (Base64 from `canvas.toDataURL()`) is loaded into an `Image` element
2. A new offscreen `<canvas>` is created matching the photo dimensions
3. The photo is drawn onto this canvas: `ctx.drawImage(img, 0, 0)`
4. The signature canvas (which the user drew on) is drawn on top: `ctx.drawImage(signatureCanvas, 0, 0, w, h)`
5. The merged result is exported as Base64 PNG: `canvas.toDataURL('image/png')`

This creates a single flattened image containing both the photo and the signature overlay.

---

## 🗺️ City-to-Coordinate Mapping (Leaflet)

The Analytics page uses `react-leaflet` to render an interactive map. Since the API data only provides city names (not coordinates), a **hardcoded lookup table** is used in `src/utils/api.js` (`CITY_COORDINATES`).

This table maps ~30 major cities to `[latitude, longitude]` pairs. If a city from the API data matches a key in the table (case-insensitive), a `CircleMarker` is rendered at that location. Cities without matching coordinates are excluded from the map.

**Trade-off:** A geocoding API could provide dynamic lookups for unknown cities, but the hardcoded approach satisfies the assignment requirements and avoids external API dependencies.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| Styling | Raw CSS Modules |
| Maps | Leaflet + react-leaflet |
| State | React Context API |
| Camera | Native MediaDevices API |
| Canvas | HTML5 Canvas API |

---

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.jsx    # Auth guard component
├── context/
│   ├── AuthContext.jsx        # Authentication state + localStorage
│   └── DataContext.jsx        # Shared employee data + merged image
├── hooks/
│   ├── useCamera.js           # Camera stream management
│   └── useVirtualScroll.js    # Custom virtualization engine
├── pages/
│   ├── Login.jsx              # Authentication screen
│   ├── List.jsx               # Virtualized employee grid
│   ├── Details.jsx            # Camera + signature + merge
│   └── Analytics.jsx          # SVG chart + Leaflet map
├── styles/
│   ├── Login.module.css
│   ├── List.module.css
│   ├── Details.module.css
│   └── Analytics.module.css
├── utils/
│   └── api.js                 # API calls, merge utility, city coords
├── App.jsx                    # Root routing
├── main.jsx                   # Entry point
└── index.css                  # Global design system
```
