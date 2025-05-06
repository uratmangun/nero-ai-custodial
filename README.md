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

# How to run with docker and cloudflare tunnel if you had your own domain

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

# How run with phala cloud
accountId=uratmangun.testnet
contractId=phala.uratmangun.testnet

# NEAR Smart Contract Development and Deployment

This section outlines the basic steps for setting up your environment, compiling, and deploying a NEAR smart contract, assuming you have a contract written in Rust in a sub-directory (e.g., `contract/`).

## Prerequisites and Installation

1.  **Install Rust:** Follow the official instructions at [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install).
2.  **Install NEAR CLI (`near-cli-rs`):** This tool is used for interacting with the NEAR blockchain (creating accounts, deploying contracts, calling methods).
    ```bash
    curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh
    # You might need to add ~/.cargo/bin to your PATH or restart your terminal
    ```
3.  **Install `cargo-near`:** This Cargo subcommand helps build NEAR contracts.
    ```bash
    curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/cargo-near/releases/latest/download/cargo-near-installer.sh | sh
    ```
4.  **Add WASM Target:** NEAR contracts compile to WebAssembly (WASM). Add the necessary Rust target:
    ```bash
    rustup target add wasm32-unknown-unknown
    ```
5.  **Install Clang:** Some Rust dependencies (like `ring`) might require the Clang compiler.
    ```bash
    # Debian/Ubuntu
    sudo apt update && sudo apt install -y clang
    # Fedora
    # sudo dnf install clang
    # MacOS (with Homebrew)
    # brew install llvm
    ```
6.  **Log in to NEAR CLI:** Associate your NEAR account (e.g., `your-account.testnet`) with the CLI. This will open a browser window for authorization.
    ```bash
    near login
    ```

## Compiling the Contract

Navigate to your contract's directory and use `cargo near build`.

```bash
cd path/to/your/contract/
cargo near build
```

This will compile your contract and place the optimized WASM file typically in `target/near/contract.wasm` (or similar name based on your `Cargo.toml`).

## Deploying the Contract

Use the `near deploy` command. You need an existing NEAR account to deploy to.

1.  **Ensure Account Exists:** The target account (e.g., `your-contract-account.testnet`) must exist. If it's a sub-account (like `sub.your-account.testnet`), the parent account (`your-account.testnet`) must create it first:
    ```bash
    # Example: Create sub.main-account.testnet, funded by main-account.testnet
    near create-account sub.main-account.testnet --masterAccount main-account.testnet
    ```
2.  **Ensure Sufficient Funds:** The target account needs enough NEAR to cover the contract's storage cost (this can vary, but often a few NEAR are needed). Send funds if necessary:
    ```bash
    # Example: Send 5 NEAR from main-account.testnet to your-contract-account.testnet
    near send main-account.testnet your-contract-account.testnet 5
    ```
3.  **Deploy:**
    ```bash
    near deploy <your-contract-account.testnet> path/to/your/contract/target/near/contract.wasm
    ```

    Replace `<your-contract-account.testnet>` with the actual account ID and adjust the path to your compiled WASM file if needed. The command will output a link to the transaction explorer upon success.
