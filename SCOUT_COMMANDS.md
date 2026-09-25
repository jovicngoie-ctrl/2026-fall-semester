# SCOUT Commands Reference

Quick reference for using SCOUT in all modes.

## Dashboard (Web UI)

### Start SCOUT Search
1. Open SCOUT Dashboard
2. Select **Industry**: Real Estate, Insurance, Home Services, etc.
3. Enter **Location**: City, State (e.g., "Las Vegas, NV")
4. Set **# to Find**: Number of prospects (1-100, default 25)
5. Set **Min. Score**: Minimum lead score (0-100, default 70)
6. Click **▶ START SCOUT**
7. Watch results appear in real-time

### View Prospects
- **List View**: See all prospects in table format
- **Filter by Status**: Click status buttons (ALL, NEW, QUALIFIED, CONTACTED, WON)
- **Sort**: Click column headers
- **Search**: Use Cmd/Ctrl+F on page

### Interact with Prospect
1. Click any prospect row
2. Modal opens showing:
   - Lead score breakdown
   - Contact information
   - Problems detected
   - CGTSAI service recommendation
   - Personalized outreach message
3. **Copy Outreach**: Copy message to clipboard
4. **Update Status**: Change status dropdown
5. **Save Changes**: Click outside modal

### Pipeline Views
- **Stats Cards**: See total, new, qualified, contacted, average score
- **Pipeline Table**: View prospects by status
- **Filter Buttons**: Show only specific status

## CLI (Command Line)

### Basic Search
```bash
node scout-agent.js "25 real estate agents in Las Vegas"
```

### With Minimum Score
```bash
node scout-agent.js "25 real estate agents in Las Vegas" 75
```

### Find More Specific Prospects
```bash
# Insurance brokers in New York with 50+ employees
node scout-agent.js "20 independent insurance brokers in New York"

# Home service companies in California
node scout-agent.js "30 plumbing and HVAC companies in Los Angeles"

# Medical spas in Florida
node scout-agent.js "15 med spas in Miami"

# Property management companies in Texas
node scout-agent.js "25 property management companies in Austin"
```

### View Top Results
```bash
# After running SCOUT, check Supabase dashboard or:
npm run scout
# Then open https://your-project.supabase.co
```

## API (Programmatic)

### Search Endpoint

**POST** `/api/scout/search`

```bash
curl -X POST http://localhost:3000/api/scout/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "25 real estate agents in Las Vegas",
    "minimumScore": 70
  }'
```

### JavaScript
```javascript
const response = await fetch("/api/scout/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "25 real estate agents in Las Vegas",
    minimumScore: 70,
  }),
});

const data = await response.json();
console.log(`Found ${data.qualified} qualified prospects`);
```

### Python
```python
import requests
import json

response = requests.post(
    "http://localhost:3000/api/scout/search",
    headers={"Content-Type": "application/json"},
    data=json.dumps({
        "query": "25 real estate agents in Las Vegas",
        "minimumScore": 70,
    }),
)

results = response.json()
print(f"Found {results['qualified']} qualified prospects")
```

## Database Queries (Supabase)

### Get Recent Prospects

```sql
SELECT business_name, lead_score, industry, status
FROM prospects
ORDER BY created_at DESC
LIMIT 20;
```

### Find High-Quality Leads

```sql
SELECT business_name, contact_name, business_email, lead_score
FROM prospects
WHERE lead_score >= 80
  AND status = 'NEW'
ORDER BY lead_score DESC;
```

### Get Prospects by Industry

```sql
SELECT industry, COUNT(*) as count, AVG(lead_score) as avg_score
FROM prospects
GROUP BY industry
ORDER BY count DESC;
```

### Get Contacted Prospects

```sql
SELECT business_name, contact_name, business_email, created_at
FROM prospects
WHERE status = 'CONTACTED'
ORDER BY created_at DESC;
```

### Export Outreach List

```sql
SELECT 
  business_name,
  contact_name,
  business_email,
  outreach_message,
  lead_score
FROM prospects
WHERE status = 'NEW'
  AND lead_score >= 75
ORDER BY lead_score DESC;
```

### View Pipeline Summary

```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(AVG(lead_score)) as avg_score
FROM prospects
GROUP BY status
ORDER BY count DESC;
```

## Node.js Integration

### Import and Use Scout Agent

```javascript
const { runScout, getTopProspects, updateProspectStatus } = require('./scout-agent');

// Run a search
const results = await runScout("25 real estate agents in Las Vegas", 70);
console.log(`Found ${results.qualified} qualified prospects`);

// Get top prospects
const topLeads = await getTopProspects(10, 75);
topLeads.forEach(prospect => {
  console.log(`${prospect.business_name}: ${prospect.lead_score}/100`);
});

// Update prospect status
await updateProspectStatus('prospect-uuid-here', 'CONTACTED');
```

## Common Workflows

### 1. Find and Reach Out (Same Day)

```bash
# 1. Find prospects
node scout-agent.js "20 real estate agents in Las Vegas" 75

# 2. View in dashboard
npm run dev
# -> Open http://localhost:3000/scout

# 3. Copy outreach messages and send emails
# (Click each prospect, copy message, paste in email)

# 4. Mark as CONTACTED in dashboard
# (Update status to "CONTACTED")
```

### 2. Research and Qualify

```bash
# 1. Find prospects
node scout-agent.js "30 insurance brokers in Miami" 65

# 2. Research in dashboard
# (View website links, contact info, problems detected)

# 3. Mark as QUALIFIED if good fit
# (Update status to "QUALIFIED")

# 4. Prepare custom pitches
# (Review recommended services)
```

### 3. Bulk Email Campaign

```bash
# 1. Find prospects
node scout-agent.js "50 home services in Phoenix" 70

# 2. Export from dashboard
# (Download CSV with emails and messages)

# 3. Use in email tool
# (Paste into Mailchimp, Lemlist, etc.)

# 4. Track responses
# (Update status in dashboard as replies come in)
```

### 4. Track to Close

```bash
# Day 1: Find leads
node scout-agent.js "25 real estate agents in Las Vegas" 75

# Day 2: Initial contact
# Update status to CONTACTED

# Day 3: If they reply
# Update status to REPLIED

# Day 4: Schedule meeting
# Update status to APPOINTMENT_SET

# Day 5+: Send proposal
# Update status to PROPOSAL_SENT

# Final: Closed deal
# Update status to WON

# View pipeline
# Dashboard shows: 25 NEW -> 8 CONTACTED -> 2 REPLIED -> 1 APPOINTMENT_SET -> 1 WON
```

## Customization Commands

### Search with Different Min Score

```bash
# Low threshold (include more prospects)
node scout-agent.js "50 agents in Las Vegas" 60

# High threshold (only best prospects)
node scout-agent.js "50 agents in Las Vegas" 85

# No threshold (see all found)
node scout-agent.js "50 agents in Las Vegas" 0
```

### Search by Region

```bash
# Entire state
node scout-agent.js "25 real estate agents in California" 75

# Region
node scout-agent.js "20 agents in Southern California" 75

# Multiple cities
node scout-agent.js "15 agents in Las Vegas and Henderson" 75

# Nationwide
node scout-agent.js "100 real estate agents in USA" 80
```

### Search by Niche

```bash
# Luxury market
node scout-agent.js "20 luxury real estate agents in Las Vegas" 75

# Commercial
node scout-agent.js "15 commercial real estate brokers in Miami" 75

# Wholesale
node scout-agent.js "25 wholesale real estate investors in Phoenix" 70

# Property management
node scout-agent.js "30 property management companies in Austin" 75
```

## Monitoring Commands

### Check Prospect Count

```bash
# Via CLI (PostgreSQL)
psql -d supabase -c "SELECT COUNT(*) FROM prospects;"

# Via Dashboard
# See stat cards at top: "Total Prospects: XXX"
```

### View Recent Activity

```sql
SELECT COUNT(*) as new_today
FROM prospects
WHERE created_at >= NOW() - INTERVAL '1 day';
```

### Export for Reporting

```bash
# In dashboard: Click "Export" button
# Or via SQL:

SELECT 
  DATE(created_at) as date,
  COUNT(*) as prospects_found,
  AVG(lead_score) as avg_score
FROM prospects
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Troubleshooting Commands

### Clear Old Prospects (Be careful!)

```sql
-- Delete prospects from 30 days ago
DELETE FROM prospects
WHERE created_at < NOW() - INTERVAL '30 days'
  AND status = 'LOST';
```

### Reset Database

```sql
-- Delete all prospects (CAREFUL!)
DELETE FROM prospects;
DELETE FROM scout_runs;

-- Verify it's empty
SELECT COUNT(*) FROM prospects;
```

### Check Database Connection

```javascript
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const { data, error } = await supabase
  .from("prospects")
  .select("COUNT(*)")
  .single();

if (error) {
  console.error("Connection failed:", error);
} else {
  console.log("Connected!");
}
```

---

## Quick Reference Table

| Task | Command | Where |
|------|---------|-------|
| Find prospects | `node scout-agent.js "25 agents in Vegas"` | CLI |
| View dashboard | Open browser to `/scout` | Web |
| Filter by status | Click status buttons | Dashboard |
| Copy message | Click "Copy Message" | Dashboard |
| Update status | Select from dropdown | Dashboard |
| Export list | Click "Export" | Dashboard |
| View SQL | Run query | Supabase |
| Clear data | Run DELETE | Supabase SQL |

---

**Need help?** Check `SCOUT_SETUP.md` or the dashboard help button.
