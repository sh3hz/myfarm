# MyFarm

> A modern farm management application built with Electron, React, and TypeScript

MyFarm is a desktop application designed to help farmers and agricultural professionals manage their farm operations efficiently. Built with modern web technologies and packaged as a cross-platform desktop application.

## Features

- 🌱 Farm management and tracking
- 📊 Data visualization with charts and analytics
- 📅 Calendar integration for scheduling
- 📋 Table-based data management
- 🌙 Dark/Light theme support
- 💾 Local SQLite database storage
- 📤 Excel export functionality
- 🔄 Auto-updates

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Desktop**: Electron 37
- **Database**: SQLite (better-sqlite3)
- **UI Components**: Radix UI, Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite, Electron Vite
- **Code Quality**: ESLint, Prettier

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MyFarm
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

This will launch the Electron application in development mode with hot reload enabled.

## Building

### Build for all platforms
```bash
npm run build
```

### Platform-specific builds
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Development build (unpacked)
```bash
npm run build:unpack
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Preview the built application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
MyFarm/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Preload scripts
│   ├── renderer/      # React frontend
│   └── shared/        # Shared utilities
├── resources/         # Application resources
├── build/            # Build output
└── dist/             # Distribution files
```

## Development Setup

### Recommended IDE
- [Visual Studio Code](https://code.visualstudio.com/)
- Extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [TypeScript](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**shehaz.me**
- Website: [https://shehaz.me/myfarm-website](https://shehaz.me/myfarm-website)

## Version

Current version: 1.3.0
