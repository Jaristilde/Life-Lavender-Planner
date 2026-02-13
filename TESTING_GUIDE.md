# Testing Guide — Lavender Life Planner

This document maps each implemented feature to its corresponding files, explains how to verify it works, and describes the architecture behind each integration.

---

## Feature 1: Two User Roles (Free vs Premium)

### Files
- `views/PremiumOnboarding.tsx` — Role selection during onboarding
- `components/Sidebar.tsx` — Plan badge (Crown for Premium, Shield for Free)
- `components/MoreSheet.tsx` — Plan badge in mobile bottom sheet
- `components/MagicUI.tsx` — `PremiumBadge` overlay component for gated features
- `App.tsx` — Passes `isPremium` prop to Sidebar, MoreSheet, and feature views

### How It Works
During onboarding (`PremiumOnboarding`), the user selects their plan. The `is_premium` boolean is stored on the Supabase `profiles` table. Throughout the app, views receive `isPremium` as a prop and use it to:
- Show a **Crown** icon (Premium) or **Shield** icon (Free) in the sidebar and mobile nav
- Gate premium-only features using the `PremiumBadge` wrapper component, which blurs the content and shows an "Upgrade to Premium" overlay for free users

### How to Test
1. Sign in or create an account
2. During onboarding, select **Free Plan** — verify Shield icon appears in sidebar
3. Open Sidebar and MoreSheet — verify "Free Plan" badge displays
4. Sign out, create a new account, select **Premium Plan** — verify Crown icon and "Premium Plan" badge

---

## Feature 2: Editable User Profile Page

### Files
- `views/Profile.tsx` — Full profile editor with save functionality
- `components/Sidebar.tsx` — "Profile" link under Settings section
- `components/MoreSheet.tsx` — "Profile" item in mobile nav grid
- `App.tsx` — Routes to Profile view, passes `onUpdateProfile` callback

### How It Works
`Profile.tsx` reads the current profile (name, bio, currency, financial goals, notifications) from props. When the user edits fields and clicks **Save Changes**, it calls `onUpdateProfile` which runs `dataService.updateProfile(userId, updates)` to persist to Supabase's `profiles` table. The profile state in `App.tsx` is updated immediately via `setProfile`.

### How to Test
1. Navigate to **Profile** from Sidebar or MoreSheet
2. Verify avatar displays (initial letter or Google avatar)
3. Edit name, bio, currency, financial goal summary
4. Toggle notification preferences
5. Click **Save Changes** — verify "Saved!" confirmation appears
6. Refresh the page — verify changes persisted

---

## Feature 3: Supabase Migration SQL (pgvector, knowledge_base, chat_messages)

### Files
- `supabase_migration.sql` — Complete migration script

### How It Works
The migration script:
1. Enables the `vector` extension (`CREATE EXTENSION IF NOT EXISTS vector`)
2. Creates `knowledge_base` table with `embedding vector(1536)` column for similarity search
3. Creates `chat_messages` table for storing conversation history
4. Creates `match_knowledge()` function for vector similarity search using cosine distance
5. Creates `search_knowledge_by_text()` function for keyword fallback search
6. Adds profile columns: `bio`, `currency`, `financial_goal_summary`, `notification_preferences`, `avatar_url`
7. Enables RLS on all tables with appropriate policies

### How to Test
1. Run the migration against your Supabase project:
   ```bash
   psql -h <supabase-host> -U postgres -d postgres -f supabase_migration.sql
   ```
   Or paste into the Supabase SQL Editor.
2. Verify tables exist: `knowledge_base`, `chat_messages`
3. Verify functions exist: `match_knowledge`, `search_knowledge_by_text`
4. Verify `profiles` table has new columns: `bio`, `currency`, etc.
5. Verify RLS is enabled on all tables

---

## Feature 4: Advanced UI Components (Magic UI)

### Files
- `components/MagicUI.tsx` — 6 animated components
- `views/Dashboard.tsx` — Integrates AnimatedCounter, GlowBorder, TextReveal

### Components (inspired by 21st.dev Magic UI & ReactBits)

| Component | Inspiration Source | Usage |
|-----------|-------------------|-------|
| `AnimatedCounter` | 21st.dev "Animated Number" | Financial totals on Dashboard, challenge progress |
| `ShimmerCard` | 21st.dev "Shimmer/Skeleton" | Loading placeholders across views |
| `SparkleEffect` | 21st.dev "Sparkles" & ReactBits confetti | Goal completion celebrations |
| `GlowBorder` | 21st.dev "Animated Border" | Daily affirmation card on Dashboard |
| `TextReveal` | 21st.dev "Text Reveal" | Affirmation text character reveal |
| `PremiumBadge` | Custom premium gating overlay | Locks premium features for free users |

### How It Works
All components use **Framer Motion** for physics-based animations:
- `AnimatedCounter` uses `useMotionValue` + `animate()` to spring from 0 to target
- `GlowBorder` uses a `conic-gradient` background with `rotate: 360` infinite animation
- `TextReveal` maps each character to a staggered `motion.span` with delay
- `SparkleEffect` generates random sparkle particles with physics-based trajectories

### How to Test
1. Open **Dashboard** — verify the financial income number animates from 0 to its value
2. Verify the affirmation card has a rotating glowing border (lavender/gold gradient)
3. Verify the affirmation text reveals character by character
4. Verify the challenge progress percentage animates

---

## Feature 5: Supabase Edge Functions

### Files
- `supabase/functions/generate-embedding/index.ts` — Embedding generation
- `supabase/functions/chat/index.ts` — RAG chat pipeline

### How It Works

**generate-embedding:**
1. Receives `{ content, metadata }` via POST
2. Verifies JWT auth via Supabase
3. Generates a 1536-dimension embedding via OpenAI `text-embedding-3-small`
4. Stores the entry + embedding in `knowledge_base` table
5. Returns `{ id, embedding_generated: true }`

**chat:**
1. Receives `{ message, history }` via POST
2. Stores the user message in `chat_messages`
3. Generates a query embedding
4. Runs `match_knowledge()` for vector similarity search (cosine distance < 0.8)
5. Falls back to `search_knowledge_by_text()` if no vector matches
6. Sends context + message to OpenAI/Anthropic LLM
7. Stores and returns the assistant response

### How to Test
1. Deploy edge functions:
   ```bash
   supabase functions deploy generate-embedding
   supabase functions deploy chat
   ```
2. Set secrets:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
3. Test embedding generation:
   ```bash
   curl -X POST https://<project>.supabase.co/functions/v1/generate-embedding \
     -H "Authorization: Bearer <anon-key>" \
     -H "Content-Type: application/json" \
     -d '{"content":"Test entry","metadata":{"category":"test","tags":["test"]}}'
   ```
4. Test chat function:
   ```bash
   curl -X POST https://<project>.supabase.co/functions/v1/chat \
     -H "Authorization: Bearer <anon-key>" \
     -H "Content-Type: application/json" \
     -d '{"message":"How do I budget?","history":[]}'
   ```

---

## Feature 6: MCP Server Integration

### Files
- `services/mcpService.ts` — MCP-style tool call wrapper
- `views/DatabaseExplorer.tsx` — MCP integration UI
- `components/Sidebar.tsx` — "Database Explorer" link

### How It Works
The MCP (Model Context Protocol) service (`mcpService.ts`) wraps Supabase queries in a tool-call interface that mirrors the MCP specification:

```typescript
mcpService.executeToolCall({ tool: 'list_tables', params: {} })
mcpService.executeToolCall({ tool: 'get_table_schema', params: { table: 'profiles' } })
mcpService.executeToolCall({ tool: 'get_recent_activity', params: {} })
mcpService.executeToolCall({ tool: 'get_user_stats', params: { userId: '...' } })
```

Available tools:
- `list_tables` — Returns all app tables with descriptions and row counts
- `get_table_schema` — Returns column definitions (name, type, PK/FK info)
- `query_table` — Fetches rows from a table with limit
- `get_row_count` — Returns count for a specific table
- `get_recent_activity` — Fetches recent chat messages and knowledge entries
- `get_user_stats` — Returns user-specific statistics

The `DatabaseExplorer` view provides three tabs:
- **Tables** — Card grid of all tables with drill-down schema view
- **Activity** — Timeline of recent chat messages and knowledge entries
- **Stats** — User statistics (messages, knowledge entries, planning years)

### How to Test
1. Navigate to **Database Explorer** from Sidebar
2. Verify "Connected" badge displays with MCP protocol info
3. Click on a table card — verify schema columns display
4. Switch to **Activity** tab — verify recent activity items or empty state
5. Switch to **Stats** tab — verify stat cards display counts

---

## Feature 7: RAG Chatbot

### Files
- `views/Chatbot.tsx` — Floating chat UI with RAG pipeline
- `data/knowledge_base_seed.ts` — 25+ knowledge entries for local RAG

### How It Works
The chatbot uses a **client-side RAG (Retrieval-Augmented Generation) pipeline**:

1. **User sends message** → stored in Supabase `chat_messages` table
2. **Knowledge search** (`searchKnowledge()`) — scores all 25+ knowledge entries by:
   - Keyword matching (2 points per word match in content)
   - Tag matching (3 points per word match in tags)
   - Category boosting (extra points for topic-specific queries)
3. **Response generation** (`generateResponse()`) — formats top-matching entries as a conversational response
4. **Assistant response** stored in `chat_messages` table
5. **Chat history** loads from Supabase on mount (up to 50 messages)

Knowledge base covers 5 categories:
- **Financial** — budgeting, emergency funds, debt strategies, credit scores, investing
- **App Features** — Morning Reset, Financial Hub, Planner, Vision Board, etc.
- **Wellness** — hydration, morning routines, journaling, movement, sleep
- **Goal Setting** — SMART goals, writing goals, financial priority order
- **Affirmations** — money mindset, daily practice, overcoming shame

UI features:
- Floating lavender chat button (bottom-right corner)
- iMessage-style chat bubbles (user = lavender right, bot = white left)
- Butterfly bot avatar with gradient background
- Typing indicator with bouncing dots
- Clear chat button

### How to Test
1. Click the floating **chat button** (bottom-right with sparkle badge)
2. Verify welcome message from "Lavender AI" appears
3. Type "hello" — verify personalized greeting response
4. Type "help" — verify capabilities list
5. Type "how do I budget" — verify relevant budgeting advice from knowledge base
6. Type "morning reset" — verify app feature explanation
7. Type "water intake" — verify wellness guidance
8. Click the **trash** icon — verify chat clears to welcome message
9. Close and reopen chat — verify history loads from Supabase

---

## Feature 8: Testing Guide

This document (TESTING_GUIDE.md) serves as both the testing guide and the requirement mapping for the university assignment. Each section above corresponds to one of the 8 required features, mapping to specific files, explaining the architecture, and providing step-by-step test procedures.

---

## Architecture Overview

```
Lavender Life Planner
├── App.tsx                          # Root: auth, routing, data loading, year management
├── components/
│   ├── Sidebar.tsx                  # Desktop nav with plan badge
│   ├── BottomNav.tsx                # Mobile bottom navigation
│   ├── MoreSheet.tsx                # Mobile expanded nav sheet
│   ├── MagicUI.tsx                  # 6 animated UI components (Framer Motion)
│   └── MorningAlignmentModal.tsx    # Legacy modal
├── views/
│   ├── Dashboard.tsx                # Main dashboard with Magic UI integration
│   ├── MorningReset.tsx             # 5-section morning ritual
│   ├── TrackingCenter.tsx           # Streak tracking and analytics
│   ├── FinancialHub.tsx             # Budget management
│   ├── Planner.tsx                  # Daily planner with kanban
│   ├── Chatbot.tsx                  # RAG chatbot with floating UI
│   ├── Profile.tsx                  # Editable user profile
│   ├── DatabaseExplorer.tsx         # MCP server integration UI
│   ├── Library.tsx                  # PDF storage and viewer
│   ├── AuthScreen.tsx               # Auth with error handling
│   └── ...                          # Other views
├── services/
│   ├── supabaseClient.ts            # Supabase client init
│   ├── authService.ts               # Auth methods + password reset
│   ├── dataService.ts               # CRUD for profiles, years, fields
│   ├── mcpService.ts                # MCP tool-call wrapper for Supabase
│   └── geminiService.ts             # Google Gemini AI integration
├── data/
│   └── knowledge_base_seed.ts       # 25+ knowledge entries for RAG
├── supabase/
│   └── functions/
│       ├── generate-embedding/      # Edge function: embedding generation
│       └── chat/                    # Edge function: RAG chat pipeline
├── supabase_migration.sql           # Database schema + pgvector setup
└── types.ts                         # TypeScript interfaces
```

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + custom lavender theme
- **Animations:** Framer Motion (spring physics, staggered reveals)
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage)
- **Vector Search:** pgvector extension (1536-dim OpenAI embeddings)
- **AI:** Google Gemini (affirmations), OpenAI (embeddings), client-side RAG
- **Charts:** Recharts
- **Deployment:** Netlify
