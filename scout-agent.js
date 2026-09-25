/**
 * SCOUT - Lead Intelligence & Client Acquisition Agent
 * For CGTSAI LLC
 *
 * Finds and qualifies potential CGTSAI clients
 * Saves to Supabase, prevents duplicates, generates outreach
 */

const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// SCOUT's system prompt
const SCOUT_SYSTEM_PROMPT = `You are SCOUT, the lead intelligence and client acquisition agent for CGTSAI LLC.

CGTSAI is an AI automation agency that helps businesses improve:
- Lead generation
- Lead response (AI chatbots & voice agents)
- Appointment booking automation
- Follow-up automation
- CRM management
- Business automation

Your job: Find and qualify potential CGTSAI clients.

When given a location, industry, or prospecting request:

1. Find legitimate businesses using publicly available sources
2. Gather information: name, contact, website, phone, email, location, socials
3. Analyze the business's online presence for problems CGTSAI solves
4. Score 0-100 based on CGTSAI opportunity

SCORING SYSTEM (out of 100):
- No/poor website: +20 points
- No online appointment booking: +15 points
- No chatbot/instant response: +15 points
- Poor lead capture: +15 points
- Weak follow-up system: +15 points
- Strong revenue potential: +10 points
- Matches CGTSAI target niche: +10 points

PROBLEMS TO LOOK FOR:
- Poor website experience
- Missing lead forms/capture
- No appointment booking system
- No instant response (chatbot/AI)
- Manual lead follow-up
- No CRM or poor CRM usage
- Weak conversion funnel
- Missed call handling
- No automation
- Outdated technology

CGTSAI SERVICES TO RECOMMEND:
- AI voice agents
- AI chatbots
- CRM implementation
- Automated SMS/email follow-up
- Appointment booking automation
- Missed-lead recovery
- Lead qualification
- Lead capture funnels
- Database reactivation
- Website automation
- Business workflow automation

IMPORTANT RULES:
1. Only use publicly available information
2. Never fabricate emails, phone numbers, or contact names
3. Mark unknown info as "UNKNOWN"
4. Check database before creating prospects (prevent duplicates)
5. Only save prospects with score >= minimum_score
6. Generate personalized, professional outreach messages
7. Be specific about problems found and how CGTSAI solves them

Response format should be JSON:
{
  "prospects": [
    {
      "business_name": "string",
      "contact_name": "string or UNKNOWN",
      "industry": "string",
      "city": "string",
      "state": "string",
      "website": "URL or UNKNOWN",
      "business_email": "email or UNKNOWN",
      "business_phone": "phone or UNKNOWN",
      "source_url": "where you found this",
      "instagram": "handle or UNKNOWN",
      "linkedin": "URL or UNKNOWN",
      "lead_score": "number 0-100",
      "score_breakdown": "explain the score",
      "problem_detected": "specific problem found",
      "recommended_service": "which CGTSAI service",
      "outreach_message": "personalized pitch"
    }
  ],
  "summary": "overall findings"
}`;

/**
 * Fetch and analyze a website
 * @param {string} url - Website URL
 * @returns {Promise<string>} - Page content analysis
 */
async function analyzeWebsite(url) {
  try {
    if (!url || url === "UNKNOWN") return "No website available";

    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CGTSAIScout/1.0)",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract key elements
    const hasBookingForm =
      $('[name*="appointment"]').length > 0 ||
      $('[class*="booking"]').length > 0 ||
      $('[class*="calendar"]').length > 0;

    const hasChatbot =
      $('[class*="chat"]').length > 0 ||
      $('[class*="widget"]').length > 0 ||
      $('iframe[src*="chat"]').length > 0;

    const hasContactForm = $("form").length > 0;
    const contactText = $("body").text().toLowerCase();

    const analysis = {
      hasBookingForm,
      hasChatbot,
      hasContactForm,
      pageTitle: $("title").text(),
      hasLeadCapture: contactText.includes("email") || hasContactForm,
      modernTech: response.data.includes("react") || response.data.includes("vue"),
    };

    return JSON.stringify(analysis);
  } catch (error) {
    return `Website analysis failed: ${error.message}`;
  }
}

/**
 * Check if prospect already exists in database
 * @param {string} businessName - Business name
 * @param {string} city - City
 * @param {string} state - State
 * @returns {Promise<boolean>} - True if exists
 */
async function prospectExists(businessName, city, state) {
  try {
    const { data, error } = await supabase
      .from("prospects")
      .select("id")
      .eq("business_name", businessName)
      .eq("city", city)
      .eq("state", state)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Save prospect to Supabase
 * @param {object} prospect - Prospect data
 * @returns {Promise<object>} - Saved prospect
 */
async function saveProspect(prospect) {
  try {
    // Check for duplicate
    const exists = await prospectExists(
      prospect.business_name,
      prospect.city,
      prospect.state
    );

    if (exists) {
      console.log(`⚠️ Prospect ${prospect.business_name} already exists, skipping`);
      return null;
    }

    const { data, error } = await supabase.from("prospects").insert([
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
        notes: `SCOUT run - Score: ${prospect.lead_score}/100. ${prospect.score_breakdown}`,
      },
    ]).select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error saving prospect:", error);
    return null;
  }
}

/**
 * Run SCOUT search
 * @param {string} query - Search query (e.g., "25 real estate agents in Las Vegas")
 * @param {number} minimumScore - Minimum lead score to save
 * @returns {Promise<object>} - Results
 */
async function runScout(query, minimumScore = 70) {
  console.log(`🔍 SCOUT starting: "${query}"`);

  try {
    // Get AI analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SCOUT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Find and analyze: ${query}

Return ONLY valid JSON with prospect data. Include website analysis.
Only include prospects with clear fit for CGTSAI services.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    let results = response.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = results.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const data = JSON.parse(jsonMatch[0]);
    const prospects = data.prospects || [];

    // Analyze websites and save qualified prospects
    const savedProspects = [];
    let skipped = 0;

    for (const prospect of prospects) {
      // Score threshold filter
      if (prospect.lead_score < minimumScore) {
        skipped++;
        continue;
      }

      // Analyze website if available
      if (prospect.website && prospect.website !== "UNKNOWN") {
        const websiteAnalysis = await analyzeWebsite(prospect.website);
        prospect.website_analysis = websiteAnalysis;
      }

      // Save to Supabase
      const saved = await saveProspect(prospect);
      if (saved) {
        savedProspects.push(saved);
        console.log(
          `✅ Saved: ${saved.business_name} (Score: ${saved.lead_score}/100)`
        );
      }
    }

    // Log SCOUT run
    await supabase.from("scout_runs").insert([
      {
        industry: query.split(" ").slice(-3).join(" "), // Extract likely industry
        location: query,
        amount_requested: prospects.length,
        minimum_score: minimumScore,
        prospects_found: prospects.length,
        prospects_qualified: savedProspects.length,
        status: "COMPLETED",
      },
    ]);

    return {
      success: true,
      query,
      totalFound: prospects.length,
      qualified: savedProspects.length,
      skipped,
      prospects: savedProspects,
      summary: data.summary,
    };
  } catch (error) {
    console.error("SCOUT Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get top prospects from database
 * @param {number} limit - Number of results
 * @param {number} minScore - Minimum score
 * @returns {Promise<array>} - Top prospects
 */
async function getTopProspects(limit = 50, minScore = 70) {
  try {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .gte("lead_score", minScore)
      .neq("status", "LOST")
      .order("lead_score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching prospects:", error);
    return [];
  }
}

/**
 * Update prospect status
 * @param {string} prospectId - Prospect UUID
 * @param {string} newStatus - New status
 * @returns {Promise<boolean>} - Success
 */
async function updateProspectStatus(prospectId, newStatus) {
  try {
    const validStatuses = [
      "NEW",
      "RESEARCHED",
      "QUALIFIED",
      "CONTACTED",
      "REPLIED",
      "APPOINTMENT_SET",
      "PROPOSAL_SENT",
      "WON",
      "LOST",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const { error } = await supabase
      .from("prospects")
      .update({ status: newStatus })
      .eq("id", prospectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating prospect:", error);
    return false;
  }
}

/**
 * Export prospects for email campaign
 * @param {number} minScore - Minimum score filter
 * @returns {Promise<array>} - Prospects with outreach info
 */
async function exportOutreach(minScore = 75) {
  try {
    const { data, error } = await supabase
      .from("prospects")
      .select("business_name,contact_name,business_email,outreach_message")
      .gte("lead_score", minScore)
      .eq("status", "NEW")
      .order("lead_score", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error exporting outreach:", error);
    return [];
  }
}

// Export functions
module.exports = {
  runScout,
  getTopProspects,
  updateProspectStatus,
  saveProspect,
  exportOutreach,
  analyzeWebsite,
};

// CLI usage
if (require.main === module) {
  const query = process.argv[2] || "25 real estate agents in Las Vegas";
  const minScore = parseInt(process.argv[3]) || 70;

  runScout(query, minScore).then((results) => {
    console.log("\n=== SCOUT RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
  });
}
