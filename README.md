# Lead Generation Agent for cgtsai LLC

An intelligent lead generation agent powered by Claude AI that finds, researches, and scores potential customers for cgtsai LLC.

## Features

- **Intelligent Lead Finding**: Uses Claude AI to identify potential leads based on your ideal customer profile
- **Prospect Research**: Automatically researches companies and contacts
- **Lead Scoring**: Evaluates leads on a 1-100 scale based on fit and opportunity
- **Problem Detection**: Identifies specific business problems your services solve
- **Outreach Generation**: Creates personalized outreach messages
- **Persistent Database**: Stores all prospect data in JSON format
- **Interactive Conversation**: Chat-based interface for natural lead discovery

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure API Key
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 3. Run the Agent
```bash
python lead_agent.py
```

## Database Schema

The agent manages prospect data with the following fields:

```json
{
  "id": "unique identifier",
  "business_name": "company name",
  "contact_name": "decision maker name",
  "industry": "industry vertical",
  "city": "city",
  "state": "state",
  "website": "company website",
  "business_email": "contact email",
  "business_phone": "contact phone",
  "source_url": "where lead was found",
  "instagram": "instagram handle",
  "linkedin": "linkedin profile",
  "lead_score": "1-100 quality score",
  "problem_detected": "specific business problem",
  "recommended_service": "your service that solves it",
  "outreach_message": "personalized message",
  "status": "new/contacted/qualified/closed",
  "notes": "internal notes",
  "created_at": "timestamp"
}
```

## Usage Examples

### Find Leads by Industry
```
You: find leads in SaaS
Agent: I'll search for SaaS companies that match your profile...
```

### Research a Specific Company
```
You: research TechCorp Inc
Agent: Let me gather information about TechCorp Inc...
```

### Generate Outreach Messages
```
You: generate outreach for prospect 5
Agent: Here's a personalized message for prospect 5...
```

### View All Prospects
```
You: list prospects
Agent: [shows all saved prospects with scores and status]
```

## Agent Capabilities

The agent can:

1. **Find Leads**: Search for companies matching your target profile
2. **Score Leads**: Evaluate fit and opportunity (1-100)
3. **Identify Problems**: Detect specific challenges your solution addresses
4. **Generate Messages**: Create personalized outreach communications
5. **Track Status**: Manage prospect pipeline (new, contacted, qualified, closed)
6. **Provide Insights**: Analyze market opportunities and trends
7. **Export Data**: Generate reports and CSV exports

## Commands

- `find leads in [industry]` - Search for leads in a specific industry
- `research [company_name]` - Research a specific company
- `score [prospect_id]` - Evaluate a prospect's fit
- `list prospects` - Show all saved prospects
- `show prospect [id]` - View prospect details
- `generate outreach [id]` - Create outreach message
- `export` - Export prospects to CSV
- `help` - Show available commands
- `quit` - Exit the agent

## Configuration

On first run, you'll be prompted to configure:

- **Company Services**: What you offer
- **Target Industry**: Your ideal vertical
- **Target Company Size**: SMB, Mid-Market, Enterprise
- **Geographic Focus**: Where you want to sell
- **Ideal Customer Profile**: Description of perfect customer
- **Key Problems Solved**: Your value proposition
- **Budget Range**: Typical customer budget

## Output Files

- `prospects.json` - Main database of all prospects
- `prospect_export_[date].csv` - Exported prospect reports
- Conversation logs with timestamps

## Tips for Best Results

1. **Be Specific**: Provide detailed target profiles for better lead quality
2. **Engage Naturally**: Ask questions to refine leads
3. **Track Status**: Update prospect status as you engage
4. **Review Scores**: Pay attention to lead scores and reasoning
5. **Personalize**: Use agent to customize each outreach
6. **Iterate**: Refine your ideal customer profile over time

## Example Workflow

```
1. Start the agent: python lead_agent.py
2. Configure your company profile
3. Ask agent: "Find me 5 IT directors in healthcare companies with 100-500 employees in California"
4. Review prospects: "list prospects"
5. Research specific company: "research MediTech Solutions"
6. Score and analyze: "score prospect 3"
7. Generate outreach: "generate outreach 3"
8. Track engagement: Update status in database
9. Export results: "export"
```

## Troubleshooting

**Agent not responding?**
- Check your ANTHROPIC_API_KEY is set correctly
- Verify internet connection
- Ensure API key has sufficient credits

**Prospects not saving?**
- Confirm write permissions in directory
- Check prospects.json is valid JSON
- Try removing corrupted prospects.json and restart

**Want better leads?**
- Provide more detailed target profile
- Ask more specific questions
- Refine industry and geography focus

## API Requirements

- Valid Anthropic API key
- Internet connection
- Python 3.8+

## License

For cgtsai LLC use only.
