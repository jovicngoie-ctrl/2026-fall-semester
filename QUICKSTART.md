# Quick Start Guide - Lead Generation Agent

## 5-Minute Setup

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Your API Key
```bash
export ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

### 3. Start the Agent
```bash
python lead_agent_advanced.py
```

### 4. Configure Your Company (First Run)
You'll be prompted to enter:
- Company name
- Services you offer
- Target industry
- Company size you target
- Geographic focus
- Your ideal customer description
- Problems you solve
- Budget range
- Website & email

## Usage Examples

### Find Leads
```
📌 You: find 10 IT directors in mid-market healthcare companies in California
🤖 Agent: I'll search for qualified healthcare IT decision makers...
```

### Research a Company
```
📌 You: research Kaiser Permanente and their current tech stack
🤖 Agent: Let me gather information about Kaiser's systems...
```

### View Your Prospects
```
📌 You: list prospects
```

Shows all saved leads with IDs, names, scores, and status.

### See Top Leads
```
📌 You: top prospects 5
```

Shows your best 5 leads by score.

### Generate Outreach
```
📌 You: show prospect 3
```

Shows detailed information including the personalized outreach message.

### Update Prospect Status
```
📌 You: update prospect 2 status contacted
```

## Key Features

✅ **Intelligent Scoring** - AI evaluates fit (1-100)
✅ **Problem Detection** - Identifies specific issues your solution solves
✅ **Personalized Outreach** - Auto-generates custom messages
✅ **Data Persistence** - All prospects saved in JSON database
✅ **CSV Export** - Export leads for email campaigns
✅ **Pipeline Tracking** - Track status: new → contacted → qualified → closed
✅ **Market Insights** - Get competitive and industry analysis

## Prospect Status Values

- **new** - Just discovered
- **contacted** - Reached out
- **qualified** - Showed interest
- **negotiating** - In active discussions
- **closed** - Won/lost deal
- **archived** - No longer relevant

## Tips for Best Results

### 1. Be Specific in Your Asks
❌ Bad: "find leads"
✅ Good: "find IT directors at healthcare companies with 200-500 employees in California who are currently using outdated ERP systems"

### 2. Ask Follow-up Questions
```
📌 You: which of the top 5 prospects has the most pain with legacy systems?
🤖 Agent: Based on my research, prospect #2...
```

### 3. Get Market Intelligence
```
📌 You: what's the typical budget for companies in our target market?
🤖 Agent: Based on current market trends...
```

### 4. Customize Your Outreach
```
📌 You: update prospect 3 outreach_message with a focus on ROI and quick implementation
```

## File Structure

```
.
├── lead_agent_advanced.py    # Main agent (RECOMMENDED)
├── lead_agent.py             # Basic agent version
├── prospect_manager.py       # Database operations
├── prospects.json            # Your prospect database
├── company_config.json       # Your company configuration
├── requirements.txt          # Python dependencies
├── README.md                 # Full documentation
└── QUICKSTART.md            # This file
```

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
export ANTHROPIC_API_KEY="your-key-here"
python lead_agent_advanced.py
```

### No prospects appearing?
- Make sure to ask the agent to "find leads" or "research companies"
- The agent needs to explicitly provide prospect data
- Check prospects.json file for saved data

### Want to see saved prospects?
```bash
python -c "from prospect_manager import ProspectManager; m = ProspectManager(); print(len(m.list_all()), 'prospects')"
```

### Clear all data and start fresh?
```bash
rm prospects.json company_config.json
python lead_agent_advanced.py
```

## Advanced Commands

### Filter by Industry
```
📌 You: show me all prospects in SaaS with scores above 75
```

### Generate Reports
```
📌 You: export
```
Creates a CSV file of all prospects.

### Get Statistics
```
📌 You: stats
```

Shows database overview and breakdown.

### Multi-turn Conversation
```
📌 You: find leads in fintech
🤖 Agent: I found 5 fintech companies...
📌 You: which one has the most funding?
🤖 Agent: Based on the research...
📌 You: generate personalized outreach for prospect 1
🤖 Agent: Here's a custom message...
```

## Next Steps

1. ✅ Complete setup and first run
2. ✅ Let agent find your first batch of leads
3. ✅ Review prospects and scores
4. ✅ Personalize and send outreach
5. ✅ Track responses and update status
6. ✅ Build your sales pipeline

## Contact

For questions about your leads, just ask the agent! It can:
- Explain why a prospect got a certain score
- Suggest companies in new industries
- Analyze competitor landscapes
- Help with sales strategy
- Generate follow-up messages

Happy prospecting! 🚀
