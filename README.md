# Railverse - Smart Railway Experience Platform

Railverse is a modern railway intelligence platform built with Next.js for train discovery, schedule exploration, and route-level insights.

## Preview

Railverse combines a clean product-style interface with structured railway data to make train search and route understanding easier for users. The platform focuses on practical utility: finding trains, visualizing schedules, mapping routes, and presenting details in a clear UI.

## Features

- Train search across available route data
- Full schedule visualization with structured station timelines
- No-halt station grouping support in schedule presentation
- Route map experience using OpenStreetMap and Leaflet
- Distance tracking between stations in route context
- Smart UI patterns such as badges, timeline structure, and modal details
- Maintenance mode system with admin bypass support

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- OpenStreetMap + Leaflet (via react-leaflet)
- Vercel deployment workflow

## Project Structure

High-level structure:

- `src/app/` - App Router pages and route segments
- `src/components/` - Reusable UI and feature components
- `src/data/` - Railway datasets and generated route/train data
- `src/lib/` - Utility and domain logic (search/data helpers)
- `src/scripts/` - Internal data validation or build support scripts
- `public/` - Static assets
- `middleware.ts` - Global request handling (maintenance mode and bypass)

## Setup and Installation

```bash
git clone <repo-url>
cd railverse
npm install
npm run dev
```

Open `http://localhost:3000` after the server starts.

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

What it does:

- `true`: Maintenance mode is enabled and users are routed to the maintenance screen
- `false`: Normal application routes remain accessible

## Usage

### Search Trains

- Open the Train Search page
- Enter route details (source and destination)
- Submit to view available trains

### View Schedules

- Select a train result
- Open the train details modal/card flow
- Review station order, timing, and route segments

### View Route Map

- Open route details for a train
- Use the embedded map view to inspect route progression
- Review mapped stations and route context

## Maintenance Mode

Maintenance mode is managed through the environment variable and middleware logic.

Enable maintenance:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

Disable maintenance:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

Admin bypass:

- Visit any route with `?admin=true`
- This sets an admin access cookie and allows normal access during maintenance

## Future Plans

- Live train tracking
- AI travel planner enhancements
- Ticket booking integration
- Expanded analytics dashboard

## Contributing

Contributions are welcome.

Suggested workflow:

1. Fork the repository
2. Create a feature branch
3. Commit focused changes
4. Open a pull request with a clear summary

## License

License is currently to be finalized.

Recommended option for open-source release: MIT License.

## Author

Vishal Singh  
Founder - TravelCore Technologies
