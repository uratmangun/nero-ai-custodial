# Nero AI Custodial Web

The NERO AI Custodial Wallet is an AI-powered chat interface built on Next.js, enabling users to manage NERO blockchain assets through natural language. Users can connect custodial wallets, query balances, initiate transfers, and inspect token details on NERO chain via tool functions.

# Web demo
https://lcd-purchases-subaru-trembl.trycloudflare.com/

# Video demo
https://youtu.be/1ukIsK-wnzQ

# List of tools
 - `check_address`: Get the connected wallet address.
 - `check_balance`: Get the balance of the connected wallet or an ERC-20 token if an address is provided.
   - `address` (string, optional): user address.
 - `faucet`: Show the faucet URL for obtaining testnet tokens.
 - `mint_test_token`: Mint test tokens to the connected wallet.
   - `amount` (string): amount of test tokens to mint in NERO.
 - `transfer`: Transfer tokens or ETH to a specified address.
   - `address` (string): recipient address.
   - `amount` (string): amount to transfer.
   - `token_name` (string, optional): ERC-20 token name.

# How to run with docker

## Prerequisites
- Copy `.env.example` to `.env` and fill in your API keys.

# Create a Docker network
docker network create my-net
# Run Cloudflare tunnel container
docker run -d --restart always --name cloudflared \
  --network my-net \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_CLOUDFLARE_TUNNEL_TOKEN
# Configure Cloudflare Tunnel in Zero Trust Dashboard

1. Log in to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access > Tunnels**
3. Select your tunnel or create a new one
4. In the **Public Hostname** tab, click **Add a public hostname**
5. Configure the following:
   - **Domain**: your-domain.com
   - **Path**: / (or specific path)
   - **Service**: Select HTTP
   - **URL**: http://nero-ai-custodial:3000
6. Click **Save hostname**

The tunnel will route traffic from your domain to the containerized application running on port 3000.

## Build and Start
docker run -d --restart always --env-file .env -v /home/uratmangun/CascadeProjects/nero-ai-custodial/data:/app/data --name nero-ai-custodial --network my-net nero-ai-custodial
