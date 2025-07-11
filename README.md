# Don's Docs - Aiken Library Documentation Browser

An interactive documentation browser for Aiken libraries including stdlib, prelude, and vodka packages. This Next.js application provides a comprehensive search and browse interface for Aiken library functions, types, constants, and modules.

## Features

- 🔍 **Interactive Search**: Search across all Aiken libraries (stdlib, prelude, vodka)
- 📊 **Statistics Dashboard**: View comprehensive stats about library contents
- 📚 **Multi-Library Support**: Browse stdlib, prelude, and vodka packages
- 🎯 **Filtered Views**: Filter by source library and search queries
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance**: Built with Next.js 15 and optimized for speed

## Libraries Covered

- **Aiken Stdlib**: Core standard library functions and types
- **Aiken Prelude**: Essential prelude functions and utilities
- **Aiken Vodka**: Cardano-specific libraries and utilities

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dons-docs/dons-docs.git
cd dons-docs
```

2. Install dependencies:

```bash
npm install
```

3. Build the Aiken SDK:

```bash
npm run build-sdk
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
dons-docs/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── packages/               # Aiken library packages
│   ├── aiken-sdk/         # TypeScript SDK for parsing Aiken
│   ├── aiken-stdlib/      # Aiken standard library
│   ├── aiken-prelude/     # Aiken prelude
│   └── aiken-vodka/       # Aiken vodka library
├── public/                 # Static assets
└── scripts/               # Build and utility scripts
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run build-sdk` - Build the Aiken SDK package
- `npm run demo-aiken` - Run Aiken SDK demo

### Adding New Libraries

1. Add the library to the `packages/` directory
2. Update the copy script in `scripts/copy-aiken-files.js`
3. Rebuild the SDK and restart the development server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: team@dons-docs.com
- 🐛 Issues: [GitHub Issues](https://github.com/dons-docs/dons-docs/issues)
- 📖 Documentation: [Project Wiki](https://github.com/dons-docs/dons-docs/wiki)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Tabler Icons](https://tabler-icons.io/)
- Syntax highlighting with [Prism React Renderer](https://github.com/FormidableLabs/prism-react-renderer)
