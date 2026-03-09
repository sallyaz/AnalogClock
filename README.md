# Analog Clock App

A React Native mobile app that displays a custom analog clock with timezone support and offline-first caching.

## Features

- **Custom Analog Clock**: Built from scratch without third-party clock libraries
- **Real-time Updates**: Clock hands update every second with smooth rotation
- **Responsive Design**: Adapts to different screen sizes and orientations (portrait/landscape)
- **Timezone Selector**: Searchable dropdown with 418+ timezones from TimeZoneDB API
- **Offline Support**: Full functionality without internet after initial data fetch
- **Persistent State**: Remembers last selected timezone across app restarts

---

## Architecture Decisions

### 1. **State Management: Redux Toolkit (RTK)**

**Why RTK?**
- **RTK Query** provides built-in caching, request deduplication, and optimistic updates
- Reduces boilerplate compared to vanilla Redux
- TypeScript support out of the box
- Industry standard for complex state management

**Structure:**
```
src/store/
├── api/
│   └── timezoneApi.ts        # RTK Query API slice for TimeZoneDB
├── slices/
│   └── timezoneSlice.ts      # Selected timezone state
└── index.ts                   # Store configuration
```

### 2. **Offline-First Architecture**

**Flow:**
1. App launch → Load from SQLite cache immediately
2. If cache exists → Display data, then refresh in background if online
3. If cache empty → Fetch from API, save to cache
4. If offline + no cache → Show error message

**Benefits:**
- Instant app startup (no loading spinner for returning users)
- Works completely offline after first launch
- Background refresh keeps data up-to-date without blocking UI

**Implementation:**
- `react-native-sqlite-storage` for local persistence
- `@react-native-community/netinfo` for network status detection
- Custom hook `useTimezonesWithOffline` orchestrates the data flow

### 3. **Component Architecture**

**Separation of Concerns:**
```
src/
├── components/          # Reusable UI components
│   ├── AnalogClock.tsx
│   ├── TimeZoneSelector.tsx
│   ├── SelectorContent.tsx
│   ├── StatusBadges.tsx
│   └── ClockHand.tsx (subcomponent)
├── screens/            # Screen-level components
│   └── MainScreen.tsx
├── hooks/              # Custom React hooks
│   └── useTimezonesWithOffline.ts
├── helpers/            # Pure utility functions
│   ├── clockUtils.ts
│   ├── timezoneUtils.ts
│   ├── timezoneHelpers.ts
│   └── timezoneDataHelpers.ts
├── services/           # External integrations
│   └── database.ts
└── types/              # TypeScript interfaces
    ├── ITimeZone.ts
    ├── IAnalogClockProps.ts
    └── ...
```

### 4. **Custom Clock Implementation**

**Why not use a library?**
- Assignment requirement (no prebuilt clock components)
- Full control over styling and animations
- Better performance (no external dependencies)

**Technical approach:**
- Clock hands as React Native `View` components
- Rotation using CSS `transform: rotate(Xdeg)`
- Mathematical calculation: `(time / maxTime) * 360°`
- `useWindowDimensions` for responsive sizing
- `setInterval` for real-time updates every 1000ms

### 5. **List Optimization: FlashList**

Replaced `FlatList` with `@shopify/flash-list` for better performance:
- 10x faster rendering for 418+ timezones
- Reduced memory footprint
- Smooth scrolling on low-end devices

---

## Offline Caching Approach

### Database Schema

**SQLite Tables:**

1. **`timezones` table:**
   ```sql
   CREATE TABLE timezones (
     zoneName TEXT PRIMARY KEY,
     gmtOffset INTEGER NOT NULL,
     countryCode TEXT,
     countryName TEXT,
     createdAt INTEGER
   );
   ```

2. **`settings` table:**
   ```sql
   CREATE TABLE settings (
     key TEXT PRIMARY KEY,
     value TEXT
   );
   ```
   Used to store `lastTimezone` for persistence.

### Caching Strategy

#### **On App Launch:**
```typescript
1. Check network status (NetInfo)
2. Load timezones from SQLite
3. If data exists:
   - Display cached data immediately
   - Restore last selected timezone
   - If online: Fetch fresh data in background → update cache
4. If no data:
   - If offline: Show "No internet connection" error
   - If online: Fetch from API → save to cache
```

#### **Fallback Chain:**
```
SQLite → TimeZoneDB API → Intl.supportedValuesOf → Error
```

This ensures the app always has data, even without an API key or network.

### Data Freshness

- **Cache invalidation**: None (timezone data rarely changes)
- **Background refresh**: Only when cached data exists and device is online
- **User-initiated refresh**: Available via refresh button (when StatusBadges enabled)

---

## Assumptions & Trade-offs

### Assumptions

1. **Timezone data is static**: GMTOffset values rarely change (DST handled by JavaScript `Date` API)
2. **API availability**: TimeZoneDB API assumed to be reliable; fallback ensures app never breaks
3. **Device timezone accuracy**: Assumes device timezone is correctly configured
4. **Network detection**: `@react-native-community/netinfo` accurately detects connectivity

### Trade-offs

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| **SQLite for caching** | Native performance, no file size limits | Requires native module linking |
| **RTK Query** | Powerful caching, dev tools | Larger bundle size vs manual fetch |
| **Custom clock** | Full control, no dependencies | More code to maintain |
| **FlashList** | 10x faster rendering | Additional dependency |
| **Offline-first** | Instant app startup | Slightly stale data possible |
| **No time picker** | Simpler UX | Can't set arbitrary times |

### Security Considerations

1. **API Key**: Should be stored in `.env` (not committed to repo)
2. **SQLite**: Data stored in app sandbox (not accessible to other apps)
3. **No sensitive data**: Only timezone info cached (no PII)

### Performance Optimizations

1. **Memoization**: `useCallback` for functions, React.memo for components
2. **Efficient queries**: SQLite indexed on `zoneName` (PRIMARY KEY)
3. **Lazy loading**: RTK Query only fetches when needed
4. **FlashList**: Virtualized rendering for long lists
5. **Background refresh**: Non-blocking (doesn't show loading state)

---

## API Integration

### TimeZoneDB API

**Endpoint:** `https://api.timezonedb.com/v2.1/list-time-zone`

**Registration:** [https://timezonedb.com/register](https://timezonedb.com/register)

**Rate Limits:** 1 request/second (free tier)

**Response Format:**
```json
{
  "status": "OK",
  "zones": [
    {
      "zoneName": "America/New_York",
      "gmtOffset": -18000,
      "countryCode": "US",
      "countryName": "United States"
    }
  ]
}
```

### Fallback Strategy

If API fails or no key provided:
```typescript
Intl.supportedValuesOf('timeZone')
// Returns 400+ timezone IDs (no country info)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS) / Android Studio (for Android)

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install CocoaPods
cd ios && bundle exec pod install && cd ..

# Set API key (optional)
export TIMEZONE_API_KEY=your_key_here
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS IPA

```bash
# Via Xcode
1. Open ios/AnalogClockApp.xcworkspace
2. Product → Archive
3. Distribute App → Ad Hoc/App Store

# Via CLI
cd ios
xcodebuild -workspace AnalogClockApp.xcworkspace \
  -scheme AnalogClockApp \
  -configuration Release \
  -archivePath build/AnalogClockApp.xcarchive \
  archive
```

---

## Project Structure

```
AnalogClockApp/
├── App.tsx                          # Root component (Provider wrapper)
├── src/
│   ├── components/
│   │   ├── AnalogClock.tsx         # Custom analog clock component
│   │   ├── TimeZoneSelector.tsx    # Searchable timezone modal
│   │   ├── SelectorContent.tsx     # Selector loading/error states
│   │   └── StatusBadges.tsx        # Online/offline indicator
│   ├── hooks/
│   │   └── useTimezonesWithOffline.ts  # Offline-first data hook
│   ├── screens/
│   │   └── MainScreen.tsx          # Main app screen (clock + selector)
│   ├── services/
│   │   └── database.ts             # SQLite operations
│   ├── store/
│   │   ├── api/
│   │   │   └── timezoneApi.ts     # RTK Query API slice
│   │   ├── slices/
│   │   │   └── timezoneSlice.ts   # Selected timezone state
│   │   └── index.ts                # Redux store config
│   ├── helpers/
│   │   ├── clockUtils.ts           # Clock math & sizing
│   │   ├── timezoneUtils.ts        # Timezone selection logic
│   │   ├── timezoneHelpers.ts      # Display name formatting
│   │   └── timezoneDataHelpers.ts  # Data loading helpers
│   ├── types/
│   │   ├── ITimeZone.ts            # Timezone data interface
│   │   ├── IUseTimezonesResult.ts  # Hook return type
│   │   └── ...                      # Component prop types
│   └── config.ts                    # API key configuration
├── android/                         # Android native code
├── ios/                             # iOS native code
└── README.md
```

---

## Testing

### Manual Testing Checklist

- [ ] Clock displays correct time in selected timezone
- [ ] Clock hands move smoothly every second
- [ ] Timezone selector shows 418+ zones
- [ ] Search filters zones correctly
- [ ] Selected timezone persists after app restart
- [ ] Works offline after initial data fetch
- [ ] Landscape orientation displays correctly
- [ ] App handles no internet connection gracefully

### Network Simulation

**iOS Simulator:**
1. Open Settings app on simulator
2. Enable Airplane Mode

**Android Emulator:**
1. Settings → Network & Internet
2. Toggle Airplane Mode

---

## Known Limitations

1. **No DST indicator**: App doesn't show if timezone observes daylight saving time
2. **No manual time entry**: Can only select timezones, not arbitrary times
3. **Single timezone display**: Clock shows one timezone at a time (not multiple)
4. **No alarms/timers**: Focus is on display, not time-based actions
5. **Background refresh only**: No pull-to-refresh (StatusBadges provides refresh button)

---

## Future Enhancements

- [ ] Multiple clocks (world clock grid view)
- [ ] Timezone comparison (time difference calculator)
- [ ] Custom clock faces (themes/skins)
- [ ] Widget support (iOS 14+, Android)
- [ ] Dark mode toggle
- [ ] Accessibility improvements (VoiceOver/TalkBack)
- [ ] Unit tests (Jest) and E2E tests (Detox)

---

## Dependencies

### Core
- `react-native` - Mobile framework
- `@reduxjs/toolkit` - State management
- `react-redux` - React bindings for Redux

### Data & Network
- `react-native-sqlite-storage` - Local database
- `@react-native-community/netinfo` - Network status detection
- `react-native-config` - Environment variables (optional)

### UI
- `@shopify/flash-list` - Optimized list rendering
- `react-native-safe-area-context` - Safe area handling

---

## License

MIT

---

## Author

Created as part of a React Native assignment demonstrating:
- Custom UI components (analog clock)
- Offline-first architecture (SQLite caching)
- State management (Redux Toolkit)
- API integration (TimeZoneDB)
- Responsive design (orientation support)
