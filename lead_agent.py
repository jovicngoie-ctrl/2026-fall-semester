#!/usr/bin/env python3
"""
Lead Generation Agent for cgtsai LLC
Finds, researches, and scores potential leads using Claude API
"""

import json
import os
from datetime import datetime
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic()

# Database file for storing prospects
PROSPECTS_DB = "prospects.json"

def load_prospects():
    """Load prospects from JSON database"""
    if os.path.exists(PROSPECTS_DB):
        with open(PROSPECTS_DB, 'r') as f:
            return json.load(f)
    return []

def save_prospects(prospects):
    """Save prospects to JSON database"""
    with open(PROSPECTS_DB, 'w') as f:
        json.dump(prospects, f, indent=2)

def create_prospect(data):
    """Create a new prospect with all required fields"""
    prospect = {
        "id": len(load_prospects()) + 1,
        "business_name": data.get("business_name", ""),
        "contact_name": data.get("contact_name", ""),
        "industry": data.get("industry", ""),
        "city": data.get("city", ""),
        "state": data.get("state", ""),
        "website": data.get("website", ""),
        "business_email": data.get("business_email", ""),
        "business_phone": data.get("business_phone", ""),
        "source_url": data.get("source_url", ""),
        "instagram": data.get("instagram", ""),
        "linkedin": data.get("linkedin", ""),
        "lead_score": data.get("lead_score", 0),
        "problem_detected": data.get("problem_detected", ""),
        "recommended_service": data.get("recommended_service", ""),
        "outreach_message": data.get("outreach_message", ""),
        "status": data.get("status", "new"),
        "notes": data.get("notes", ""),
        "created_at": datetime.now().isoformat()
    }
    return prospect

def run_agent(company_info):
    """Run the lead generation agent with conversation history"""
    conversation_history = []

    system_prompt = f"""You are an expert lead generation agent for cgtsai LLC.

Company Profile:
{json.dumps(company_info, indent=2)}

Your responsibilities:
1. Find potential leads that match the target profile
2. Research companies and contacts
3. Identify specific problems the company's services could solve
4. Score leads on a scale of 1-100 based on fit and opportunity
5. Generate personalized outreach messages
6. Track all prospect information in the provided database schema

When finding leads, consider:
- Industry alignment with target market
- Company size and growth indicators
- Geographic location preferences
- Decision-makers and contact information
- Current business challenges
- Budget and buying power

Always respond with structured JSON data when asked to find or analyze leads.
Provide detailed reasoning for lead scores and recommendations."""

    print("\n=== Lead Generation Agent for cgtsai LLC ===")
    print("Type 'help' for commands, 'quit' to exit\n")

    while True:
        user_input = input("You: ").strip()

        if not user_input:
            continue

        if user_input.lower() == 'quit':
            print("Agent shutting down...")
            break

        if user_input.lower() == 'help':
            print_help()
            continue

        # Add user message to history
        conversation_history.append({
            "role": "user",
            "content": user_input
        })

        # Get response from Claude
        response = client.messages.create(
            model="claude-opus-5-5",
            max_tokens=2000,
            system=system_prompt,
            messages=conversation_history
        )

        assistant_message = response.content[0].text

        # Add assistant response to history
        conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        print(f"\nAgent: {assistant_message}\n")

        # Check if response contains prospect data to save
        if "json" in assistant_message.lower() or "{" in assistant_message:
            try:
                # Try to extract JSON from response
                json_start = assistant_message.find('{')
                json_end = assistant_message.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = assistant_message[json_start:json_end]
                    prospect_data = json.loads(json_str)

                    prospects = load_prospects()
                    prospect = create_prospect(prospect_data)
                    prospects.append(prospect)
                    save_prospects(prospects)
                    print(f"✓ Prospect saved (ID: {prospect['id']})")
            except (json.JSONDecodeError, ValueError):
                pass  # Not JSON data, continue normally

def print_help():
    """Print available commands"""
    print("""
Available Commands:
- find leads in [industry] - Find leads in a specific industry
- research [company_name] - Research a specific company
- score [prospect_id] - Score a prospect
- list prospects - Show all saved prospects
- show prospect [id] - Show details of a specific prospect
- generate outreach [id] - Generate outreach message for prospect
- export - Export all prospects to CSV
- help - Show this help message
- quit - Exit the agent
    """)

def get_company_info():
    """Get company information from user"""
    print("\n=== Configure cgtsai LLC Profile ===")
    print("Provide information about your company to help the agent find better leads:\n")

    company_info = {
        "name": input("Company name [cgtsai LLC]: ").strip() or "cgtsai LLC",
        "services": input("What services/products do you offer?: ").strip(),
        "target_industry": input("Target industry/vertical: ").strip(),
        "target_company_size": input("Ideal company size (e.g., SMB, Mid-Market, Enterprise): ").strip(),
        "geographic_focus": input("Geographic focus (e.g., USA, specific regions): ").strip(),
        "ideal_customer_profile": input("Describe your ideal customer: ").strip(),
        "key_problems_solved": input("Key problems your solution solves: ").strip(),
        "budget_range": input("Typical customer budget range: ").strip(),
    }

    return company_info

if __name__ == "__main__":
    # Get company configuration
    company_info = get_company_info()

    # Run the agent
    run_agent(company_info)
