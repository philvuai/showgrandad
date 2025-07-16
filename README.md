# Instagrandad - Family Photo Gallery

A password-protected family photo sharing website built for grandad, so the whole family can upload images and he can see what's happening in the world.

## Features

- **Dual Login System**: Separate login experiences for grandad and family members
- **Grandad-Friendly**: Simple PIN login with large buttons and view-only interface
- **Family Upload**: Full photo upload functionality with descriptions
- **Cross-Device Sync**: Photos sync across all devices and family members
- **Password Protection**: Secure authentication for both user types
- **Gallery View**: Beautiful responsive gallery to browse all family photos
- **Mobile Friendly**: Works great on phones, tablets, and desktops
- **Laravel Filament Style**: Clean, modern admin panel design

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/philvuai/instagrandad.git
   cd instagrandad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or with Netlify Functions support:
   ```bash
   npm run dev:netlify
   ```

4. Open your browser to `http://localhost:3000` (or the port shown in terminal)

### Login Options

**For Grandad (View-Only Experience):**
- Click "I'm Grandad" 
- Enter PIN: `6656`
- Large buttons and simple interface
- "Keep me logged in" option
- **View photos only** - no upload functionality
- Clean, distraction-free interface

**For Family Members (Full Access):**
- Click "I'm Family"
- Username: Any name (e.g., "John", "Mary", etc.)
- Password: `GrandadWebb!123`
- **Upload photos** with descriptions
- **View all photos** shared with grandad

> **Note**: Login credentials can be changed in `src/hooks/useAuth.ts`

## Building for Production

```bash
npm run build
```

The build files will be in the `dist` directory.

## Deployment to Netlify

### Option 1: Connect GitHub Repository

1. Push your code to GitHub
2. Log into [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your GitHub repository
5. Build settings are automatically configured via `netlify.toml`
6. Deploy!

### Option 2: Drag and Drop

1. Run `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area

### Persistent Storage

The app automatically uses **Netlify Blobs** for persistent storage when deployed to Netlify. This provides:

- **Cross-device synchronization**: Photos uploaded on any device appear on all devices
- **Persistence across deployments**: Photos won't be lost when you redeploy the site
- **No setup required**: Works automatically when deployed to Netlify
- **Fallback support**: Uses in-memory storage during local development

## Cross-Device Photo Sharing

**Netlify Blobs Storage**: Photos are stored using Netlify's built-in Blobs service. This means:
- Photos uploaded on any device will appear on all devices
- True cross-device synchronization for the entire family
- Secure server-side storage with automatic fallback
- No external database setup required

**For Family Use**: 
- Family members can upload photos from any device
- Grandad will see all photos from all family members
- Photos are automatically synced across phones, tablets, and computers

## Security Note

This application uses Netlify Blobs for persistent storage and includes basic authentication. For production use with sensitive family photos, consider:

1. Using Netlify Identity for secure authentication
2. Adding image optimization and compression
3. Using environment variables for passwords
4. Implementing user roles and permissions
5. Adding backup and recovery features

## Customization

### Changing Login Credentials

Edit `src/hooks/useAuth.ts` and update the credentials:

```typescript
// For family members
const FAMILY_PASSWORD = 'your-new-password';

// For grandad (simple 4-6 digit PIN)
const GRANDAD_PIN = '6656';
```

### Styling

The app uses Tailwind CSS with a custom color scheme inspired by Laravel Filament. You can customize colors in `tailwind.config.js`.

### Adding Features

- Photos are stored using Netlify Blobs for persistence
- Authentication is client-side only (consider Netlify Identity for enhanced security)
- No image optimization (consider adding compression for better performance)
- Delete functionality is available but not exposed in the UI

## Troubleshooting

### Photos Disappearing After Deployment

If photos disappear after redeployment, it's likely related to the storage setup:

1. **Check Netlify Blobs**: Make sure you're deployed to Netlify (not just running locally)
2. **View Function Logs**: In Netlify dashboard, go to Functions → View logs to see storage activity
3. **Test Storage**: Visit `https://your-site.netlify.app/.netlify/functions/test-storage` to verify storage is working
4. **Site Context**: Photos are stored per-site, so different Netlify sites will have separate photo storage

### Local Development

During local development with `npm run dev:netlify`, photos will use fallback storage and won't persist. This is normal - persistent storage only works when deployed to Netlify.

## License

ISC License

## Contributing

This is a family project, but feel free to fork and adapt for your own family!
