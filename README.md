# ShowGrandad - Family Photo Gallery

A password-protected family photo sharing website built for grandad, so the whole family can upload images and he can see what's happening in the world.

## Features

- **Password Protection**: Simple family password authentication
- **Photo Upload**: Upload photos from phone or desktop with drag-and-drop support
- **Photo Descriptions**: Add descriptions to photos to tell grandad what's happening
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
   git clone https://github.com/philvuai/showgrandad.git
   cd showgrandad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Default Login

- **Username**: Any name (e.g., "John", "Mary", etc.)
- **Password**: `GrandadWebb!123`

> **Note**: The password can be changed in `src/hooks/useAuth.ts`

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

## Security Note

This application currently uses localStorage for data persistence and a simple password check. For production use with sensitive family photos, consider:

1. Using Netlify Functions for secure authentication
2. Implementing a proper database (like Netlify's Identity + FaunaDB)
3. Adding image optimization and secure cloud storage
4. Using environment variables for passwords

## Customization

### Changing the Password

Edit `src/hooks/useAuth.ts` and update the `FAMILY_PASSWORD` constant:

```typescript
const FAMILY_PASSWORD = 'your-new-password';
```

### Styling

The app uses Tailwind CSS with a custom color scheme inspired by Laravel Filament. You can customize colors in `tailwind.config.js`.

### Adding Features

- Photos are stored in localStorage (in a real app, use a database)
- Authentication is client-side only (in a real app, use server-side auth)
- No image optimization (in a real app, optimize images)

## License

ISC License

## Contributing

This is a family project, but feel free to fork and adapt for your own family!
