/**
 * Next.js API Route for SCOUT
 * Place this at: pages/api/scout/search.js
 *
 * Usage:
 * POST /api/scout/search
 * {
 *   "query": "25 real estate agents in Las Vegas",
 *   "minimumScore": 70
 * }
 */

const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SCOUT_SYSTEM_PROMPT = `You are SCOUT, the lead intelligence and client acquisition agent for CGTSAI LLC.

CGTSAI is an AI automation agency that helps businesses improve:
- Lead generation
- Lead response (AI chatbots & voice agents)
- Appointment booking automation
- Follow-up automation
- CRM management
- Business automation

Your job: Find and qualify potential CGTSAI clients.

SCORING SYSTEM (out of 100):
- No/poor website: +20
- No online appointment booking: +15
- No chatbot/instant response: +15
- Poor lead capture: +15
- Weak follow-up system: +15
- Strong revenue potential: +10
- Matches CGTSAI target niche: +10

Only use publicly available information.
Return valid JSON with prospect array.`;

async function analyzeWebsite(url) {
  try {
    if (!url || url === "UNKNOWN") return null;

    const response = await axios.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0 (CGTSAIScout/1.0)" },
    });

    const $ = cheerio.load(response.data);

    return {
      hasBooking:
        $('[name*="appointment"]').length > 0 ||
        $('[class*="booking"]').length > 0,
      hasChat:
        $('[class*="chat"]').length > 0 ||
        $('iframe[src*="chat"]').length > 0,
      hasForm: $("form").length > 0,
      title: $("title").text(),
    };
  } catch (error) {
    return null;
  }
}

async function prospectExists(businessName, city, state) {
  try {
    const { data } = await supabase
      .from("prospects")
      .select("id")
      .eq("business_name", businessName)
      .eq("city", city)
      .eq("state", state)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

async function saveProspect(prospect) {
  try {
    const exists = await prospectExists(
      prospect.business_name,
      prospect.city,
      prospect.state
    );

    if (exists) return null;

    const { data, error } = await supabase
      .from("prospects")
      .insert([
        {
          business_name: prospect.business_name,
          contact_name: prospect.contact_name,
          industry: prospect.industry,
          city: prospect.city,
          state: prospect.state,
          website: prospect.website,
          business_email: prospect.business_email,
          business_phone: prospect.business_phone,
          source_url: prospect.source_url,
          instagram: prospect.instagram,
          linkedin: prospect.linkedin,
          lead_score: prospect.lead_score,
          problem_detected: prospect.problem_detected,
          recommended_service: prospect.recommended_service,
          outreach_message: prospect.outreach_message,
          status: "NEW",
          notes: `SCOUT: ${prospect.score_breakdown}`,
        },
      ])
      .select();

    return data?.[0] || null;
  } catch (error) {
    console.error("Save error:", error);
    return null;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, minimumScore = 70 } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SCOUT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Find and analyze: ${query}\n\nReturn valid JSON with prospects array.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse response");
    }

    const data = JSON.parse(jsonMatch[0]);
    const prospects = data.prospects || [];

    // Process and save prospects
    const savedProspects = [];

    for (const prospect of prospects) {
      if (prospect.lead_score < minimumScore) continue;

      // Analyze website
      if (prospect.website && prospect.website !== "UNKNOWN") {
        const analysis = await analyzeWebsite(prospect.website);
        if (analysis) prospect.website_analysis = analysis;
      }

      // Save to database
      const saved = await saveProspect(prospect);
      if (saved) savedProspects.push(saved);
    }

    // Log the run
    await supabase.from("scout_runs").insert([
      {
        industry: "Real Estate", // Parse from query if needed
        location: query,
        amount_requested: prospects.length,
        minimum_score: minimumScore,
        prospects_found: prospects.length,
        prospects_qualified: savedProspects.length,
        status: "COMPLETED",
      },
    ]);

    return res.status(200).json({
      success: true,
      query,
      totalFound: prospects.length,
      qualified: savedProspects.length,
      prospects: savedProspects,
      summary: data.summary,
    });
  } catch (error) {
    console.error("SCOUT Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
