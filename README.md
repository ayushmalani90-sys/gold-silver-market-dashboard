# Gold & Silver Market Dashboard — V3 (No Forecasts)

Vercel-ready responsive dashboard for XAU/USD and XAG/USD.

## Required environment variable
- `COMMODITY_API_KEY` = your CommodityPriceAPI key

## Economic calendar
The calendar is intentionally limited to **official release schedules** for major US events. It shows:
- next release date/time (US Eastern Time)
- event and reference period
- previous release reference
- impact level
- plain-English gold/silver read-through

**Forecast/consensus data is intentionally disabled for now.** No Trading Economics key is required and no forecast subscription is needed.

## V3 additions
- High-impact economic calendar
- Official release dates for CPI, PCE, PPI, NFP/jobs and FOMC events
- Weekend/holiday-safe daily market handling
- Historical price charts and technical framework

## Deploy
Upload this project to the same Vercel project and redeploy. Keep your existing `COMMODITY_API_KEY`. Do not add any Trading Economics API key.
