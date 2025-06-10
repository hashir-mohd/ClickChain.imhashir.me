# 🔗 ClickChain Frontend

<div align="center">

![ClickChain Logo](https://img.shields.io/badge/ClickChain-Distributed%20Tracing-blue?style=for-the-badge)

**Modern Distributed Tracing & Error Analytics Dashboard**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.16.0-0055FF?style=flat&logo=framer&logoColor=white)](https://framer.com/motion/)

[Features](#-features) • [Setup](#-quick-setup) • [Usage](#-usage) • [API](#-api-integration) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### 🔍 **Distributed Tracing**
- **Real-time Trace Visualization** - Interactive timeline view of distributed traces
- **Span Analysis** - Detailed span inspection with performance metrics
- **Error Detection** - Automatic error identification and highlighting
- **Service Discovery** - Dynamic service selection and monitoring

### 📊 **Error Analytics Dashboard**
- **Error Heatmaps** - Visual representation of error patterns
- **Statistical Analysis** - Comprehensive error frequency and distribution metrics
- **Top Errors Tracking** - Identification of most critical issues
- **Interactive Charts** - Pie charts, bar charts, and statistical cards

### 🤖 **AI-Powered Insights**
- **Gemini Integration** - AI-powered trace analysis and optimization
- **Smart Summaries** - Automated trace summary generation
- **Optimization Tips** - AI-suggested performance improvements
- **Interactive Chat** - Contextual AI assistant for trace debugging

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works seamlessly across all devices
- **Smooth Animations** - Framer Motion powered interactions
- **Dark Theme** - Eye-friendly interface for long debugging sessions
- **Landing Page** - Professional product showcase

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** >= 16.0.0
- **npm** or **yarn**
- **Backend API** running on `http://localhost:3000`

### 1️⃣ Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd clickChainFrontend

# Install dependencies
npm install
```

### 2️⃣ Environment Configuration
Create a `.env` file in the root directory:
```env
# Gemini AI API Key for chat functionality
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (optional, defaults to localhost:3000)
VITE_API_URL=http://localhost:3000
```

### 3️⃣ Start Development Server
```bash
npm run dev
```

### 4️⃣ Build for Production
```bash
npm run build
npm run preview
```

---

## 📱 Usage

### Navigation Structure
```
📁 ClickChain Frontend
├── 🏠 Landing Page (/)
│   └── Welcome & Feature Overview
├── 📊 Dashboard (/app)
│   ├── Service Selection
│   ├── Trace List
│   └── Real-time Monitoring
├── 🔍 Trace Details (/app/trace/:traceID)
│   ├── Timeline Visualization
│   ├── Span Analysis
│   ├── AI Summary
│   └── Optimization Tips
└── 📈 Error Analytics (/app/error-analytics)
    ├── Error Heatmaps
    ├── Statistical Overview
    └── Top Errors Dashboard
```

### Key Interactions

#### 🔄 **Service & Trace Management**
1. **Select Service** - Choose from available services in the dropdown
2. **View Traces** - Browse traces with status indicators and performance metrics
3. **Filter & Search** - Find specific traces using various criteria

#### 📊 **Trace Analysis**
1. **Timeline View** - Interactive span timeline with hover details
2. **Span Selection** - Click spans for detailed analysis
3. **Error Identification** - Red indicators for error spans
4. **Performance Metrics** - Duration, timing, and status information

#### 🤖 **AI Features**
1. **Chat Assistant** - Click the chat icon for AI-powered help
2. **Trace Summaries** - Generate AI summaries of complex traces
3. **Optimization Tips** - Get AI-powered performance recommendations

---

---

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 6.24.1
- **Animations**: Framer Motion 12.16.0
- **HTTP Client**: Axios 1.7.2
- **State Management**: React Context API

### Project Structure
```
📁 src/
├── 📄 App.tsx                    # Main app component with routing
├── 📄 index.tsx                  # Application entry point
├── 📁 components/
│   ├── 📁 Chat/                  # AI chat functionality
│   ├── 📁 TraceTimeline/         # Trace visualization
│   ├── 📁 ErrorAnalytics/        # Error dashboard components
│   └── 📁 LandingPage/           # Landing page components
├── 📁 pages/
│   ├── 📄 HomePage.tsx           # Main dashboard
│   ├── 📄 TraceDetailPage.tsx    # Trace analysis page
│   ├── 📄 ErrorAnalyticsPage.tsx # Error analytics dashboard
│   └── 📄 LandingPage.tsx        # Product landing page
├── 📁 context/
│   └── 📄 AppContext.tsx         # Global state management
├── 📁 services/
│   └── 📄 apiService.ts          # API communication layer
├── 📄 types.ts                   # TypeScript type definitions
└── 📄 constants.ts               # Application constants
```
---

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key    # Required for AI features
VITE_API_URL=http://localhost:3000    # Backend API URL
```

### Adding New Features
1. **New Components** - Add to `components/` directory
2. **New Pages** - Add to `pages/` and update routing in [`App.tsx`](App.tsx)
3. **API Endpoints** - Extend [`apiService.ts`](services/apiService.ts)
4. **Types** - Update [`types.ts`](types.ts)

---

## 🚀 Deployment

### Production Build
```bash
npm run build
```

---

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Use **TypeScript** for type safety
- Follow **React Hooks** patterns
- Implement **responsive design**
- Add **Framer Motion** animations for smooth UX

---

## 📋 Roadmap

- [ ] **Real-time Updates** - WebSocket integration for live trace updates
- [ ] **Advanced Filtering** - Complex trace filtering and search capabilities
- [ ] **Custom Dashboards** - User-configurable dashboard layouts
- [ ] **Export Features** - PDF/PNG export for traces and analytics
- [ ] **Multi-tenant Support** - Organization and team management
- [ ] **Mobile App** - React Native companion app

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenTelemetry** - For distributed tracing standards
- **Gemini AI** - For intelligent trace analysis
- **React Community** - For the amazing ecosystem
- **Framer Motion** - For beautiful animations

---

<div align="center">

**Built with ❤️ by the ClickChain Team**

[⭐ Star us on GitHub](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues)

</div>