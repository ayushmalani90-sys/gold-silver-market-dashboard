# Gold & Silver Market Dashboard — Code Audit

## Production defects found

1. **Multiple frontend state owners**: `index.html` owns the primary dashboard state while `enhancements.js` maintains separate `H`, `P`, and `M` stores. This allows refreshes to disagree.
2. **Live price API lacked guaranteed change fields**: `/api/prices` could legitimately return `change24h: null`, leaving price-intelligence and relative-strength cards blank.
3. **Macro endpoint was CDN-cached for 15 minutes**: this could produce stale macro data and inconsistent scores after refresh.
4. **Calendar used UTC day arithmetic**: displayed day counts could be off in India. It was also cached for 15 minutes.
5. **Historical data provider had an exhausted API-key dependency**: replaced with free daily OHLC source in `/api/history`.
6. **Technical framework depends on full OHLC history**: RSI/EMA/ATR/trading levels require the history endpoint to return consistent `open/high/low/close` values.
7. **Frontend enhancement layers are loaded separately**: each layer can fetch independently, increasing race-condition risk.

## Required architectural direction

- One canonical dashboard state in `index.html`.
- One live price refresh loop.
- One macro refresh loop.
- Enhancement modules may render/read state but must not overwrite canonical score/price state.
- All market-data API routes must return explicit `success`, `updatedAt`, and `Cache-Control: no-store` semantics.
- Technical indicators must be computed from normalized OHLC history only.

## Current source stack

- Live metals: Gold API.
- Historical OHLC: Stooq daily history.
- Macro: BLS + FRED.
- Calendar: maintained release snapshot with IST-aware calculations.

## Validation checklist

- Live Gold/Silver present.
- Gold/Silver 24h change present when upstream supplies it; otherwise show a deliberate unavailable state rather than inventing a value.
- Historical chart has >30 daily candles.
- RSI, EMA20, EMA50, EMA200 and ATR are finite.
- MACD and signal are finite after sufficient history.
- Trading levels are derived from current candles and indicators.
- Macro scores remain stable across refreshes.
- Calendar contains only upcoming events and uses IST day-count logic.
- Vercel deployment is READY and runtime errors are empty.
