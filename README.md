# MOEB Dashboard

A modern, high-performance dashboard for managing the MOEB platform. Built with Next.js, TypeScript, and a robust Redux-based state management system.

## 🚀 Technologies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons)
- **Tables**: [TanStack Table](https://tanstack.com/table/v8)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Persistence**: [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Charts**: [Recharts](https://recharts.org/)

## ✨ Key Features

- **🔒 Authentication**: Secure OTP-based authentication, password reset flows, and JWT management.
- **📊 Admin Dashboard**: Centralized hub for managing marketplace items, deals, and service areas.
- **🛠️ Support System**: Integrated support ticket management with email-like communication interface.
- **🚚 Driver Management**: Subscription-based driver onboarding and profile management.
- **📑 Document Management**: Terms and conditions, privacy policy, and other legal document management with rich text editing.
- **🔔 Notifications**: Real-time notification system.
- **🌓 Dark Mode**: Seamless theme switching with `next-themes`.

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages, Layouts, API routes)
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared library configurations
├── providers/      # React context providers
└── redux/          # Redux store, slices, and RTK Query services
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Build & Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 License

Private. All rights reserved.
