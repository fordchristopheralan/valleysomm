<p align="center">
  <img src="https://img.shields.io/badge/🍷-ValleySomm-6B2D3F?style=for-the-badge&labelColor=2D4A3E" alt="ValleySomm" />
</p>

<h1 align="center">
  <strong>Valley</strong>Somm
</h1>

<p align="center">
  <em>"Your AI Sommelier for Yadkin Valley Wine Adventures"</em>
</p>

<p align="center">
  <a href="https://www.ValleySomm.com">
    <img src="https://img.shields.io/badge/Live_Site-ValleySomm.com-C9A962?style=flat-square" alt="Live Site" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <strong>Chat. Plan. Taste.</strong> — Discover 50+ curated wineries and create shareable itineraries in minutes, not hours.
</p>

---

## 🍇 About ValleySomm

ValleySomm is an AI-powered wine trip planning companion for **Yadkin Valley**, North Carolina's premier wine region. Simply chat with our friendly AI to discover hidden gems, plan your perfect route, and create beautiful shareable itineraries.

### The Problem We're Solving

Planning a wine country trip is overwhelming:
- 🤯 **Too many options** — Where do you even start with 50+ wineries?
- 📍 **Logistics nightmare** — Which wineries are close together? What's the best route?
- 🎯 **Preference matching** — How do you find wineries that match YOUR taste?
- 📅 **Reservation chaos** — Booking multiple tastings across different websites
- 🚗 **The DD dilemma** — How do you handle transportation safely?

### Our Solution

An AI sommelier that knows every winery in the valley and speaks your language. Tell it what you like, and it crafts the perfect day for you.

---

## ✨ Features

### 🤖 AI-Powered Planning
Chat naturally with our AI to discover wineries based on your preferences — whether you love bold reds, crisp whites, scenic views, or dog-friendly patios.

### 🗺️ Smart Itineraries
Get optimized routes that make geographical sense. No more zigzagging across the valley.

### 📤 Shareable Trip Cards
Generate beautiful, shareable itinerary cards to send to friends or post on social media.

### 🍷 50+ Curated Wineries
Every winery in Yadkin Valley, with detailed info on wine styles, atmosphere, food options, and insider tips.

### 📊 Research-Backed Design
Built on real user research from wine country travelers to solve actual pain points.

---

## 🎨 Brand Identity

ValleySomm features a carefully crafted brand identity that blends wine country elegance with modern tech sensibility.

| Element | Colors |
|---------|--------|
| **Wine Tones** | `#6B2D3F` Wine Deep · `#8B3A4D` Burgundy · `#C4637A` Rosé |
| **Valley Greens** | `#2D4A3E` Deep · `#5B7C6F` Sage · `#8FA99E` Mist |
| **Accents** | `#C9A962` Gold · `#FAF7F2` Cream · `#2C2C30` Charcoal |

**Typography:** Cormorant Garamond (Display) + DM Sans (Body)

> 📁 Full brand kit available in `/valleysomm-brand-kit.html`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/fordchristopheralan/valleysomm.git
cd valleysomm
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Dashboard Password (protects /dashboard, /review, and /analysis pages)
NEXT_PUBLIC_DASHBOARD_PASSWORD=your-secure-password
```

> ⚠️ **Important:** Choose a strong password for `NEXT_PUBLIC_DASHBOARD_PASSWORD` — this protects your survey data and analysis tools from public access.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts |
| **Deployment** | Vercel |
| **Fonts** | Cormorant Garamond, DM Sans |

---

## 📁 Project Structure

```
valleysomm/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Main landing/chat interface
│   │   ├── dashboard/       # Analytics dashboard
│   │   ├── review/          # Response review tool
│   │   └── analysis/        # Pain point analysis
│   ├── components/          # Reusable React components
│   └── lib/                 # Utilities & Supabase client
├── public/                  # Static assets
├── valleysomm-brand-kit.html # Complete brand identity guide
└── README.md
```

---

## 📊 Research & Analytics

ValleySomm includes built-in tools for understanding wine trip planning pain points:

### Survey System
Collect structured feedback from wine country travelers about their planning experiences.

### Review Dashboard
Tag and categorize open-ended responses with themes like:
- Discovery / Matching
- Logistics / Routing
- Transportation / DD
- Reservations
- Group Coordination
- And more...

### Analysis Tools
- **Pain Point Matrix** — Frequency, intensity, and willingness-to-pay rates
- **Segment Analysis** — Compare themes across group types, confidence levels, and sources
- **ICE Scoring** — Prioritize feature ideas with Impact × Confidence × Ease

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DASHBOARD_PASSWORD` (choose something secure!)
4. Deploy!

The app is live at [valleysomm.vercel.app](https://valleysomm.vercel.app)

---

## 🗺️ Roadmap

- [x] Brand identity & design system
- [x] User research survey system
- [x] Analytics dashboard
- [x] Pain point analysis tools
- [ ] AI chat interface
- [ ] Winery database integration
- [ ] Itinerary generator
- [ ] Shareable trip cards
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — do whatever you want with it.

---

## 🙏 Acknowledgments

- The Yadkin Valley wine community for inspiring this project
- All the wine country travelers who shared their planning pain points
- The open-source community for the amazing tools

---

<p align="center">
  <strong>ValleySomm</strong><br/>
  <em>AI-Powered Yadkin Valley Wine Planning</em><br/><br/>
  <a href="https://www.valleysomm.com">ValleySomm.com</a>
</p>

<p align="center">
  Made with 🍷 in North Carolina
</p>
