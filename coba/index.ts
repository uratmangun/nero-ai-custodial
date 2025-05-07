import { Scraper, SearchMode } from 'agent-twitter-client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Loki from 'lokijs';
import fs from 'fs';
import { generateToolCallResponse } from './lib/tool_call';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const scraper = new Scraper();

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize LokiJS
const db = new Loki(path.join(dataDir, 'tweets.db'), {
  adapter: new Loki.LokiFsAdapter(),
  autoload: true,
  autosave: true,
  autosaveInterval: 4000 // autosave every 4 seconds
});

// Get or create the tweets collection
let tweetsCollection = db.getCollection('tweets');
if (tweetsCollection === null) {
  tweetsCollection = db.addCollection('tweets');
}

async function main() {
  try {
    await scraper.login(process.env.TWITTER_USERNAME as string, process.env.TWITTER_PASSWORD as string);

    // await scraper.sendTweet('@uratmangun Hello world!');
    // Function to check for new tweets
    async function checkForNewTweets() {
      try {
        console.log(`Checking for new tweets at ${new Date().toISOString()}`);
        const tweets = await scraper.searchTweets('@bankrextension0', 10, SearchMode.Latest);
        // Using for...of loop with async generator
        for await (const tweet of tweets) {
          try {
            // console.log(tweet);
            // Check if tweet already exists
            const existingTweet = tweetsCollection.findOne({ 'id': tweet.id });
            
            if (!existingTweet) {
              tweetsCollection.insert(tweet); // Save tweet to LokiJS
              console.log(tweet.permanentUrl)
              const randomNumber = Math.floor(Math.random() * 1000);

              const tool_call_response = await generateToolCallResponse([{
                role: 'user',
                content: tweet.text
              }]);
              console.log(tool_call_response);
              // Trim response content to Twitter's 280 character limit
              const trimmedContent = JSON.stringify(tool_call_response).substring(0, 280);
              if(tool_call_response.tool_calls && tool_call_response.tool_calls.length > 0){
                await scraper.sendTweet(trimmedContent, tweet.id);
              }else{
                await scraper.sendTweet(`I can only help with blockchain interactions on nero networks. Here are the available tools:
- check_address: Get the connected wallet address.
- check_balance: Get the balance of the connected wallet optional address (string).
- faucet: Show the faucet URL for obtaining testnet tokens.
- mint_test_token: Mint test tokens to the connected wallet. Requires parameter: amount (number).
- transfer: Transfer tokens or ETH to a specified address. Requires parameters: address (string), amount (string), and optional token_name (string).

Please let me know which of these tools you'd like to use.`, tweet.id);
                
              }
              // Sleep for 10 seconds before continuing
              console.log('Sleeping for 10 seconds...');
              await new Promise(resolve => setTimeout(resolve, 10000));
              console.log('Resumed after 10 seconds');
              console.log(`Tweet ${tweet.id} saved.`);
            } else {
              console.log(`Tweet ${tweet.id} already exists. Skipping.`);
            }
          } catch (error) {
            console.error(`Error processing tweet:`, error);
          }
        }
      } catch (error) {
        console.error('Error in checkForNewTweets:', error);
      }
    }

    // Initial check
    await checkForNewTweets();
    
    // Set up interval to check every minute
    setInterval(async () => {
      try {
        await checkForNewTweets();
      } catch (error) {
        console.error('Error checking for tweets:', error);
      }
    }, 60000); // 60000 ms = 1 minute
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Wait for the database to load before executing main
db.on('loaded', () => {
  console.log('Database loaded successfully.');
  // Re-fetch the collection after DB is loaded, as it might have been re-initialized
  tweetsCollection = db.getCollection('tweets');
  if (tweetsCollection === null) {
    console.log('Tweets collection not found after load, creating it.');
    tweetsCollection = db.addCollection('tweets');
  } else {
    console.log('Tweets collection found after load.');
  }
  main().catch(console.error);
});

