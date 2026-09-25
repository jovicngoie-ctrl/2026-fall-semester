-- CGTSAI SCOUT - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the prospects table

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    industry VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(50),
    website VARCHAR(500),
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    source_url TEXT,
    instagram VARCHAR(255),
    linkedin VARCHAR(500),
    lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
    problem_detected TEXT,
    recommended_service VARCHAR(255),
    outreach_message TEXT,
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'RESEARCHED', 'QUALIFIED', 'CONTACTED', 'REPLIED', 'APPOINTMENT_SET', 'PROPOSAL_SENT', 'WON', 'LOST')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    UNIQUE(business_name, city, state)
);

-- Create index on lead_score for fast filtering
CREATE INDEX idx_lead_score ON prospects(lead_score DESC);

-- Create index on status for pipeline views
CREATE INDEX idx_status ON prospects(status);

-- Create index on industry for filtering
CREATE INDEX idx_industry ON prospects(industry);

-- Create index on created_at for timeline views
CREATE INDEX idx_created_at ON prospects(created_at DESC);

-- Create audit log table for tracking SCOUT activity
CREATE TABLE IF NOT EXISTS prospect_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    action VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Create scout_runs table to track SCOUT searches
CREATE TABLE IF NOT EXISTS scout_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    industry VARCHAR(100),
    location VARCHAR(255),
    amount_requested INTEGER,
    minimum_score INTEGER,
    status VARCHAR(50) DEFAULT 'RUNNING',
    prospects_found INTEGER DEFAULT 0,
    prospects_qualified INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_by UUID
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for prospects table
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - set up auth policies)
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own prospects" ON prospects
    FOR SELECT USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert prospects" ON prospects
    FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own prospects" ON prospects
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own scout runs" ON scout_runs
    FOR SELECT USING (auth.uid() = created_by);

-- Create a view for sales pipeline
CREATE OR REPLACE VIEW pipeline_view AS
SELECT
    status,
    COUNT(*) as count,
    ROUND(AVG(lead_score), 0) as avg_score,
    MAX(created_at) as latest
FROM prospects
GROUP BY status
ORDER BY
    CASE
        WHEN status = 'NEW' THEN 1
        WHEN status = 'RESEARCHED' THEN 2
        WHEN status = 'QUALIFIED' THEN 3
        WHEN status = 'CONTACTED' THEN 4
        WHEN status = 'REPLIED' THEN 5
        WHEN status = 'APPOINTMENT_SET' THEN 6
        WHEN status = 'PROPOSAL_SENT' THEN 7
        WHEN status = 'WON' THEN 8
        WHEN status = 'LOST' THEN 9
    END;

-- Create view for top scoring prospects
CREATE OR REPLACE VIEW top_prospects AS
SELECT
    id,
    business_name,
    industry,
    city,
    state,
    lead_score,
    problem_detected,
    recommended_service,
    status,
    created_at
FROM prospects
WHERE status != 'LOST'
ORDER BY lead_score DESC, created_at DESC
LIMIT 100;
