# h labs Garment Builder - AI-Powered Fashion Design Tool

A professional garment design application with real AI-generated mockups for creating stunning Indian ethnic wear.

## 🚀 Features

- **Real AI Integration**: Uses OpenAI DALL-E 3, Replicate, and Stability AI for realistic garment mockups
- **Professional Prompts**: Advanced prompt engineering for high-quality fashion photography results
- **Multi-Provider Support**: Automatic fallbacks between different AI services
- **Interactive Design**: Drag-and-drop fabric application with real-time preview
- **Garment Types**: Saree, Lehenga, Kurti, Blouse, Indo-western Dress, Ethnic Shirt
- **Progressive Web App**: Fast, responsive design for desktop and mobile

## 🛠️ Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd garment-builder
npm install
```

### 2. Configure AI APIs
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Primary AI Provider (Choose one)
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
# OR
VITE_REPLICATE_API_TOKEN=r8_your-replicate-token-here
# OR
VITE_STABILITY_API_KEY=sk-your-stability-api-key-here

# Configuration
VITE_AI_PROVIDER=openai
VITE_IMAGE_SIZE=1024x1024
VITE_IMAGE_QUALITY=hd
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎨 AI Provider Setup

### OpenAI DALL-E 3 (Recommended)
- **Best Quality**: Professional fashion photography results
- **Cost**: ~$0.04 per image
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Replicate (Cost-Effective)
- **Good Quality**: Stable Diffusion models
- **Cost**: ~$0.0023 per image
- **Setup**: Get token from [Replicate](https://replicate.com/account/api-tokens)

### Stability AI (High Quality)
- **High Quality**: Stable Diffusion XL
- **Cost**: Variable pricing
- **Setup**: Get key from [Stability AI](https://platform.stability.ai/account/keys)

## 📋 Usage Guide

### 1. Design Your Garment
- Select garment type (Saree, Lehenga, Kurti, etc.)
- Choose neckline, sleeves, hem, and fit options
- Upload or select fabrics from catalog

### 2. Generate AI Mockups
- Click "🎨 Generate New Images"
- AI creates professional front and back view mockups
- View generated prompts for transparency

### 3. Export and Share
- Export high-resolution images
- Share designs with generated links
- Save to design library

## 🔧 Advanced Configuration

### Custom Prompts
Modify `generateEnhancedPrompt()` in `GarmentMockup2D.jsx` for custom styling:
```javascript
const customPrompt = `Your custom prompt with ${fabricText}, ${viewText}`;
```

### API Fallbacks
The system automatically tries fallback providers:
1. Primary provider (configured in .env)
2. Replicate (if token available)
3. Error handling with retry options

### Environment Variables
```env
VITE_AI_PROVIDER=openai          # Primary AI service
VITE_IMAGE_SIZE=1024x1024        # Generated image dimensions
VITE_IMAGE_QUALITY=hd            # OpenAI quality setting
VITE_OPENAI_API_KEY=sk-...       # OpenAI API key
VITE_REPLICATE_API_TOKEN=r8_...  # Replicate token
VITE_STABILITY_API_KEY=sk-...    # Stability AI key
```

## 📁 Project Structure

```
src/
├── components/
│   ├── GarmentMockup2D.jsx      # AI integration logic
│   ├── GarmentBuilder.jsx       # Main design interface
│   ├── DesignToolbar.jsx        # Design controls
│   ├── FabricCatalog.jsx        # Fabric selection
│   └── GarmentCanvas.jsx        # Drag-drop canvas
├── styles/                      # CSS files
└── assets/                      # Static resources
```

## 🎯 AI Integration Details

### Prompt Engineering
The system generates detailed prompts like:
```
"Stunning Indian saree front view on professional fashion mannequin, 
elegant silk fabric with solid pattern, round neckline blouse with 
half sleeves, traditional Indian craftsmanship, professional studio 
lighting, soft shadows, high-end fashion photography, clean white 
background, ultra-realistic, high resolution, detailed fabric texture, 
commercial quality, intricate border work, flowing fabric movement"
```

### API Integration
- **OpenAI**: Direct DALL-E 3 API calls with HD quality
- **Replicate**: Stable Diffusion with polling for completion
- **Stability**: Stable Diffusion XL with base64 image response
- **Error Handling**: Comprehensive error messages and retry logic
- **Progress Tracking**: Real-time generation progress indicators

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Build the project
2. Upload `dist/` folder
3. Set environment variables in deployment platform
4. Configure redirects for SPA routing

## 🔐 Security Notes

- API keys are stored in environment variables
- CORS handling for different AI providers
- Rate limiting considerations
- Image URL validation and error handling

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check `.env` file exists and has correct variable names
   - Ensure API keys are valid and have sufficient credits

2. **"Failed to generate images"**
   - Verify internet connection
   - Check API provider status
   - Review console logs for specific errors

3. **Build/Development Issues**
   - Clear `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Ensure Node.js version compatibility

### Debug Mode
Enable debug logging in browser console to see:
- Generated prompts
- API calls and responses
- Error details and stack traces

## 📈 Performance Optimization

- Images are cached by browser
- Progressive loading with placeholders
- Lazy loading for fabric catalog
- Optimized bundle splitting available

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

---

## 🎨 Sample Generated Prompts

**Kurti Front View:**
```
Modern Indian kurti front view on elegant mannequin, premium silk fabric with elegant finish, round neckline with half sleeves, straight hemline, regular fit silhouette, contemporary ethnic wear design, professional studio lighting, soft shadows, high-end fashion photography, clean white studio background, ultra-realistic, high resolution, detailed fabric texture, commercial quality, subtle embroidery details, flowing fabric drape
```

**Lehenga Back View:**
```
Magnificent Indian lehenga back view on fashion mannequin, premium silk fabric with elegant finish, round neckline choli with half sleeves, voluminous A-line skirt with straight hem, intricate back detailing, zipper closure, royal traditional styling, professional studio lighting, soft shadows, high-end fashion photography, pristine white background, ultra-realistic, high resolution, detailed fabric texture, commercial quality, heavy embellishments, rich fabric texture
```

Ready to create stunning AI-generated fashion designs! 🎨✨
