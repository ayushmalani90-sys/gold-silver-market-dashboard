export default async function handler(req, res) {
  try {
    const key = process.env.COMMODITY_API_KEY;

    if (!key) {
      return res.status(500).json({
        success: false,
        error: 'COMMODITY_API_KEY is not configured on the server.'
      });
    }

    // Historical data should end on the previous calendar day.
    // This avoids requesting today's/weekend's incomplete market data.
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);

    // Fetch roughly one year of historical data.
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 365);

    const fmt = d => d.toISOString().slice(0, 10);

    const url = new URL(
      'https://api.commoditypriceapi.com/v2/rates/time-series'
    );

    url.searchParams.set('symbols', 'XAU,XAG');
    url.searchParams.set('startDate', fmt(start));
    url.searchParams.set('endDate', fmt(end));

    const r = await fetch(url, {
      headers: {
        'x-api-key': key
      },
      cache: 'no-store'
    });

    const data = await r.json();

    if (!r.ok || !data.success) {
      return res.status(r.status || 502).json({
        success: false,
        error: data?.message || data?.error || 'Historical feed error',
        details: data
      });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=21600, stale-while-revalidate=86400'
    );

   return res.status(200).json(data);
    

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message
    });
  }
}
