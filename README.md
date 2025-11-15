# Sales Dashboard Frontend

A real-time sales performance dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time Leaderboard**: Live rankings with automatic updates every 15 seconds
- **Agent Performance**: Detailed stats including SPH, SPCC, and connect rates
- **Big Movers**: Track agents with significant rank changes
- **District Battle**: Team performance comparisons and analytics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Beautiful interface with smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts (for future enhancements)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS API Gateway URL (for production)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API Gateway URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API Gateway base URL | Required |
| `NEXT_PUBLIC_DEFAULT_SITE` | Default site selection | `phoenix` |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | Auto-refresh interval (ms) | `15000` |
| `NEXT_PUBLIC_MOCK_DATA` | Use mock data for development | `true` |
| `NEXT_PUBLIC_DEBUG_MODE` | Enable debug logging | `false` |

## Project Structure

```
frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Navigation and site selector
│   │   ├── LeaderboardTable.tsx  # Main leaderboard display
│   │   ├── StatsCards.tsx   # Performance metrics cards
│   │   ├── BigMovers.tsx    # Rank change indicators
│   │   └── DistrictBattle.tsx    # Team comparisons
│   ├── hooks/               # Custom React hooks
│   │   └── useApi.ts        # API data fetching
│   ├── types.ts             # TypeScript type definitions
│   ├── globals.css          # Global styles and Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## API Integration

The dashboard connects to AWS API Gateway endpoints:

- `GET /leaderboard` - Current agent rankings
- `GET /me/{agent_id}` - Individual agent stats
- `GET /big-movers` - Agents with significant rank changes
- `GET /districts` - Team/district performance data

### Mock Data

For development, the app includes comprehensive mock data that simulates real API responses. Set `NEXT_PUBLIC_MOCK_DATA=true` to enable mock mode.

## Customization

### Styling

The app uses Tailwind CSS with custom color schemes defined in `tailwind.config.js`:

- **Primary**: Orange theme (`#ed7420`)
- **Secondary**: Gray scale
- **Success**: Green for positive metrics
- **Warning**: Yellow for alerts
- **Danger**: Red for negative metrics

### Refresh Interval

Adjust the auto-refresh interval by modifying `NEXT_PUBLIC_REFRESH_INTERVAL` in your environment variables.

### Site Configuration

Add or modify sites in `app/components/Header.tsx`:

```typescript
const SITES = [
  { code: 'phoenix', name: 'Phoenix', timezone: 'MST' },
  { code: 'denver', name: 'Denver', timezone: 'MST' },
  // Add more sites...
]
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### AWS Amplify

1. Connect your repository to AWS Amplify
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
3. Set environment variables in Amplify console

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance Optimization

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: API responses cached for optimal performance
- **Lazy Loading**: Components loaded on demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@yourcompany.com or create an issue in the repository.