#!/usr/bin/env python3
"""
Prospect Database Manager
Handles CRUD operations and reporting on prospects
"""

import json
import csv
from datetime import datetime
from pathlib import Path

class ProspectManager:
    def __init__(self, db_file="prospects.json"):
        self.db_file = db_file
        self.prospects = self.load()

    def load(self):
        """Load prospects from database"""
        if Path(self.db_file).exists():
            with open(self.db_file, 'r') as f:
                return json.load(f)
        return []

    def save(self):
        """Save prospects to database"""
        with open(self.db_file, 'w') as f:
            json.dump(self.prospects, f, indent=2)

    def add(self, prospect_data):
        """Add a new prospect"""
        prospect = {
            "id": len(self.prospects) + 1,
            "business_name": prospect_data.get("business_name", ""),
            "contact_name": prospect_data.get("contact_name", ""),
            "industry": prospect_data.get("industry", ""),
            "city": prospect_data.get("city", ""),
            "state": prospect_data.get("state", ""),
            "website": prospect_data.get("website", ""),
            "business_email": prospect_data.get("business_email", ""),
            "business_phone": prospect_data.get("business_phone", ""),
            "source_url": prospect_data.get("source_url", ""),
            "instagram": prospect_data.get("instagram", ""),
            "linkedin": prospect_data.get("linkedin", ""),
            "lead_score": prospect_data.get("lead_score", 0),
            "problem_detected": prospect_data.get("problem_detected", ""),
            "recommended_service": prospect_data.get("recommended_service", ""),
            "outreach_message": prospect_data.get("outreach_message", ""),
            "status": prospect_data.get("status", "new"),
            "notes": prospect_data.get("notes", ""),
            "created_at": datetime.now().isoformat()
        }
        self.prospects.append(prospect)
        self.save()
        return prospect

    def update(self, prospect_id, updates):
        """Update an existing prospect"""
        for prospect in self.prospects:
            if prospect["id"] == prospect_id:
                prospect.update(updates)
                self.save()
                return prospect
        return None

    def get(self, prospect_id):
        """Get a prospect by ID"""
        for prospect in self.prospects:
            if prospect["id"] == prospect_id:
                return prospect
        return None

    def delete(self, prospect_id):
        """Delete a prospect"""
        self.prospects = [p for p in self.prospects if p["id"] != prospect_id]
        self.save()

    def list_all(self):
        """List all prospects"""
        return self.prospects

    def filter_by_industry(self, industry):
        """Filter prospects by industry"""
        return [p for p in self.prospects if p["industry"].lower() == industry.lower()]

    def filter_by_status(self, status):
        """Filter prospects by status"""
        return [p for p in self.prospects if p["status"].lower() == status.lower()]

    def filter_by_score_range(self, min_score, max_score):
        """Filter prospects by lead score"""
        return [p for p in self.prospects
                if min_score <= p["lead_score"] <= max_score]

    def top_prospects(self, count=10):
        """Get top prospects by lead score"""
        return sorted(self.prospects, key=lambda x: x["lead_score"], reverse=True)[:count]

    def export_csv(self):
        """Export prospects to CSV"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"prospect_export_{timestamp}.csv"

        if not self.prospects:
            print("No prospects to export")
            return None

        with open(filename, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=self.prospects[0].keys())
            writer.writeheader()
            writer.writerows(self.prospects)

        return filename

    def get_stats(self):
        """Get database statistics"""
        stats = {
            "total_prospects": len(self.prospects),
            "by_status": {},
            "by_industry": {},
            "average_score": 0,
            "high_quality_leads": 0  # score >= 70
        }

        if self.prospects:
            scores = [p["lead_score"] for p in self.prospects]
            stats["average_score"] = sum(scores) / len(scores)
            stats["high_quality_leads"] = len([s for s in scores if s >= 70])

        for prospect in self.prospects:
            status = prospect["status"]
            industry = prospect["industry"]
            stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            stats["by_industry"][industry] = stats["by_industry"].get(industry, 0) + 1

        return stats

    def print_prospect(self, prospect):
        """Pretty print a prospect"""
        print("\n" + "="*60)
        print(f"ID: {prospect['id']} | {prospect['business_name']}")
        print("="*60)
        print(f"Contact: {prospect['contact_name']}")
        print(f"Industry: {prospect['industry']}")
        print(f"Location: {prospect['city']}, {prospect['state']}")
        print(f"Website: {prospect['website']}")
        print(f"Email: {prospect['business_email']}")
        print(f"Phone: {prospect['business_phone']}")
        print(f"Lead Score: {prospect['lead_score']}/100")
        print(f"Status: {prospect['status']}")
        print(f"Problem Detected: {prospect['problem_detected']}")
        print(f"Recommended Service: {prospect['recommended_service']}")
        print(f"Outreach Message:\n{prospect['outreach_message']}")
        print(f"Notes: {prospect['notes']}")
        print(f"Created: {prospect['created_at']}")
        print("="*60 + "\n")

    def print_summary(self, prospects):
        """Print summary of prospects"""
        print(f"\nFound {len(prospects)} prospects:\n")
        for p in prospects:
            print(f"[{p['id']}] {p['business_name']} - {p['contact_name']} | Score: {p['lead_score']}/100 | Status: {p['status']}")
        print()


if __name__ == "__main__":
    # Example usage
    manager = ProspectManager()

    # Show stats
    print("Database Statistics:")
    stats = manager.get_stats()
    print(json.dumps(stats, indent=2))
