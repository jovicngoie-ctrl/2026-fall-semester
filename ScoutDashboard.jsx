/**
 * SCOUT Dashboard Component
 * Place this at: components/ScoutDashboard.jsx
 *
 * Shows SCOUT interface, runs searches, displays results
 */

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const INDUSTRIES = [
  "Real Estate",
  "Insurance",
  "Home Services",
  "Restaurants",
  "Medical Spa",
  "Property Management",
  "Legal Services",
  "Consulting",
  "Healthcare",
  "Fitness",
];

export default function ScoutDashboard() {
  // Form state
  const [industry, setIndustry] = useState("Real Estate");
  const [location, setLocation] = useState("Las Vegas, NV");
  const [amount, setAmount] = useState(25);
  const [minimumScore, setMinimumScore] = useState(70);

  // Results state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [prospects, setProspects] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load prospects on mount
  useEffect(() => {
    loadProspects();
  }, []);

  async function loadProspects() {
    try {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .order("lead_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      setProspects(data || []);
    } catch (err) {
      console.error("Error loading prospects:", err);
    }
  }

  async function runScout(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const query = `${amount} ${industry} in ${location}`;

      const response = await fetch("/api/scout/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          minimumScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setResults(data);
      await loadProspects(); // Refresh list
    } catch (err) {
      setError(err.message);
      console.error("SCOUT Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateProspectStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from("prospects")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setProspects(
        prospects.map((p) =>
          p.id === id ? { ...p, status: newStatus } : p
        )
      );

      if (selectedProspect?.id === id) {
        setSelectedProspect({ ...selectedProspect, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  // Filter prospects
  const filteredProspects =
    statusFilter === "ALL"
      ? prospects
      : prospects.filter((p) => p.status === statusFilter);

  const stats = {
    total: prospects.length,
    new: prospects.filter((p) => p.status === "NEW").length,
    qualified: prospects.filter((p) => p.status === "QUALIFIED").length,
    contacted: prospects.filter((p) => p.status === "CONTACTED").length,
    avgScore:
      prospects.length > 0
        ? Math.round(
            prospects.reduce((sum, p) => sum + p.lead_score, 0) /
              prospects.length
          )
        : 0,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">🔍 SCOUT</h1>
          <p className="text-blue-100">
            Lead Intelligence & Client Acquisition Agent for CGTSAI
          </p>
        </div>

        {/* Search Form */}
        <div className="p-8 border-b">
          <form onSubmit={runScout} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  # to Find
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Minimum Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Score
                </label>
                <input
                  type="number"
                  value={minimumScore}
                  onChange={(e) => setMinimumScore(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? "🔍 SCOUT Running..." : "▶ START SCOUT"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Results Summary */}
        {results && (
          <div className="m-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              ✅ SCOUT Complete
            </h3>
            <p className="text-green-700">
              Found <strong>{results.totalFound}</strong> businesses |
              Qualified <strong>{results.qualified}</strong> prospects |{" "}
              {results.summary}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-8 border-b">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Prospects</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{stats.new}</div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats.qualified}
            </div>
            <div className="text-sm text-gray-600">Qualified</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {stats.contacted}
            </div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.avgScore}
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>

        {/* Prospects List */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Pipeline</h2>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {["ALL", "NEW", "RESEARCHED", "QUALIFIED", "CONTACTED", "WON"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {/* Prospects Table */}
          {filteredProspects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Business
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Industry
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProspect(prospect)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-lg text-gray-900">
                          {prospect.lead_score}
                        </span>
                        <span className="text-gray-500">/100</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {prospect.business_name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {prospect.industry}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {prospect.city}, {prospect.state}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            prospect.status === "NEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : prospect.status === "QUALIFIED"
                              ? "bg-purple-100 text-purple-800"
                              : prospect.status === "CONTACTED"
                              ? "bg-blue-100 text-blue-800"
                              : prospect.status === "WON"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {prospect.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProspect(prospect);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No prospects yet. Run SCOUT to find leads!
            </div>
          )}
        </div>
      </div>

      {/* Prospect Detail Modal */}
      {selectedProspect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedProspect.business_name}
                </h2>
                <p className="text-blue-100">
                  {selectedProspect.contact_name} • {selectedProspect.city},{" "}
                  {selectedProspect.state}
                </p>
              </div>
              <button
                onClick={() => setSelectedProspect(null)}
                className="text-2xl hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Score & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedProspect.lead_score}/100
                  </div>
                  <div className="text-sm text-gray-600">Lead Score</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-bold text-purple-600">
                    {selectedProspect.status}
                  </div>
                  <select
                    value={selectedProspect.status}
                    onChange={(e) =>
                      updateProspectStatus(selectedProspect.id, e.target.value)
                    }
                    className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-lg"
                  >
                    <option value="NEW">NEW</option>
                    <option value="RESEARCHED">RESEARCHED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="APPOINTMENT_SET">APPOINTMENT_SET</option>
                    <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                    <option value="WON">WON</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-bold text-lg mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>{" "}
                    <a
                      href={`mailto:${selectedProspect.business_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedProspect.business_email}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone:</span>{" "}
                    {selectedProspect.business_phone}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Website:</span>{" "}
                    <a
                      href={selectedProspect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedProspect.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Problems & Services */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2">Problem Detected</h3>
                <p className="text-red-700">{selectedProspect.problem_detected}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">
                  Recommended Service
                </h3>
                <p className="text-green-700">
                  {selectedProspect.recommended_service}
                </p>
              </div>

              {/* Outreach Message */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Outreach Message</h3>
                <p className="text-blue-700 whitespace-pre-line">
                  {selectedProspect.outreach_message}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProspect.outreach_message);
                    alert("Copied to clipboard!");
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📋 Copy Message
                </button>
              </div>

              {/* Notes */}
              {selectedProspect.notes && (
                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <strong>Notes:</strong> {selectedProspect.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
