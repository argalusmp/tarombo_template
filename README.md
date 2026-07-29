# Tarombo Digital

> **Interactive Batak Family Tree Generator** — Built with Next.js 15, React Flow, and SheetJS. Fully client-side. No backend, no database, no authentication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Features

| Feature | Status |
|---------|--------|
| Upload Excel (`.xlsx`) | ✅ |
| Parse & Validate Data | ✅ |
| Interactive Family Tree | ✅ |
| Search by Name / ID / Marga | ✅ |
| Zoom & Pan | ✅ |
| MiniMap | ✅ |
| Export PNG (High-res) | ✅ |
| Export Long PDF | ✅ |
| 1000+ Members | ✅ |
| 30+ Generations | ✅ |
| Dark Mode UI | ✅ |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/tarombo-digital.git
cd tarombo-digital

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Deploy to Vercel

### Option 1: One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Integration

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click **Deploy** — no environment variables needed

> **Note**: Since this is fully client-side, there's zero configuration needed on Vercel.

---

## Excel Format

### Required Sheet: `Tarombo`

Your Excel file must have a sheet named exactly **`Tarombo`** with these columns:

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `ID` | ✅ | Number | Unique identifier for each person |
| `Father ID` | ❌ | Number | ID of the father. **Leave empty for the root person.** |
| `Nama` | ✅ | String | Full name |
| `Gender` | ✅ | String | `L` = Male (Laki-laki), `P` = Female (Perempuan) |
| `Pasangan` | ❌ | String | Spouse name (free text, not an ID) |
| `Generasi` | ❌ | Number | Generation number (auto-calculated if omitted) |
| `Marga` | ❌ | String | Clan / surname |
| `Lahir` | ❌ | String/Number | Birth year or date |
| `Wafat` | ❌ | String/Number | Death year or date |
| `Catatan` | ❌ | String | Notes |

### Example

| ID | Father ID | Nama | Gender | Pasangan | Generasi | Marga |
|----|-----------|------|--------|----------|----------|-------|
| 1 | | Ompu Raja | L | | 1 | Contoh |
| 2 | 1 | Anak A | L | Boru Simanjuntak | 2 | Contoh |
| 3 | 1 | Anak B | L | Boru Sitorus | 2 | Contoh |
| 4 | 2 | Cucu A1 | L | | 3 | Contoh |

### Download Template

A ready-to-use template is included at `/public/Tarombo_Template.xlsx`. You can download it directly from the app toolbar.

### Validation Rules

The app validates:
- ❌ Duplicate IDs
- ❌ Empty names
- ❌ Invalid Father ID (references non-existent ID)
- ❌ Circular relationships (A → B → A)
- ❌ Missing root (no person with empty Father ID)
- ❌ Invalid data types (non-numeric ID)
- ⚠️ Multiple roots (warning, tree still renders)

---

## Project Structure

```
tarombo-digital/
├── app/                      # Next.js App Router
│   ├── globals.css           # Global dark theme styles
│   ├── layout.tsx            # Root layout + fonts + SEO
│   └── page.tsx              # Main page (orchestrates everything)
│
├── components/               # UI Components
│   ├── Header.tsx            # App branding bar
│   ├── Toolbar.tsx           # Upload, search, export controls
│   ├── TreeCanvas.tsx        # React Flow canvas wrapper
│   ├── PersonNode.tsx        # Custom React Flow node
│   ├── ValidationPanel.tsx   # Error/warning display
│   ├── EmptyState.tsx        # Initial upload prompt
│   └── StatsBar.tsx          # Tree statistics overlay
│
├── hooks/                    # React hooks
│   ├── useFamilyTree.ts      # Upload → parse → validate → layout pipeline
│   └── useSearch.ts          # Fuzzy search over persons
│
├── lib/                      # Business logic
│   ├── excelParser.ts        # SheetJS reader for Tarombo sheet
│   ├── validator.ts          # Structural validation + BFS generation calc
│   └── treeLayout.ts         # Reingold-Tilford layout algorithm
│
├── types/                    # TypeScript types
│   └── tarombo.ts            # All shared types
│
├── utils/                    # Utilities
│   └── exportUtils.ts        # PNG + PDF export via html-to-image + jsPDF
│
├── public/
│   └── Tarombo_Template.xlsx # Downloadable Excel template
│
├── Tarombo_Template.xlsx     # Source template
└── README.md
```

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15+ | React framework, App Router |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 4+ | Utility CSS |
| `@xyflow/react` | latest | Interactive tree canvas |
| `xlsx` (SheetJS) | latest | Excel parsing |
| `html-to-image` | latest | Canvas → PNG snapshot |
| `jspdf` | latest | PNG → PDF export |
| `lucide-react` | latest | Icons |

---

## Architecture

All logic is strictly client-side:

```
Upload Excel
    ↓
excelParser.ts  →  Raw rows from "Tarombo" sheet
    ↓
validator.ts    →  Validation errors + BFS generation calc
    ↓
treeLayout.ts   →  Reingold-Tilford X/Y positions
    ↓
TreeCanvas      →  React Flow renders nodes + edges
```

---

## Performance

- **`React.memo`** on `PersonNode` — avoids re-render on unrelated state changes
- **`useCallback` / `useMemo`** throughout hooks — stable references
- **Reingold-Tilford layout** runs once per upload, not per render
- React Flow virtualizes off-screen nodes automatically
- Tested with 1000+ nodes on modern hardware

---

## Phase 2 (Future)

The right panel is reserved for Phase 2 features:
- Detail Drawer (person info)
- Edit Person
- Collapse/Expand subtrees
- Timeline view
- Multi-tree support
- Share link

---

## License

MIT
