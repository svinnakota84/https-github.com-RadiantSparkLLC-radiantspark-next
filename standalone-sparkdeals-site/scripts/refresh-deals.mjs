import fs from 'node:fs/promises';
import path from 'node:path';
import { refreshLiveDealsFeed } from './deals-fetcher.mjs';

try {
  const result = await refreshLiveDealsFeed({ writePublicJson: false });
  const rootJsonPath = path.resolve(process.cwd(), 'deals-feed.json');
  await fs.writeFile(rootJsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(
    `[SparkDeals Standalone Sync] Status=${result.status} | Deals=${result.totalDeals} | Wrote deals-feed.json`
  );
  if (result.totalDeals === 0) {
    process.exitCode = 1;
  }
} catch (err) {
  console.error('[SparkDeals Standalone Sync] Fatal failure:', err);
  process.exitCode = 1;
}
