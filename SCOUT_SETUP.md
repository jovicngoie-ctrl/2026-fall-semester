# SCOUT Setup & Integration Guide

**SCOUT** - Lead Intelligence & Client Acquisition Agent for CGTSAI LLC

SCOUT finds real businesses, analyzes them, scores them, and turns them into qualified prospects in your Supabase database.

---

## Quick Overview

```
Your Command
    ↓
SCOUT Agent (GPT-4)
    ↓
Find Businesses (25 real estate agents in Las Vegas)
    ↓
Analyze Websites & Problems
    ↓
Score 0-100
    ↓
Save to Supabase (no duplicates)
    ↓
Dashboard Shows Results
    ↓
You Manage Pipeline
```

---

## Step 1: Database Setup

### 1A. Create Supabase Table

Run the SQL from `SCOUT_SUPABASE.sql` in your Supabase SQL Editor:

```sql
-- Copy entire SCOUT_SUPABASE.sql file and run it in Supabase SQL Editor
```

This creates:
- `prospects` table (main database)
- `prospect_audit_log` table (track changes)
- `scout_runs` table (track searches)
- Indexes for fast filtering
- Views for pipeline analysis

### 1B. Verify Tables

In Supabase, you should see:
- ✅ `prospects` table with all fields
- ✅ `scout_runs` table
- ✅ `prospect_audit_log` table
- ✅ Indexes for performance

---

## Step 2: Environment Configuration

### Option A: If you have an existing Next.js CGTSAI dashboard

1. Copy your existing environment variables to a `.env.local` file:

```bash
# From your Nova setup
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=...

# Add for frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
```

2. That's it! SCOUT uses the same OpenAI + Supabase config.

### Option B: Standalone usage

1. Copy `.env.scout.example` to `.env.local`
2. Fill in your OpenAI API key and Supabase credentials

---

## Step 3: Install Dependencies

```bash
npm install openai @supabase/supabase-js axios cheerio
```

Or if you already have these from Nova:
```bash
npm install --save-dev
```

---

## Step 4: Integration Options

Choose one or more:

### Option A: Add to Existing Dashboard

If you have a Next.js CGTSAI dashboard:

1. **Copy the dashboard component:**
   ```bash
   cp ScoutDashboard.jsx components/ScoutDashboard.jsx
   ```

2. **Add the API route:**
   ```bash
   cp api-scout-route.js pages/api/scout/search.js
   ```

3. **Import in your dashboard:**
   ```jsx
   import ScoutDashboard from "@/components/ScoutDashboard";

   export default function Dashboard() {
     return <ScoutDashboard />;
   }
   ```

### Option B: Standalone Agent (CLI)

Run SCOUT from command line:

```bash
node scout-agent.js "25 real estate agents in Las Vegas" 70
```

This searches, scores, and saves prospects to Supabase.

### Option C: Direct API Call

```javascript
import { runScout } from "./scout-agent.js";

const results = await runScout(
  "25 real estate agents in Las Vegas",
  70
);

console.log(results);
// {
//   success: true,
//   query: "25 real estate agents in Las Vegas",
//   totalFound: 25,
//   qualified: 18,
//   prospects: [...]
// }
```

---

## Step 5: Use SCOUT

### Via Dashboard (Recommended)

1. Open your dashboard with ScoutDashboard component
2. Fill in:
   - **Industry**: Real Estate
   - **Location**: Las Vegas, NV
   - **# to Find**: 25
   - **Min. Score**: 70
3. Click "START SCOUT"
4. Watch as it finds and qualifies leads
5. See results appear in real-time
6. Click on each prospect to see analysis
7. Update status as you engage them

### Via CLI

```bash
# Find real estate agents in Las Vegas, minimum score 70
node scout-agent.js "25 real estate agents in Las Vegas" 70

# Find insurance agents in Miami, minimum score 75
node scout-agent.js "30 insurance agents in Miami" 75
```

### Via API

```javascript
// From your Next.js app
const response = await fetch("/api/scout/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "25 real estate agents in Las Vegas",
    minimumScore: 70,
  }),
});

const results = await response.json();
```

---

## SCOUT Scoring System

### How Scores Are Calculated (0-100)

| Factor | Points |
|--------|--------|
| No/poor website | +20 |
| No online appointment booking | +15 |
| No chatbot/instant response | +15 |
| Poor lead capture | +15 |
| Weak follow-up system | +15 |
| Strong business/revenue potential | +10 |
| Matches CGTSAI target niche | +10 |
| **Maximum** | **100** |

**Example:**
- Vegas Realtor A: No chatbot (+15) + Poor booking (+15) + Strong revenue (+10) = **40/100**
- Actually, SCOUT finds deeper issues...
- Real Estate Agent B: Outdated website (-), No instant response system (-), Manual lead follow-up (-), Weak CRM (-) = **91/100** ✅

### Lead Quality Tiers

- **80-100**: Hot leads (immediate action)
- **60-79**: Warm leads (follow up soon)
- **40-59**: Lukewarm (might be interested)
- **0-39**: Cold leads (low fit)

### Filter by Score

Only save prospects above your minimum:
- `minimumScore: 70` = High quality only
- `minimumScore: 60` = Include more prospects
- `minimumScore: 80` = Ultra-high quality (fewer found)

---

## Pipeline Statuses

Track prospects through your sales workflow:

| Status | Meaning |
|--------|---------|
| **NEW** | Just found by SCOUT |
| **RESEARCHED** | Deep analysis done |
| **QUALIFIED** | Confirmed as good fit |
| **CONTACTED** | You reached out |
| **REPLIED** | They responded |
| **APPOINTMENT_SET** | Meeting scheduled |
| **PROPOSAL_SENT** | Sent them proposal |
| **WON** | Closed the deal! 🎉 |
| **LOST** | Didn't work out |

Update status in dashboard by clicking the prospect and selecting new status.

---

## Examples by Industry

### Real Estate Agents (Las Vegas)
```
minimumScore: 75
industry: "Real Estate"
location: "Las Vegas, NV"
amount: 25

Problems SCOUT looks for:
- No online appointment booking (huge for realtors)
- Weak lead follow-up system
- No instant response chatbot
- Manual CRM management
```

### Insurance Agents (Miami)
```
minimumScore: 70
industry: "Insurance"
location: "Miami, FL"
amount: 30

Problems SCOUT looks for:
- No lead capture on website
- Manual quote requests
- No instant communication
- Poor follow-up workflow
```

### Home Services (Phoenix)
```
minimumScore: 72
industry: "Home Services"
location: "Phoenix, AZ"
amount: 20

Problems SCOUT looks for:
- No online booking
- Manual dispatch
- Poor customer communication
- Weak review/reputation management
```

---

## Duplicate Prevention

SCOUT automatically prevents duplicates:

1. Before saving each prospect, checks database
2. Looks for matching: `business_name` + `city` + `state`
3. Skips if already exists
4. Logs skipped prospects

This prevents:
- ✅ Contacting same person twice
- ✅ Wasting outreach efforts
- ✅ Database pollution

---

## Database Queries

### Get Top Prospects

```sql
SELECT * FROM prospects
WHERE lead_score >= 75
  AND status != 'LOST'
ORDER BY lead_score DESC
LIMIT 20;
```

### Get Prospects by Status

```sql
SELECT COUNT(*) as count, status
FROM prospects
GROUP BY status;
```

### Find Real Estate Agents

```sql
SELECT * FROM prospects
WHERE industry = 'Real Estate'
  AND lead_score >= 70
ORDER BY created_at DESC;
```

### Get Prospects Created This Week

```sql
SELECT * FROM prospects
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY lead_score DESC;
```

---

## Monitoring SCOUT Runs

### View Search History

```sql
SELECT * FROM scout_runs
ORDER BY started_at DESC
LIMIT 10;
```

### Get Statistics

```sql
SELECT 
  COUNT(*) as total_prospects,
  AVG(lead_score) as avg_score,
  COUNT(CASE WHEN status = 'WON' THEN 1 END) as deals_won
FROM prospects;
```

---

## Exporting Prospects

### Export for Email Campaign

In the dashboard, prospects can be exported for bulk outreach:

```javascript
// Get prospects with personalized messages
const outreach = await exportOutreach(minimumScore = 75);

// Result:
// [
//   {
//     business_name: "Vegas Realty Group",
//     contact_name: "John Smith",
//     business_email: "john@vegasrealty.com",
//     outreach_message: "Hi John,\n\nWe noticed Vegas Realty Group... "
//   },
//   ...
// ]
```

---

## Troubleshooting

### "SCOUT is running but finding no prospects"

**Causes:**
- Query too specific (e.g., "find 25 luxury real estate agents in rural Nevada")
- All found prospects score below minimum
- OpenAI rate limiting

**Solutions:**
- Lower minimumScore to 60
- Broaden geography (e.g., "Southwest USA" instead of specific town)
- Increase amount (e.g., 50 instead of 25)
- Wait 30 seconds and try again

### "All prospects are duplicates"

**Causes:**
- You've already run the same search
- Industry is very small

**Solutions:**
- Change industry/location
- Lower minimumScore to find different prospects
- Look in nearby areas

### "OpenAI API errors"

**Causes:**
- Invalid API key
- No API credits
- Rate limiting

**Solutions:**
- Check `.env.local` has correct `OPENAI_API_KEY`
- Check OpenAI account has credits
- Wait 60 seconds between runs

### "Supabase connection errors"

**Causes:**
- Missing SUPABASE_URL or SUPABASE_KEY
- Network issue
- Supabase project down

**Solutions:**
- Check `.env.local` has Supabase credentials
- Verify Supabase project is active
- Test connection: `SELECT 1`

---

## Advanced Configuration

### Custom Scoring Rules

Edit `scout-agent.js` SCOUT_SYSTEM_PROMPT:

```javascript
SCOUT_SYSTEM_PROMPT = `
  ...
  SCORING SYSTEM (out of 100):
  - No website: +20
  - Missing feature X: +15
  - ... add your custom criteria
`;
```

### Target New Industries

Add to INDUSTRIES list in dashboard:

```jsx
const INDUSTRIES = [
  "Real Estate",
  "Insurance",
  "Home Services",
  "Restaurants",
  "Medical Spa",
  "Property Management",
  "YOUR_INDUSTRY_HERE", // Add here
];
```

### Integrate with Nova

Once SCOUT finds leads, Nova can:
1. Automatically send cold email
2. Book initial consultation
3. Qualify leads further
4. Schedule follow-ups

**Flow:**
```
SCOUT finds prospect
    ↓
Saves to Supabase
    ↓
Nova sees new lead
    ↓
Sends personalized email
    ↓
If replies: books call
    ↓
Transfers to you if qualified
```

---

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Set up environment variables
3. ✅ Install dependencies
4. ✅ Start SCOUT (dashboard or CLI)
5. ✅ Review first batch of prospects
6. ✅ Update statuses as you engage
7. ✅ Connect with Nova for automation
8. ✅ Track deals won

---

## Support

**SCOUT Documentation**: See `SCOUT_SETUP.md`
**Database Schema**: See `SCOUT_SUPABASE.sql`
**Dashboard Code**: See `ScoutDashboard.jsx`
**Agent Code**: See `scout-agent.js`
**API Route**: See `api-scout-route.js`

Questions? Check the code comments or ask Claude!

---

## Success Metrics

Track SCOUT's effectiveness:

- **Prospects Found**: Running count
- **Qualification Rate**: % with score >= 75
- **Response Rate**: % who reply to outreach
- **Conversion Rate**: % who become customers
- **Deal Value**: Revenue from SCOUT leads

Example after 1 month:
- Found: 150 prospects
- Qualified (75+): 95 (63%)
- Contacted: 40 (42%)
- Replied: 8 (20% of contacted)
- Closed: 2 deals worth $X

---

**Ready to scale your lead generation? Start SCOUT now!** 🚀
