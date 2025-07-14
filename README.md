# TakeUp Armazém - Frontend

Modern warehouse management system built with Next.js 14, TypeScript, and Tailwind CSS. This frontend provides a comprehensive interface for managing warehouse operations including address management, street organization, customer management, and take-up processes.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd takeup-armazem-frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
BACKEND_URL=http://takeup-prime-armazem:3000
```

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Project Structure
```
src/
├── app/
│   ├── api/                  # Next.js API Routes (Backend Proxy)
│   │   ├── addresses/        # Address management endpoints
│   │   └── streets/          # Street management endpoints
│   ├── dashboard/            # Dashboard pages
│   │   ├── addresses/        # Address management UI
│   │   ├── clientes/         # Customer management UI
│   │   ├── enderecamento/    # Address assignment UI
│   │   ├── enderecos/        # Address management UI
│   │   ├── expedicao/        # Shipping management UI
│   │   ├── pacotes/          # Package management UI
│   │   ├── rua/              # Street management UI
│   │   └── take-up/          # Take-up management UI
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── login-page.tsx        # Login page component
│   └── page.tsx              # Home page
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── addresses-list.tsx    # Address list component
│   ├── dashboard-layout.tsx  # Dashboard layout
│   └── theme-provider.tsx    # Theme configuration
├── hooks/
│   ├── use-addresses.ts      # Address management hook
│   └── use-toast.ts          # Toast notifications hook
└── lib/
    └── utils.ts              # Utility functions
```

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Icons:** Lucide React
- **State Management:** React Hooks + Context
- **HTTP Client:** Fetch API
- **Form Handling:** React Hook Form (implied)
- **Validation:** Zod (implied)

## 📚 API Routes Documentation

The frontend includes Next.js API routes that act as a proxy to the backend service with fallback functionality.

### 🏠 Addresses API Routes

#### `GET /api/addresses`
Fetch all addresses with fallback support.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "street": {
        "id": 1,
        "name": "Rua das Flores"
      },
      "number": "123",
      "complement": "Apto 101",
      "status": "empty"
    }
  ],
  "fallback": false,
  "message": "Data from backend"
}
```

#### `POST /api/addresses`
Create a new address.

**Request Body:**
```json
{
  "street": {
    "id": 1
  },
  "number": "123",
  "complement": "Apto 101"
}
```

**Response:**
```json
{
  "success": true,
  "fallback": false,
  "message": "Address created in backend",
  "data": {
    "id": "uuid",
    "street": {
      "id": 1,
      "name": "Rua das Flores"
    },
    "number": "123",
    "complement": "Apto 101",
    "status": "empty"
  }
}
```

#### `PUT /api/addresses/[id]`
Update an address.

#### `DELETE /api/addresses/[id]`
Delete an address.

### 🛣️ Streets API Routes

#### `GET /api/streets`
Fetch all streets with fallback data.

**Response:**
```json
{
  "data": [
    {
      "id": "RUA001",
      "description": "Rua A - Setor de Picking"
    }
  ],
  "fallback": false,
  "message": "Data from backend"
}
```

**Fallback Response (when backend is unavailable):**
```json
{
  "data": [
    {
      "id": "RUA001",
      "description": "Rua A - Setor de Picking"
    },
    {
      "id": "RUA002",
      "description": "Rua B - Setor de Estoque Principal"
    }
  ],
  "fallback": true,
  "message": "Using fallback data - backend unavailable"
}
```

#### `POST /api/streets`
Create a new street.

**Request Body:**
```json
{
  "description": "Nova Rua - Setor X"
}
```

#### `PUT /api/streets/[id]`
Update a street.

#### `DELETE /api/streets/[id]`
Delete a street.

## 🎨 UI Components

### Core Components

#### Dashboard Layout (`components/dashboard-layout.tsx`)
Provides the main layout structure for dashboard pages.

```tsx
<DashboardLayout title="Page Title" subtitle="Page description">
  {/* Page content */}
</DashboardLayout>
```

#### Address List (`components/addresses-list.tsx`)
Displays a list of addresses with management capabilities.

### UI Components (`components/ui/`)
Reusable components built with Shadcn/UI:

- **Button** - Various button styles and sizes
- **Card** - Content containers
- **Dialog** - Modal dialogs
- **Input** - Form input fields
- **Table** - Data tables
- **Tabs** - Tab navigation
- **Badge** - Status indicators
- **Alert Dialog** - Confirmation dialogs

## 🔧 Hooks

### `useAddresses`
Custom hook for address management operations.

```tsx
const {
  addresses,
  loading,
  error,
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = useAddresses();
```

### `useToast`
Toast notification system for user feedback.

```tsx
const { toast } = useToast();

toast({
  title: "Success",
  description: "Operation completed successfully",
  variant: "default"
});
```

## 📱 Pages & Features

### Dashboard (`/dashboard`)
Main dashboard with navigation to all modules:
- Address Management
- Street Management
- Customer Management
- Take-up Operations
- Package Management
- Shipping Management

### Address Management (`/dashboard/enderecos`)
- View all addresses
- Create new addresses
- Edit existing addresses
- Delete addresses
- Associate addresses with streets

### Street Management (`/dashboard/rua`)
- View all streets
- Create new streets
- Edit street names
- Delete streets
- Real-time search and filtering

### Features
- **Offline Support:** Fallback data when backend is unavailable
- **Real-time Updates:** Live data synchronization
- **Responsive Design:** Works on desktop and mobile
- **Toast Notifications:** User feedback for all operations
- **Error Handling:** Graceful error handling with fallbacks
- **Search & Filter:** Real-time search capabilities
- **Modal Dialogs:** Confirmation dialogs for destructive actions

## 🔄 Data Flow

### Backend Integration
1. **API Routes** act as proxies to the backend service
2. **Fallback System** provides offline functionality
3. **Error Handling** ensures graceful degradation
4. **Data Transformation** converts between frontend and backend formats

### State Management
- **Local State:** React useState for component state
- **Custom Hooks:** Encapsulate business logic
- **Context API:** Global state management (where needed)

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Code Quality
npm run format       # Format code with Prettier
npm run lint:fix     # Fix linting errors
```

### Development Guidelines

1. **Component Structure:**
   - Use functional components with hooks
   - Keep components small and focused
   - Use TypeScript for type safety

2. **Styling:**
   - Use Tailwind CSS classes
   - Follow mobile-first responsive design
   - Use CSS variables for theming

3. **API Integration:**
   - Use the custom API routes
   - Handle loading and error states
   - Implement fallback mechanisms

4. **State Management:**
   - Use custom hooks for complex state
   - Keep state close to where it's used
   - Use Context for truly global state

## 🎨 Styling & Theming

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended spacing scale
- Custom component variants
- Dark mode support

### Component Theming
Components support light/dark themes through:
- CSS variables
- Tailwind's dark mode utilities
- Theme provider context

## 🔒 Environment Variables

### Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
BACKEND_URL=http://localhost:3000
```

### Production
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_ENV=production
BACKEND_URL=https://your-backend-api.com
```

## 📦 Docker Support

### Dockerfile
Multi-stage build optimized for production:
1. **Dependencies stage:** Install packages
2. **Builder stage:** Build the application
3. **Runner stage:** Run the production server

### Docker Compose
Integration with backend services:
```yaml
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:3000
```

## 🧪 Testing

### Testing Strategy
- **Unit Tests:** Component testing with Jest/React Testing Library
- **Integration Tests:** API route testing
- **E2E Tests:** End-to-end testing with Playwright/Cypress

### Test Commands
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

## 🔧 Error Handling

### Global Error Handling
- **Error Boundaries:** Catch React component errors
- **API Error Handling:** Graceful API error responses
- **Toast Notifications:** User-friendly error messages
- **Fallback UI:** Graceful degradation

### Offline Support
- **Service Worker:** Cache static assets
- **Fallback Data:** Offline functionality
- **Network Detection:** Detect online/offline status

## 📞 Support & Troubleshooting

### Common Issues

1. **Backend Connection Failed:**
   - Check `BACKEND_URL` environment variable
   - Verify backend service is running
   - Application will use fallback data

2. **Build Errors:**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

3. **Styling Issues:**
   - Verify Tailwind configuration
   - Check CSS import order
   - Clear browser cache

### Debugging
```bash
# View application logs
npm run dev -- --debug

# Check build output
npm run build -- --debug

# Analyze bundle size
npm run analyze
```

## 🔄 Version History

- **v1.0.0:** Initial release with core functionality
- **v1.1.0:** Added offline support and fallback system
- **v1.2.0:** Enhanced UI components and responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- **TakeUp Prime Backend:** Backend API service
- **TakeUp Mobile:** Mobile application for warehouse operations
