# BookBridge Admin Panel

A modern admin dashboard for managing the BookBridge platform.

## Features

- **Dashboard**: Overview of platform statistics
- **User Management**: View, block/unblock, and delete users
- **Book Management**: View and manage all listed books
- **Order Management**: Track all orders and payments
- **Real-time Updates**: Live data with automatic refresh
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on port 8080

### Installation

1. Navigate to the admin directory:
```bash
cd Frontend/Second-Hand-Buy-Sell-platform-For-Books/src/Component/admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Default Login Credentials

- **Email**: admin@bookbridge.com
- **Password**: password

## API Integration

The admin panel connects to the existing BookBridge backend APIs:

- **Authentication**: `/api/admin/login`
- **Dashboard**: `/api/admin/dashboard`
- **Users**: `/api/admin/users`
- **Books**: `/api/admin/books`
- **Orders**: `/api/admin/orders`
- **Payments**: `/api/admin/payments`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 18, Vite
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── Layout/       # Layout components
├── pages/            # Page components
├── services/         # API services
├── hooks/            # Custom hooks
└── lib/              # Utility functions
```

## Development

The admin panel is built with modern React patterns:

- **Functional Components** with hooks
- **React Query** for server state management
- **Protected Routes** for authentication
- **Error Boundaries** for error handling
- **Loading States** for better UX

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Add proper error handling
4. Test all API integrations
5. Update documentation as needed 
 