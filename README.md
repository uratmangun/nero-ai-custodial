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
   - **URL**: http://uratmangun:3000
6. Click **Save hostname**

The tunnel will route traffic from your domain to the containerized application running on port 3000.

## Build and Start
docker run -d --restart always --env-file .env -v /home/uratmangun/CascadeProjects/nero-ai-custodial/data:/app/data --name nero-ai-custodial --network my-net nero-ai-custodial
