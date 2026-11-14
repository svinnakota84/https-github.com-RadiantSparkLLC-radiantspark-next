import { refreshLiveDealsFeed } from './deals-fetcher.mjs';

try {
  const result = await refreshLiveDealsFeed({ writePublicJson: true });
  console.log(
    `[SparkDeals Sync] Status=${result.status} | Deals=${result.totalDeals} | Sources=${result.sourcesStatus
      .map((s) => `${s.id}:${s.status}(${s.itemCount})`)
      .join(', ')}`
  );
  if (result.totalDeals === 0) {
    process.exitCode = 1;
  }
} catch (err) {
  console.error('[SparkDeals Sync] Fatal failure:', err);
  process.exitCode = 1;
}
