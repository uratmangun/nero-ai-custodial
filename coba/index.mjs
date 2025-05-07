import { Scraper, SearchMode } from 'agent-twitter-client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const scraper = new Scraper();


async function main() {
  const result = await scraper.searchTweets('@nft_marketplace', {
    searchMode: SearchMode.Latest,
    limit: 10,
  });

  console.log(result);
}

main().catch(console.error);