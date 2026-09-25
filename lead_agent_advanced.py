#!/usr/bin/env python3
"""
Advanced Lead Generation Agent for cgtsai LLC
Enhanced version with better CLI, database operations, and reporting
"""

import json
import os
import sys
from datetime import datetime
from anthropic import Anthropic
from prospect_manager import ProspectManager

# Initialize
client = Anthropic()
manager = ProspectManager()

def get_company_profile():
    """Get or load company profile"""
    config_file = "company_config.json"

    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return json.load(f)

    print("\n" + "="*70)
    print("WELCOME TO CGTSAI LLC LEAD GENERATION AGENT")
    print("="*70)
    print("\nFirst, let's configure your company profile...\n")

    config = {
        "name": input("Company name [cgtsai LLC]: ").strip() or "cgtsai LLC",
        "services": input("What services/products do you offer?: ").strip(),
        "target_industry": input("Target industry/vertical: ").strip(),
        "target_company_size": input("Ideal company size (e.g., SMB, Mid-Market, Enterprise): ").strip(),
        "geographic_focus": input("Geographic focus (e.g., USA, specific regions): ").strip(),
        "ideal_customer_profile": input("Describe your ideal customer: ").strip(),
        "key_problems_solved": input("Key problems your solution solves (comma-separated): ").strip(),
        "budget_range": input("Typical customer budget range: ").strip(),
        "website": input("Your company website: ").strip(),
        "contact_email": input("Your contact email: ").strip(),
    }

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)

    return config

def build_system_prompt(config):
    """Build system prompt with company configuration"""
    return f"""You are an expert lead generation and sales research agent for {config['name']}.

COMPANY PROFILE:
- Services/Products: {config['services']}
- Target Industry: {config['target_industry']}
- Target Company Size: {config['target_company_size']}
- Geographic Focus: {config['geographic_focus']}
- Ideal Customer: {config['ideal_customer_profile']}
- Key Problems Solved: {config['key_problems_solved']}
- Budget Range: {config['budget_range']}

YOUR ROLE:
You are responsible for identifying, researching, and qualifying leads for {config['name']}.

TASKS YOU PERFORM:
1. Find potential leads that match the target profile
2. Research companies, industries, and decision-makers
3. Identify specific business problems the company's services could solve
4. Score leads 1-100 based on fit, opportunity, and buying power
5. Generate personalized, compelling outreach messages
6. Provide market insights and competitive analysis
7. Track prospect interactions and pipeline status

PROSPECT DATA FORMAT:
Always provide prospect information in this JSON structure when asked:
{{
    "business_name": "Company name",
    "contact_name": "Decision maker name",
    "industry": "Industry",
    "city": "City",
    "state": "State",
    "website": "Website URL",
    "business_email": "Email address",
    "business_phone": "Phone number",
    "source_url": "URL where found",
    "instagram": "Instagram handle",
    "linkedin": "LinkedIn profile URL",
    "lead_score": 75,
    "problem_detected": "Specific problem this prospect has",
    "recommended_service": "Which of our services solves it",
    "outreach_message": "Personalized outreach message",
    "status": "new"
}}

LEAD SCORING CRITERIA (1-100):
- 80-100: Hot leads - high fit, immediate pain, budget approved
- 60-79: Warm leads - good fit, some pain points, exploring
- 40-59: Lukewarm - moderate fit, nice-to-have need
- 20-39: Cold leads - poor fit, no current need
- 1-19: Not a fit

When researching leads:
- Look for industry trends, growth signals, recent funding
- Identify decision makers and their roles
- Find specific pain points relevant to our services
- Consider company culture fit and growth trajectory
- Assess ability to pay based on company size and funding

Always provide reasoning for scores and recommendations."""

def parse_prospect_from_response(response_text):
    """Try to extract prospect JSON from agent response"""
    try:
        # Look for JSON block in response
        import re
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            prospect_data = json.loads(json_str)

            # Verify it has prospect fields
            if "business_name" in prospect_data:
                return prospect_data
    except (json.JSONDecodeError, AttributeError):
        pass

    return None

def display_menu():
    """Display main menu"""
    print("\n" + "="*70)
    print("COMMANDS:")
    print("="*70)
    print("  find leads in [industry] - Find leads in specific industry")
    print("  research [company] - Research a specific company")
    print("  list prospects - Show all saved prospects")
    print("  show prospect [id] - View prospect details")
    print("  top prospects [count] - Show top leads by score")
    print("  filter by [industry/status] [value] - Filter prospects")
    print("  update prospect [id] [status/notes] - Update prospect")
    print("  export - Export prospects to CSV")
    print("  stats - Show database statistics")
    print("  help - Show this menu")
    print("  quit - Exit agent")
    print("="*70 + "\n")

def handle_command(command, config, conversation_history):
    """Handle special commands"""
    cmd_lower = command.lower().strip()

    if cmd_lower == "list prospects":
        prospects = manager.list_all()
        if prospects:
            manager.print_summary(prospects)
        else:
            print("No prospects yet.")
        return True

    elif cmd_lower.startswith("show prospect"):
        parts = cmd_lower.split()
        if len(parts) > 2:
            try:
                prospect_id = int(parts[2])
                prospect = manager.get(prospect_id)
                if prospect:
                    manager.print_prospect(prospect)
                else:
                    print(f"Prospect {prospect_id} not found.")
            except ValueError:
                print("Invalid prospect ID")
        return True

    elif cmd_lower.startswith("top prospects"):
        parts = cmd_lower.split()
        count = int(parts[2]) if len(parts) > 2 else 10
        prospects = manager.top_prospects(count)
        if prospects:
            manager.print_summary(prospects)
        else:
            print("No prospects yet.")
        return True

    elif cmd_lower == "export":
        filename = manager.export_csv()
        if filename:
            print(f"✓ Exported to {filename}")
        return True

    elif cmd_lower == "stats":
        stats = manager.get_stats()
        print("\n" + "="*70)
        print("DATABASE STATISTICS")
        print("="*70)
        print(f"Total Prospects: {stats['total_prospects']}")
        print(f"Average Lead Score: {stats['average_score']:.1f}/100")
        print(f"High Quality Leads (70+): {stats['high_quality_leads']}")
        print(f"\nBy Status: {stats['by_status']}")
        print(f"By Industry: {stats['by_industry']}")
        print("="*70 + "\n")
        return True

    elif cmd_lower == "help":
        display_menu()
        return True

    return False

def run_agent():
    """Run the interactive lead generation agent"""
    # Load company profile
    config = get_company_profile()

    # Display welcome
    print("\n" + "="*70)
    print(f"LEAD GENERATION AGENT FOR {config['name'].upper()}")
    print("="*70)
    print(f"Services: {config['services']}")
    print(f"Target: {config['target_industry']} | Size: {config['target_company_size']}")
    print(f"Location: {config['geographic_focus']}")
    print("="*70)
    display_menu()

    conversation_history = []
    system_prompt = build_system_prompt(config)

    while True:
        try:
            user_input = input("\n📌 You: ").strip()
        except EOFError:
            print("\nExiting...")
            break

        if not user_input:
            continue

        if user_input.lower() == "quit":
            print("\n✓ Agent shutting down. Prospects saved.")
            break

        # Handle special commands
        if handle_command(user_input, config, conversation_history):
            continue

        # Add to conversation history
        conversation_history.append({
            "role": "user",
            "content": user_input
        })

        try:
            # Get response from Claude
            print("\n🤖 Agent: ", end="", flush=True)
            response = client.messages.create(
                model="claude-opus-5-5",
                max_tokens=2000,
                system=system_prompt,
                messages=conversation_history
            )

            assistant_message = response.content[0].text
            print(assistant_message)

            # Add to history
            conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })

            # Try to extract and save prospect
            prospect_data = parse_prospect_from_response(assistant_message)
            if prospect_data:
                prospect = manager.add(prospect_data)
                print(f"\n✓ Prospect saved (ID: {prospect['id']}) - {prospect['business_name']}")

        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("Please check your API key and try again.")

if __name__ == "__main__":
    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set")
        print("Run: export ANTHROPIC_API_KEY='your-api-key'")
        sys.exit(1)

    run_agent()
