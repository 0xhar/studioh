# Deploy to Netlify Guide

## Prerequisites
- A GitHub account with this repository
- A Netlify account (free at netlify.com)

## Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended)

1. **Sign in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with GitHub

2. **Import your project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your repository: `0xhar/studioh`
   - Choose the `claude` branch

3. **Configure build settings**
   - Base directory: `garment-builder`
   - Build command: `npm run build`
   - Publish directory: `garment-builder/dist`
   - Functions directory: `garment-builder/netlify/functions`

4. **Add environment variables**
   - Click "Show advanced" → "New variable"
   - Add your API keys:
     ```
     VITE_OPENAI_API_KEY=your_openai_key
     VITE_REPLICATE_API_TOKEN=your_replicate_token
     VITE_STABILITY_API_KEY=your_stability_key
     VITE_AI_PROVIDER=openai
     ```

5. **Deploy site**
   - Click "Deploy site"
   - Wait for deployment to complete (2-3 minutes)

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Navigate to project**
   ```bash
   cd /home/harini/Documents/pocs/h_lab
   ```

4. **Initialize Netlify**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (optional)

5. **Set environment variables**
   ```bash
   netlify env:set VITE_OPENAI_API_KEY "your_openai_key"
   netlify env:set VITE_REPLICATE_API_TOKEN "your_replicate_token"
   netlify env:set VITE_STABILITY_API_KEY "your_stability_key"
   netlify env:set VITE_AI_PROVIDER "openai"
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Important Notes

### API Keys
- Never commit API keys to the repository
- Always use Netlify environment variables for sensitive data
- The `.env` file is for local development only

### Serverless Functions
- The versions API runs as a Netlify serverless function
- Located at: `garment-builder/netlify/functions/versions.js`
- Accessible at: `/.netlify/functions/versions`

### Data Persistence
- **Important**: The current implementation uses in-memory storage
- Data will be lost on each deployment
- For production, consider using:
  - Supabase (recommended - free tier available)
  - MongoDB Atlas (free tier available)
  - FaunaDB (Netlify's preferred database)
  - Firebase Firestore

### Free Tier Limits
- 100GB bandwidth per month
- 300 build minutes per month
- 125,000 serverless function requests per month
- These limits are sufficient for moderate usage

## Updating the Deployment

To update your deployed site:

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin claude
   ```
3. **Netlify auto-deploys** (if connected to GitHub)
   - Or manually deploy: `netlify deploy --prod`

## Custom Domain

To add a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Monitoring

- View logs: Site dashboard → Functions tab
- Check build logs: Deploys tab
- Monitor usage: Team dashboard → Usage tab

## Troubleshooting

### Build fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### API not working
- Check function logs in Netlify dashboard
- Verify environment variables are set
- Check browser console for CORS errors

### Images not loading
- Ensure API keys are correctly set in environment variables
- Check if API providers have sufficient credits
- Verify the AI provider setting

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com
- GitHub Issues: https://github.com/0xhar/studioh/issues