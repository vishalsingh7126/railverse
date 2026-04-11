# Train Search Feature - Visual Architecture & Flow Guide

## 🏗️ Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TrainSearchPage (Main Page)                  │
│                      /train-search/page.tsx                     │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────────────┐  ┌──────────────────────────────────────────┐
│ TrainSearchForm  │  │   Results Section (Conditional Render)   │
│                  │  │                                          │
│ • From input     │  │  ┌─────────────────────────────────────┐│
│ • To input       │  │  │  Loading State (Spinner)           ││
│ • Swap button    │  │  │  OR                                 ││
│ • Date picker    │  │  │  Empty State (Message + Button)    ││
│ • Search button  │  │  │  OR                                 ││
│ │                │  │  │  Trains Grid:                      ││
└──────────────────┘  │  │  ┌───────────────────────────────┐ ││
        │             │  │  │ TrainCard #1 (clickable)      │ ││
        ↓             │  │  │ TrainCard #2 (clickable)      │ ││
   [onClick]          │  │  │ TrainCard #3 (clickable)      │ ││
        │             │  │  └───────────────────────────────┘ ││
        ↓             │  └─────────────────────────────────────┘│
   updates state      │                                          │
   (From, To, Date)   └──────────────────────────────────────────┘
        │                              │
    setLoading(true)         [onClick on TrainCard]
        │                              │
        ▼                              ▼
   searchTrains()                  setSelectedTrain()
        │
        └─────────────────────────────┬──────────────────────────┐
                                      ▼
                            ┌──────────────────────────┐
                            │ TrainDetailsModal        │
                            │                          │
                            │ • Train Info (Header)    │
                            │ • Journey Details        │
                            │ • TrainSchedule          │
                            │   (Timeline):            │
                            │   • TrainStop 1          │
                            │   • TrainStop 2          │
                            │   • TrainStop N          │
                            │ • Coach Layout Grid      │
                            │                          │
                            │ [Close: Esc/X/Click out]│
                            └──────────────────────────┘
```

---

## 🎬 User Interaction Flow

```
START
  │
  ├─ User sees initial state
  │  (Hero message + search form)
  │
  ├─ User enters "From" station
  │  (Text input, case-insensitive)
  │
  ├─ User enters "To" station
  │  (Text input, case-insensitive)
  │
  ├─ Optional: User clicks Swap button
  │  (Exchanges From ←→ To values)
  │
  ├─ Optional: User selects date
  │  (Date picker, currently UI-only)
  │
  ├─ User clicks "Search Trains" button
  │  (Triggers searchTrains(from, to))
  │
  ├─ Loading state appears
  │  (300ms delay + spinner)
  │
  ├─ Results page displays
  │  ├─ IF no trains found:
  │  │  └─ Empty state displayed
  │  │     (Message + "New Search" button)
  │  │
  │  └─ IF trains found:
  │     └─ Cards grid displayed
  │        (1 col mobile, 2 col tablet, 3 col desktop)
  │
  ├─ User clicks on a train card
  │  (Card gets selectedTrain state)
  │
  ├─ Modal opens with animation
  │  ├─ Header with train info
  │  ├─ Journey details section
  │  ├─ Full schedule timeline
  │  │  (getTrainSchedule called here)
  │  │
  │  └─ Coach layout simulation
  │     (3 classes: Sleeper, AC, General)
  │
  ├─ User explores modal
  │  ├─ Can scroll schedule
  │  ├─ Can view coach layouts
  │  └─ Can see all details
  │
  ├─ User closes modal
  │  (Button / Esc key / Click backdrop)
  │
  └─ Back to results
     └─ Can click another card
        or perform new search

END
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────────────┐
│   User Input (Form)      │
│  From: "Delhi"           │
│  To: "Mumbai"            │
│  Date: "2024-04-15"      │
└────────────┬─────────────┘
             │
             ▼
    ┌────────────────────┐
    │ searchTrains()     │
    │ (from trainData)   │
    └────────┬───────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │  Returns UnifiedTrain[] Array        │
    │  ├─ number: "12345"                 │
    │  ├─ name: "Rajdhani Express"        │
    │  ├─ fromName: "New Delhi"           │
    │  ├─ toName: "Mumbai Central"        │
    │  ├─ departure: "08:00"              │
    │  ├─ arrival: "18:30"                │
    │  ├─ duration: "10h 30m"             │
    │  ├─ distance: 1447                  │
    │  ├─ type: "Superfast"               │
    │  └─ stops: TrainStop[]              │
    └─────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
    Stored in:         Used in:
    searchResults      TrainCard
    (state)            components
        │                   │
        │                   ▼
        │              Display:
        │              • Train name & number
        │              • Route (From → To)
        │              • Times & duration
        │              • Train type badge
        │              • Stop count
        │
        └──────────┬─────────────┘
                   │
                   ▼ (On card click)
    ┌──────────────────────────────┐
    │  setSelectedTrain(trainData)  │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  TrainDetailsModal Opens         │
    │  (receives selectedTrain prop)   │
    └────────────┬─────────────────────┘
                 │
                 ├─ Display Train Header
                 │
                 ├─ Display Journey Details
                 │  ├─ Route (From → To)
                 │  ├─ Departure time
                 │  ├─ Arrival time
                 │  ├─ Duration
                 │  ├─ Distance
                 │  └─ Train type
                 │
                 ├─ Call getTrainSchedule()
                 │        │
                 │        ▼
                 │  ┌─────────────────┐
                 │  │ Returns         │
                 │  │ TrainStop[]     │
                 │  │ (all stops)     │
                 │  └────────┬────────┘
                 │           │
                 │           ▼
                 │  Passed to TrainSchedule
                 │  (Display timeline)
                 │
                 └─ Display Coach Layout
                    (Simulated grids)
```

---

## 🎨 UI Component Tree

```
TrainSearchPage
├── Spacing Container
│   └── space-y-8 (8 sections with spacing)
│
├── Section 1: Search Form
│   └── TrainSearchForm
│       ├── Glass card container
│       ├── Title & subtitle
│       ├── Input Grid
│       │   ├── From input
│       │   ├── Swap button
│       │   ├── To input
│       │   └── Date input
│       └── Action Buttons
│           ├── Search button (gradient)
│           └── Clear button
│
├── Section 2: Results (if hasSearched)
│   ├── Results header
│   │   ├── Title (dynamic: "Searching..." or "Results")
│   │   └── Subtitle (count or message)
│   │
│   ├─ Loading State (if loading)
│   │  └── Glass card
│   │      ├── Spinner animation
│   │      └── Loading message
│   │
│   ├─ Empty State (if !loading && results.length === 0)
│   │  └── Glass card
│   │      ├── Icon
│   │      ├── Message
│   │      └── "New Search" button
│   │
│   ├─ Results Grid (if !loading && results.length > 0)
│   │  └── Grid container (1-3 columns)
│   │      └── TrainCard[] (repeated)
│   │          ├── Header (name, badge)
│   │          ├── Route display
│   │          ├── Journey details
│   │          │   ├── Time (icon + display)
│   │          │   ├── Distance (icon + display)
│   │          │   └── Stops (icon + display)
│   │          └── CTA ("View Details →")
│   │
│   └─ Results Footer Info
│      └── Glass card with hint text
│
├── Section 3: Initial State (if !hasSearched)
│   └── Center container
│       ├── Icon circle
│       ├── Title
│       └── Subtitle
│
└── Modal (Always rendered, conditionally shown)
    └── TrainDetailsModal
        ├── Backdrop (with blur)
        └── Modal Card
            ├── Header
            │   ├── Train name & number
            │   └── Close button
            │
            ├── Content (scrollable)
            │   ├── Journey Details Section
            │   │   ├── Route grid
            │   │   ├── Type badge
            │   │   └── Time/Distance/Stops grid
            │   │
            │   ├── Schedule Section
            │   │   └── TrainSchedule
            │   │       ├── Timeline container
            │   │       │   └── TrainStop[] (repeated)
            │   │       │       ├── Timeline line
            │   │       │       ├── Station circle
            │   │       │       └── Stop details
            │   │       │
            │   │       └── Legend
            │   │           ├── Source (green)
            │   │           ├── Destination (red)
            │   │           └── Regular (primary)
            │   │
            │   └── Coach Layout Section
            │       ├── Title & subtitle
            │       ├── Coach Grid
            │       │   ├── Sleeper Class
            │       │   │   └── CoachLayoutGrid
            │       │   ├── AC 2-Tier
            │       │   │   └── CoachLayoutGrid
            │       │   └── General
            │       │       └── CoachLayoutGrid
            │       │
            │       └── Disclaimer text
            │
            └── Close triggers
                ├── X button (header)
                ├── Escape key
                └── Backdrop click
```

---

## 🎯 State Management

```
TrainSearchPage State:

1. searchResults: UnifiedTrain[]
   ├─ Initially: []
   ├─ Updated: When search succeeds
   ├─ Impact: Shows/hides results grid
   └─ Type: Array of UnifiedTrain objects

2. selectedTrain: UnifiedTrain | null
   ├─ Initially: null
   ├─ Updated: When user clicks a card
   ├─ Impact: Controls modal visibility
   └─ Type: Single UnifiedTrain or null

3. loading: boolean
   ├─ Initially: false
   ├─ Updated: During search (300ms)
   ├─ Impact: Shows/hides loading spinner
   └─ Type: Boolean flag

4. hasSearched: boolean
   ├─ Initially: false
   ├─ Updated: When search performed
   ├─ Impact: Shows/hides results section
   └─ Type: Boolean flag

5. searchParams: { from: string, to: string }
   ├─ Initially: { from: "", to: "" }
   ├─ Updated: When search succeeds
   ├─ Impact: Display in results header
   └─ Type: Object with station names

Transitions:
  
  Initial → Search Clicked
    loading: false → true
    hasSearched: false → true
    
  Loading → Results Ready
    loading: true → false
    searchResults: [] → [...trains]
    
  Results Ready → Card Clicked
    selectedTrain: null → UnifiedTrain
    (Modal opens)
    
  Modal → Close
    selectedTrain: UnifiedTrain → null
    (Modal closes)
    
  Results → New Search
    hasSearched: true → false
    searchResults: [...] → []
    loading: false → false
    selectedTrain: UnifiedTrain | null → null
```

---

## 🔌 API Call Sequence

```
Timeline of operations:

User Interaction: Click Search Button
        │
        ▼
T0: setLoading(true)
T0: setHasSearched(true)
T0: Begin 300ms timeout
        │
        ├─ Simulating network delay...
        │
T300: Inside setTimeout callback:
        │
        ├─ Call searchTrains(from, to)
        │   └─ Returns UnifiedTrain[]
        │
        ├─ setSearchResults(results)
        │   └─ Updates state with train array
        │
        ├─ setSearchParams({ from, to })
        │   └─ Updates display information
        │
        └─ setLoading(false)
            └─ Hides spinner, shows results

User Clicks Train Card:
        │
        ├─ setSelectedTrain(train)
        │   └─ Opens modal, passes train data
        │
        ├─ Modal calls getTrainSchedule(trainNumber)
        │   └─ Returns TrainStop[]
        │
        └─ TrainSchedule renders timeline

User Closes Modal:
        │
        └─ setSelectedTrain(null)
            └─ Closes modal, clears selection
```

---

## 📱 Responsive Breakpoints

```
Mobile (375px - 639px)
├── Search Form
│   ├── All inputs stack vertically
│   ├── Inputs: full width
│   ├── Swap button: centered below From
│   └── Button: full width
│
├── Results Grid
│   └── 1 column (single cards)
│
├── Modal
│   ├── Full viewport height
│   ├── Slides from bottom
│   ├── Padding reduced
│   └── Sheet-like appearance
│
└── Timeline
    └── Compact layout, small fonts

Tablet (640px - 1023px)
├── Search Form
│   ├── 2x2 grid layout
│   ├── Inputs: Flex distribution
│   └── Button: Half width or more
│
├── Results Grid
│   └── 2 columns
│
├── Modal
│   ├── Centered on screen
│   ├── Max-width: 620px
│   ├── Standard padding
│   └── Dialog-like appearance
│
└── Timeline
    └── Standard layout

Desktop (1024px+)
├── Search Form
│   ├── 4 columns (From | Swap | To | Date)
│   ├── Full-width grid
│   └── Button: Auto width
│
├── Results Grid
│   └── 3 columns
│
├── Modal
│   ├── Centered on screen
│   ├── Max-width: 896px (max-w-2xl)
│   ├── Ample padding
│   └── Full-featured dialog
│
└── Timeline
    └── Full detailed layout
```

---

## 🎨 Color & Theme System

```
Dark Mode (Default)
├── Background: rgb(8 13 24)     #08 0D 18
├── Foreground: rgb(232 240 255) #E8 F0 FF
├── Card: rgb(14 24 41)          #0E 18 29
├── Primary: rgb(88 126 255)     #58 7E FF
├── Primary-soft: rgb(146 178 255) #92 B2 FF
├── Accent: rgb(64 226 205)      #40 E2 CD
├── Border: rgb(39 54 82)        #27 36 52
│
├── Glass Effect
│   ├── Background: Linear gradient (opacity 0.84 → 0.72)
│   ├── Border: 1px solid rgba(border, 0.8)
│   └── Blur: 18px backdrop-filter
│
├── Train Type Badges
│   ├── Superfast: Green (emerald)
│   ├── DEMU: Amber (orange)
│   ├── Passenger: Red (rose)
│   └── Default: Blue (primary)
│
├── Timeline Colors
│   ├── Source station: Emerald (green dot, pulsing)
│   ├── Destination: Rose (red dot, pulsing)
│   ├── Regular stops: Primary blue
│   └── Timeline line: Gradient primary → faded
│
└── Interactive States
    ├── Hover: +10% opacity, scale 105%
    ├── Focus: Ring color primary/50
    ├── Disabled: 50% opacity
    └── Active: Darker shade of parent color
```

---

## ⚡ Performance Considerations

```
Rendering
├── TrainCard: O(n) - renders for each train
├── TrainStop: O(m) - renders for each stop in schedule
└── CoachLayoutGrid: O(rows × cols) - grid items

State Updates
├── searchResults: Triggers re-render of grid
├── selectedTrain: Triggers modal show/hide
├── loading: Minimal re-renders
└── hasSearched: Controls section visibility

Optimizations Included
├── No unnecessary API calls
├── Schedule fetched on-demand (modal open)
├── State properly scoped
├── No prop drilling beyond 2 levels
└── Components memoize-ready (no complex props)

Potential Improvements
├── useMemo for filtered search results
├── useCallback for event handlers
├── Virtual scrolling for large schedules (100+ stops)
└── Lazy load modal content
```

---

## 🎓 Key Insights

### Why This Architecture?

1. **Separation of Concerns**
   - Each component handles one aspect
   - Easier to test and maintain
   - Reusable across the app

2. **Single Source of Truth**
   - State in TrainSearchPage
   - Passed down as props
   - Updates flow back through callbacks

3. **Progressive Enhancement**
   - Initial empty state
   - Loading feedback
   - Results display
   - Detailed modal

4. **Responsive by Default**
   - Grid-based layout
   - Breakpoint-aware components
   - Mobile-first styling

5. **Accessible Design**
   - Semantic HTML
   - Keyboard support (Esc to close)
   - Screen reader friendly
   - Color-coded visual hierarchy

---

**Visual Guide Version**: 1.0
**Last Updated**: April 2026
**Status**: Production Ready ✅
