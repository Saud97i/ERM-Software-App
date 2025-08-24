import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {

	Activity,

	AlertTriangle,

	AlertCircle,

	ArrowRight,

	BarChart3,

	Building2,

	Calendar,

	Check,

	CheckCircle2,

	ClipboardList,

	Download,

	Eye,

	FileCheck,

	FileText,

	Filter,

	FolderTree,

	Grid3X3,

	Info,

	LogOut,

	Moon,

	PieChart,

	Play,

	Plus,

	Save,

	Settings,

	Shield,

	Sun,

	Thermometer,

	Trash2,

	Upload,

	Users,

	X,

} from "lucide-react";



// ============================================================================

// DESIGN SYSTEM - Typography, Colors, Spacing, and Accessibility Standards

// ============================================================================



/*

Typography Scale (consistent across the application):

- xs: 12px (captions, small labels)

- sm: 14px (body text, table content)

- base: 16px (default body)

- lg: 18px (section headers)

- xl: 20px (card titles)

- 2xl: 24px (page headers)

- 3xl: 32px (main page title)



Line Heights:

- Tight: 1.25 (headings)

- Normal: 1.5 (body text)

- Relaxed: 1.75 (long-form content)



Spacing Scale (4px base unit):

- 1: 4px

- 2: 8px

- 3: 12px

- 4: 16px

- 6: 24px

- 8: 32px

- 12: 48px

- 16: 64px



Color Palette (WCAG 2.1 AA compliant):

- Primary: Blue (slate-600, slate-700)

- Success: Green (emerald-600, emerald-700)

- Warning: Amber (amber-600, amber-700)

- Danger: Red (rose-600, rose-700)

- Neutral: Gray scale (slate-50 to slate-900)

- Background: White and light grays

- Text: Dark grays for readability



Accessibility:

- Focus rings: 2px solid with high contrast

- Hover states: Subtle color shifts

- Active states: Clear visual feedback

- Disabled states: Reduced opacity + visual cues



Print Styles:

- White background, black text

- Remove non-essential UI elements

- Page breaks before major sections

- Ensure tables don't overflow

- Include date/time stamps and page numbers

*/



// ============================================================================

// Types and constants

// ============================================================================

const STORAGE_KEY = "erm_tool_state_v5";

const ROLES = ["Admin", "Risk Champion", "Risk Owner", "Executive"];

const STATUS = ["Draft", "Under Review", "Approved", "Rejected"];

function id() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function nowISO() { return new Date().toISOString(); }

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function uniq(arr) { return Array.from(new Set(arr)); }



// -------------------- Persistence --------------------

function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); } catch { return null; } }

function saveState(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }



// -------------------- Initial demo data --------------------

const DEFAULT_DEPARTMENTS = [

	{ id: id(), name: "Marketing", description: "Markets products and manages brand and pricing comms.", processes: ["Pricing review", "Campaign planning", "Market research"], inherentRiskExamples: ["Brand damage from poor campaign", "Pricing misalignment", "Demand forecast error"], riskOwner: "marketing.owner@company.com", riskChampion: "marketing.champion@company.com" },

	{ id: id(), name: "Sales", description: "Manages customer pipeline and order booking.", processes: ["Key account mgmt", "Order booking", "Credit checks"], inherentRiskExamples: ["Customer default", "Forecast bias", "High dependency on single buyer"], riskOwner: "sales.owner@company.com", riskChampion: "sales.champion@company.com" },

	{ id: id(), name: "Operations", description: "Runs the plants and ensures stable throughput and quality.", processes: ["Production planning", "Maintenance", "Quality control"], inherentRiskExamples: ["Unplanned shutdown", "Asset failure", "Off spec production"], riskOwner: "operations.owner@company.com", riskChampion: "operations.champion@company.com" },

	{ id: id(), name: "Supply Chain", description: "Purchasing, logistics, shipping, and warehousing.", processes: ["Procurement", "Berth scheduling", "Shipping"], inherentRiskExamples: ["Berth unavailability", "Supplier failure", "Freight surge"], riskOwner: "supply.owner@company.com", riskChampion: "supply.champion@company.com" },

	{ id: id(), name: "Finance", description: "Cash, reporting, and controls.", processes: ["Cash mgmt", "Close and reporting", "Credit mgmt"], inherentRiskExamples: ["Liquidity squeeze", "FX exposure", "Revenue cut off errors"], riskOwner: "finance.owner@company.com", riskChampion: "finance.champion@company.com" },

	{ id: id(), name: "IT", description: "Applications and infrastructure support.", processes: ["Access control", "Change mgmt", "Backup and recovery"], inherentRiskExamples: ["Cyber incident", "Change failure", "Backup failure"], riskOwner: "it.owner@company.com", riskChampion: "it.champion@company.com" },

	{ id: id(), name: "HSE", description: "Health, safety, and environment oversight.", processes: ["Permit to work", "Incident mgmt", "Compliance audits"], inherentRiskExamples: ["Recordable incident", "Non compliance", "Pollution release"], riskOwner: "hse.owner@company.com", riskChampion: "hse.champion@company.com" },

];

const DEFAULT_CATEGORIES = [

	{ id: id(), name: "Market" },

	{ id: id(), name: "Operational" },

	{ id: id(), name: "Financial" },

	{ id: id(), name: "People" },

	{ id: id(), name: "HSE" },

	{ id: id(), name: "Cyber" },

	{ id: id(), name: "Compliance" },

	{ id: id(), name: "Project" },

];

// parentCategoryName used to map to initial ids

const DEFAULT_SUBCATS_SEED = [

	{ id: id(), name: "Demand", parentCategoryName: "Market" },

	{ id: id(), name: "Supply", parentCategoryName: "Market" },

	{ id: id(), name: "Competition", parentCategoryName: "Market" },

	{ id: id(), name: "Asset reliability", parentCategoryName: "Operational" },

	{ id: id(), name: "Maintenance", parentCategoryName: "Operational" },

	{ id: id(), name: "Credit", parentCategoryName: "Financial" },

	{ id: id(), name: "Liquidity", parentCategoryName: "Financial" },

	{ id: id(), name: "Talent", parentCategoryName: "People" },

	{ id: id(), name: "Safety", parentCategoryName: "HSE" },

	{ id: id(), name: "Environmental", parentCategoryName: "HSE" },

	{ id: id(), name: "Access mgmt", parentCategoryName: "Cyber" },

	{ id: id(), name: "Network", parentCategoryName: "Cyber" },

	{ id: id(), name: "Regulatory", parentCategoryName: "Compliance" },

	{ id: id(), name: "Execution", parentCategoryName: "Project" },

];

const initialConfig = {

	likelihoodLabels: ["Rare","Unlikely","Possible","Likely","Almost Certain"],

	impactLabels: ["Insignificant","Minor","Moderate","Major","Severe"],

	scoring: { method: "multiply", thresholds: { low: 5, medium: 12, mediumHigh: 16, high: 20, extreme: 25 } },

	appetite: 12, // residual score ≤ appetite is within appetite

	ui: { heatmapModeByUser: {} },

	hiddenTabs: ["topreport"],

	auth: {

		roleDepartments: { "Risk Champion": ["Marketing"], "Risk Owner": ["Operations"] },

		canApproveRoles: ["Admin", "Risk Champion"],

	},

};

const DEFAULT_USERS = [

	{ id: id(), name: "Admin", email: "admin@company.com", role: "Admin", departmentId: null },
	{ id: id(), name: "Omar Owner", email: "omar@co.com", role: "Risk Owner", departmentName: "Marketing" },
	{ id: id(), name: "Ali Owner", email: "ali@co.com", role: "Risk Owner", departmentName: "Operations" },
	{ id: id(), name: "Lina Champion", email: "lina@co.com", role: "Risk Champion", departmentName: "Marketing" },
	{ id: id(), name: "Mona Champion", email: "mona@co.com", role: "Risk Champion", departmentName: "Marketing" },
	{ id: id(), name: "Sara Champion", email: "sara@co.com", role: "Risk Champion", departmentName: "Operations" },
	{ id: id(), name: "Ahmed Team", email: "ahmed@co.com", role: "Team Member", departmentName: "Marketing" },
	{ id: id(), name: "Executive", email: "exec@co.com", role: "Executive", departmentId: null },
];

const demoRisks = [

	{

		id: id(),

		title: "Feed allocation uncertainty after growth project",

		descriptionCause: "Supplier contract constraint",

		descriptionEvent: "Reallocation request may be refused",

		descriptionConsequence: "Throughput reduction and margin erosion",

		worstCase: "3 months curtailed production, 8% EBIT impact",

		departmentId: null,

		department: "Operations",

		linkedProcesses: [],

		categoryId: null,

		category: "Operational",

		subcategoryId: null,

		subcategory: "Asset reliability",

		owner: "owner@company.com",

		champion: "champion@company.com",

		likelihood: 4,

		impact: 5,

		residualLikelihood: 3,

		residualImpact: 4,

		likelihoodNotes: "",

		impactNotes: "",

		residualLikelihoodNotes: "",

		residualImpactNotes: "",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Negotiate contract amendment", owner: "owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "In Progress" },

			{ id: id(), action: "Qualify alternate suppliers", owner: "champion@company.com", dueDate: new Date(Date.now()+1000*60*60*24*120).toISOString(), status: "Planned" },

		],

		businessInterruption: false,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),

		createdAt: nowISO(),

		createdBy: "owner@company.com",

		approvals: [ { at: nowISO(), by: "champion@company.com", action: "Approved", note: "Track monthly." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Cybersecurity breach through phishing attacks",

		descriptionCause: "Increasing sophistication of cyber threats",

		descriptionEvent: "Employee clicks malicious link or opens infected attachment",

		descriptionConsequence: "Data breach, system compromise, regulatory fines",

		worstCase: "Complete system shutdown, $2M in fines, customer data exposure",

		departmentId: null,

		department: "IT",

		linkedProcesses: [],

		categoryId: null,

		category: "Cyber",

		subcategoryId: null,

		subcategory: "Access mgmt",

		owner: "it.owner@company.com",

		champion: "it.champion@company.com",

		likelihood: 4,

		impact: 5,

		residualLikelihood: 2,

		residualImpact: 4,

		likelihoodNotes: "High frequency of phishing attempts",

		impactNotes: "Critical business systems and customer data at risk",

		residualLikelihoodNotes: "Enhanced email filtering and user training implemented",

		residualImpactNotes: "Data encryption and access controls in place",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Implement advanced email security", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*30).toISOString(), status: "Completed" },

			{ id: id(), action: "Conduct security awareness training", owner: "hr.manager@company.com", dueDate: new Date(Date.now()+1000*60*60*24*45).toISOString(), status: "In Progress" },

			{ id: id(), action: "Deploy endpoint detection and response", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Pending" },

		],

		businessInterruption: true,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),

		createdAt: nowISO(),

		createdBy: "it.owner@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Critical security risk - prioritize mitigation." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Supply chain disruption from key vendor failure",

		descriptionCause: "Single-source dependency on critical supplier",

		descriptionEvent: "Vendor goes bankrupt or fails to deliver",

		descriptionConsequence: "Production delays, customer order fulfillment issues",

		worstCase: "2-month production halt, $5M revenue loss, customer churn",

		departmentId: null,

		department: "Supply Chain",

		linkedProcesses: [],

		categoryId: null,

		category: "Operational",

		subcategoryId: null,

		subcategory: "Supply",

		owner: "supply.owner@company.com",

		champion: "supply.champion@company.com",

		likelihood: 3,

		impact: 5,

		residualLikelihood: 2,

		residualImpact: 4,

		likelihoodNotes: "Vendor financial instability indicators",

		impactNotes: "Critical component with no immediate alternatives",

		residualLikelihoodNotes: "Diversification program initiated",

		residualImpactNotes: "Safety stock increased, alternative suppliers identified",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Qualify alternate suppliers", owner: "supply.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "In Progress" },

			{ id: id(), action: "Build strategic inventory buffer", owner: "finance.director@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Pending" },

		],

		businessInterruption: true,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(),

		createdAt: nowISO(),

		createdBy: "supply.owner@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "High priority - critical business continuity risk." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Regulatory compliance failure in financial reporting",

		descriptionCause: "Complex regulatory requirements and tight deadlines",

		descriptionEvent: "Missed filing deadline or incorrect reporting",

		descriptionConsequence: "Regulatory fines, reputational damage, legal action",

		worstCase: "$1M in fines, executive liability, trading suspension",

		departmentId: null,

		department: "Finance",

		linkedProcesses: [],

		categoryId: null,

		category: "Compliance",

		subcategoryId: null,

		subcategory: "Regulatory",

		owner: "finance.director@company.com",

		champion: "finance.champion@company.com",

		likelihood: 2,

		impact: 5,

		residualLikelihood: 1,

		residualImpact: 4,

		likelihoodNotes: "New regulatory requirements effective next quarter",

		impactNotes: "Severe financial and legal consequences",

		residualLikelihoodNotes: "Enhanced controls and review processes implemented",

		residualImpactNotes: "Insurance coverage increased, legal review process established",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Implement automated compliance monitoring", owner: "finance.director@company.com", dueDate: new Date(Date.now()+1000*60*60*24*30).toISOString(), status: "Completed" },

			{ id: id(), action: "Establish regulatory change management process", owner: "legal.assistant@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "In Progress" },

		],

		businessInterruption: false,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),

		createdAt: nowISO(),

		createdBy: "finance.director@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Critical compliance risk - monitor closely." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Key personnel departure and knowledge loss",

		descriptionCause: "High employee turnover in critical roles",

		descriptionEvent: "Senior staff member leaves without proper knowledge transfer",

		descriptionConsequence: "Operational disruption, project delays, institutional knowledge loss",

		worstCase: "6-month project delay, $500K rework costs, customer dissatisfaction",

		departmentId: null,

		department: "Operations",

		linkedProcesses: [],

		categoryId: null,

		category: "People",

		subcategoryId: null,

		subcategory: "Talent",

		owner: "operations.owner@company.com",

		champion: "hr.manager@company.com",

		likelihood: 4,

		impact: 4,

		residualLikelihood: 3,

		residualImpact: 3,

		likelihoodNotes: "Competitive job market, limited career advancement",

		impactNotes: "Critical operational knowledge concentrated in few individuals",

		residualLikelihoodNotes: "Improved retention programs and career development",

		residualImpactNotes: "Knowledge documentation and cross-training programs",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Implement knowledge management system", owner: "operations.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*45).toISOString(), status: "In Progress" },

			{ id: id(), action: "Establish succession planning program", owner: "hr.manager@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Pending" },

		],

		businessInterruption: false,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(),

		createdAt: nowISO(),

		createdBy: "operations.owner@company.com",

		approvals: [ { at: nowISO(), by: "champion@company.com", action: "Approved", note: "Monitor retention metrics quarterly." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Environmental incident and regulatory violation",

		descriptionCause: "Aging environmental control systems and equipment",

		descriptionEvent: "Equipment failure leads to environmental release",

		descriptionConsequence: "Regulatory fines, cleanup costs, reputational damage",

		worstCase: "$2M in fines, operational shutdown, community relations damage",

		departmentId: null,

		department: "HSE",

		linkedProcesses: [],

		categoryId: null,

		category: "HSE",

		subcategoryId: null,

		subcategory: "Environmental",

		owner: "hse.owner@company.com",

		champion: "hse.champion@company.com",

		likelihood: 3,

		impact: 5,

		residualLikelihood: 2,

		residualImpact: 4,

		likelihoodNotes: "Equipment approaching end of life",

		impactNotes: "Severe environmental and regulatory consequences",

		residualLikelihoodNotes: "Preventive maintenance program enhanced",

		residualImpactNotes: "Emergency response procedures updated, insurance increased",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Replace aging environmental controls", owner: "hse.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*180).toISOString(), status: "In Progress" },

			{ id: id(), action: "Enhance monitoring and alerting systems", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Pending" },

		],

		businessInterruption: true,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),

		createdAt: nowISO(),

		createdBy: "hse.owner@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Critical environmental risk - prioritize mitigation." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Market demand decline and revenue impact",

		descriptionCause: "Economic downturn and changing customer preferences",

		descriptionEvent: "Significant reduction in customer orders and market demand",

		descriptionConsequence: "Revenue decline, excess inventory, workforce reduction",

		worstCase: "30% revenue decline, $10M inventory write-down, 20% workforce reduction",

		departmentId: null,

		department: "Sales",

		linkedProcesses: [],

		categoryId: null,

		category: "Market",

		subcategoryId: null,

		subcategory: "Demand",

		owner: "sales.owner@company.com",

		champion: "sales.champion@company.com",

		likelihood: 3,

		impact: 4,

		residualLikelihood: 2,

		residualImpact: 3,

		likelihoodNotes: "Economic indicators showing slowdown",

		impactNotes: "Significant revenue and profitability impact",

		residualLikelihoodNotes: "Diversification into new markets and products",

		residualImpactNotes: "Cost reduction programs and flexible workforce strategies",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Develop new market entry strategy", owner: "sales.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "In Progress" },

			{ id: id(), action: "Implement cost optimization program", owner: "finance.director@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "Pending" },

		],

		businessInterruption: false,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),

		createdAt: nowISO(),

		createdBy: "sales.owner@company.com",

		approvals: [ { at: nowISO(), by: "champion@company.com", action: "Approved", note: "Monitor economic indicators monthly." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "IT system failure and business continuity disruption",

		descriptionCause: "Aging infrastructure and insufficient redundancy",

		descriptionEvent: "Critical system outage affecting multiple business functions",

		descriptionConsequence: "Operational disruption, customer service impact, revenue loss",

		worstCase: "24-hour system outage, $1M daily revenue loss, customer service failure",

		departmentId: null,

		department: "IT",

		linkedProcesses: [],

		categoryId: null,

		category: "Operational",

		subcategoryId: null,

		subcategory: "Asset reliability",

		owner: "it.owner@company.com",

		champion: "it.champion@company.com",

		likelihood: 3,

		impact: 4,

		residualLikelihood: 2,

		residualImpact: 3,

		likelihoodNotes: "Infrastructure approaching end of life",

		impactNotes: "Critical business systems affected",

		residualLikelihoodNotes: "Enhanced monitoring and preventive maintenance",

		residualImpactNotes: "Improved backup systems and disaster recovery",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Upgrade critical infrastructure", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*120).toISOString(), status: "In Progress" },

			{ id: id(), action: "Implement redundant systems", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*180).toISOString(), status: "Pending" },

		],

		businessInterruption: true,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 240).toISOString(),

		createdAt: nowISO(),

		createdBy: "it.owner@company.com",

		approvals: [ { at: nowISO(), by: "champion@company.com", action: "Approved", note: "Monitor system performance weekly." } ],

		incidents: [],

	},



	{

		id: id(),

		title: "Contract dispute and legal exposure",

		descriptionCause: "Ambiguous contract terms and changing business requirements",

		descriptionEvent: "Contract interpretation dispute leads to legal action",

		descriptionConsequence: "Legal costs, project delays, relationship damage",

		worstCase: "$500K legal costs, 6-month project delay, partnership termination",

		departmentId: null,

		department: "Legal",

		linkedProcesses: [],

		categoryId: null,

		category: "Compliance",

		subcategoryId: null,

		subcategory: "Regulatory",

		owner: "general.counsel@company.com",

		champion: "legal.assistant@company.com",

		likelihood: 2,

		impact: 4,

		residualLikelihood: 1,

		residualImpact: 3,

		likelihoodNotes: "Complex contract with multiple stakeholders",

		impactNotes: "Significant legal and financial exposure",

		residualLikelihoodNotes: "Enhanced contract review and approval process",

		residualImpactNotes: "Improved dispute resolution procedures and insurance",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Establish contract review checklist", owner: "general.counsel@company.com", dueDate: new Date(Date.now()+1000*60*60*24*30).toISOString(), status: "Completed" },

			{ id: id(), action: "Implement contract management system", owner: "legal.assistant@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "In Progress" },

		],

		businessInterruption: false,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),

		createdAt: nowISO(),

		createdBy: "general.counsel@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Monitor contract performance quarterly." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Data privacy breach and GDPR violation",

		descriptionCause: "Inadequate data protection measures and employee training",

		descriptionEvent: "Unauthorized access to customer personal data",

		descriptionConsequence: "Regulatory fines, customer trust loss, legal action",

		worstCase: "€20M GDPR fine, 4% annual revenue penalty, customer exodus",

		departmentId: null,

		department: "IT",

		linkedProcesses: [],

		categoryId: null,

		category: "Cyber",

		subcategoryId: null,

		subcategory: "Access mgmt",

		owner: "it.owner@company.com",

		champion: "it.champion@company.com",

		likelihood: 3,

		impact: 5,

		residualLikelihood: 2,

		residualImpact: 4,

		likelihoodNotes: "Increasing cyber threats and regulatory scrutiny",

		impactNotes: "Severe financial and reputational consequences",

		residualLikelihoodNotes: "Enhanced data protection controls implemented",

		residualImpactNotes: "Privacy by design principles and regular audits",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Implement data classification system", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*30).toISOString(), status: "Completed" },

			{ id: id(), action: "Conduct privacy impact assessments", owner: "legal.assistant@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "In Progress" },

			{ id: id(), action: "Deploy data loss prevention tools", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Pending" },

		],

		businessInterruption: false,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(),

		createdAt: nowISO(),

		createdBy: "it.owner@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Critical compliance risk - monitor closely." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Natural disaster and facility damage",

		descriptionCause: "Geographic location in high-risk natural disaster zone",

		descriptionEvent: "Earthquake, flood, or hurricane damages critical facilities",

		descriptionConsequence: "Operational shutdown, asset damage, business interruption",

		worstCase: "3-month facility shutdown, $15M asset damage, 50% revenue loss",

		departmentId: null,

		department: "Operations",

		linkedProcesses: [],

		categoryId: null,

		category: "Operational",

		subcategoryId: null,

		subcategory: "Asset reliability",

		owner: "operations.owner@company.com",

		champion: "operations.champion@company.com",

		likelihood: 2,

		impact: 5,

		residualLikelihood: 1,

		residualImpact: 4,

		likelihoodNotes: "Located in seismic zone with flood risk",

		impactNotes: "Critical infrastructure and production facilities at risk",

		residualLikelihoodNotes: "Enhanced building codes and disaster preparedness",

		residualImpactNotes: "Business continuity planning and insurance coverage",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Strengthen facility infrastructure", owner: "operations.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*180).toISOString(), status: "In Progress" },

			{ id: id(), action: "Establish disaster recovery procedures", owner: "operations.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "Completed" },

			{ id: id(), action: "Implement remote work capabilities", owner: "it.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*120).toISOString(), status: "Pending" },

		],

		businessInterruption: true,

		topRisk: true,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),

		createdAt: nowISO(),

		createdBy: "operations.owner@company.com",

		approvals: [ { at: nowISO(), by: "admin@company.com", action: "Approved", note: "Critical business continuity risk." } ],

		incidents: [],

	},

	{

		id: id(),

		title: "Product quality failure and recall",

		descriptionCause: "Manufacturing process variability and quality control gaps",

		descriptionEvent: "Product defect leads to safety issue or customer complaints",

		descriptionConsequence: "Product recall, customer loss, regulatory action",

		worstCase: "Full product recall, $8M costs, regulatory investigation",

		departmentId: null,

		department: "Operations",

		linkedProcesses: [],

		categoryId: null,

		category: "Operational",

		subcategoryId: null,

		subcategory: "Quality control",

		owner: "operations.owner@company.com",

		champion: "quality.lead@company.com",

		likelihood: 3,

		impact: 4,

		residualLikelihood: 2,

		residualImpact: 3,

		likelihoodNotes: "Complex manufacturing processes with multiple variables",

		impactNotes: "Significant financial and reputational impact",

		residualLikelihoodNotes: "Enhanced quality control systems implemented",

		residualImpactNotes: "Improved testing protocols and customer feedback",

		status: "Approved",

		mitigationActions: [

			{ id: id(), action: "Implement statistical process control", owner: "operations.owner@company.com", dueDate: new Date(Date.now()+1000*60*60*24*60).toISOString(), status: "Completed" },

			{ id: id(), action: "Establish quality management system", owner: "quality.lead@company.com", dueDate: new Date(Date.now()+1000*60*60*24*90).toISOString(), status: "In Progress" },

		],

		businessInterruption: false,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),

		createdAt: nowISO(),

		createdBy: "operations.owner@company.com",

		approvals: [ { at: nowISO(), by: "champion@company.com", action: "Approved", note: "Monitor quality metrics monthly." } ],

		incidents: [],

	},

];



// -------------------- ERM Awareness Default State --------------------

const defaultAwareness = {

	overview: {

		heroTitle: "Enterprise Risk Management (ERM) — ISO 31000",

		heroSubtitle: "Managing uncertainty to protect value and enable performance.",

		mapping: [

			{ id: id(), tool: "Risk Register", iso31000: "Recording & Reporting", note: "Single source of risk truth.", icon: "ClipboardList" },

			{ id: id(), tool: "Heatmap", iso31000: "Risk Analysis & Evaluation", note: "Visualizes likelihood × impact & appetite.", icon: "Grid3X3" },

			{ id: id(), tool: "Actions", iso31000: "Risk Treatment", note: "Mitigation plans with owners, due dates, status.", icon: "CheckCircle2" },

			{ id: id(), tool: "Workflow", iso31000: "Communication & Consultation", note: "Approvals & status transitions.", icon: "ArrowRight" },

			{ id: id(), tool: "Administration", iso31000: "Scope, Context & Criteria", note: "Scales, thresholds, appetite, taxonomy, roles.", icon: "Settings" }

		]

	},

	procedure: [

		{ id: id(), title: "Purpose & Scope", body: "This procedure establishes the framework for identifying, assessing, treating, monitoring, and reporting risks across the organization in alignment with ISO 31000:2018 standards." },

		{ id: id(), title: "Scope, Context & Criteria", body: "Risk assessment covers all business activities, processes, and projects. Risk criteria include likelihood and impact scales, risk appetite thresholds, and categorization frameworks." },

		{ id: id(), title: "Risk Assessment", body: "Risks are identified through structured analysis of processes, external factors, and stakeholder input. Analysis evaluates likelihood and impact using defined scales. Evaluation compares results against risk criteria and appetite." },

		{ id: id(), title: "Treatment & Actions", body: "Risk treatment plans specify mitigation actions, responsible owners, due dates, and success criteria. Actions are tracked through completion with regular status updates." },

		{ id: id(), title: "Monitoring & Review", body: "Risk status and treatment progress are monitored monthly. Formal reviews occur quarterly with annual comprehensive risk assessment updates." },

		{ id: id(), title: "Recording & Reporting", body: "All risk assessments, treatments, and reviews are documented in the risk register. Regular reports are provided to management and stakeholders." },

		{ id: id(), title: "Roles & Responsibilities", body: "Board provides oversight and approves risk appetite. Executives ensure risk management integration. Risk Champions coordinate departmental risk activities. Risk Owners implement treatments and monitor risks." }

	],

	modules: [

		{ 

			id: id(), 

			title: "ERM Basics (ISO 31000)", 

			summary: "Principles, framework, and process essentials.", 

			minutes: 5,

			quiz: [

				{ id: id(), q: "Which set is ISO 31000 core?", a: ["Principles, Framework, Process", "Controls, Audits, Risks"], correct: 0 },

				{ id: id(), q: "Heatmap supports mainly…", a: ["Risk Identification", "Risk Analysis & Evaluation", "Risk Treatment"], correct: 1 },

				{ id: id(), q: "Risk appetite defines…", a: ["Maximum acceptable risk level", "Minimum risk threshold", "Average risk score"], correct: 0 }

			], 

			passScore: 2 

		},

		{ 

			id: id(), 

			title: "Inherent vs Residual Risk", 

			summary: "Before vs after controls/mitigations.", 

			minutes: 4,

			quiz: [

				{ id: id(), q: "Inherent risk is assessed…", a: ["After controls", "Before controls"], correct: 1 },

				{ id: id(), q: "Residual risk reflects…", a: ["Post-treatment exposure", "Budget variance"], correct: 0 },

				{ id: id(), q: "Controls reduce risk by…", a: ["Eliminating likelihood", "Reducing likelihood or impact", "Increasing impact"], correct: 1 }

			], 

			passScore: 2 

		},

		{ 

			id: id(), 

			title: "Risk Appetite & Criteria", 

			summary: "Understanding risk thresholds and evaluation.", 

			minutes: 3,

			quiz: [

				{ id: id(), q: "Risk appetite is…", a: ["Amount of risk willing to accept", "Total number of risks", "Risk assessment method"], correct: 0 },

				{ id: id(), q: "Green zone in heatmap means…", a: ["Risk within appetite", "Risk above appetite", "Risk below threshold"], correct: 0 }

			], 

			passScore: 1 

		}

	],

	completions: [], // {userEmail, moduleId, score, passed, on, note?}

	settings: { showOverviewFirst: true, requirePassBeforeAcknowledge: true },

	auditTrail: [] // {id, at, by, action, details}

};



const demoIncidents = [

	{ id: id(), department: "Operations", date: new Date(Date.now()-1000*60*60*24*30).toISOString(), severity: "Moderate", summary: "Unexpected pipeline maintenance caused 12 hour delay.", linkedRiskId: null },

	{ id: id(), department: "IT", date: new Date(Date.now()-1000*60*60*24*15).toISOString(), severity: "High", summary: "Email server outage affecting 500+ users for 4 hours.", linkedRiskId: null },

	{ id: id(), department: "HSE", date: new Date(Date.now()-1000*60*60*24*7).toISOString(), severity: "Low", summary: "Minor chemical spill in laboratory, contained within 30 minutes.", linkedRiskId: null },

	{ id: id(), department: "Finance", date: new Date(Date.now()-1000*60*60*24*45).toISOString(), severity: "Moderate", summary: "Payment processing delay affecting 50 vendor payments.", linkedRiskId: null },

	{ id: id(), department: "Supply Chain", date: new Date(Date.now()-1000*60*60*24*60).toISOString(), severity: "High", summary: "Critical supplier delivery failure causing 3-day production delay.", linkedRiskId: null },

	{ id: id(), department: "IT", date: new Date(Date.now()-1000*60*60*24*3).toISOString(), severity: "High", summary: "Ransomware attack affecting 200 workstations, data encrypted.", linkedRiskId: null },

	{ id: id(), department: "Operations", date: new Date(Date.now()-1000*60*60*24*90).toISOString(), severity: "Moderate", summary: "Equipment failure in production line causing 8-hour shutdown.", linkedRiskId: null },

	{ id: id(), department: "HSE", date: new Date(Date.now()-1000*60*60*24*120).toISOString(), severity: "High", summary: "Workplace injury requiring hospitalization and investigation.", linkedRiskId: null },

];



// Generate additional demo risks for a livelier dashboard

function generateDemoRisks(count = 50) {

    const deptNames = DEFAULT_DEPARTMENTS.map(d => d.name);

    const deptMetaByName = Object.fromEntries(DEFAULT_DEPARTMENTS.map(d => [d.name, d]));

    const catNames = DEFAULT_CATEGORIES.map(c => c.name);

    const subcatsByCat = DEFAULT_SUBCATS_SEED.reduce((m, s) => {

        (m[s.parentCategoryName] ||= []).push(s.name);

        return m;

    }, {});

    const statuses = ["Approved", "Submitted", "Rejected", "Under Review"];

    const actionStatuses = ["Completed", "In Progress", "Pending", "Overdue"]; 



    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function rint(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function future(daysMin, daysMax) { return new Date(Date.now() + rint(daysMin, daysMax) * 86400000).toISOString(); }



    const items = [];

    for (let n = 0; n < count; n++) {

        const dept = pick(deptNames);

        const cat = pick(catNames);

        const sub = pick(subcatsByCat[cat] || ["General"]);

        const L = rint(1, 5);

        const I = rint(1, 5);

        const RL = rint(1, 5);

        const RI = rint(1, 5);

        const top = Math.random() < 0.18; // ~18% flagged top risk

        const bi = Math.random() < 0.25;  // ~25% BI

        const ownerEmail = deptMetaByName[dept]?.riskOwner || "owner@company.com";

        const champEmail = deptMetaByName[dept]?.riskChampion || "champion@company.com";

        const actionsCount = rint(0, 3);

        const actions = Array.from({ length: actionsCount }).map(() => ({

            id: id(),

            action: `${pick(["Review", "Mitigate", "Assess", "Monitor", "Improve"]) } ${pick(["controls", "supplier", "process", "training", "SLA"]) }`,

            owner: pick([ownerEmail, champEmail, "admin@company.com"]),

            dueDate: future(14, 120),

            status: pick(actionStatuses)

        }));



        items.push({

            id: id(),

            title: `${pick(["Potential", "Emerging", "Key", "Recurring"]) } risk in ${dept}: ${cat} / ${sub}`,

            descriptionCause: pick(["Process gap", "External dependency", "Aging asset", "Budget constraint", "Skill shortage"]),

            descriptionEvent: pick(["Failure occurs", "Disruption happens", "Non-compliance detected", "Delay accumulates", "Incident triggered"]),

            descriptionConsequence: pick(["Operational delay", "Financial impact", "Customer dissatisfaction", "Regulatory exposure", "Rework costs"]),

            worstCase: `${rint(1, 6)} month impact, ${rint(1, 10)}% EBIT at risk`,

            department: dept,

            category: cat,

            subcategory: sub,

            owner: ownerEmail,

            champion: champEmail,

            likelihood: L,

            impact: I,

            residualLikelihood: RL,

            residualImpact: RI,

            status: pick(statuses),

            mitigationActions: actions,

            businessInterruption: bi,

            topRisk: top,

            dueDate: future(30, 200),

            createdAt: new Date(Date.now() - rint(0, 120) * 86400000).toISOString(),

            createdBy: ownerEmail,

            approvals: top ? [{ at: new Date().toISOString(), by: "admin@company.com", action: "Approved", note: "Auto-approved for demo" }] : [] ,

            incidents: []

        });

    }

    return items;

}



// -------------------- Helpers --------------------

function scoreOf(l, i) { return l * i; }

function riskLevel(score, t) {

	if (score <= t.low) return { label: "Low", tone: "bg-emerald-100 text-emerald-800" };

	if (score <= t.medium) return { label: "Medium", tone: "bg-yellow-100 text-yellow-800" };

	if (score <= t.mediumHigh) return { label: "Medium High", tone: "bg-amber-100 text-amber-800" };

	if (score <= t.high) return { label: "High", tone: "bg-orange-100 text-orange-800" };

	return { label: "Extreme", tone: "bg-red-100 text-red-800" };

}

function prettyDate(iso) { try { return new Date(iso).toLocaleDateString(); } catch { return iso; } }

function descSummary(r) { return [r.descriptionCause, r.descriptionEvent, r.descriptionConsequence].filter(Boolean).join(" → ") || ""; }

function padToFive(pipeText) { const parts = pipeText.split("|").map(s=>s.trim()).filter(Boolean); while (parts.length < 5) parts.push(""); return parts.slice(0,5); }

function canEditDept(currentUser) { return currentUser.role === "Admin" || currentUser.role === "Risk Owner"; }

// -------------------- Main App --------------------

export default function ERMTool() {

	const loaded = loadState();

	const [users, setUsers] = useState(loaded?.users || DEFAULT_USERS);

	const [currentUserId, setCurrentUserId] = useState(loaded?.currentUserId || users[0].id);

	const currentUser = users.find((u) => u.id === currentUserId) || users[0];



	const [departments, setDepartments] = useState(loaded?.departments || DEFAULT_DEPARTMENTS);

	const [categories, setCategories] = useState(loaded?.categories || DEFAULT_CATEGORIES);

	const [subcategories, setSubcategories] = useState(

		loaded?.subcategories || DEFAULT_SUBCATS_SEED.map(s => {

			const parent = DEFAULT_CATEGORIES.find(c => c.name === s.parentCategoryName);

			return { id: s.id, name: s.name, parentCategoryId: parent?.id || DEFAULT_CATEGORIES[0].id };

		})

	);



	// config migrate: ensure mediumHigh exists and seed new keys

	const fixedConfig = (() => {

		const c = loaded?.config || initialConfig;

		const th = c.scoring?.thresholds || initialConfig.scoring.thresholds;

		return {

			...c,

			scoring: { ...c.scoring, thresholds: { low: th.low ?? 5, medium: th.medium ?? 12, mediumHigh: th.mediumHigh ?? 16, high: th.high ?? 20, extreme: th.extreme ?? 25 } },

			appetite: c.appetite ?? 12,

			ui: c.ui || { heatmapModeByUser: {} },

			hiddenTabs: Array.isArray(c.hiddenTabs) ? c.hiddenTabs : (initialConfig.hiddenTabs || []),

			auth: c.auth || initialConfig.auth,

		};

	})();



	const [config, setConfig] = useState(fixedConfig);

	const [risks, setRisks] = useState(() => {

		const seeded = loaded?.risks || demoRisks;

		if (seeded.length < 50) {

			return [...seeded, ...generateDemoRisks(50 - seeded.length)];

		}

		return seeded;

	});

	const [incidents, setIncidents] = useState(loaded?.incidents || demoIncidents);

	const [deptSuggestions, setDeptSuggestions] = useState(loaded?.deptSuggestions || []);

	const [audit, setAudit] = useState(loaded?.audit || []);

	const [awareness, setAwareness] = useState(loaded?.awareness || defaultAwareness);

	const [riskReportOpen, setRiskReportOpen] = useState(false);

	const [selectedRisk, setSelectedRisk] = useState(null);

	const [deptEditMode, setDeptEditMode] = useState(false);

	const [deptEditDialog, setDeptEditDialog] = useState({ open: false, dept: null });

	

	// Dark mode state with localStorage persistence

	const [darkMode, setDarkMode] = useState(() => {

		const saved = localStorage.getItem('erm_dark_mode');

		return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;

	});



	useEffect(() => { saveState({ users, currentUserId, departments, categories, subcategories, config, risks, incidents, deptSuggestions, audit, awareness }); }, [users, currentUserId, departments, categories, subcategories, config, risks, incidents, deptSuggestions, audit, awareness]);

	

	// Dark mode effect

	useEffect(() => {

		localStorage.setItem('erm_dark_mode', JSON.stringify(darkMode));

		if (darkMode) {

			document.documentElement.classList.add('dark');

		} else {

			document.documentElement.classList.remove('dark');

		}

	}, [darkMode]);



	function logAudit(type, details) {

		const entry = { id: id(), at: nowISO(), actor: currentUser?.email || "unknown", type, details };

		setAudit(prev => [entry, ...prev].slice(0, 500));

	}



	function onAudit(by, action, details) {

		const entry = { id: id(), at: nowISO(), by, action, details };

		setAwareness(prev => ({

			...prev,

			auditTrail: [entry, ...prev.auditTrail].slice(0, 100)

		}));

	}



	// Handle View/Edit risk events

	useEffect(() => {

		function handleViewRisk(event) {

			const riskId = event.detail.riskId;

			const risk = risks.find(r => r.id === riskId);

			if (risk) {

				setSelectedRisk(risk);

				setRiskReportOpen(true);

			}

		}

		

		function handleEditRisk(event) {

			const riskId = event.detail.riskId;

			// This will be handled by the existing RiskDialog components

			console.log("Edit risk:", riskId);

		}

		

		window.addEventListener("erm:viewRisk", handleViewRisk);

		window.addEventListener("erm:editRisk", handleEditRisk);

		

		return () => {

			window.removeEventListener("erm:viewRisk", handleViewRisk);

			window.removeEventListener("erm:editRisk", handleEditRisk);

		};

	}, [risks]);



	const [tab, setTab] = useState("dashboard");

	// Allow TopBar "Settings" button to navigate to Administration tab
	useEffect(() => {
		function handleGotoAdmin() {
			setTab("admin");
		}
		window.addEventListener("erm:gotoAdmin", handleGotoAdmin);
		return () => window.removeEventListener("erm:gotoAdmin", handleGotoAdmin);
	}, []);

	const [showNewRisk, setShowNewRisk] = useState(false);

	const [showNewIncident, setShowNewIncident] = useState(false);



	function addRisk(risk) {

		setRisks(prev => [...prev, risk]);

		logAudit("CREATE_RISK", { riskId: risk.id, title: risk.title, department: risk.department });

	}

	

	function updateRisk(riskId, updates) {

		const oldRisk = risks.find(r => r.id === riskId);

		setRisks(prev => prev.map(r => r.id === riskId ? { ...r, ...updates } : r));

		logAudit("UPDATE_RISK", { riskId, oldTitle: oldRisk?.title, newTitle: updates.title, changes: updates });

	}

	

	function deleteRisk(riskId) {

		const risk = risks.find(r => r.id === riskId);

		setRisks(prev => prev.filter(r => r.id !== riskId));

		logAudit("DELETE_RISK", { riskId, title: risk?.title, department: risk?.department });

	}



	function updateAction(actionId, updates) {

		setRisks(prev => prev.map(r => {

			if (!r.mitigationActions) return r;

			const updatedActions = r.mitigationActions.map(a => a.id === actionId ? { ...a, ...updates } : a);

			return { ...r, mitigationActions: updatedActions };

		}));

		logAudit("UPDATE_ACTION", { actionId, updates });

	}

	const isExecutive = (users.find(u=>u.id===currentUserId)?.role||"Executive") === "Executive";

	return (

		<div className={`min-h-screen w-full font-sans antialiased transition-colors duration-300 ${

			darkMode 

				? 'bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100' 

				: 'bg-gradient-to-b from-slate-50 to-white text-slate-900'

		}`}>

			<TopBar 

				users={users} 

				currentUserId={currentUserId} 

				onUserChange={setCurrentUserId} 

				currentRole={users.find(u=>u.id===currentUserId)?.role || "Executive"} 

				onLogout={() => setCurrentUserId(users[3].id)}

				darkMode={darkMode}

				onDarkModeToggle={() => setDarkMode(!darkMode)}

			/>

			<main className="mx-auto max-w-7xl px-6 py-8 space-y-8">

				<Tabs value={tab} onValueChange={setTab}>

					<div className="flex flex-wrap items-center justify-between gap-6 mb-8">

											<TabsList className={`flex flex-wrap h-auto border shadow-sm transition-colors duration-300 ${

						darkMode 

							? 'bg-slate-800 border-slate-700' 

							: 'bg-white border-slate-200'

					}`}>

						{!config.hiddenTabs?.includes("dashboard") && 						<TabsTrigger value="dashboard" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Dashboard</TabsTrigger>}

						{!config.hiddenTabs?.includes("register") && <TabsTrigger value="register" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Risk Register</TabsTrigger>}

						{!config.hiddenTabs?.includes("actions") && <TabsTrigger value="actions" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Actions</TabsTrigger>}

						{!config.hiddenTabs?.includes("deptkb") && <TabsTrigger value="deptkb" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Department Knowledge</TabsTrigger>}

						{(users.find(u=>u.id===currentUserId)?.role === "Admin" || users.find(u=>u.id===currentUserId)?.role === "Risk Champion") && !config.hiddenTabs?.includes("topreport") && (

							<TabsTrigger value="topreport" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

								darkMode 

									? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

									: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

							}`}>Top Risks Report</TabsTrigger>

						)}

						{!isExecutive && !config.hiddenTabs?.includes("incidents") && <TabsTrigger value="incidents" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Incidents</TabsTrigger>}

						{!isExecutive && !config.hiddenTabs?.includes("workflow") && <TabsTrigger value="workflow" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Workflow</TabsTrigger>}

						<TabsTrigger value="awareness" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>

							<Shield className="h-4 w-4 mr-2" />

							ERM Awareness

						</TabsTrigger>

													{users.find(u=>u.id===currentUserId)?.role === "Admin" && !config.hiddenTabs?.includes("admin") && <TabsTrigger value="admin" className={`tab-enhanced px-6 py-3 text-base font-semibold transition-all duration-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${

							darkMode 

								? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-800 hover:scale-105' 

								: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:bg-slate-50 hover:scale-105'

						}`}>Administration</TabsTrigger>}

					</TabsList>

					<div className="flex items-center gap-2">

						<Button variant="outline" size="sm" onClick={() => {

							const data = { risks, incidents, exportedAt: new Date().toISOString() };

							const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

							const url = URL.createObjectURL(blob);

							const a = document.createElement('a');

							a.href = url;

							a.download = `erm_data_${new Date().toISOString().slice(0, 10)}.json`;

							document.body.appendChild(a);

							a.click();

							document.body.removeChild(a);

							URL.revokeObjectURL(url);

						}} className={`transition-colors duration-300 ${

							darkMode 

								? 'border-slate-600 hover:bg-slate-700 text-slate-300' 

								: 'border-slate-200 hover:bg-slate-50 text-slate-700'

						}`}>

							<Download className="h-4 w-4 mr-2" />

							Export

						</Button>

					</div>

				</div>



					<TabsContent value="dashboard">

						<Dashboard risks={risks} incidents={incidents} config={config} setConfig={setConfig} departments={departments} categories={categories} subcategories={subcategories} addRisk={addRisk} currentUser={currentUser} darkMode={darkMode} />

					</TabsContent>



					<TabsContent value="register">

						<RiskRegister 

							risks={risks} 

							setRisks={setRisks} 

							config={config} 

							departments={departments} 

							categories={categories} 

							subcategories={subcategories} 

							currentUser={currentUser}

							setSelectedRisk={setSelectedRisk}

							setRiskReportOpen={setRiskReportOpen}

							addRisk={addRisk}

							updateRisk={updateRisk}

							deleteRisk={deleteRisk}

							updateAction={updateAction}

							descSummary={descSummary}

							riskLevel={riskLevel}

							darkMode={darkMode}

						/>

					</TabsContent>



					<TabsContent value="actions">

						<ActionsBoard risks={risks} setRisks={setRisks} darkMode={darkMode} />

					</TabsContent>



					<TabsContent value="deptkb">

						<DepartmentKnowledge departments={departments} setDepartments={setDepartments} currentUser={currentUser} suggestions={deptSuggestions} setSuggestions={setDeptSuggestions} darkMode={darkMode} />

					</TabsContent>



					{(currentUser.role === "Admin" || currentUser.role === "Risk Champion") && (

						<TabsContent value="topreport">

							<TopRisksReport risks={risks} config={config} />

						</TabsContent>

					)}



					{!isExecutive && (

						<TabsContent value="incidents">

							<Incidents incidents={incidents} setIncidents={setIncidents} departments={departments.map(d=>d.name)} risks={risks} setRisks={setRisks} darkMode={darkMode} />

						</TabsContent>

					)}



					{!isExecutive && (

						<TabsContent value="workflow">

							<Workflow risks={risks} setRisks={setRisks} currentUser={currentUser} config={config} darkMode={darkMode} />

						</TabsContent>

					)}



					<TabsContent value="awareness">

						<ERMAwareness awareness={awareness} setAwareness={setAwareness} currentUser={currentUser} onAudit={onAudit} darkMode={darkMode} />

					</TabsContent>



					{users.find(u=>u.id===currentUserId)?.role === "Admin" && (

						<TabsContent value="admin">

							<Administration 

								config={config} 

								setConfig={setConfig} 

								users={users} 

								setUsers={setUsers} 

								departments={departments} 

								setDepartments={setDepartments} 

								categories={categories} 

								setCategories={setCategories} 

								subcategories={subcategories} 

								setSubcategories={setSubcategories} 

								audit={audit}

								risks={risks}

								setRisks={setRisks}

								logAudit={logAudit}

								darkMode={darkMode}

							/>

						</TabsContent>

					)}

				</Tabs>

			</main>

			

			{/* Risk Report Drawer */}

			<RiskReportDrawer 

				risk={selectedRisk}

				open={riskReportOpen}

				onOpenChange={setRiskReportOpen}

				config={config}

				audit={audit}

			/>

		</div>

	);

}



// -------------------- Top Bar --------------------

function TopBar({ users, currentUserId, onUserChange, currentRole, onLogout, darkMode, onDarkModeToggle }) {

	return (

		<header className={`sticky top-0 z-20 w-full border-b backdrop-blur-sm shadow-sm transition-colors duration-300 ${

			darkMode 

				? 'border-slate-700 bg-slate-800/95' 

				: 'border-slate-200 bg-white/95'

		}`}>

			<div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">

				<div className="flex items-center gap-3">

					<Shield className={`h-7 w-7 transition-colors duration-300 ${

						darkMode ? 'text-slate-300' : 'text-slate-700'

					}`} />

					<h1 className={`text-xl font-semibold tracking-tight transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>ERM Tool</h1>

				</div>

				<div className="ml-auto flex items-center gap-3">

					{/* Dark Mode Toggle Button - International Standards Compliant */}

					<Button

						variant="outline"

						size="sm"

						onClick={onDarkModeToggle}

						className="h-10 w-10 p-0 border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 transition-all duration-200"

						aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}

						title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}

					>

						{darkMode ? (

							<Sun className="h-4 w-4 text-amber-600" />

						) : (

							<Moon className="h-4 w-4 text-slate-600" />

						)}

					</Button>

					

					{(() => {

						let canImpersonate = false

						try {

							const raw = localStorage.getItem('erm_auth_user')

							if (raw) {

								const auth = JSON.parse(raw)

								canImpersonate = auth?.role === 'Admin'

							}

						} catch {}

						return canImpersonate ? (

							<Select value={currentUserId} onValueChange={onUserChange}>

								<SelectTrigger className={`w-[240px] h-10 border focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-300 ${

									darkMode 

										? 'bg-slate-700 border-slate-600 text-slate-100' 

										: 'bg-white border-slate-200 text-slate-900'

								}` }>

									<SelectValue placeholder="Select user" />

								</SelectTrigger>

								<SelectContent>

									{users.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name} - {u.role}</SelectItem>))}

								</SelectContent>

							</Select>

						) : null

					})()}

					<Badge variant="secondary" className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors duration-300 ${

						darkMode 

							? 'bg-slate-700 text-slate-300 border-slate-600' 

							: 'bg-slate-100 text-slate-700 border-slate-200'

					}`}>{currentRole}</Badge>

					{(() => {

						let canImpersonate = false

						try {

							const raw = localStorage.getItem('erm_auth_user')

							if (raw) {

								const auth = JSON.parse(raw)

								canImpersonate = auth?.role === 'Admin'

							}

						} catch {}

						return canImpersonate ? (

							<Button variant="outline" size="sm" onClick={onLogout} className={`h-10 px-4 border focus:ring-2 focus:ring-slate-500 transition-colors duration-300 ${

								darkMode 

									? 'border-slate-600 hover:bg-slate-700 text-slate-300' 

									: 'border-slate-200 hover:bg-slate-50 text-slate-700'

							}`}>

								<LogOut className="h-4 w-4 mr-2" /> Switch to Executive

							</Button>

						) : null

					})()}

				</div>

			</div>

		</header>

	);

}

// -------------------- Dashboard --------------------

function Dashboard({ risks, incidents, config, setConfig, departments, categories, subcategories, addRisk, currentUser, darkMode = false }) {

	const [deptFilter, setDeptFilter] = useState("All");

	const [mode, setMode] = useState(() => {

		const perUser = config.ui?.heatmapModeByUser || {};

		const key = currentUser?.email || "__current";

		return perUser[key] || perUser.__current || "Counts";

	});

	const filteredRisks = useMemo(() => risks.filter((r) => {

		if (deptFilter === "All") return true;

		return r.department === deptFilter || r.departmentId === departments.find(d=>d.name===deptFilter)?.id;

	}).filter(r => Number.isFinite((r?.residualLikelihood ?? r?.likelihood)) && Number.isFinite((r?.residualImpact ?? r?.impact))), [risks, deptFilter, departments]);



	const totals = useMemo(() => {

		const t = config.scoring.thresholds;

		const counts = { Low: 0, Medium: 0, "Medium High": 0, High: 0, Extreme: 0 };

		filteredRisks.forEach((r) => {

			const score = scoreOf(r.residualLikelihood ?? r.likelihood, r.residualImpact ?? r.impact);

			const level = riskLevel(score, t).label; counts[level]++;

		});

		return counts;

	}, [filteredRisks, config.scoring.thresholds]);



	const appetite = config.appetite ?? 12;

	const aboveAppetite = filteredRisks.filter(r => scoreOf(r.residualLikelihood ?? r.likelihood, r.residualImpact ?? r.impact) > appetite).length;

	const withinAppetite = filteredRisks.length - aboveAppetite;

	return (

		<div className="space-y-6">

			<div className="flex items-center justify-between sticky top-0 z-10 py-2">

				<h2 className={`text-2xl font-semibold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Dashboard</h2>

				<div className="flex items-center gap-3">

					<Label htmlFor="heatmap-mode" className={`text-sm font-medium transition-colors duration-300 ${

						darkMode ? 'text-slate-300' : 'text-slate-700'

					}`}>Display Mode:</Label>

					<Select value={mode} onValueChange={(v) => {

						setMode(v);

						const key = currentUser?.email || "__current";

						setConfig(c => ({ 

							...c, 

							ui: { 

								...c.ui, 

								heatmapModeByUser: { 

									...c.ui?.heatmapModeByUser, 

									[key]: v, 

									__current: v 

								} 

							} 

						}));

					}}>

						<SelectTrigger className="w-32">

							<SelectValue />

						</SelectTrigger>

						<SelectContent>

							<SelectItem value="Counts">Counts</SelectItem>

							<SelectItem value="Bubbles">Bubbles</SelectItem>

						</SelectContent>

					</Select>

					<RiskDialog

						trigger={<Button id="sticky-new-risk-dashboard" className="h-9 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">

							<Plus className="h-4 w-4 mr-2" /> New Risk

						</Button>}

						initial={{}}

						onSave={addRisk}

						departments={departments}

						categories={categories}

						subcategories={subcategories}

						config={config}

						focusReturnId="sticky-new-risk-dashboard"

					/>

				</div>

			</div>



			{/* Main Risk Matrix Section with Top Risks Side by Side - ISO 31000 Compliant */}

			<div className="mb-8">

				<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

					{/* Risk Matrix Heatmap - Takes 3/4 of the space */}

					<div className="xl:col-span-3">

						<Card className={`border-0 shadow-xl h-full transition-colors duration-300 ${

							darkMode 

								? 'bg-gradient-to-br from-slate-800 to-slate-700' 

								: 'bg-gradient-to-br from-slate-50 to-white'

						}`}>

							<CardHeader className="pb-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-xl">

								<div className="flex items-center justify-between">

									<div>

										<CardTitle className="flex items-center gap-3 text-2xl font-bold text-white mb-2">

											<Grid3X3 className="h-8 w-8" />

											Risk Assessment Matrix (ISO 31000)

										</CardTitle>

										<p className="text-purple-100 text-lg">Risk likelihood vs. impact visualization with residual risk analysis</p>

									</div>

									<div className="flex items-center gap-4">

										<div className="flex items-center gap-3">

											<Filter className="h-5 w-5 text-purple-200" />

											<Select value={deptFilter} onValueChange={setDeptFilter}>

												<SelectTrigger className="w-48 bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-white/40 focus:ring-white/20">

													<SelectValue placeholder="All Departments" />

												</SelectTrigger>

												<SelectContent>

													<SelectItem value="All">All Departments</SelectItem>

													{departments.map((d) => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}

												</SelectContent>

											</Select>

										</div>

										<div className="flex items-center gap-3">

											<Label htmlFor="heatmap-mode" className="text-purple-200 font-medium">Mode:</Label>

											<Select value={mode} onValueChange={(v) => {

												setMode(v);

												const key = currentUser?.email || "__current";

												setConfig(c => ({ 

													...c, 

													ui: { 

														...c.ui, 

														heatmapModeByUser: { 

															...c.ui?.heatmapModeByUser, 

															[key]: v, 

															__current: v 

														} 

													} 

												}));

											}}>

												<SelectTrigger className="w-32 bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-white/40 focus:ring-white/20">

													<SelectValue />

												</SelectTrigger>

												<SelectContent>

													<SelectItem value="Counts">Counts</SelectItem>

													<SelectItem value="Bubbles">Bubbles</SelectItem>

												</SelectContent>

											</Select>

										</div>

									</div>

								</div>

							</CardHeader>

							<CardContent className="p-8">

								<div className="w-full">

									<Heatmap risks={filteredRisks} config={config} mode={mode} darkMode={darkMode} />

								</div>

								<div className={`mt-8 pt-6 border-t transition-colors duration-300 ${

									darkMode ? 'border-slate-700' : 'border-slate-200'

								}`}>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

										<div className="space-y-2">

											<div className={`text-2xl font-bold transition-colors duration-300 ${

												darkMode ? 'text-slate-100' : 'text-slate-900'

											}`}>{filteredRisks.length}</div>

											<div className={`text-sm transition-colors duration-300 ${

												darkMode ? 'text-slate-400' : 'text-slate-600'

											}`}>Total Risks</div>

										</div>

										<div className="space-y-2">

											<div className="text-2xl font-bold text-rose-600">{aboveAppetite}</div>

											<div className={`text-sm transition-colors duration-300 ${

												darkMode ? 'text-slate-400' : 'text-slate-600'

											}`}>Above Appetite</div>

										</div>

										<div className="space-y-2">

											<div className="text-2xl font-bold text-emerald-600">{withinAppetite}</div>

											<div className={`text-sm transition-colors duration-300 ${

												darkMode ? 'text-slate-400' : 'text-slate-600'

											}`}>Within Appetite</div>

										</div>

									</div>

								</div>

							</CardContent>

						</Card>

					</div>



					{/* Top Risks - Right Side, directly next to Risk Matrix */}

					<div className="xl:col-span-1">

						<Card className={`border-0 shadow-xl h-full transition-colors duration-300 summary-card ${

							darkMode 

								? 'bg-gradient-to-br from-red-900 to-red-800' 

								: 'bg-gradient-to-br from-red-50 to-white'

						}`}>

							<CardHeader className="pb-6 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-t-xl">

								<CardTitle className="flex items-center gap-3 text-xl font-bold text-white mb-2">

									<AlertCircle className="h-6 w-6" />

									Priority Risks

								</CardTitle>

								<p className="text-red-100">ISO 31000: High residual risk items requiring immediate attention</p>

							</CardHeader>

							<CardContent className="p-6">

								<TopRisksList risks={risks} config={config} darkMode={darkMode} />

							</CardContent>

						</Card>

					</div>

				</div>

			</div>

			{/* Supporting Information Grid - ISO 31000 Compliant */}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

				{/* Summary Cards - Left Side */}

				<div className="lg:col-span-1 space-y-4">

					<Card className={`border-0 shadow-lg transition-colors duration-300 ${

						darkMode 

							? 'bg-gradient-to-br from-blue-900 to-blue-800' 

							: 'bg-gradient-to-br from-blue-50 to-white'

					}`}>

						<CardHeader className="pb-3">

							<CardTitle className={`flex items-center gap-2 text-lg font-semibold transition-colors duration-300 ${

								darkMode ? 'text-blue-100' : 'text-blue-900'

							}`}>

								<BarChart3 className="h-5 w-5 text-blue-600" />

								Risk Profile Summary

							</CardTitle>

						</CardHeader>

						<CardContent className="space-y-4">

							<SummaryRow label="Total Risks" value={filteredRisks.length} darkMode={darkMode} />

							<SummaryRow label="High/Extreme Risks" value={totals["High"] + totals["Extreme"]} darkMode={darkMode} />

							<SummaryRow label="Pending Approval" value={risks.filter(r => r.status === "Submitted").length} darkMode={darkMode} />

							<Separator className={`my-4 transition-colors duration-300 ${

								darkMode ? 'bg-slate-700' : 'bg-slate-200'

							}`} />

							<SummaryRow label="Above Risk Appetite" value={aboveAppetite} tone="bg-rose-100 text-rose-800 border border-rose-200" darkMode={darkMode} />

							<SummaryRow label="Within Risk Appetite" value={withinAppetite} tone="bg-emerald-100 text-emerald-800 border border-emerald-200" darkMode={darkMode} />

						</CardContent>

					</Card>



					<Card className={`border-0 shadow-lg transition-colors duration-300 ${

						darkMode 

							? 'bg-gradient-to-br from-emerald-900 to-emerald-800' 

							: 'bg-gradient-to-br from-emerald-50 to-white'

					}`}>

						<CardHeader className="pb-3">

							<CardTitle className={`flex items-center gap-2 text-lg font-semibold transition-colors duration-300 ${

								darkMode ? 'text-emerald-100' : 'text-emerald-900'

							}`}>

								<ClipboardList className="h-5 w-5 text-emerald-600" />

								Risk Treatment Actions

							</CardTitle>

						</CardHeader>

						<CardContent className="space-y-4">

							<SummaryRow label="Total Actions" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Completed" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Completed").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="In Progress" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "In Progress").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Pending" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Pending").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Overdue" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Overdue").length || 0), 0)} darkMode={darkMode} />

						</CardContent>

					</Card>



					<Card className={`border-0 shadow-lg transition-colors duration-300 ${

						darkMode 

							? 'bg-gradient-to-br from-orange-900 to-orange-800' 

							: 'bg-gradient-to-br from-orange-50 to-white'

					}`}>

						<CardHeader className="pb-3">

							<CardTitle className={`flex items-center gap-2 text-lg font-semibold transition-colors duration-300 ${

								darkMode ? 'text-orange-100' : 'text-orange-900'

							}`}>

								<AlertTriangle className="h-5 w-5 text-orange-600" />

								Recent Incidents

							</CardTitle>

						</CardHeader>

						<CardContent>

							{incidents.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0, 3).map(incident => (

								<div key={incident.id} className={`flex items-center justify-between py-2 border-b last:border-b-0 transition-colors duration-300 ${

									darkMode ? 'border-orange-800' : 'border-orange-100'

								}`}>

									<div className="flex-1 min-w-0">

										<p className={`text-sm font-medium truncate transition-colors duration-300 ${

											darkMode ? 'text-slate-100' : 'text-slate-900'

										}`}>{incident.title}</p>

										<p className={`text-xs transition-colors duration-300 ${

											darkMode ? 'text-slate-400' : 'text-slate-500'

										}`}>{incident.department}</p>

									</div>

									<Badge variant="destructive" className="text-xs">Incident</Badge>

								</div>

							))}

							{incidents.length === 0 && (

								<p className={`text-sm text-center py-4 transition-colors duration-300 ${

									darkMode ? 'text-slate-400' : 'text-slate-500'

								}`}>No recent incidents</p>

							)}

						</CardContent>

					</Card>

				</div>



				{/* Additional Information - Right Side */}

				<div className="lg:col-span-2">

					<Card className={`border-0 shadow-lg transition-colors duration-300 ${

						darkMode 

							? 'bg-gradient-to-br from-indigo-900 to-indigo-800' 

							: 'bg-gradient-to-br from-indigo-50 to-white'

					}`}>

						<CardHeader className="pb-3">

							<CardTitle className={`flex items-center gap-2 text-lg font-semibold transition-colors duration-300 ${

								darkMode ? 'text-indigo-100' : 'text-indigo-900'

							}`}>

								<ClipboardList className="h-5 w-5 text-indigo-600" />

								Risk Treatment Actions

							</CardTitle>

						</CardHeader>

						<CardContent className="space-y-4">

							<SummaryRow label="Total Actions" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Completed" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Completed").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="In Progress" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "In Progress").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Pending" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Pending").length || 0), 0)} darkMode={darkMode} />

							<SummaryRow label="Overdue" value={risks.reduce((sum, r) => sum + (r.mitigationActions?.filter(a => a.status === "Overdue").length || 0), 0)} darkMode={darkMode} />

						</CardContent>

					</Card>

				</div>

			</div>

		</div>

	);

}



function SummaryRow({ label, value, tone, darkMode = false }) {

	return (

		<div className="flex items-center justify-between">

			<span className={`text-sm font-medium transition-colors duration-300 ${

				darkMode ? 'text-slate-300' : 'text-slate-700'

			}`}>{label}</span>

			<span className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-colors duration-300 ${

				tone || (darkMode 

					? "bg-slate-700 text-slate-300 border border-slate-600" 

					: "bg-slate-100 text-slate-700 border border-slate-200")

			}`}>{value}</span>

		</div>

	);

}

// Enhanced interactive heatmap with international design standards, animations, and rich colors

function Heatmap({ risks, config, mode = "Counts", darkMode = false }) {

	const L = 5, I = 5;

	const grid = Array.from({ length: I }, () => Array.from({ length: L }, () => 0));

	const buckets = {};

	risks.forEach((r) => {

		const rawL = r?.residualLikelihood ?? r?.likelihood;

		const rawI = r?.residualImpact ?? r?.impact;

		if (typeof rawL !== "number" || typeof rawI !== "number" || !isFinite(rawL) || !isFinite(rawI)) {

			return; // Skip malformed risks to avoid crashes

		}

		const l = clamp(rawL, 1, 5);

		const i = clamp(rawI, 1, 5);

		grid[I - i][l - 1] += 1;

		const key = `${l}-${i}`;

		if (!buckets[key]) buckets[key] = [];

		buckets[key].push(r);

	});

	const t = config.scoring.thresholds;

	const appetite = config.appetite ?? 12;

	const likeLabels = config.likelihoodLabels || [];

	const impLabels = config.impactLabels || [];

	

	// Enhanced color scheme with better contrast and visual appeal

	function cellTone(l, i) {

		const score = l * i;

		const level = riskLevel(score, t).label;

		let base = "";

		let textColor = "";

		let borderColor = "";

		

		if (level === "Low") {

			base = "bg-gradient-to-br from-emerald-50 to-emerald-100";

			textColor = "text-emerald-800";

			borderColor = "border-emerald-200";

		} else if (level === "Medium") {

			base = "bg-gradient-to-br from-yellow-50 to-yellow-100";

			textColor = "text-yellow-800";

			borderColor = "border-yellow-200";

		} else if (level === "Medium High") {

			base = "bg-gradient-to-br from-amber-50 to-amber-100";

			textColor = "text-amber-800";

			borderColor = "border-amber-200";

		} else if (level === "High") {

			base = "bg-gradient-to-br from-orange-50 to-orange-100";

			textColor = "text-orange-800";

			borderColor = "border-orange-200";

		} else {

			base = "bg-gradient-to-br from-red-50 to-red-100";

			textColor = "text-red-800";

			borderColor = "border-red-200";

		}

		

		// Add appetite ring with enhanced styling

		if (score > appetite) {

			base += " ring-2 ring-rose-500 ring-offset-2 ring-offset-white";

		}

		

		return { base, textColor, borderColor };

	}

	

	function seededJitter(riskId, idx) {

		const key = String(riskId ?? "");

		let h = 0;

		if (key.length > 0) {

			for (let i=0;i<key.length;i++) { h = (h * 31 + key.charCodeAt(i)) >>> 0; }

		} else {

			// deterministic fallback when id is missing

			h = (idx * 1103515245 + 12345) >>> 0;

		}

		const a = ((h + idx*97) % 1000) / 1000;

		const b = ((h ^ (idx*53)) % 1000) / 1000;

		return { x: (a - 0.5) * 0.6, y: (b - 0.5) * 0.6 };

	}

	

	function bubbleSize(score) {

		const min = 8, max = 28; const s = Math.max(1, Math.min(25, score));

		return min + (max - min) * ((s - 1) / 24);

	}

	

	const [open, setOpen] = useState(false);

	const [cell, setCell] = useState({ l: 0, i: 0, list: [] });

	const [hoveredCell, setHoveredCell] = useState(null);

	const [viewMode, setViewMode] = useState("count");

	const [showLegend, setShowLegend] = useState(true);

	return (

		<>

			{/* Enhanced Header with Professional Styling */}

			<div className={`bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 ${

				darkMode ? 'from-slate-800 to-slate-700 border-slate-600' : ''

			}`}>

				<div className="flex items-center justify-between mb-4">

					<div className="flex items-center gap-3">

						<div className={`p-3 rounded-xl ${

							darkMode ? 'bg-slate-700 text-slate-200' : 'bg-red-100 text-red-700'

						}`}>

							<Thermometer className="h-6 w-6" />

						</div>

						<div>

							<h2 className={`text-3xl font-bold transition-colors duration-300 ${

								darkMode ? 'text-slate-100' : 'text-slate-900'

							}`}>Risk Heatmap</h2>

							<p className={`text-lg transition-colors duration-300 ${

								darkMode ? 'text-slate-400' : 'text-slate-600'

							}`}>Visual risk assessment matrix with interactive insights</p>

						</div>

					</div>

					<div className="flex items-center gap-3">

						<Button onClick={() => setViewMode(viewMode === "count" ? "bubble" : "count")} variant="outline" className={`border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 ${

							darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

						}`}>

							{viewMode === "count" ? <BarChart3 className="h-4 w-4 mr-2" /> : <PieChart className="h-4 w-4 mr-2" />}

							{viewMode === "count" ? "Count View" : "Bubble View"}

						</Button>

						<Button onClick={() => setShowLegend(!showLegend)} variant="outline" className={`border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 ${

							darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

						}`}>

							<Info className="h-4 w-4 mr-2" />

							{showLegend ? "Hide Legend" : "Show Legend"}

						</Button>

					</div>

				</div>

				

				{/* Enhanced Summary Stats */}

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

						}`}>{risks.length}</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Total Risks</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-red-600`}>

							{risks.filter(r => (r.likelihood * r.impact) >= 15).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>High Risk</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-amber-600`}>

							{risks.filter(r => (r.likelihood * r.impact) >= 8 && (r.likelihood * r.impact) < 15).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Medium Risk</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-emerald-600`}>

							{risks.filter(r => (r.likelihood * r.impact) < 8).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Low Risk</div>

					</div>

				</div>

			</div>

			

			<div className="w-full">

				<div className="grid gap-2 animate-heatmap-pop" style={{ 

					gridTemplateColumns: `120px repeat(${L}, 1fr)`,

					gridTemplateRows: `auto repeat(${I}, 1fr)`,

					aspectRatio: '6/5'

				}}>

					{/* Header row */}

					<div className={`text-right pr-3 text-base font-bold flex items-center justify-center h-12 rounded-lg border transition-colors duration-300 ${

						darkMode 

							? 'text-slate-200 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600' 

							: 'text-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'

					}`}>

						<div className="text-center">

							<div className={`text-xs mb-1 transition-colors duration-300 ${

								darkMode ? 'text-slate-400' : 'text-slate-600'

							}`}>Impact</div>

							<div className={`text-sm font-bold transition-colors duration-300 ${

								darkMode ? 'text-slate-200' : 'text-slate-800'

							}`}>↓</div>

						</div>

					</div>

					{Array.from({ length: L }, (_, idx) => (

						<div key={idx} className={`text-center text-base font-bold py-2 rounded-lg border transition-colors duration-300 ${

							darkMode 

								? 'text-slate-200 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700' 

								: 'text-slate-800 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'

						}`}>

							<div className={`text-xs mb-1 transition-colors duration-300 ${

								darkMode ? 'text-blue-400' : 'text-blue-600'

							}`}>Likelihood</div>

							<div className={`text-sm font-bold transition-colors duration-300 ${

								darkMode ? 'text-blue-200' : 'text-blue-800'

							}`}>{likeLabels[idx] || `L ${idx+1}`}</div>

						</div>

					))}

					

					{/* Data rows */}

					{Array.from({ length: I }, (_, row) => (

						<React.Fragment key={row}>

							<div className={`text-right pr-3 text-base font-bold flex items-center justify-center h-12 rounded-lg border transition-colors duration-300 ${

								darkMode 

									? 'text-slate-200 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600' 

									: 'text-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'

							}`}>

								<div className="text-center">

									<div className={`text-xs mb-1 transition-colors duration-300 ${

										darkMode ? 'text-slate-400' : 'text-slate-600'

									}`}>Impact</div>

									<div className={`text-sm font-bold transition-colors duration-300 ${

										darkMode ? 'text-slate-200' : 'text-slate-800'

									}`}>{impLabels[I - row - 1] || `I ${I-row}`}</div>

								</div>

							</div>

							{Array.from({ length: L }, (_, col) => {

								const l = col + 1; const i = I - row; const count = grid[row][col]; const score = l * i;

								const { base, textColor, borderColor } = cellTone(l, i);

								const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;

								

								return (

									<button

										key={`${row}-${col}`}

										title={`${likeLabels[l-1] || `L${l}`} × ${impLabels[i-1] || `I${i}`} = ${score} (${count} risks)`}

										onClick={() => { setCell({ l, i, list: buckets[`${l}-${i}`] || [] }); setOpen(true); }}

										onMouseEnter={() => setHoveredCell({ row, col, l, i, count, score })}

										onMouseLeave={() => setHoveredCell(null)}

										className={`relative w-full h-full flex items-center justify-center rounded-lg heatmap-cell ${

											isHovered 

												? 'scale-105 shadow-2xl z-10' 

												: 'hover:scale-102 hover:shadow-lg'

										} focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 ${base} ${borderColor} border-2`}

										aria-label={`Risk cell ${l}×${i} with ${count} risks, score ${score}`}

									>

										{/* Enhanced Hover Tooltip - Smart positioning to avoid overflow */}

										{isHovered && (

											<div className={`absolute z-20 ${

												// Smart positioning: if near left edge, position right; if near right edge, position left

												col === 0 ? 'left-0' : 

												col === L - 1 ? 'right-0' : 

												'left-1/2 transform -translate-x-1/2'

											} ${

												// Smart positioning: if near top edge, position below; if near bottom edge, position above

												row === 0 ? 'top-full mt-2' : 

												row === I - 1 ? 'bottom-full mb-2' : 

												'-top-2 -translate-y-full'

											}`}>

											<div className={`bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap ${

												// Adjust arrow position based on tooltip position

												col === 0 ? 'ml-0' : 

												col === L - 1 ? 'mr-0' : 

												''

											}`}>

												<div className="font-semibold">{likeLabels[l-1] || `L${l}`} × {impLabels[i-1] || `I${i}`}</div>

												<div className="text-slate-300">Score: {score}</div>

												<div className="text-slate-300">Risks: {count}</div>

												{score > appetite && (

													<div className="text-rose-300 font-medium">⚠️ Above appetite</div>

												)}

												{/* Smart arrow positioning */}

												<div className={`absolute w-0 h-0 ${

													row === 0 ? 'top-0 -translate-y-full border-b-4 border-b-slate-900' :

													row === I - 1 ? 'bottom-0 translate-y-full border-t-4 border-t-slate-900' :

													'top-full border-t-4 border-t-slate-900'

												} ${

													col === 0 ? 'left-4 border-l-4 border-r-4 border-transparent' :

													col === L - 1 ? 'right-4 border-l-4 border-r-4 border-transparent' :

													'left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-transparent'

												}`}></div>

											</div>

										</div>

										)}

										{/* Hover effect overlay */}

										{isHovered && (

											<div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>

										)}

										

										{/* Content */}

										{mode === "Bubbles" ? (

											<div className="absolute inset-2">

												{(buckets[`${l}-${i}`]||[]).map((r, idx) => {

													const rl = r.residualLikelihood ?? r.likelihood; const ri = r.residualImpact ?? r.impact; const sc = rl * ri;

													const { x, y } = seededJitter(r.id, idx);

													const sz = bubbleSize(sc);

													const bubbleColor = sc <= 4 ? "bg-emerald-500" : sc <= 12 ? "bg-yellow-500" : sc <= 16 ? "bg-amber-500" : sc <= 20 ? "bg-orange-500" : "bg-red-500";

													

													return (

														<div key={r.id}

															title={`${r.title} — L${rl}×I${ri}=${sc}`}

															className={`absolute rounded-full border-2 border-white shadow-lg heatmap-bubble ${bubbleColor}`}

															style={{ 

																width: `${sz}px`, 

																height: `${sz}px`, 

																left: `calc(50% + ${x*100}%)`, 

																top: `calc(50% + ${y*100}%)`, 

																transform: "translate(-50%, -50%)",

																animationDelay: `${idx * 100}ms`

															}}

														/>

													);

												})}

											</div>

										) : (

											<>

												<span className={`text-lg font-bold ${textColor} transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>

													{count}

												</span>

												<span className={`absolute bottom-2 right-2 text-xs font-semibold ${textColor} bg-white/80 px-2 py-1 rounded-full border ${borderColor}`}>

													{score}

												</span>

											</>

										)}

										

										{/* Risk count badge */}

										{count > 0 && (

											<div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full bg-white/90 ${textColor} border ${borderColor}`}>

												{count}

											</div>

										)}

									</button>

								);

							})}

						</React.Fragment>

					))}

				</div>

			</div>

			

			{/* Enhanced Interactive Legend */}

			<div className={`mt-8 p-6 rounded-2xl border shadow-lg transition-colors duration-300 ${

				darkMode 

					? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' 

					: 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

			}`}>

				<div className={`text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>

					<Grid3X3 className={`h-5 w-5 transition-colors duration-300 ${

						darkMode ? 'text-slate-400' : 'text-slate-600'

					}`} />

					Interactive Heatmap Legend

				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

					<div className="space-y-3">

						<div className={`font-semibold text-base transition-colors duration-300 ${

							darkMode ? 'text-slate-200' : 'text-slate-800'

						}`}>Risk Level Colors</div>

						<div className="space-y-2">

							<div className={`flex items-center gap-3 p-2 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-emerald-900 border-emerald-700' : 'bg-emerald-50 border-emerald-200'

							}`}>

								<div className="w-5 h-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg"></div>

								<span className={`font-medium transition-colors duration-300 ${

									darkMode ? 'text-emerald-200' : 'text-emerald-800'

								}`}>Low (1-4)</span>

							</div>

							<div className={`flex items-center gap-3 p-2 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'

							}`}>

								<div className="w-5 h-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg"></div>

								<span className={`font-medium transition-colors duration-300 ${

									darkMode ? 'text-yellow-200' : 'text-yellow-800'

								}`}>Medium (5-12)</span>

							</div>

							<div className={`flex items-center gap-3 p-2 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-amber-900 border-amber-700' : 'bg-amber-50 border-amber-200'

							}`}>

								<div className="w-5 h-5 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg"></div>

								<span className={`font-medium transition-colors duration-300 ${

									darkMode ? 'text-amber-200' : 'text-amber-800'

								}`}>Medium High (13-16)</span>

							</div>

							<div className={`flex items-center gap-3 p-2 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'

							}`}>

								<div className="w-5 h-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg"></div>

								<span className={`font-medium transition-colors duration-300 ${

									darkMode ? 'text-orange-200' : 'text-orange-800'

								}`}>High (17-20)</span>

							</div>

							<div className={`flex items-center gap-3 p-2 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'

							}`}>

								<div className="w-5 h-5 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg"></div>

								<span className={`font-medium transition-colors duration-300 ${

									darkMode ? 'text-red-200' : 'text-red-800'

								}`}>Extreme (21-25)</span>

							</div>

						</div>

					</div>

					

					<div className="space-y-3">

						<div className={`font-semibold text-base transition-colors duration-300 ${

							darkMode ? 'text-slate-200' : 'text-slate-800'

						}`}>Interactive Features</div>

						<div className={`space-y-2 text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-300' : 'text-slate-700'

						}`}>

							<div className="flex items-center gap-2">

								<div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>

								<span>Hover for cell details</span>

							</div>

							<div className="flex items-center gap-2">

								<div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>

								<span>Click to view risks</span>

							</div>

							<div className="flex items-center gap-2">

								<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

								<span>Smooth animations</span>

							</div>

						</div>

						

						<div className="pt-3">

							<div className={`font-semibold text-base mb-2 transition-colors duration-300 ${

								darkMode ? 'text-slate-200' : 'text-slate-800'

							}`}>Appetite Threshold</div>

							<div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors duration-300 ${

								darkMode ? 'bg-rose-900 border-rose-700' : 'bg-rose-50 border-rose-200'

							}`}>

								<div className="w-5 h-5 bg-slate-100 border-2 border-rose-500 ring-2 ring-rose-500 ring-offset-2 ring-offset-white rounded-lg"></div>

								<div>

									<span className={`font-medium transition-colors duration-300 ${

										darkMode ? 'text-rose-200' : 'text-rose-800'

									}`}>Above appetite ({appetite}+)</span>

									<div className={`text-xs transition-colors duration-300 ${

										darkMode ? 'text-rose-400' : 'text-rose-600'

									}`}>Enhanced ring indicator</div>

								</div>

							</div>

						</div>

					</div>

					

					<div className="space-y-3">

						<div className={`font-semibold text-base transition-colors duration-300 ${

							darkMode ? 'text-slate-200' : 'text-slate-800'

						}`}>Display Modes</div>

						<div className="space-y-3">

							{mode === "Bubbles" ? (

								<div className={`p-3 rounded-lg border transition-colors duration-300 ${

									darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'

								}`}>

									<div className={`font-medium mb-2 transition-colors duration-300 ${

										darkMode ? 'text-blue-200' : 'text-blue-800'

									}`}>Bubble Mode</div>

									<div className={`text-sm space-y-1 transition-colors duration-300 ${

										darkMode ? 'text-blue-300' : 'text-blue-700'

									}`}>

										<div>• Colorful bubbles for each risk</div>

										<div>• Size: 8-28px based on score</div>

										<div>• Hover effects & animations</div>

									</div>

								</div>

							) : (

								<div className={`p-3 rounded-lg border transition-colors duration-300 ${

									darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'

								}`}>

									<div className={`font-medium mb-2 transition-colors duration-300 ${

										darkMode ? 'text-green-200' : 'text-green-800'

									}`}>Count Mode</div>

									<div className={`text-sm space-y-1 transition-colors duration-300 ${

										darkMode ? 'text-green-300' : 'text-green-700'

									}`}>

										<div>• Risk count per cell</div>

										<div>• Score display</div>

										<div>• Enhanced typography</div>

									</div>

								</div>

							)}

						</div>

						

						<div className="pt-3">

							<div className={`font-semibold text-base mb-2 transition-colors duration-300 ${

								darkMode ? 'text-slate-200' : 'text-slate-800'

							}`}>Current Stats</div>

							<div className="grid grid-cols-2 gap-2 text-sm">

								<div className={`text-center p-2 rounded-lg transition-colors duration-300 ${

									darkMode ? 'bg-slate-700' : 'bg-slate-100'

								}`}>

									<div className={`font-bold transition-colors duration-300 ${

										darkMode ? 'text-slate-100' : 'text-slate-900'

									}`}>{risks.length}</div>

									<div className={`transition-colors duration-300 ${

										darkMode ? 'text-slate-400' : 'text-slate-600'

									}`}>Total Risks</div>

								</div>

								<div className={`text-center p-2 rounded-lg transition-colors duration-300 ${

									darkMode ? 'bg-slate-700' : 'bg-slate-100'

								}`}>

									<div className={`font-bold transition-colors duration-300 ${

										darkMode ? 'text-slate-100' : 'text-slate-900'

									}`}>{Object.keys(buckets).length}</div>

									<div className={`transition-colors duration-300 ${

										darkMode ? 'text-slate-400' : 'text-slate-600'

									}`}>Active Cells</div>

								</div>

							</div>

						</div>

					</div>

				</div>

			</div>

			

			<Dialog open={open} onOpenChange={setOpen}>

				<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">

					<DialogHeader className="pb-4">

						<DialogTitle className="text-xl font-semibold text-slate-900">Risks at {likeLabels[cell.l-1] || `L${cell.l}`} × {impLabels[cell.i-1] || `I${cell.i}`}</DialogTitle>

					</DialogHeader>

					<div className="max-h-[60vh] overflow-auto space-y-4">

						{cell.list.length === 0 ? (

							<div className="text-center py-8 text-slate-500">

								<ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />

								<div className="text-base font-medium mb-2">No risks in this cell</div>

								<div className="text-sm text-slate-600">This likelihood × impact combination has no associated risks</div>

							</div>

						) : cell.list.map(r => {

							const l0 = r.likelihood, i0 = r.impact; const rl = r.residualLikelihood ?? r.likelihood; const ri = r.residualImpact ?? r.impact; const s0 = l0*i0; const s1 = rl*ri;

							const lev0 = riskLevel(s0, t); const lev1 = riskLevel(s1, t);

							return (

								<div key={r.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">

									<div className="flex items-start justify-between gap-4">

										<div className="min-w-0 flex-1">

											<div className="font-semibold text-base text-slate-900 mb-3">{r.title}</div>

											<div className="text-sm text-slate-600 mb-3 leading-relaxed">

												{r.department} • {r.category} • {r.subcategory}

											</div>

											<div className="flex items-center gap-3 mb-3">

												<Badge className={`${lev0.tone} text-sm font-medium px-3 py-1.5 border`} variant="outline">Inherent {s0}</Badge>

												<Badge className={`${lev1.tone} text-sm font-medium px-3 py-1.5`}>Residual {s1}</Badge>

												{r.businessInterruption && <Badge className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 border border-sky-200">BI</Badge>}

												{r.topRisk && <Badge className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 border border-amber-200">Top</Badge>}

											</div>

											<div className="text-sm text-slate-600 leading-relaxed">

												Actions: {r.mitigationActions?.length || 0}

											</div>

										</div>

										<div className="flex items-center gap-2 shrink-0">

											<Button 

												size="sm" 

												variant="outline" 

												onClick={() => {

													setOpen(false);

													window.dispatchEvent(new CustomEvent("erm:viewRisk", { detail: { riskId: r.id } }));

												}}

												className="h-8 px-3 text-sm border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500"

											>

												View

											</Button>

											<Button 

												size="sm" 

												onClick={() => {

													setOpen(false);

													window.dispatchEvent(new CustomEvent("erm:editRisk", { detail: { riskId: r.id } }));

												}}

												className="h-8 px-3 text-sm bg-slate-700 hover:bg-slate-800 focus:ring-2 focus:ring-slate-500"

											>

												Edit

											</Button>

										</div>

									</div>

								</div>

							);

						})}

					</div>

				</DialogContent>

			</Dialog>

		</>

	);

}

// -------------------- Risk Register --------------------

function RiskRegister({ risks, setRisks, config, departments, categories, subcategories, setSelectedRisk, setRiskReportOpen, addRisk, updateRisk, deleteRisk, updateAction, descSummary, riskLevel, darkMode = false }) {

	const currentUser = { role: "Risk Owner", email: "user@company.com" }; // Default user for now

	const [search, setSearch] = useState("");

	const [deptFilter, setDeptFilter] = useState("All");

	const [catFilter, setCatFilter] = useState("All");

	const [subcatFilter, setSubcatFilter] = useState("All");

	const [statusFilter, setStatusFilter] = useState("All");

	const [levelFilter, setLevelFilter] = useState("All");

	const [showDetails, setShowDetails] = useState(false);

	const [sortBy, setSortBy] = useState("updatedAt");

	const [sortOrder, setSortOrder] = useState("desc");



	const filtered = useMemo(() => {

		let filteredRisks = risks.filter((r) => {

		const deptOk = (deptFilter === "All" || r.department === deptFilter || r.departmentId === departments.find(d=>d.name===deptFilter)?.id);

		const catOk = (catFilter === "All" || r.category === catFilter || r.categoryId === categories.find(c=>c.name===catFilter)?.id);

		const subOk = (subcatFilter === "All" || r.subcategory === subcatFilter || r.subcategoryId === subcategories.find(s=>s.name===subcatFilter)?.id);

		const text = (r.title + " " + descSummary(r)).toLowerCase();

		const qOk = search.trim() === "" || text.includes(search.toLowerCase());

		const stOk = statusFilter === "All" || r.status === statusFilter;

		const levelOk = levelFilter === "All" || (() => {

			const residualL = r.residualLikelihood ?? r.likelihood;

			const residualI = r.residualImpact ?? r.impact;

			const score = residualL * residualI;

			const level = riskLevel(score, config.scoring.thresholds);

			return level.label === levelFilter;

		})();

		return deptOk && catOk && subOk && qOk && stOk && levelOk;

		});



		// Enhanced sorting with multiple criteria

		return filteredRisks.sort((a, b) => {

			let aValue, bValue;

			

			switch (sortBy) {

				case "title":

					aValue = a.title.toLowerCase();

					bValue = b.title.toLowerCase();

					break;

				case "department":

					aValue = (a.department || "").toLowerCase();

					bValue = (b.department || "").toLowerCase();

					break;

				case "residualScore":

					const aScore = (a.residualLikelihood ?? a.likelihood) * (a.residualImpact ?? a.impact);

					const bScore = (b.residualLikelihood ?? b.likelihood) * (b.residualImpact ?? b.impact);

					aValue = aScore;

					bValue = bScore;

					break;

				case "status":

					aValue = a.status.toLowerCase();

					bValue = b.status.toLowerCase();

					break;

				case "updatedAt":

				default:

					aValue = new Date(a.updatedAt || a.createdAt || 0);

					bValue = new Date(b.updatedAt || b.createdAt || 0);

					break;

			}

			

			if (typeof aValue === "string" && typeof bValue === "string") {

				return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);

			} else {

				return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

			}

		});

	}, [risks, search, deptFilter, catFilter, subcatFilter, statusFilter, levelFilter, departments, categories, subcategories, config.scoring.thresholds, sortBy, sortOrder]);



	function upsertRisk(r) { setRisks((prev) => { const idx = prev.findIndex((x) => x.id === r.id); if (idx === -1) return [r, ...prev]; const next = prev.slice(); next[idx] = r; return next; }); }

	function deleteRisk(id0) { setRisks((prev) => prev.filter((r) => r.id !== id0)); }

	

	

	

	



	

	const subOptions = useMemo(() => {

		if (catFilter === "All") return subcategories;

		const parentId = categories.find(c=>c.name===catFilter)?.id;

		return subcategories.filter(s => s.parentCategoryId === parentId);

	}, [catFilter, categories, subcategories]);

	

	// Extract all actions from risks

	const actions = useMemo(() => {

		const allActions = [];

		risks.forEach(risk => {

			if (risk.mitigationActions) {

				risk.mitigationActions.forEach(action => {

					allActions.push({

						...action,

						riskTitle: risk.title,

						riskId: risk.id

					});

				});

			}

		});

		return allActions;

	}, [risks]);

	

	const sorted = useMemo(() => {

		return actions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

	}, [actions]);



	return (

		<div className="space-y-6">

			{/* Enhanced Header with Professional Styling */}

			<div className={`bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm p-6 ${

				darkMode ? 'from-slate-800 to-slate-700 border-slate-600' : ''

			}`}>

				<div className="flex items-center justify-between mb-4">

					<div className="flex items-center gap-3">

						<div className={`p-3 rounded-xl ${

							darkMode ? 'bg-slate-700 text-slate-200' : 'bg-blue-100 text-blue-700'

						}`}>

							<ClipboardList className="h-6 w-6" />

						</div>

						<div>

							<h2 className={`text-3xl font-bold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Risk Register</h2>

							<p className={`text-lg transition-colors duration-300 ${

								darkMode ? 'text-slate-400' : 'text-slate-600'

							}`}>Comprehensive risk management and oversight</p>

						</div>

					</div>

				<div className="flex items-center gap-3">

						<Button onClick={() => setShowDetails(!showDetails)} variant="outline" className={`border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 ${

							darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

						}`}>

						<Eye className="h-4 w-4 mr-2" />

						{showDetails ? "Hide Details" : "Show Details"}

					</Button>

					<Button onClick={() => {

						const headers = [

							"Title", "Department", "Category", "Subcategory", "Inherent Score", "Residual Score", 

							"Status", "Owner", "Due Date", "Business Interruption", "Top Risk"

						];

						

						const data = filtered.map(risk => [

							risk.title,

							risk.department || departments.find(d=>d.id===risk.departmentId)?.name || "",

							risk.category || categories.find(c=>c.id===risk.categoryId)?.name || "",

							risk.subcategory || subcategories.find(s=>s.id===risk.subcategoryId)?.name || "",

							`${risk.likelihood}/${risk.impact}`,

							`${risk.residualLikelihood ?? risk.likelihood}/${risk.residualImpact ?? risk.impact}`,

							risk.status,

							risk.owner || "",

							risk.dueDate ? prettyDate(risk.dueDate) : "",

							risk.businessInterruption ? "Yes" : "No",

							risk.topRisk ? "Yes" : "No"

						]);



						const csvContent = [headers, ...data]

							.map(row => row.map(cell => `"${cell}"`).join(","))

							.join("\n");



						const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

						const link = document.createElement("a");

						link.href = URL.createObjectURL(blob);

						link.download = `risk_register_${new Date().toISOString().split('T')[0]}.csv`;

						link.click();

						}} variant="outline" className={`border-green-600 text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-500 ${

							darkMode ? 'border-green-500 text-green-400 hover:bg-green-900/20' : ''

						}`}>

						<Download className="h-4 w-4 mr-2" />

						Export to Excel

					</Button>

					<RiskDialog

							trigger={<Button id="sticky-new-risk" className={`h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 shadow-lg ${

								darkMode ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : ''

							}`}>

								<Plus className="h-4 w-4 mr-2" /> New Risk

						</Button>}

						initial={{}}

						onSave={addRisk}

						departments={departments}

						categories={categories}

						subcategories={subcategories}

						config={config}

							focusReturnId="sticky-new-risk"

					/>

				</div>

			</div>

			

				{/* Enhanced Summary Stats */}

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

						}`}>{filtered.length}</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Total Risks</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-amber-600`}>

							{filtered.filter(r => r.status === "Draft" || r.status === "Under Review").length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Pending Review</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-emerald-600`}>

							{filtered.filter(r => r.status === "Approved").length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Approved</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-rose-600`}>

							{filtered.filter(r => r.topRisk).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Top Risks</div>

					</div>

				</div>

			</div>

			

			{/* Enhanced Filters with Sorting Controls */}

			<div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${

				darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-slate-50 to-white border-slate-200'

			}`}>

				<div className="flex items-center gap-3 mb-4">

					<Filter className={`h-5 w-5 ${

						darkMode ? 'text-slate-400' : 'text-slate-600'

					}`} />

					<h3 className={`text-lg font-semibold transition-colors duration-300 ${

						darkMode ? 'text-slate-200' : 'text-slate-800'

					}`}>Filters & Sorting</h3>

				</div>

				

				{/* Search and Basic Filters Row */}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

				<div className="flex items-center gap-2">

					<Input 

						placeholder="Search risks..." 

						value={search} 

						onChange={(e) => setSearch(e.target.value)}

							className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}

					/>

				</div>

				<div className="flex items-center gap-2">

					<Select value={deptFilter} onValueChange={setDeptFilter}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

							<SelectValue placeholder="All Departments" />

						</SelectTrigger>

						<SelectContent>

							<SelectItem value="All">All Departments</SelectItem>

							{departments.map((d)=>(<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}

						</SelectContent>

					</Select>

				</div>

					<div className="flex items-center gap-2">

						<Select value={statusFilter} onValueChange={setStatusFilter}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

								<SelectValue placeholder="All Statuses" />

							</SelectTrigger>

							<SelectContent>

								<SelectItem value="All">All Statuses</SelectItem>

								{STATUS.map((s)=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}

							</SelectContent>

						</Select>

					</div>

				</div>

				

				{/* Category and Advanced Filters Row */}

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">

				<div className="flex items-center gap-2">

					<Select value={catFilter} onValueChange={(v)=>{ setCatFilter(v); setSubcatFilter("All"); }}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

							<SelectValue placeholder="All Categories" />

						</SelectTrigger>

						<SelectContent>

							<SelectItem value="All">All Categories</SelectItem>

							{categories.map((c)=>(<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}

						</SelectContent>

					</Select>

				</div>

				<div className="flex items-center gap-2">

					<Select value={subcatFilter} onValueChange={setSubcatFilter}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

							<SelectValue placeholder="All Subcategories" />

						</SelectTrigger>

						<SelectContent>

							<SelectItem value="All">All Subcategories</SelectItem>

							{subOptions.map((s)=>(<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}

						</SelectContent>

					</Select>

				</div>

				<div className="flex items-center gap-2">

					<Select value={levelFilter} onValueChange={setLevelFilter}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

							<SelectValue placeholder="All Levels" />

						</SelectTrigger>

						<SelectContent>

							<SelectItem value="All">All Levels</SelectItem>

							<SelectItem value="Extreme">Extreme</SelectItem>

							<SelectItem value="High">High</SelectItem>

							<SelectItem value="Medium High">Medium High</SelectItem>

							<SelectItem value="Medium">Medium</SelectItem>

							<SelectItem value="Low">Low</SelectItem>

						</SelectContent>

					</Select>

				</div>

					<div className="flex items-center gap-2">

						<Select value={sortBy} onValueChange={setSortBy}>

							<SelectTrigger className={`w-full h-10 border-slate-300 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'

							}`}>

								<SelectValue placeholder="Sort by" />

							</SelectTrigger>

							<SelectContent>

								<SelectItem value="updatedAt">Last Updated</SelectItem>

								<SelectItem value="title">Title</SelectItem>

								<SelectItem value="department">Department</SelectItem>

								<SelectItem value="residualScore">Residual Score</SelectItem>

								<SelectItem value="status">Status</SelectItem>

							</SelectContent>

						</Select>

			</div>

				</div>

				

				{/* Sort Order Toggle */}

				<div className="flex items-center justify-between">

					<div className="flex items-center gap-2">

						<Button

							variant="outline"

							size="sm"

							onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}

							className={`border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 ${

								darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

							}`}

						>

							{sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}

						</Button>

					</div>

					<div className={`text-sm transition-colors duration-300 ${

						darkMode ? 'text-slate-400' : 'text-slate-600'

					}`}>

						Showing {filtered.length} of {risks.length} risks

					</div>

				</div>

			</div>

			{/* Enhanced Risk Table with Professional Styling */}

			<Card className={`border-0 shadow-xl overflow-hidden transition-colors duration-300 ${

				darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

			}`}>

				<CardContent className="p-0">

					{filtered.length === 0 ? (

						<div className={`text-center py-16 transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-500'

						}`}>

							<ClipboardList className={`h-20 w-20 mx-auto mb-6 opacity-50 transition-colors duration-300 ${

								darkMode ? 'text-slate-500' : 'text-slate-400'

							}`} />

							<div className={`text-xl font-medium mb-3 transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>No risks found</div>

							<div className={`text-base transition-colors duration-300 ${

								darkMode ? 'text-slate-500' : 'text-slate-600'

							} mb-6`}>Try adjusting your filters or add a new risk</div>

							<RiskDialog

								trigger={<Button variant="outline" className={`h-11 px-6 border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 ${

									darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

								}`}>

									<Plus className="h-4 w-4 mr-2" /> Add Your First Risk

								</Button>}

								initial={{}}

								onSave={addRisk}

								departments={departments}

								categories={categories}

								subcategories={subcategories}

								config={config}

							/>

						</div>

					) : (

						<div className="overflow-x-auto">

							<table className="w-full text-sm">

								<thead className={`border-b sticky top-0 transition-colors duration-300 ${

									darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'

								}`}>

									<tr>

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

							}`} title="Risk title and brief description">Risk Details</th>

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

							}`} title="Department responsible for this risk">Department</th>

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

							}`} title="Risk category classification">Category</th>

										{showDetails && <th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Risk subcategory classification">Subcategory</th>}

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Inherent risk score">Inherent Score</th>

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Residual risk score after controls">Residual Score</th>

										<th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Current approval status">Status</th>

										{showDetails && <th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Risk owner or champion">Owner</th>}

										{showDetails && <th className={`py-4 px-6 text-left font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Next review due date">Due Date</th>}

										{showDetails && <th className={`py-4 px-6 text-center font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Business Interruption flag">BI</th>}

										{showDetails && <th className={`py-4 px-6 text-center font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="Top Risk flag">Top</th>}

										<th className={`py-4 px-6 text-center font-bold transition-colors duration-300 ${

											darkMode ? 'text-slate-200' : 'text-slate-800'

										}`} title="View detailed risk report or edit risk">Actions</th>

									</tr>

								</thead>

								<tbody className={`divide-y transition-colors duration-300 ${

									darkMode ? 'divide-slate-700' : 'divide-slate-100'

								}`}>

									{filtered.map((r) => {

										const residualL = r.residualLikelihood ?? r.likelihood;

										const residualI = r.residualImpact ?? r.impact;

										const score = scoreOf(residualL, residualI);

										const level = riskLevel(score, config.scoring.thresholds);

										const deptName = r.department || departments.find(d=>d.id===r.departmentId)?.name || "";

										const subName = r.subcategory || subcategories.find(s=>s.id===r.subcategoryId)?.name || "";

										const catName = r.category || categories.find(c=>c.id===r.categoryId)?.name || "";

										return (

											<tr key={r.id} className={`hover:bg-slate-50 transition-all duration-300 group ${

												darkMode ? 'hover:bg-slate-700' : ''

											}`}>

												<td className="py-4 px-6 max-w-[320px]">

													<div className={`font-semibold transition-colors duration-300 ${

														darkMode ? 'text-slate-100' : 'text-slate-900'

													} mb-2`}>{r.title}</div>

													<div className={`text-sm transition-colors duration-300 ${

														darkMode ? 'text-slate-400' : 'text-slate-600'

													} line-clamp-1`}>{descSummary(r)}</div>

												</td>

												<td className={`py-4 px-6 transition-colors duration-300 ${

										darkMode ? 'text-slate-300' : 'text-slate-700'

												}`}>

													<div className="font-medium">{deptName}</div>

												</td>

												<td className={`py-4 px-6 transition-colors duration-300 ${

										darkMode ? 'text-slate-300' : 'text-slate-700'

												}`}>

													<div className="font-medium">{catName}</div>

												</td>

												{showDetails && <td className={`py-4 px-6 transition-colors duration-300 ${

													darkMode ? 'text-slate-400' : 'text-slate-600'

												}`}>{subName}</td>}

												<td className="py-4 px-6">

													<Badge className={`bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 border border-blue-200 shadow-sm ${

														darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : ''

													}`}>

														{r.likelihood} × {r.impact} = {r.likelihood * r.impact}

													</Badge>

												</td>

												<td className="py-4 px-6">

													<Badge className={`${level.tone} text-xs font-semibold px-3 py-1.5 shadow-sm ${

														darkMode ? 'text-white' : ''

													}`}>

														{residualL} × {residualI} = {score}

													</Badge>

												</td>

												<td className="py-4 px-6">

													<Badge variant={r.status === "Approved" ? "default" : "secondary"} className={`text-xs font-semibold px-3 py-1.5 shadow-sm ${

														darkMode ? 'text-white' : ''

													}`}>

														{r.status}

													</Badge>

												</td>

												{showDetails && <td className={`py-4 px-6 text-sm transition-colors duration-300 ${

													darkMode ? 'text-slate-400' : 'text-slate-600'

												}`}>{r.owner}</td>}

												{showDetails && <td className={`py-4 px-6 text-sm transition-colors duration-300 ${

													darkMode ? 'text-slate-400' : 'text-slate-600'

												}`}>{prettyDate(r.dueDate)}</td>}

												{showDetails && (

													<td className="py-4 px-6 text-center">

														{r.businessInterruption ? (

															<Badge className={`bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1.5 border border-sky-200 shadow-sm ${

																darkMode ? 'bg-sky-900 text-sky-200 border-sky-700' : ''

															}`}>BI</Badge>

														) : ""}

													</td>

												)}

												{showDetails && (

													<td className="py-4 px-6 text-center">

														{r.topRisk ? (

															<Badge className={`bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 border border-amber-200 shadow-sm ${

																darkMode ? 'bg-amber-900 text-amber-200 border-amber-700' : ''

															}`}>★</Badge>

														) : ""}

													</td>

												)}

												<td className="py-4 px-6">

													<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

														<Button 

															size="sm" 

															variant="outline" 

															onClick={() => {

																setSelectedRisk(r);

																setRiskReportOpen(true);

															}}

															className={`h-8 px-3 text-xs border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 shadow-sm ${

																darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

															}`}

															title="View detailed risk report"

														>

															<Eye className="h-3 w-3 mr-1" />

															View

														</Button>

														<RiskDialog

															trigger={<Button variant="outline" size="sm" className={`h-8 px-3 text-xs border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 shadow-sm ${

																darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : ''

															}`} title="Edit risk details">

																<FileText className="h-3 w-3 mr-1" />

																Edit

															</Button>}

															initial={r}

															onSave={(nr) => updateRisk(r.id, nr)}

															departments={departments}

															categories={categories}

															subcategories={subcategories}

															config={config}

														/>

														<Button 

															variant="ghost" 

															size="sm" 

															onClick={() => {

																if (confirm(`Are you sure you want to delete "${r.title}"? This action cannot be undone.`)) {

																	deleteRisk(r.id);

																}

															}}

															className={`h-8 px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500 shadow-sm ${

																darkMode ? 'text-red-400 hover:bg-red-900/20' : ''

															}`}

															title="Delete this risk"

														>

															<Trash2 className="h-3 w-3" />

														</Button>

													</div>

												</td>

											</tr>

										);

									})}

								</tbody>

							</table>

						</div>

					)}

				</CardContent>

			</Card>

		</div>

	);

}

// -------------------- Risk Dialog --------------------

function RiskDialog({ trigger, onSave, initial, defaults = {}, departments, categories, subcategories, config, focusReturnId }) {

	const [open, setOpen] = useState(false);

	const firstDept = departments[0]?.id;

	const firstCat = categories[0]?.id;

	const firstSub = subcategories.find(s => s.parentCategoryId === firstCat)?.id;



	const [form, setForm] = useState(initial || {

		id: id(),

		title: "",

		descriptionCause: "",

		descriptionEvent: "",

		descriptionConsequence: "",

		worstCase: "",

		departmentId: firstDept,

		department: undefined,

		linkedProcesses: [],

		categoryId: firstCat,

		category: undefined,

		subcategoryId: firstSub,

		subcategory: undefined,

		owner: defaults.owner || "owner@company.com",

		champion: defaults.champion || "champion@company.com",

		likelihood: 3,

		impact: 3,

		residualLikelihood: 3,

		residualImpact: 3,

		likelihoodNotes: "",

		impactNotes: "",

		residualLikelihoodNotes: "",

		residualImpactNotes: "",

		status: "Draft",

		mitigationActions: [],

		businessInterruption: false,

		topRisk: false,

		dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),

		createdAt: nowISO(),

		createdBy: defaults.owner || "owner@company.com",

		approvals: [],

		incidents: [],

		// New Controls fields

		existingControls: [],

		controlOwner: "",

		controlEffectiveness: 0,

		// ISO 31000 fields

		riskTreatment: "",

		nextReviewDate: undefined,

	});



	useEffect(() => { if (initial) setForm({ ...initial }); }, [initial]);

	function change(k, v) { setForm((f) => ({ ...f, [k]: v })); }



	const thresholds = config.scoring.thresholds;

	const s1 = scoreOf(form.likelihood, form.impact);

	const s2 = scoreOf(form.residualLikelihood, form.residualImpact);

	const lev1 = riskLevel(s1, thresholds);

	const lev2 = riskLevel(s2, thresholds);



	const selectedDept = departments.find(d => d.id === form.departmentId) || departments.find(d => d.name === form.department);

	const deptProcesses = selectedDept?.processes || [];

	const subOptions = subcategories.filter(s => s.parentCategoryId === (form.categoryId || categories.find(c=>c.name===form.category)?.id));



	return (

		<Dialog open={open} onOpenChange={(v)=>{ setOpen(v); if (!v && focusReturnId) { setTimeout(()=>{ const el = document.getElementById(focusReturnId); if (el) try { el.focus(); } catch {} }, 0) } }}>

			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="max-w-7xl h-[95vh] overflow-y-auto bg-slate-50">

				<DialogHeader className="pb-8 px-8 pt-8 bg-white border-b border-slate-200">

					<DialogTitle className="text-3xl font-bold text-slate-900 mb-3">

						{initial ? "Edit Risk Assessment" : "Create New Risk Assessment"}

					</DialogTitle>

					<p className="text-lg text-slate-600 leading-relaxed">

						{initial ? "Update comprehensive risk information and assessment details" : "Define a new risk with detailed analysis following international standards"}

					</p>

				</DialogHeader>

				<div className="p-8 space-y-10">

					{/* Basic Information Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<FileText className="h-6 w-6" />

								Basic Risk Information

							</h3>

							<p className="text-blue-100 mt-2">Essential details to identify and categorize the risk</p>

						</div>

						<div className="p-8 space-y-6">

							{/* Risk Title */}

							<div className="space-y-3">

								<Label className="text-base font-semibold text-slate-800">Risk Title *</Label>

								<Input 

									value={form.title} 

									onChange={(e)=>change("title", e.target.value)}

									placeholder="Enter a clear, descriptive title for this risk..."

									className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"

								/>

							</div>

							

							{/* Department, Category, Subcategory Grid */}

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Department</Label>

									<Select value={form.departmentId || ""} onValueChange={(v)=>{ change("departmentId", v); change("linkedProcesses", []); }}>

										<SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">

											<SelectValue placeholder="Select Department" />

										</SelectTrigger>

										<SelectContent>

											{departments.map((d)=>(<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}

										</SelectContent>

									</Select>

									{selectedDept?.description && (

										<div className="text-sm text-blue-700 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">

											<strong>Department Description:</strong> {selectedDept.description}

										</div>

									)}

								</div>

								

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Category</Label>

									<Select value={form.categoryId || ""} onValueChange={(v)=>{ change("categoryId", v); change("subcategoryId", subcategories.find(s=>s.parentCategoryId===v)?.id || undefined); }}>

										<SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">

											<SelectValue placeholder="Select Category" />

										</SelectTrigger>

										<SelectContent>

											{categories.map((c)=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}

										</SelectContent>

									</Select>

								</div>

								

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Subcategory</Label>

									<Select value={form.subcategoryId || ""} onValueChange={(v)=>change("subcategoryId", v)}>

										<SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">

											<SelectValue placeholder="Select Subcategory" />

										</SelectTrigger>

										<SelectContent>

											{subOptions.map((s)=>(<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}

										</SelectContent>

									</Select>

								</div>

							</div>

						</div>

					</div>



					{/* Description Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<AlertTriangle className="h-6 w-6" />

								Risk Description & Analysis

							</h3>

							<p className="text-emerald-100 mt-2">Comprehensive breakdown of cause, event, and consequence</p>

						</div>

						<div className="p-8 space-y-6">

							{/* C-E-C Grid */}

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Root Cause</Label>

									<Textarea 

										rows={5} 

										value={form.descriptionCause} 

										onChange={(e)=>change("descriptionCause", e.target.value)}

										placeholder="What underlying factors cause this risk to materialize? Consider systemic issues, vulnerabilities, or root causes..."

										className="border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg resize-none"

									/>

								</div>

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Risk Event</Label>

									<Textarea 

										rows={5} 

										value={form.descriptionEvent} 

										onChange={(e)=>change("descriptionEvent", e.target.value)}

										placeholder="What specific event or incident could occur? Describe the trigger or catalyst..."

										className="border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg resize-none"

									/>

								</div>

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Potential Consequence</Label>

									<Textarea 

										rows={5} 

										value={form.descriptionConsequence} 

										onChange={(e)=>change("descriptionConsequence", e.target.value)}

										placeholder="What would be the impact if this risk occurs? Consider financial, operational, reputational, and regulatory impacts..."

										className="border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg resize-none"

									/>

								</div>

							</div>

							

							{/* Worst Case Scenario */}

							<div className="space-y-3 pt-4 border-t border-slate-200">

								<Label className="text-base font-semibold text-slate-800">Worst Case Scenario</Label>

								<Textarea 

									rows={4} 

									value={form.worstCase} 

									onChange={(e)=>change("worstCase", e.target.value)}

									placeholder="Describe the most severe potential outcome, including maximum financial loss, operational disruption, and cascading effects..."

									className="border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg resize-none"

								/>

							</div>

						</div>

					</div>



					{/* Risk Assessment Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<BarChart3 className="h-6 w-6" />

								Risk Assessment & Scoring

							</h3>

							<p className="text-amber-100 mt-2">Evaluate likelihood and impact to determine risk levels</p>

						</div>

						<div className="p-8 space-y-8">

							{/* Inherent Risk Assessment */}

							<div className="space-y-6">

								<div className="flex items-center gap-3 mb-4">

									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>

									<h4 className="text-lg font-semibold text-slate-800">Inherent Risk Assessment</h4>

									<span className="text-sm text-slate-600">(Before controls)</span>

								</div>

								

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

									<ScorePickerEditable 

										label="Likelihood" 

										value={form.likelihood} 

										onChange={(v)=>change("likelihood", v)} 

										labels={config.likelihoodLabels} 

										notes={form.likelihoodNotes} 

										onNotesChange={(v)=>change("likelihoodNotes", v)} 

									/>

									<ScorePickerEditable 

										label="Impact" 

										value={form.impact} 

										onChange={(v)=>change("impact", v)} 

										labels={config.impactLabels} 

										notes={form.impactNotes} 

										onNotesChange={(v)=>change("impactNotes", v)} 

									/>

								</div>

								

								<div className="bg-blue-50 p-6 rounded-xl border border-blue-200">

									<div className="flex items-center justify-between mb-3">

										<div className="text-sm font-medium text-blue-800">Inherent Risk Score</div>

										<div className="text-xs text-blue-600 italic">= likelihood × impact before considering controls</div>

									</div>

									<div className="flex items-center gap-3">

										<Badge className={`${lev1.tone} text-base px-4 py-2`}>

											{s1} - {lev1.label}

										</Badge>

										<div className="text-sm text-blue-700">

											{form.likelihood} × {form.impact} = {s1}

										</div>

									</div>

								</div>

							</div>

							

							{/* Residual Risk Assessment */}

							<div className="space-y-6 pt-6 border-t border-slate-200">

								<div className="flex items-center gap-3 mb-4">

									<div className="w-3 h-3 bg-emerald-500 rounded-full"></div>

									<h4 className="text-lg font-semibold text-slate-800">Residual Risk Assessment</h4>

									<span className="text-sm text-slate-600">(After controls)</span>

								</div>

								

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

									<ScorePickerEditable 

										label="Residual Likelihood" 

										value={form.residualLikelihood} 

										onChange={(v)=>change("residualLikelihood", v)} 

										labels={config.likelihoodLabels} 

										notes={form.residualLikelihoodNotes} 

										onNotesChange={(v)=>change("residualLikelihoodNotes", v)} 

									/>

									<ScorePickerEditable 

										label="Residual Impact" 

										value={form.residualImpact} 

										onChange={(v)=>change("residualImpact", v)} 

										labels={config.impactLabels} 

										notes={form.residualImpactNotes} 

										onNotesChange={(v)=>change("residualImpactNotes", v)} 

									/>

								</div>

								

								<div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">

									<div className="flex items-center justify-between mb-3">

										<div className="text-sm font-medium text-emerald-800">Residual Risk Score</div>

										<div className="text-xs text-emerald-600 italic">= likelihood × impact after existing controls and mitigations</div>

									</div>

									<div className="flex items-center gap-3">

										<Badge className={`${lev2.tone} text-base px-4 py-2`}>

											{s2} - {lev2.label}

										</Badge>

										<div className="text-sm text-emerald-700">

											{form.residualLikelihood} × {form.residualImpact} = {s2}

										</div>

									</div>

									<div className="text-sm text-emerald-700 mt-3 p-3 bg-emerald-100 rounded-lg">

										<strong>Note:</strong> Residual score should reflect the effectiveness of existing controls and mitigations.

									</div>

								</div>

							</div>

						</div>

					</div>

					{/* Enhanced Controls & Mitigations Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<Shield className="h-6 w-6" />

								Controls & Mitigations

							</h3>

							<p className="text-purple-100 mt-2">Document existing controls, their effectiveness, and mitigation strategies</p>

						</div>

						<div className="p-8 space-y-8">

							{/* Controls Overview */}

							<div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">

								<h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">

									<Shield className="h-5 w-5" />

									Existing Controls Assessment

								</h4>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

								<div className="space-y-3">

										<Label className="text-base font-semibold text-purple-800">Control Descriptions</Label>

									<Textarea 

											rows={5}

											placeholder="Describe existing controls, policies, procedures, or safeguards that help manage this risk (e.g., 'Monthly budget reviews, Automated alerts, Training programs')" 

										value={(form.existingControls || []).join(", ")} 

										onChange={(e) => change("existingControls", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 

											className="border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg resize-none"

									/>

										<p className="text-xs text-purple-600">Separate multiple controls with commas</p>

								</div>

								<div className="space-y-3">

										<Label className="text-base font-semibold text-purple-800">Control Owner</Label>

									<Input 

											placeholder="Email of control owner (e.g., control.owner@company.com)" 

										value={form.controlOwner || ""} 

										onChange={(e) => change("controlOwner", e.target.value)} 

											className="h-12 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"

									/>

										<p className="text-xs text-purple-600">Person responsible for maintaining this control</p>

									</div>

								</div>

							</div>

							

							{/* Control Effectiveness Rating */}

							<div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">

								<h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">

									<BarChart3 className="h-5 w-5" />

									Control Effectiveness Rating

								</h4>

							<div className="space-y-4">

									<div className="grid grid-cols-5 gap-4">

									{Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (

										<button

											type="button"

											key={n}

											onClick={() => change("controlEffectiveness", n)}

												className={`h-16 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${

												n === (form.controlEffectiveness || 0) 

														? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105" 

														: "bg-white hover:bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:scale-102"

												}`}

												title={n === 1 ? "Very Weak - Control provides minimal risk reduction" : 

													  n === 2 ? "Weak - Control provides limited risk reduction" : 

													  n === 3 ? "Moderate - Control provides reasonable risk reduction" : 

													  n === 4 ? "Strong - Control provides significant risk reduction" : 

													  "Very Strong - Control provides maximum risk reduction"}

											>

												<div className="text-lg font-bold">{n}</div>

												<div className="text-xs opacity-80">

													{n === 1 ? "Very Weak" : 

													 n === 2 ? "Weak" : 

													 n === 3 ? "Moderate" : 

													 n === 4 ? "Strong" : 

													 "Very Strong"}

												</div>

										</button>

									))}

								</div>

									<div className="bg-white p-4 rounded-lg border border-indigo-200">

										<div className="flex items-center gap-3">

											<div className={`w-4 h-4 rounded-full ${

												form.controlEffectiveness === 1 ? "bg-red-500" :

												form.controlEffectiveness === 2 ? "bg-orange-500" :

												form.controlEffectiveness === 3 ? "bg-yellow-500" :

												form.controlEffectiveness === 4 ? "bg-green-500" :

												form.controlEffectiveness === 5 ? "bg-emerald-500" : "bg-gray-300"

											}`}></div>

											<div className="text-sm">

												<strong className="text-indigo-800">Current Rating:</strong> {

													form.controlEffectiveness === 1 ? "Very Weak - Control provides minimal risk reduction" : 

													form.controlEffectiveness === 2 ? "Weak - Control provides limited risk reduction" : 

													form.controlEffectiveness === 3 ? "Moderate - Control provides reasonable risk reduction" : 

													form.controlEffectiveness === 4 ? "Strong - Control provides significant risk reduction" : 

													form.controlEffectiveness === 5 ? "Very Strong - Control provides maximum risk reduction" : "Not rated - Please assess control effectiveness"

												}

											</div>

										</div>

									</div>

								</div>

							</div>

							

							{/* Mitigation Actions Section */}

							<div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">

								<h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">

									<ClipboardList className="h-5 w-5" />

									Mitigation Actions & Strategies

								</h4>

								<p className="text-blue-700 mb-4">Define specific actions to reduce risk exposure and improve control effectiveness</p>

								<MitigationActionsEditor 

									actions={form.mitigationActions || []} 

									onChange={(actions) => change("mitigationActions", actions)} 

								/>

							</div>

						</div>

					</div>



					{/* ISO 31000 Alignment Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<FileCheck className="h-6 w-6" />

								ISO 31000 Alignment

							</h3>

							<p className="text-indigo-100 mt-2">Standard risk management framework alignment</p>

						</div>

						<div className="p-8 space-y-6">

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Risk Treatment Strategy</Label>

									<Select value={form.riskTreatment || ""} onValueChange={(v) => change("riskTreatment", v)}>

										<SelectTrigger className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg">

											<SelectValue placeholder="Select strategy" />

										</SelectTrigger>

										<SelectContent>

											<SelectItem value="Accept">Accept</SelectItem>

											<SelectItem value="Mitigate">Mitigate</SelectItem>

											<SelectItem value="Transfer">Transfer</SelectItem>

											<SelectItem value="Avoid">Avoid</SelectItem>

										</SelectContent>

									</Select>

								</div>

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Next Review Date</Label>

									<Input 

										type="date" 

										value={form.nextReviewDate?.slice(0,10) || ""} 

										onChange={(e) => change("nextReviewDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} 

										className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg"

									/>

								</div>

							</div>

						</div>

					</div>



					{/* Additional Details Section */}

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

						<div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">

							<h3 className="text-xl font-bold text-white flex items-center gap-3">

								<Settings className="h-6 w-6" />

								Additional Details & Settings

							</h3>

							<p className="text-slate-100 mt-2">Risk metadata and configuration options</p>

						</div>

						<div className="p-8 space-y-6">

							<div className="space-y-3">

								<Label className="text-base font-semibold text-slate-800">Due Date</Label>

								<Input 

									type="date" 

									value={form.dueDate?.slice(0,10)} 

									onChange={(e)=>change("dueDate", new Date(e.target.value).toISOString())} 

									className="h-12 border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 rounded-lg"

								/>

							</div>

							

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Risk Owner (Email)</Label>

									<Input 

										value={form.owner} 

										onChange={(e)=>change("owner", e.target.value)} 

										placeholder="owner@company.com"

										className="h-12 border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 rounded-lg"

									/>

								</div>

								<div className="space-y-3">

									<Label className="text-base font-semibold text-slate-800">Risk Champion (Email)</Label>

									<Input 

										value={form.champion} 

										onChange={(e)=>change("champion", e.target.value)} 

										placeholder="champion@company.com"

										className="h-12 border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 rounded-lg"

									/>

								</div>

							</div>

							

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

								<label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">

									<input 

										type="checkbox" 

										className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-slate-300 rounded" 

										checked={!!form.businessInterruption} 

										onChange={(e)=>change("businessInterruption", e.target.checked)} 

									/>

									<div>

										<div className="text-base font-semibold text-slate-800">Business Interruption</div>

										<div className="text-sm text-slate-600">Flag as critical business process risk</div>

									</div>

								</label>

								<label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">

									<input 

										type="checkbox" 

										className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-slate-300 rounded" 

										checked={!!form.topRisk} 

										onChange={(e)=>change("topRisk", e.target.checked)} 

									/>

									<div>

										<div className="text-base font-semibold text-slate-800">Top Risk</div>

										<div className="text-sm text-slate-600">Mark as high-priority risk</div>

									</div>

								</label>

							</div>

						</div>

					</div>

				</div>

				{/* Actions Section */}

				<div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-200">

					<Button 

						variant="outline" 

						onClick={()=>setOpen(false)}

						size="lg"

						className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50"

					>

						Cancel

					</Button>

					<Button 

						onClick={()=>{ onSave(form); setOpen(false); }}

						size="lg"

						className="px-8 py-3 bg-blue-600 hover:bg-blue-700"

					>

						<Save className="h-4 w-4 mr-2" /> 

						{initial ? "Update Risk" : "Create Risk"}

					</Button>

				</div>

			</DialogContent>

		</Dialog>

	);

}



// simple multi select chiplist

function ProcessMultiSelect({ options, selected, onChange }) {

	const [q, setQ] = useState("");

	const filtered = options.filter(p => p.toLowerCase().includes(q.toLowerCase()));

	function toggle(p) { onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]); }

	return (

		<div className="space-y-2">

			<Input placeholder="Search processes" value={q} onChange={(e)=>setQ(e.target.value)} />

			<div className="flex flex-wrap gap-1 max-h-32 overflow-auto">

				{filtered.length === 0 ? <div className="text-xs text-slate-500">No matches</div> : filtered.map(p => (

					<button key={p} type="button" onClick={()=>toggle(p)} className={`px-2 py-1 rounded text-xs border ${selected.includes(p) ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}>{p}</button>

				))}

			</div>

			{selected.length > 0 && (

				<div className="flex flex-wrap gap-1">

					{selected.map(p => (<span key={p} className="px-2 py-0.5 rounded bg-slate-100 text-xs">{p}</span>))}

				</div>

			)}

		</div>

	);

}



// -------------------- Score Picker (editable + notes) --------------------

function ScorePickerEditable({ label, value, onChange, labels, notes, onNotesChange }) {

	function clampToRange(n) {

		const num = Number(n);

		if (Number.isNaN(num)) return value;

		return Math.min(5, Math.max(1, Math.round(num)));

	}

	return (

		<div className="bg-white p-4 rounded-lg border border-slate-200">

			<Label className="text-sm font-semibold text-slate-800 mb-3 block">{label}</Label>

			

			{/* Score Buttons */}

			<div className="grid grid-cols-5 gap-2 mb-4">

				{Array.from({ length: 5 }, (_, i) => i + 1).map((n, idx) => (

					<button

						type="button"

						key={n}

						onClick={() => onChange(n)}

						className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${

							n === value 

								? "bg-blue-600 text-white border-blue-600 shadow-md" 

								: "bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300"

						}`}

						title={labels[idx]}

					>

						{n}

					</button>

				))}

			</div>

			

			{/* Current Selection Display */}

			<div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">

				<div className="text-sm font-medium text-blue-800 mb-1">Selected: {value}</div>

				<div className="text-sm text-blue-700">{labels[value - 1]}</div>

			</div>

			

			{/* Input Fields */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

				<div className="space-y-2">

					<Label className="text-xs font-medium text-slate-700">Manual Input (1-5)</Label>

					<Input 

						type="number" 

						min={1} 

						max={5} 

						step={1} 

						value={value} 

						onChange={(e)=> onChange(clampToRange(e.target.value))}

						className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"

					/>

				</div>

				<div className="space-y-2">

					<Label className="text-xs font-medium text-slate-700">Notes / Rationale</Label>

					<Textarea 

						rows={3} 

						placeholder={`Write why this ${label.toLowerCase()} was selected...`} 

						value={notes || ""} 

						onChange={(e)=> onNotesChange && onNotesChange(e.target.value)}

						className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"

					/>

				</div>

			</div>

		</div>

	);

}



// -------------------- Actions Board --------------------

function ActionsBoard({ risks, setRisks, darkMode = false }) {

	const currentUser = { role: "Risk Owner", email: "user@company.com" }; // Default user for now

	const allActions = risks.flatMap(r => (r.mitigationActions || []).map(a => ({ ...a, riskId: r.id, riskTitle: r.title })));

	const [filter, setFilter] = useState("All");

	const [sortBy, setSortBy] = useState("dueDate");

	

	const filtered = allActions.filter(a => {

		if (filter === "All") return true;

		return a.status === filter;

	});

	

	const sorted = [...filtered].sort((a, b) => {

		if (sortBy === "dueDate") return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);

		if (sortBy === "status") return a.status.localeCompare(b.status);

		if (sortBy === "owner") return a.owner.localeCompare(b.owner);

		return 0;

	});

	

	function updateAction(actionId, updates) {

		setRisks(prev => prev.map(r => ({

			...r,

			mitigationActions: r.mitigationActions?.map(a => a.id === actionId ? { ...a, ...updates } : a) || []

		})));

	}

	return (

		<div className="space-y-6">

			<div className="flex items-center justify-between">

				<h2 className={`text-2xl font-semibold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Actions Board</h2>

			</div>



			{/* Status Summary Cards */}

			<div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

				<Card className={`card-enhanced bg-gradient-to-br border-green-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-green-900/20 to-green-800/20 border-green-700' : 'from-green-50 to-green-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-green-300' : 'text-green-700'

						}`}>{allActions.filter(a => a.status === "Completed").length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-green-400' : 'text-green-600'

						}`}>Completed</div>

					</CardContent>

				</Card>

				<Card className={`card-enhanced bg-gradient-to-br border-blue-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-blue-900/20 to-blue-800/20 border-blue-700' : 'from-blue-50 to-blue-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-blue-300' : 'text-blue-700'

						}`}>{allActions.filter(a => a.status === "In Progress").length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-blue-400' : 'text-blue-600'

						}`}>In Progress</div>

					</CardContent>

				</Card>

				<Card className={`card-enhanced bg-gradient-to-br border-yellow-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-yellow-900/20 to-yellow-800/20 border-yellow-700' : 'from-yellow-50 to-yellow-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-yellow-300' : 'text-yellow-700'

						}`}>{allActions.filter(a => a.status === "Pending").length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-yellow-400' : 'text-yellow-600'

						}`}>Pending</div>

					</CardContent>

				</Card>

				<Card className={`card-enhanced bg-gradient-to-br border-purple-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-purple-900/20 to-purple-800/20 border-purple-700' : 'from-purple-50 to-purple-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-purple-300' : 'text-purple-700'

						}`}>{allActions.filter(a => a.status === "Under Review").length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-purple-400' : 'text-purple-600'

						}`}>Under Review</div>

					</CardContent>

				</Card>

				<Card className={`card-enhanced bg-gradient-to-br border-red-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-red-900/20 to-red-800/20 border-red-700' : 'from-red-50 to-red-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-red-300' : 'text-red-700'

						}`}>{allActions.filter(a => a.status === "Overdue").length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-red-400' : 'text-red-600'

						}`}>Overdue</div>

					</CardContent>

				</Card>

				<Card className={`card-enhanced bg-gradient-to-br border-slate-200 transition-all duration-300 hover-lift ${

					darkMode ? 'from-slate-900/20 to-slate-800/20 border-slate-700' : 'from-slate-50 to-slate-100'

				}`}>

					<CardContent className="p-4 text-center">

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-slate-300' : 'text-slate-700'

						}`}>{allActions.length}</div>

						<div className={`text-sm font-medium transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Total</div>

					</CardContent>

				</Card>

			</div>



			{/* Filters and Controls */}

			<Card className={`transition-colors duration-300 ${

				darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

			}`}>

				<CardHeader className="pb-3">

					<CardTitle className={`text-lg font-semibold transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>Filters & Controls</CardTitle>

				</CardHeader>

				<CardContent>

					<div className="flex flex-wrap gap-4 items-center">

						<div className="flex items-center gap-2">

							<Label htmlFor="status-filter" className={`text-sm font-medium transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>Status:</Label>

							<Select value={filter} onValueChange={setFilter}>

								<SelectTrigger className={`w-32 transition-colors duration-300 ${

									darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'

								}`}>

									<SelectValue />

								</SelectTrigger>

								<SelectContent>

									<SelectItem value="All">All</SelectItem>

									<SelectItem value="Completed">Completed</SelectItem>

									<SelectItem value="In Progress">In Progress</SelectItem>

									<SelectItem value="Pending">Pending</SelectItem>

									<SelectItem value="Under Review">Under Review</SelectItem>

									<SelectItem value="Overdue">Overdue</SelectItem>

								</SelectContent>

							</Select>

						</div>

						<div className="flex items-center gap-2">

							<Label htmlFor="sort-by" className={`text-sm font-medium transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>Sort by:</Label>

							<Select value={sortBy} onValueChange={setSortBy}>

								<SelectTrigger className={`w-32 transition-colors duration-300 ${

									darkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'

								}`}>

									<SelectValue />

								</SelectTrigger>

								<SelectContent>

									<SelectItem value="dueDate">Due Date</SelectItem>

									<SelectItem value="status">Status</SelectItem>

									<SelectItem value="owner">Owner</SelectItem>

									<SelectItem value="priority">Priority</SelectItem>

								</SelectContent>

							</Select>

						</div>

					</div>

				</CardContent>

			</Card>



			{/* Actions Table */}

			<Card>

				<CardContent className="p-0">

					{allActions.length === 0 ? (

						<div className="text-center py-12 text-slate-500">

							<ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />

							<div className="text-lg font-medium mb-2">No actions defined yet</div>

							<div className="text-sm text-slate-600">Define mitigation actions to reduce risk exposure</div>

						</div>

					) : (

						<div className="overflow-x-auto">

							<table className="w-full text-sm border border-slate-200 rounded-lg">

								<thead className="bg-gradient-to-r from-slate-50 to-slate-100">

									<tr>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="Description of the mitigation action">Action</th>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="Risk this action addresses">Risk</th>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="Person responsible for this action">Owner</th>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="When this action is due">Due Date</th>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="Current status of the action">Status</th>

										<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200" title="Quick status update actions">Update</th>

									</tr>

								</thead>

								<tbody className="divide-y divide-slate-100">

									{sorted.map(a => {

										const getStatusColor = (status) => {

											switch (status) {

												case "Completed": return "bg-green-100 text-green-800 border-green-200";

												case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";

												case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";

												case "Overdue": return "bg-red-100 text-red-800 border-red-200";

												case "Under Review": return "bg-purple-100 text-purple-800 border-purple-200";

												default: return "bg-slate-100 text-slate-800 border-slate-200";

											}

										};

										

										return (

											<tr key={a.id} className="hover:bg-slate-50 transition-colors">

												<td className="py-3 px-4 max-w-[300px] text-slate-900">{a.action}</td>

												<td className="py-3 px-4 max-w-[200px] text-xs text-slate-600">{a.riskTitle}</td>

												<td className="py-3 px-4 text-slate-700">{a.owner}</td>

												<td className="py-3 px-4 text-slate-700">{prettyDate(a.dueDate)}</td>

												<td className="py-3 px-4">

													<Select value={a.status} onValueChange={(v) => updateAction(a.id, { status: v })}>

														<SelectTrigger className="w-[120px] h-8 bg-white border-slate-200 focus:ring-2 focus:ring-slate-500">

															<SelectValue />

														</SelectTrigger>

														<SelectContent>

															<SelectItem value="Pending">Pending</SelectItem>

															<SelectItem value="Under Review">Under Review</SelectItem>

															<SelectItem value="In Progress">In Progress</SelectItem>

															<SelectItem value="Completed">Completed</SelectItem>

															<SelectItem value="Overdue">Overdue</SelectItem>

														</SelectContent>

													</Select>

												</td>

												<td className="py-3 px-4">

													<div className="flex items-center gap-2">

														<Button 

															size="sm" 

															variant="outline" 

															onClick={() => updateAction(a.id, { status: "Under Review" })}

															className="h-8 px-2 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"

															disabled={a.status === "Under Review"}

														>

															<Eye className="h-3 w-3 mr-1" />

															Review

														</Button>

														<Button 

															size="sm" 

															variant="outline" 

															onClick={() => updateAction(a.id, { status: "In Progress" })}

															className="h-8 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"

															disabled={a.status === "In Progress"}

														>

															<Play className="h-3 w-3 mr-1" />

															Start

														</Button>

														<Button 

															size="sm" 

															variant="outline" 

															onClick={() => updateAction(a.id, { status: "Completed" })}

															className="h-8 px-2 text-xs border-green-200 text-green-700 hover:bg-green-50"

															disabled={a.status === "Completed"}

														>

															<Check className="h-3 w-3 mr-1" />

															Complete

														</Button>

													</div>

												</td>

											</tr>

										);

									})}

								</tbody>

							</table>

						</div>

					)}

				</CardContent>

			</Card>

		</div>

	);

}



// -------------------- Mitigation Actions Editor --------------------

function MitigationActionsEditor({ actions, onChange }) {

	const [draft, setDraft] = useState({ id: id(), action: "", owner: "", dueDate: "", status: "Pending" });

	function add() { if (!draft.action.trim()) return; const item = { ...draft, id: id() }; onChange([...(actions || []), item]); setDraft({ id: id(), action: "", owner: "", dueDate: "", status: "Pending" }); }

	function update(aid, patch) { onChange(actions.map(a => a.id === aid ? { ...a, ...patch } : a)); }

	function remove(aid) { onChange(actions.filter(a => a.id !== aid)); }

	return (

		<div className="space-y-8">

			{/* Enhanced Add New Action Form */}

			<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">

				<div className="flex items-center gap-3 mb-6">

					<div className="p-3 bg-blue-100 rounded-xl">

						<Plus className="h-6 w-6 text-blue-700" />

				</div>

					<div>

						<h4 className="text-xl font-bold text-slate-800">Add New Mitigation Action</h4>

						<p className="text-blue-700 text-sm">Define specific actions to reduce risk exposure</p>

					</div>

				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

					<div className="lg:col-span-2 space-y-3">

						<Label className="text-base font-semibold text-slate-700">Action Description *</Label>

						<Textarea 

							rows={4}

							placeholder="Describe the specific mitigation action to reduce this risk (e.g., 'Implement automated monitoring system', 'Conduct quarterly training sessions')..." 

							value={draft.action} 

							onChange={(e)=>setDraft({...draft, action: e.target.value})}

							className="border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg resize-none text-base"

						/>

					</div>

					<div className="space-y-3">

						<Label className="text-base font-semibold text-slate-700">Owner Email</Label>

						<Input 

							placeholder="owner@company.com" 

							value={draft.owner} 

							onChange={(e)=>setDraft({...draft, owner: e.target.value})}

							className="h-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"

						/>

					</div>

					<div className="space-y-3">

						<Label className="text-base font-semibold text-slate-700">Due Date</Label>

						<Input 

							type="date" 

							value={draft.dueDate} 

							onChange={(e)=>setDraft({...draft, dueDate: e.target.value})}

							className="h-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"

						/>

					</div>

				</div>

				<div className="mt-6 flex justify-end">

					<Button 

						onClick={add} 

						disabled={!draft.action.trim()}

						className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 h-12 rounded-lg shadow-lg text-base font-semibold"

					>

						<Plus className="h-4 w-4 mr-2" /> Add Action

					</Button>

				</div>

			</div>



			{/* Enhanced Actions Table */}

			{(!actions || actions.length === 0) ? (

				<div className="text-center py-16 text-slate-500 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">

					<ClipboardList className="h-20 w-20 mx-auto mb-6 opacity-50" />

					<div className="text-lg font-medium mb-3">No mitigation actions yet</div>

					<div className="text-base text-slate-600">Add actions above to reduce this risk</div>

				</div>

			) : (

				<div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

					<div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">

						<h4 className="text-xl font-bold text-white flex items-center gap-3">

							<ClipboardList className="h-6 w-6" />

							Current Mitigation Actions

						</h4>

						<p className="text-slate-300 mt-2">Track progress and status of risk reduction activities</p>

					</div>

					<div className="overflow-x-auto">

						<table className="w-full text-sm">

							<thead className="bg-gradient-to-r from-slate-50 to-slate-100">

								<tr className="text-left">

									<th className="py-5 px-8 font-bold text-slate-800 border-b border-slate-200">Action Description</th>

									<th className="py-5 px-8 font-bold text-slate-800 border-b border-slate-200">Owner</th>

									<th className="py-5 px-8 font-bold text-slate-800 border-b border-slate-200">Due Date</th>

									<th className="py-5 px-8 font-bold text-slate-800 border-b border-slate-200">Status</th>

									<th className="py-5 px-8 font-bold text-slate-800 border-b border-slate-200">Actions</th>

								</tr>

							</thead>

							<tbody className="divide-y divide-slate-100">

								{actions.map(a => (

									<tr key={a.id} className="hover:bg-slate-50 transition-all duration-200 group">

										<td className="py-5 px-8">

											<Textarea 

												rows={3}

												value={a.action} 

												onChange={(e)=>update(a.id, { action: e.target.value })}

												className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg resize-none min-w-[350px] text-base"

												placeholder="Describe the mitigation action..."

											/>

										</td>

										<td className="py-5 px-8">

											<Input 

												value={a.owner} 

												onChange={(e)=>update(a.id, { owner: e.target.value })}

												className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-11 text-base"

												placeholder="owner@company.com"

											/>

										</td>

										<td className="py-5 px-8">

											<Input 

												type="date" 

												value={(a.dueDate||'').slice(0,10)} 

												onChange={(e)=>update(a.id, { dueDate: e.target.value })}

												className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-11 text-base"

											/>

										</td>

										<td className="py-5 px-8">

											<Select value={a.status || "Pending"} onValueChange={(v)=>update(a.id, { status: v })}>

												<SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg h-11">

													<SelectValue placeholder="Status" />

												</SelectTrigger>

																						<SelectContent>

													{['Pending','In Progress','Under Review','Completed','On Hold','Cancelled'].map(s=> (

														<SelectItem key={s} value={s} className="text-base">

															{s}

														</SelectItem>

													))}

										</SelectContent>

											</Select>

										</td>

										<td className="py-5 px-8 text-right">

											<Button 

												size="sm" 

												variant="ghost" 

												className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" 

												onClick={()=>remove(a.id)}

												title="Remove this action"

											>

												<Trash2 className="h-4 w-4" />

											</Button>

										</td>

									</tr>

								))}

							</tbody>

						</table>

					</div>

				</div>

			)}

		</div>

	);

}

// -------------------- Incidents --------------------

function Incidents({ incidents, setIncidents, departments, risks, setRisks, darkMode = false }) {

	function linkIncidentToRisk(incidentId, riskId) {

		setIncidents((prev) => prev.map((i) => (i.id === incidentId ? { ...i, linkedRiskId: riskId } : i)));

		setRisks((prev) => prev.map((r) => (r.id === riskId ? { ...r, incidents: uniq([...(r.incidents||[]), incidentId]) } : r)));

	}

	return (

		<Card>

			<CardHeader className="flex items-center justify-between"><CardTitle>Incident Log</CardTitle><IncidentDialog trigger={<Button><Plus className="h-4 w-4 mr-2" /> New Incident</Button>} onSave={(i) => setIncidents((prev) => [i, ...prev])} departments={departments} /></CardHeader>

			<CardContent><IncidentTable incidents={incidents} risks={risks} onLink={linkIncidentToRisk} /></CardContent>

		</Card>

	);

}



function IncidentTable({ incidents, risks, onLink, compact=false }) {

	return (

		<div className="overflow-x-auto">

			<table className={`w-full ${compact ? "text-xs" : "text-sm"}`}>

				<thead>

					<tr className="text-left border-b">

						<th className="py-2 pr-2">Date</th>

						<th className="py-2 pr-2">Dept</th>

						<th className="py-2 pr-2">Severity</th>

						<th className="py-2 pr-2">Summary</th>

						<th className="py-2 pr-2">Linked risk</th>

						{onLink && <th className="py-2 pr-2">Action</th>}

					</tr>

				</thead>

				<tbody>

					{incidents.map((i) => (

						<tr key={i.id} className="border-b">

							<td className="py-2 pr-2">{prettyDate(i.date)}</td>

							<td className="py-2 pr-2">{i.department}</td>

							<td className="py-2 pr-2">{i.severity}</td>

							<td className="py-2 pr-2 max-w-[520px]">{i.summary}</td>

							<td className="py-2 pr-2">{i.linkedRiskId ? risks.find((r)=>r.id===i.linkedRiskId)?.title || i.linkedRiskId : "None"}</td>

							{onLink && (<td className="py-2 pr-2"><LinkMenu i={i} risks={risks} onLink={onLink} /></td>)}

						</tr>

					))}

				</tbody>

			</table>

		</div>

	);

}



function LinkMenu({ i, risks, onLink }) {

	const [riskId, setRiskId] = useState(i.linkedRiskId || (risks[0]?.id || ""));

	return (

		<div className="flex items-center gap-2">

			<Select value={riskId} onValueChange={setRiskId}>

				<SelectTrigger className="w-[220px]"><SelectValue placeholder="Select risk" /></SelectTrigger>

				<SelectContent>{risks.map((r)=>(<SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>))}</SelectContent>

			</Select>

			<Button size="sm" variant="outline" onClick={()=>onLink(i.id, riskId)}>Link</Button>

		</div>

	);

}

function IncidentDialog({ trigger, onSave, departments }) {

	const [open, setOpen] = useState(false);

	const [form, setForm] = useState({ id: id(), department: departments[0]?.name || departments[0], date: new Date().toISOString(), severity: "Minor", summary: "", linkedRiskId: null });

	function change(k, v) { setForm((f)=>({ ...f, [k]: v })); }

	return (

		<Dialog open={open} onOpenChange={setOpen}>

			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="max-w-2xl">

				<DialogHeader className="pb-6">

					<DialogTitle className="text-2xl font-semibold text-slate-900">

						New Incident Report

					</DialogTitle>

					<p className="text-slate-600 mt-2">

						Document a new incident with comprehensive details

					</p>

				</DialogHeader>

				

				<div className="space-y-6">

					{/* Basic Information */}

					<div className="bg-blue-50 p-6 rounded-xl border border-blue-200">

						<h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">

							<AlertTriangle className="h-5 w-5" />

							Incident Details

						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

							<div className="space-y-3">

								<Label className="text-sm font-medium text-blue-800">Department *</Label>

								<Select value={form.department} onValueChange={(v)=>change("department", v)}>

									<SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400">

										<SelectValue placeholder="Select Department" />

									</SelectTrigger>

									<SelectContent>

										{departments.map((d)=>(<SelectItem key={typeof d === "string" ? d : d.id} value={typeof d === "string" ? d : d.name}>{typeof d === "string" ? d : d.name}</SelectItem>))}

									</SelectContent>

								</Select>

							</div>

							<div className="space-y-3">

								<Label className="text-sm font-medium text-blue-800">Incident Date *</Label>

								<Input 

									type="date" 

									value={form.date.slice(0,10)} 

									onChange={(e)=>change("date", new Date(e.target.value).toISOString())}

									className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"

								/>

							</div>

						</div>

					</div>



					{/* Severity Assessment */}

					<div className="bg-amber-50 p-6 rounded-xl border border-amber-200">

						<h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">

							<Activity className="h-5 w-5" />

							Severity Assessment

						</h3>

						<div className="space-y-3">

							<Label className="text-sm font-medium text-amber-800">Severity Level *</Label>

							<Select value={form.severity} onValueChange={(v)=>change("severity", v)}>

								<SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">

									<SelectValue placeholder="Select Severity" />

								</SelectTrigger>

								<SelectContent>

									{['Minor','Moderate','Major','Severe'].map((s)=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}

								</SelectContent>

							</Select>

							<div className="text-xs text-amber-600 mt-2">

								<strong>Minor:</strong> Minimal impact, resolved quickly<br/>

								<strong>Moderate:</strong> Some disruption, requires attention<br/>

								<strong>Major:</strong> Significant impact, needs immediate action<br/>

								<strong>Severe:</strong> Critical impact, emergency response required

							</div>

						</div>

					</div>



					{/* Incident Summary */}

					<div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">

						<h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">

							<FileText className="h-5 w-5" />

							Incident Summary

						</h3>

						<div className="space-y-3">

							<Label className="text-sm font-medium text-emerald-800">Detailed Description *</Label>

							<Textarea 

								rows={5} 

								value={form.summary} 

								onChange={(e)=>change("summary", e.target.value)}

								placeholder="Provide a comprehensive description of what happened, when, where, who was involved, and the immediate impact..."

								className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"

							/>

							<div className="text-xs text-emerald-600 mt-2">

								Include: What happened? When did it occur? Where did it happen? Who was involved? What was the immediate impact?

							</div>

						</div>

					</div>

				</div>



				{/* Actions */}

				<div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200">

					<Button 

						variant="outline" 

						onClick={()=>setOpen(false)}

						size="lg"

						className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50"

					>

						Cancel

					</Button>

					<Button 

						onClick={()=>{ onSave({ ...form, id: id() }); setOpen(false); }}

						size="lg"

						className="px-8 py-3 bg-blue-600 hover:bg-blue-700"

					>

						<Save className="h-4 w-4 mr-2" />

						Create Incident

					</Button>

				</div>

			</DialogContent>

		</Dialog>

	);

}



// -------------------- Workflow --------------------

function Workflow({ risks, setRisks, currentUser, config, darkMode = false }) {

	const pending = risks.filter((r)=> r.status === "Submitted");

	const canApprove = config?.auth?.canApproveRoles?.includes(currentUser.role) || currentUser.role === "Risk Champion" || currentUser.role === "Admin";

	function setStatus(riskId, status, note) { setRisks((prev)=> prev.map((r)=> r.id===riskId ? { ...r, status, approvals: [...(r.approvals||[]), { at: nowISO(), by: currentUser.email, action: status, note }] } : r)); }

	return (

		<Card>

			<CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Approvals</CardTitle></CardHeader>

			<CardContent>

				{pending.length === 0 ? (<div className="text-slate-600">No submissions waiting for review.</div>) : (

					<div className="space-y-3">{pending.map((r)=>(

						<div key={r.id} className="rounded-lg border p-3">

							<div className="flex items-center justify-between">

								<div><div className="font-medium">{r.title}</div><div className="text-xs text-slate-600">Dept: {r.department || ""} • Owner: {r.owner}</div></div>

								{canApprove ? (

									<div className="flex items-center gap-2">

										<Button size="sm" onClick={()=>setStatus(r.id, "Approved", "Approved by reviewer")}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>

										<Button size="sm" variant="outline" onClick={()=>setStatus(r.id, "Rejected", "Please revise details") }><X className="h-4 w-4 mr-1" /> Reject</Button>

									</div>

								) : (<div className="text-xs text-slate-500">Read only for your role</div>)}

							</div>

							<div className="text-sm text-slate-700 mt-2 line-clamp-2">{descSummary(r)}</div>

						</div>

					))}</div>

				)}

			</CardContent>

		</Card>

	);

}



// -------------------- Administration --------------------

function Administration({ config, setConfig, users, setUsers, departments, setDepartments, categories, setCategories, subcategories, setSubcategories, audit, risks, setRisks, logAudit, darkMode = false }) {

	const currentUser = { role: "Admin", email: "admin@company.com" }; // Default user for now

	// Matrix

	const [likelihoodLabels, setLikelihoodLabels] = useState(config.likelihoodLabels.join("|"));

	const [impactLabels, setImpactLabels] = useState(config.impactLabels.join("|"));

	const [low, setLow] = useState(config.scoring.thresholds.low);

	const [medium, setMedium] = useState(config.scoring.thresholds.medium);

	const [mediumHigh, setMediumHigh] = useState(config.scoring.thresholds.mediumHigh);

	const [high, setHigh] = useState(config.scoring.thresholds.high);

	const [appetite, setAppetite] = useState(config.appetite ?? 12);

	// Categories and subcategories

	const [newCat, setNewCat] = useState("");

	const [newSub, setNewSub] = useState({ name: "", parentId: categories[0]?.id });

	// Departments knowledge base

	const [deptForm, setDeptForm] = useState({ name: "", description: "", process: "", inherent: "" });

	



	



	

	return (

		<div className="space-y-6">

			{/* Enhanced Header with Professional Styling */}

			<div className={`bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm p-6 ${

				darkMode ? 'from-slate-800 to-slate-700 border-slate-600' : ''

			}`}>

				<div className="flex items-center justify-between mb-4">

					<div className="flex items-center gap-3">

						<div className={`p-3 rounded-xl ${

							darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'

						}`}>

							<Settings className="h-6 w-6" />

						</div>

						<div>

							<h2 className={`text-3xl font-bold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Administration</h2>

							<p className={`text-lg transition-colors duration-300 ${

								darkMode ? 'text-slate-400' : 'text-slate-600'

							}`}>System configuration, user management, and risk framework settings</p>

						</div>

					</div>

			</div>

			

				{/* Enhanced Summary Stats */}

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

						}`}>{users.length}</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Total Users</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-blue-600`}>

							{departments.length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Departments</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-emerald-600`}>

							{categories.length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Categories</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'

					}`}>

						<div className={`text-2xl font-bold text-purple-600`}>

							{audit.length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>Audit Entries</div>

					</div>

				</div>

			</div>

			

			{/* Enhanced Tab Navigation */}

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className={`grid w-full grid-cols-5 transition-all duration-300 ${
					darkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-200'

				}`}>

					<TabsTrigger value="overview" className="text-sm font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-slate-500">

						<BarChart3 className="h-4 w-4 mr-2" />

						Overview

					</TabsTrigger>

					<TabsTrigger value="users" className="text-sm font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-slate-500">

						<Users className="h-4 w-4 mr-2" />

						Users & Roles

					</TabsTrigger>

					<TabsTrigger value="config" className="text-sm font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-slate-500">

						<Settings className="h-4 w-4 mr-2" />

						Configuration

					</TabsTrigger>

					<TabsTrigger value="structure" className="text-sm font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-slate-500">

						<FolderTree className="h-4 w-4 mr-2" />

						Structure

					</TabsTrigger>

					<TabsTrigger value="audit" className="text-sm font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-slate-500">
						<FileText className="h-4 w-4 mr-2" />

						Audit Trail

					</TabsTrigger>

				</TabsList>

			

				<TabsContent value="overview" className="mt-6">

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

				<Card className={`xl:col-span-1 transition-colors duration-300 ${

					darkMode 

						? 'bg-slate-800 border-slate-700' 

						: 'bg-white border-slate-200'

				}`}>

					<CardHeader className="flex items-center justify-between">

						<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

						}`}><Settings className="h-5 w-5" /> Risk Matrix</CardTitle>

					</CardHeader>

					<CardContent className="space-y-3">

						<div><Label className={`transition-colors duration-300 ${

							darkMode ? 'text-slate-300' : 'text-slate-700'

						}`}>Likelihood labels (| separated)</Label><Input value={likelihoodLabels} onChange={(e)=>setLikelihoodLabels(e.target.value)} /></div>

						<div><Label className={`transition-colors duration-300 ${

							darkMode ? 'text-slate-300' : 'text-slate-700'

						}`}>Impact labels (| separated)</Label><Input value={impactLabels} onChange={(e)=>setImpactLabels(e.target.value)} /></div>

						<div className="grid grid-cols-2 gap-3">

							<div><Label className={`transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>Low</Label><Input type="number" value={low} onChange={(e)=>setLow(Number(e.target.value))} /></div>

							<div><Label className={`transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>Medium</Label><Input type="number" value={medium} onChange={(e)=>setMedium(Number(e.target.value))} /></div>

							<div><Label className={`transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>Medium High</Label><Input type="number" value={mediumHigh} onChange={(e)=>setMediumHigh(Number(e.target.value))} /></div>

							<div><Label className={`transition-colors duration-300 ${

								darkMode ? 'text-slate-300' : 'text-slate-700'

							}`}>High</Label><Input type="number" value={high} onChange={(e)=>setHigh(Number(e.target.value))} /></div>

						</div>

						<div className="grid grid-cols-2 gap-3">

							<div>

								<Label className={`transition-colors duration-300 ${

									darkMode ? 'text-slate-300' : 'text-slate-700'

								}`}>Residual appetite threshold</Label>

								<Input type="number" value={appetite} onChange={(e)=>setAppetite(Number(e.target.value))} />

								<div className={`text-xs mt-1 transition-colors duration-300 ${

									darkMode ? 'text-slate-400' : 'text-slate-600'

								}`}>Residual score ≤ this value is considered within appetite.</div>

							</div>

							<div className="flex items-end justify-end">

								<Button onClick={()=> setConfig({

									...config,

									likelihoodLabels: padToFive(likelihoodLabels),

									impactLabels: padToFive(impactLabels),

									scoring: { ...config.scoring, thresholds: { low: Number(low), medium: Number(medium), mediumHigh: Number(mediumHigh), high: Number(high), extreme: 25 } },

									appetite: Number(appetite),

								}) }><Save className="h-4 w-4 mr-2" /> Save Matrix</Button>

							</div>

						</div>

					</CardContent>

				</Card>

					</div>

				</TabsContent>



				<TabsContent value="users" className="mt-6">

					<div className="space-y-6">

						<Card className={`transition-colors duration-300 ${

					darkMode 

						? 'bg-slate-800 border-slate-700' 

						: 'bg-white border-slate-200'

				}`}>

					<CardHeader className="flex items-center justify-between">

						<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Users className="h-5 w-5" /> User Directory</CardTitle>
							</CardHeader>

							<CardContent>

								<div className="text-sm text-slate-600 mb-4">Manage users, roles, and department access</div>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="text-left border-b">
												<th className="py-2 pr-4">Name</th>
												<th className="py-2 pr-4">Email</th>
												<th className="py-2 pr-4">Role</th>
												<th className="py-2 pr-4">Departments</th>
												<th className="py-2 pr-4">Actions</th>
											</tr>
										</thead>
										<tbody>
											{users.map(user => (
												<tr key={user.id} className="border-b">
													<td className="py-2 pr-4">{user.name}</td>
													<td className="py-2 pr-4">{user.email}</td>
													<td className="py-2 pr-4">
														<Select 
															value={user.role} 
															onValueChange={(role) => {
																setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
																logAudit("USER_CHANGE", `Changed role to ${role}`, { userId: user.id, oldRole: user.role, newRole: role });
															}}
														>
															<SelectTrigger className="w-32">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{["Admin", "Risk Champion", "Risk Owner", "Executive"].map(role => (
																	<SelectItem key={role} value={role}>{role}</SelectItem>
																))}
															</SelectContent>
														</Select>
													</td>
													<td className="py-2 pr-4">
														<Select 
															value={(user.departments || []).join(",")} 
															onValueChange={(deptNames) => {
																const newDepts = deptNames ? deptNames.split(",").filter(Boolean) : [];
																setUsers(prev => prev.map(u => u.id === user.id ? { ...u, departments: newDepts } : u));
																logAudit("USER_CHANGE", `Changed departments to ${newDepts.join(", ")}`, { userId: user.id, oldDepts: user.departments, newDepts });
															}}
														>
															<SelectTrigger className="w-40">
																<SelectValue placeholder="Select departments" />
															</SelectTrigger>
															<SelectContent>
																{departments.map(d => (
																	<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
																))}
															</SelectContent>
														</Select>
													</td>
													<td className="py-2 pr-4">
									<Button 

															size="sm" 
															variant="outline" 
										onClick={() => {

																if (confirm(`Remove user ${user.name}?`)) {
																	setUsers(prev => prev.filter(u => u.id !== user.id));
																	logAudit("USER_CHANGE", `Removed user ${user.name}`, { userId: user.id, userEmail: user.email });
																}
															}}
														>
															Remove
									</Button>

													</td>
												</tr>
											))}
											{/* Add User Row */}
											<tr className="border-b">
												<td className="py-2 pr-4">
													<Input 
														id="newUserName"
														placeholder="Full name" 
														className="w-32"
													/>
												</td>
												<td className="py-2 pr-4">
													<Input 
														id="newUserEmail"
														placeholder="email@company.com" 
														className="w-40"
													/>
												</td>
												<td className="py-2 pr-4">
													<Select 
														id="newUserRole"
														value=""
														onValueChange={(role) => {
															document.getElementById("newUserRole").value = role;
														}}
													>
														<SelectTrigger className="w-32">
															<SelectValue placeholder="Select role" />
														</SelectTrigger>
														<SelectContent>
															{["Admin", "Risk Champion", "Risk Owner", "Executive"].map(role => (
																<SelectItem key={role} value={role}>{role}</SelectItem>
															))}
														</SelectContent>
													</Select>
												</td>
												<td className="py-2 pr-4">
													<Select 
														id="newUserDepts"
														value=""
														onValueChange={(deptNames) => {
															document.getElementById("newUserDepts").value = deptNames;
														}}
													>
														<SelectTrigger className="w-40">
															<SelectValue placeholder="Select departments" />
														</SelectTrigger>
														<SelectContent>
															{departments.map(d => (
																<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
															))}
														</SelectContent>
													</Select>
												</td>
												<td className="py-2 pr-4">
													<Button 
														size="sm" 
														onClick={() => {
															const name = document.getElementById("newUserName").value.trim();
															const email = document.getElementById("newUserEmail").value.trim();
															const role = document.getElementById("newUserRole").value;
															const deptNames = document.getElementById("newUserDepts").value;
															
															if (!name || !email || !role) {
																alert("Please fill in all required fields");
																return;
															}
															
															if (users.some(u => u.email === email)) {
																alert("User with this email already exists");
																return;
															}
															
															const newUser = {
																id: id(),
																name,
																email,
																role,
																departments: deptNames ? deptNames.split(",").filter(Boolean) : []
															};
															
															setUsers(prev => [...prev, newUser]);
															logAudit("USER_CHANGE", `Added user ${name}`, { userId: newUser.id, userEmail: email, role, departments: newUser.departments });
															
															// Clear form
															document.getElementById("newUserName").value = "";
															document.getElementById("newUserName").value = "";
															document.getElementById("newUserRole").value = "";
															document.getElementById("newUserDepts").value = "";
														}}
													>
														<Plus className="h-4 w-4 mr-1" />
														Add User
													</Button>
												</td>
											</tr>
										</tbody>
									</table>
						</div>

					</CardContent>

				</Card>

					</div>

				</TabsContent>



				<TabsContent value="config" className="mt-6">

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

				<Card className={`xl:col-span-1 transition-colors duration-300 ${

					darkMode 

						? 'bg-slate-800 border-slate-700' 

						: 'bg-white border-slate-200'

				}`}>

					<CardHeader className="flex items-center justify-between">

						<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Eye className="h-5 w-5" /> Visible Tabs</CardTitle>

					</CardHeader>

					<CardContent className="space-y-3">

						<div className="text-sm text-slate-600 mb-2">Control which tabs are visible to users</div>

						{["dashboard", "risks", "actions", "knowledge", "incidents", "workflow", "topreport", "admin"].map(tabId => {

							const isHidden = config.hiddenTabs?.includes(tabId);

							const tabName = {

								dashboard: "Dashboard",

								risks: "Risk Register", 

								actions: "Actions",

								knowledge: "Department Knowledge",

								incidents: "Incidents",

								workflow: "Workflow",

								topreport: "Top Risks Report",

								admin: "Administration"

							}[tabId];

							

							return (

								<label key={tabId} className="flex items-center gap-2 text-sm">

									<input 

										type="checkbox" 

										className="h-4 w-4" 

										checked={!isHidden} 

										onChange={(e) => {

											const newHiddenTabs = e.target.checked 

												? (config.hiddenTabs || []).filter(t => t !== tabId)

												: [...(config.hiddenTabs || []), tabId];

											setConfig(prev => ({ ...prev, hiddenTabs: newHiddenTabs }));

										}} 

									/>

									{tabName}

								</label>

							);

						})}

					</CardContent>

				</Card>



						<Card className={`xl:col-span-1 transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

					<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Shield className="h-5 w-5" /> Authorities</CardTitle>

					</CardHeader>

					<CardContent className="space-y-4">

						{/* Role-Department Mapping */}

						<div>

							<Label className="text-sm font-medium">Role Department Access</Label>

							<div className="text-xs text-slate-600 mb-2">Define which departments each role can access</div>

							<div className="space-y-2">

								{Object.entries(config.auth?.roleDepartments || {}).map(([role, deptNames]) => (

									<div key={role} className="flex items-center gap-2">

										<span className="text-sm w-24">{role}:</span>

										<Select 

											value={deptNames.join(",")} 

											onValueChange={(v) => {

												const newDepts = v ? v.split(",").filter(Boolean) : [];

												setConfig(prev => ({

													...prev,

													auth: {

														...prev.auth,

														roleDepartments: {

															...prev.auth?.roleDepartments,

															[role]: newDepts

														}

													}

												}));

											}}

										>

											<SelectTrigger className="w-48">

												<SelectValue placeholder="Select departments" />

											</SelectTrigger>

											<SelectContent>

												{departments.map(d => (

													<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>

												))}

											</SelectContent>

										</Select>

									</div>

								))}

							</div>

							<div className="mt-2">

								<Button 

									variant="outline" 

									size="sm"

									onClick={() => {

										const newRole = prompt("Enter role name (e.g., 'Risk Champion')");

										if (newRole && !config.auth?.roleDepartments?.[newRole]) {

											setConfig(prev => ({

												...prev,

												auth: {

													...prev.auth,

													roleDepartments: {

														...prev.auth?.roleDepartments,

														[newRole]: []

													}

												}

											}));

										}

									}}

								>

									<Plus className="h-4 w-4 mr-1" /> Add Role

								</Button>

							</div>

						</div>

						

						{/* Approval Roles */}

						<div>

							<Label className="text-sm font-medium">Approval Authority</Label>

							<div className="text-xs text-slate-600 mb-2">Roles that can approve risks</div>

							<div className="space-y-2">

								{["Admin", "Risk Champion", "Risk Owner", "Executive"].map(role => (

									<label key={role} className="flex items-center gap-2 text-sm">

										<input 

											type="checkbox" 

											className="h-4 w-4" 

											checked={config.auth?.canApproveRoles?.includes(role) || false} 

											onChange={(e) => {

												const currentRoles = config.auth?.canApproveRoles || [];

												const newRoles = e.target.checked 

													? [...currentRoles, role]

													: currentRoles.filter(r => r !== role);

												setConfig(prev => ({

													...prev,

													auth: {

														...prev.auth,

														canApproveRoles: newRoles

													}

												}));

											}} 

										/>

										{role}

									</label>

								))}

							</div>

						</div>

					</CardContent>

				</Card>



						<Card className={`xl:col-span-1 transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

					<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Settings className="h-5 w-5" /> Matrix</CardTitle>

					</CardHeader>

					<CardContent className="space-y-4">

						<div>

							<Label className="text-sm font-medium">Risk Appetite Ring</Label>

							<div className="text-xs text-slate-600 mb-2">Scores above this threshold require immediate attention</div>

							<Input 

								type="number" 

								value={config.scoring.thresholds.high} 

								onChange={(e) => setConfig(prev => ({ ...prev, scoring: { ...prev.scoring, thresholds: { ...prev.scoring.thresholds, high: parseInt(e.target.value) || 0 } } }))} 

							/>

						</div>

						<div>

							<Label className="text-sm font-medium">Medium Risk Threshold</Label>

							<div className="text-xs text-slate-600 mb-2">Scores above this are medium priority</div>

							<Input 

								type="number" 

								value={config.scoring.thresholds.medium} 

								onChange={(e) => setConfig(prev => ({ ...prev, scoring: { ...prev.scoring, thresholds: { ...prev.scoring.thresholds, medium: parseInt(e.target.value) || 0 } } }))} 

							/>

						</div>

								<div className="pt-2 border-t">

				<div className="text-xs text-slate-600">

					<strong>ISO 31000 Alignment:</strong> These thresholds help align with ISO 31000 risk management framework requirements. 

					Consider setting High threshold at 15-20 and Medium at 8-12 for typical enterprise environments.

				</div>

			</div>

					</CardContent>

				</Card>



						<Card className={`xl:col-span-1 transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

					<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Download className="h-5 w-5" /> Import/Export</CardTitle>

					</CardHeader>

					<CardContent className="space-y-4">

						<div>

							<Label className="text-sm font-medium">Export Data</Label>

							<div className="text-xs text-slate-600 mb-2">Download all application data as JSON</div>

							<Button 

								variant="outline" 

								size="sm"

								onClick={() => {

									const data = {

										risks,

										departments,

										categories,

										subcategories,

										users,

										config,

										exportedAt: new Date().toISOString()

									};

									const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

									const url = URL.createObjectURL(blob);

									const a = document.createElement('a');

									a.href = url;

									a.download = `erm_data_${new Date().toISOString().slice(0, 10)}.json`;

									document.body.appendChild(a);

									a.click();

									document.body.removeChild(a);

									URL.revokeObjectURL(url);

									logAudit("EXPORT", "Exported all application data", { exportedAt: data.exportedAt });

								}}

							>

								<Download className="h-4 w-4 mr-1" />

								Export All Data

							</Button>

						</div>

						

						<div>

							<Label className="text-sm font-medium">Import Data</Label>

							<div className="text-xs text-slate-600 mb-2">Upload JSON file to restore data (overwrites current data)</div>

							<input 

								type="file" 

								accept=".json"

								id="importFile"

								className="hidden"

								onChange={(e) => {

									const file = e.target.files[0];

									if (!file) return;

									

									const reader = new FileReader();

									reader.onload = (event) => {

										try {

											const data = JSON.parse(event.target.result);

											if (confirm("This will overwrite all current data. Are you sure?")) {

												// Import the data

												if (data.risks) setRisks(data.risks);

												if (data.departments) setDepartments(data.departments);

												if (data.categories) setCategories(data.categories);

												if (data.subcategories) setSubcategories(data.subcategories);

												if (data.users) setUsers(data.users);

												if (data.config) setConfig(data.config);

												

												logAudit("IMPORT", "Imported data from file", { 

													filename: file.name, 

													importedAt: new Date().toISOString(),

													dataKeys: Object.keys(data)

												});

												

												alert("Data imported successfully!");

											}

										} catch (error) {

											alert("Error parsing file: " + error.message);

										}

										// Reset file input

										e.target.value = "";

									};

									reader.readAsText(file);

								}}

							/>

							<Button 

								variant="outline" 

								size="sm"

								onClick={() => document.getElementById("importFile").click()}

							>

								<Upload className="h-4 w-4 mr-1" />

								Import Data

							</Button>

						</div>

						

						<div className="pt-2 border-t">

							<div className="text-xs text-slate-600">

								<strong>Warning:</strong> Import will overwrite all current data. Export first to backup.

							</div>

						</div>

					</CardContent>

				</Card>

			</div>

				</TabsContent>

				<TabsContent value="structure" className="mt-6">

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

						<Card className={`xl:col-span-1 transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

							<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><FolderTree className="h-5 w-5" /> Categories and Subcategories</CardTitle>

							</CardHeader>

							<CardContent className="space-y-4">

								{/* Categories */}

								<div className={`rounded border p-3 transition-colors duration-300 ${

									darkMode ? 'border-slate-600' : 'border-slate-200'

								}`}>

									<div className={`font-medium mb-2 transition-colors duration-300 ${

										darkMode ? 'text-slate-200' : 'text-slate-900'

									}`}>Categories</div>

									<div className="flex items-center gap-2">

										<Input placeholder="Add category" value={newCat} onChange={(e)=>setNewCat(e.target.value)} />

										<Button onClick={()=>{

											if (!newCat.trim()) return;

											setCategories(prev => [...prev, { id: id(), name: newCat.trim() }]);

											setNewCat("");

										}}><Plus className="h-4 w-4 mr-1" /> Add</Button>

									</div>

									<div className="mt-2 flex flex-wrap gap-2">

										{categories.map(c=> (

											<span key={c.id} className={`px-2 py-1 rounded text-sm transition-colors duration-300 ${

												darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'

											}`}>

												{c.name}

												<button className={`ml-2 transition-colors duration-300 ${

													darkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'

												}`} onClick={()=> setCategories(prev=> prev.filter(x=>x.id!==c.id))}>x</button>

											</span>

										))}

									</div>

								</div>

								{/* Subcategories */}

								<div className={`rounded border p-3 transition-colors duration-300 ${

									darkMode ? 'border-slate-600' : 'border-slate-200'

								}`}>

									<div className={`font-medium mb-2 transition-colors duration-300 ${

										darkMode ? 'text-slate-200' : 'text-slate-900'

									}`}>Subcategories</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-2">

										<Input placeholder="Subcategory name" value={newSub.name} onChange={(e)=>setNewSub(s=>({ ...s, name: e.target.value }))} />

										<Select value={newSub.parentId} onValueChange={(v)=>setNewSub(s=>({ ...s, parentId: v }))}>

											<SelectTrigger><SelectValue placeholder="Parent category" /></SelectTrigger>

											<SelectContent>{categories.map(c=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>

										</Select>

										<Button onClick={()=>{

											if(!newSub.name.trim() || !newSub.parentId) return;

											setSubcategories(prev => [...prev, { id: id(), name: newSub.name.trim(), parentCategoryId: newSub.parentId }]);

											setNewSub({ name: "", parentId: categories[0]?.id });

										}}><Plus className="h-4 w-4 mr-1" /> Add</Button>

									</div>

									<div className="mt-3 max-h-48 overflow-auto">

										<table className="w-full text-sm">

											<thead><tr className={`text-left border-b transition-colors duration-300 ${

												darkMode ? 'border-slate-600' : 'border-slate-200'

											}`}><th className={`py-1 pr-2 transition-colors duration-300 ${

												darkMode ? 'text-slate-300' : 'text-slate-700'

											}`}>Name</th><th className={`py-1 pr-2 transition-colors duration-300 ${

												darkMode ? 'text-slate-300' : 'text-slate-700'

											}`}>Parent</th><th className={`py-1 pr-2 transition-colors duration-300 ${

												darkMode ? 'text-slate-300' : 'text-slate-700'

											}`}>Remove</th></tr></thead>

											<tbody>

												{subcategories.map(s=>{

													const parent = categories.find(c=>c.id===s.parentCategoryId)?.name || "";

													return (

														<tr key={s.id} className={`border-b transition-colors duration-300 ${

															darkMode ? 'border-slate-600' : 'border-slate-200'

														}`}>

															<td className={`py-1 pr-2 transition-colors duration-300 ${

																darkMode ? 'text-slate-300' : 'text-slate-700'

															}`}>{s.name}</td>

															<td className={`py-1 pr-2 transition-colors duration-300 ${

																darkMode ? 'text-slate-300' : 'text-slate-700'

															}`}>{parent}</td>

															<td className={`py-1 pr-2 transition-colors duration-300 ${

																darkMode ? 'text-slate-300' : 'text-slate-700'

															}`}><Button size="sm" variant="ghost" className="text-red-600" onClick={()=> setSubcategories(prev=> prev.filter(x=>x.id!==s.id))}>Remove</Button></td>

														</tr>

													);

												})}

											</tbody>

										</table>

									</div>

								</div>

							</CardContent>

						</Card>



						<Card className={`xl:col-span-1 transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

							<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><Building2 className="h-5 w-5" /> Departments Knowledge Base</CardTitle>

							</CardHeader>

							<CardContent className="space-y-4">

								<div className={`rounded border p-3 transition-colors duration-300 ${

									darkMode ? 'border-slate-600' : 'border-slate-200'

								}`}>

									<div className={`font-medium mb-2 transition-colors duration-300 ${

										darkMode ? 'text-slate-200' : 'text-slate-900'

									}`}>Add department</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-2">

										<Input placeholder="Name" value={deptForm.name} onChange={(e)=>setDeptForm(f=>({...f, name: e.target.value}))} />

										<Input placeholder="Add process and press plus" value={deptForm.process} onChange={(e)=>setDeptForm(f=>({...f, process: e.target.value}))} />

										<Button onClick={()=>{

											if(!deptForm.name.trim()) return;

											const exists = departments.find(d=>d.name.toLowerCase()===deptForm.name.toLowerCase());

											if (exists) return;

											setDepartments(prev => [...prev, { id: id(), name: deptForm.name.trim(), description: deptForm.description || "", processes: deptForm.process ? [deptForm.process.trim()] : [], inherentRiskExamples: deptForm.inherent ? [deptForm.inherent.trim()] : [] }]);

											setDeptForm({ name: "", description: "", process: "", inherent: "" });

										}}><Plus className="h-4 w-4 mr-1" /> Add</Button>

									</div>

									<div className="mt-2">

										<Label className={`transition-colors duration-300 ${

											darkMode ? 'text-slate-300' : 'text-slate-700'

										}`}>Description</Label>

										<Textarea rows={2} value={deptForm.description} onChange={(e)=>setDeptForm(f=>({...f, description: e.target.value}))} />

									</div>

									<div className="grid grid-cols-2 gap-2 mt-2">

										<div>

											<Label className={`transition-colors duration-300 ${

												darkMode ? 'text-slate-300' : 'text-slate-700'

											}`}>Core processes</Label>

											<div className="flex items-center gap-2 mt-1">

												<Input placeholder="Process" value={deptForm.process} onChange={(e)=>setDeptForm(f=>({...f, process: e.target.value}))} />

												<Button variant="outline" onClick={()=>{

													if(!deptForm.name.trim() || !deptForm.process.trim()) return;

													setDepartments(prev => prev.map(d => d.name === deptForm.name ? { ...d, processes: uniq([...(d.processes||[]), deptForm.process.trim()]) } : d));

													setDeptForm(f=>({ ...f, process: "" }));

												}}>Add</Button>

											</div>

										</div>

										<div>

											<Label>Inherent risk examples</Label>

											<div className="flex items-center gap-2 mt-1">

												<Input placeholder="Example" value={deptForm.inherent} onChange={(e)=>setDeptForm(f=>({...f, inherent: e.target.value}))} />

												<Button variant="outline" onClick={()=>{

													if(!deptForm.name.trim() || !deptForm.inherent.trim()) return;

													setDepartments(prev => prev.map(d => d.name === deptForm.name ? { ...d, inherentRiskExamples: uniq([...(d.inherentRiskExamples||[]), deptForm.inherent.trim()]) } : d));

													setDeptForm(f=>({ ...f, inherent: "" }));

												}}>Add</Button>

											</div>

										</div>

									</div>

								</div>



								<div className="rounded border p-3">

									<div className="font-medium mb-2">All departments</div>

									<div className="max-h-64 overflow-auto">

										<table className="w-full text-sm">

											<thead><tr className="text-left border-b"><th className="py-1 pr-2">Name</th><th className="py-1 pr-2">Description</th><th className="py-1 pr-2">Processes</th><th className="py-1 pr-2">Inherent examples</th><th className="py-1 pr-2">Remove</th></tr></thead>

											<tbody>

												{departments.map(d=> (

													<tr key={d.id} className="border-b align-top">

														<td className="py-1 pr-2 font-medium">{d.name}</td>

														<td className="py-1 pr-2 text-xs w-[240px]">{d.description}</td>

														<td className="py-1 pr-2 text-xs w-[220px]">

															<div className="flex flex-wrap gap-1">{(d.processes||[]).map(p=>(<span key={p} className="px-2 py-0.5 rounded bg-slate-100">{p}</span>))}</div>

														</td>

														<td className="py-1 pr-2 text-xs w-[220px]">

															<div className="flex flex-wrap gap-1">{(d.inherentRiskExamples||[]).map(p=>(<span key={p} className="px-2 py-0.5 rounded bg-amber-50">{p}</span>))}</div>

														</td>

														<td className="py-1 pr-2"><Button size="sm" variant="ghost" className="text-red-600" onClick={()=> setDepartments(prev=> prev.filter(x=>x.id!==d.id))}>Remove</Button></td>

													</tr>

												))}

											</tbody>

										</table>

									</div>

								</div>



								<div className="rounded border p-3">

									<div className="font-medium mb-2">User Directory</div>

									<div className="text-xs text-slate-500">User management is simplified here; switch users via the top-right menu.</div>

								</div>

							</CardContent>

						</Card>

					</div>

				</TabsContent>

				<TabsContent value="audit" className="mt-6">

					<div className="space-y-6">

						<Card className={`transition-colors duration-300 ${

							darkMode 

								? 'bg-slate-800 border-slate-700' 

								: 'bg-white border-slate-200'

						}`}>

							<CardHeader className="flex items-center justify-between">

								<CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${

									darkMode ? 'text-slate-100' : 'text-slate-900'

								}`}><FileText className="h-5 w-5" /> Audit Trail</CardTitle>

							</CardHeader>

							<CardContent>

								<div className="text-sm text-slate-600 mb-3">Latest 100 audit entries</div>

								<div className="max-h-64 overflow-auto space-y-2">

									{audit.slice(0, 100).map(entry => (

										<div key={entry.id} className="text-xs p-2 bg-slate-50 rounded border">

											<div className="flex items-center justify-between">

												<span className="font-medium">{entry.type}</span>

												<span className="text-slate-500">{new Date(entry.at).toLocaleString()}</span>

											</div>

											<div className="text-slate-600">by {entry.actor}</div>

											{entry.details && (

												<div className="text-slate-500 mt-1 break-words">

													{typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}

												</div>

											)}

										</div>

									))}

									{audit.length === 0 && (

										<div className="text-xs text-slate-500 text-center py-4">No audit entries yet.</div>

									)}

								</div>

							</CardContent>

						</Card>

					</div>

				</TabsContent>

			</Tabs>

		</div>

	);

}

function UserTable() { return (<div className="text-xs text-slate-600">You can continue to use the top right user switcher. For full user CRUD here, I can wire it to your preference.</div>); }

// -------------------- Department Knowledge (view/edit/suggest) --------------------

function DepartmentKnowledge({ departments, setDepartments, currentUser, suggestions, setSuggestions, darkMode = false }) {

	const [editMode, setEditMode] = useState(false);

	const [deptEditDialog, setDeptEditDialog] = useState({ open: false, dept: null });

	

	function propose(deptId, field, proposedValue, note="") { setSuggestions(prev => [...prev, { id: id(), departmentId: deptId, by: currentUser.email, at: new Date().toISOString(), field, proposedValue, note, status: "Pending" }]); }

	function applySuggestion(s) {

		setDepartments(prev => prev.map(d => {

			if (d.id !== s.departmentId) return d;

			if (s.field === "description") return { ...d, description: s.proposedValue };

			if (s.field === "processes") return { ...d, processes: uniq([...(d.processes||[]), ...[].concat(s.proposedValue)]) };

			if (s.field === "inherent") return { ...d, inherentRiskExamples: uniq([...(d.inherentRiskExamples||[]), ...[].concat(s.proposedValue)]) };

			return d;

		}));

		setSuggestions(prev => prev.map(x => x.id === s.id ? ({ ...x, status: "Accepted" }) : x));

	}

	function rejectSuggestion(id0) { setSuggestions(prev => prev.map(x => x.id === id0 ? ({ ...x, status: "Rejected" }) : x)); }

	

	const canEdit = currentUser.role === "Admin" || currentUser.role === "Risk Owner";

	

	return (

		<div className="space-y-6">

			{/* Header with Edit Mode Toggle */}

			<div className="flex items-center justify-between">

				<h2 className={`text-2xl font-semibold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Department Knowledge Base</h2>

				{canEdit && (

					<div className="flex items-center gap-3">

						<Button 

							variant="outline" 

							size="sm"

							onClick={() => setDeptEditDialog({ open: true, dept: null })}

							className="border-blue-200 text-blue-700 hover:bg-blue-50"

						>

							<Plus className="h-4 w-4 mr-2" />

							Create Department

						</Button>

						<Button 

							variant={editMode ? "default" : "outline"} 

							size="sm"

							onClick={() => setEditMode(!editMode)}

							className={editMode ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-700 hover:bg-purple-50"}

						>

							{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}

						</Button>

					</div>

				)}

			</div>



			{/* Edit Mode Info */}

			{canEdit && editMode && (

				<Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">

					<CardContent className="p-4">

						<div className="flex items-center gap-2 text-purple-700">

							<Settings className="h-5 w-5" />

							<span className="font-medium">Edit Mode Active</span>

						</div>

						<p className="text-sm text-purple-600 mt-1">Click on departments to edit their information directly.</p>

					</CardContent>

				</Card>

			)}

			

			{/* Department Cards */}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

				{departments.map(dept => {

					const editable = editMode && canEdit;

					const pending = suggestions.filter(s => s.departmentId === dept.id && s.status === "Pending");

					return (

						<Card key={dept.id} className={`department-card group transition-all duration-300 hover-lift ${

							dept.name === "Marketing" ? "marketing" :

							dept.name === "Sales" ? "sales" :

							dept.name === "Operations" ? "operations" :

							dept.name === "Supply Chain" ? "supply-chain" :

							dept.name === "Finance" ? "finance" :

							dept.name === "IT" ? "it" :

							dept.name === "HSE" ? "hse" : ""

						}`}>

							<CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 border-b border-blue-500 text-white">

								<CardTitle className="flex items-center justify-between text-lg font-semibold text-white">

									<div className="flex items-center gap-2">

										<Building2 className="h-5 w-5 text-blue-200" />

										<span>{dept.name}</span>

									</div>

									<div className="flex items-center gap-2">

										{editable && (

											<Button 

												size="sm" 

												variant="outline"

												onClick={() => setDeptEditDialog({ open: true, dept })}

												className="border-white/30 text-white hover:bg-white/20 focus-ring"

											>

												Edit

											</Button>

										)}

										<Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 text-white border-white/30">

											{editMode ? "Edit Mode" : "View Mode"}

										</Badge>

									</div>

								</CardTitle>

							</CardHeader>

							<CardContent className="space-y-6 p-6">

								{/* Description Section */}

								<section className="group/desc relative">

									<div className="flex items-center gap-2 mb-3">

										<FileText className="h-4 w-4 text-emerald-600" />

										<h3 className="text-sm font-semibold text-slate-800">What the department does</h3>

									</div>

									{editable ? (

										<Textarea 

											rows={3} 

											value={dept.description || ""} 

											onChange={(e)=> setDepartments(prev => prev.map(d => d.id===dept.id ? { ...d, description: e.target.value } : d))}

											className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"

										/>

									) : (

										<div className="text-sm text-slate-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">

											{dept.description || <span className="text-slate-500 italic">No description available.</span>}

										</div>

									)}

									{!editable && !editMode && (

										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 opacity-0 group-hover/desc:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">

											<SuggestBox label="Suggest description change" onSubmit={(text)=>propose(dept.id, "description", text)} />

										</div>

									)}

								</section>



								{/* Processes Section */}

								<section className="group/process relative">

									<div className="flex items-center gap-2 mb-3">

										<Activity className="h-4 w-4 text-blue-600" />

										<h3 className="text-sm font-semibold text-slate-800">Core processes</h3>

									</div>

									<div className="flex flex-wrap gap-2 mb-3">

										{(dept.processes||[]).map(p => (

											<span key={p} className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">

												{p}

											</span>

										))}

									</div>

									{editable ? (

										<AddChip onAdd={(txt)=> setDepartments(prev => prev.map(d => d.id===dept.id ? { ...d, processes: uniq([...(d.processes||[]), txt]) } : d))} placeholder="Add process..." />

									) : !editMode && (

										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 opacity-0 group-hover/process:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">

											<SuggestBox label="Suggest processes (comma separated)" onSubmit={(text)=>propose(dept.id, "processes", text.split(",").map(s=>s.trim()).filter(Boolean))} />

										</div>

									)}

								</section>



								{/* Risk Examples Section */}

								<section className="group/risk relative">

									<div className="flex items-center gap-2 mb-3">

										<AlertTriangle className="h-4 w-4 text-amber-600" />

										<h3 className="text-sm font-semibold text-slate-800">Inherent risk examples</h3>

									</div>

									<div className="flex flex-wrap gap-2 mb-3">

										{(dept.inherentRiskExamples||[]).map(p => (

											<span key={p} className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">

												{p}

											</span>

										))}

									</div>

									{editable ? (

										<AddChip onAdd={(txt)=> setDepartments(prev => prev.map(d => d.id===dept.id ? { ...d, inherentRiskExamples: uniq([...(d.inherentRiskExamples||[]), txt]) } : d))} placeholder="Add example..." />

									) : !editMode && (

										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 opacity-0 group-hover/risk:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">

											<SuggestBox label="Suggest risk examples (comma separated)" onSubmit={(text)=>propose(dept.id, "inherent", text.split(",").map(s=>s.trim()).filter(Boolean))} />

										</div>

									)}

								</section>



								{/* Risk Management Team Section */}

								<section className="group/team relative">

									<div className="flex items-center gap-2 mb-3">

										<Users className="h-4 w-4 text-indigo-600" />

										<h3 className="text-sm font-semibold text-slate-800">Risk Management Team</h3>

									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">

										<div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">

											<div className="text-xs font-medium text-indigo-700 mb-1">Risk Owner</div>

											<div className="text-sm text-indigo-800">

												{editable ? (

													<Input 

														value={dept.riskOwner || ""} 

														onChange={(e)=> setDepartments(prev => prev.map(d => d.id===dept.id ? { ...d, riskOwner: e.target.value } : d))}

														placeholder="Enter email address"

														className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"

													/>

												) : (

													dept.riskOwner || <span className="text-indigo-500 italic">Not assigned</span>

												)}

											</div>

										</div>

										<div className="bg-purple-50 p-3 rounded-lg border border-purple-100">

											<div className="text-xs font-medium text-purple-700 mb-1">Risk Champion</div>

											<div className="text-sm text-purple-800">

												{editable ? (

													<Input 

														value={dept.riskChampion || ""} 

														onChange={(e)=> setDepartments(prev => prev.map(d => d.id===dept.id ? { ...d, riskChampion: e.target.value } : d))}

														placeholder="Enter email address"

														className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"

													/>

												) : (

													dept.riskChampion || <span className="text-purple-500 italic">Not assigned</span>

												)}

											</div>

										</div>

									</div>

									{!editable && !editMode && (

										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 opacity-0 group-hover/team:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">

											<SuggestBox label="Suggest team changes (comma separated: owner,champion)" onSubmit={(text)=>propose(dept.id, "team", text.split(",").map(s=>s.trim()).filter(Boolean))} />

										</div>

									)}

								</section>



								{/* Pending Suggestions */}

								{!editMode && (currentUser.role === "Admin" || currentUser.role === "Risk Owner") && pending.length > 0 && (

									<section className="border-t border-slate-200 pt-4">

										<div className="flex items-center gap-2 mb-3">

											<Eye className="h-4 w-4 text-purple-600" />

											<h3 className="text-sm font-semibold text-slate-800">Pending suggestions</h3>

										</div>

										<div className="space-y-3">

											{pending.map(s => (

												<div key={s.id} className="rounded-lg border border-purple-200 p-3 text-xs bg-purple-50">

													<div className="flex items-center gap-2 mb-2">

														<span className="font-medium text-purple-800">{s.field}</span>

														<span className="text-purple-600">•</span>

														<span className="text-purple-700">{s.by}</span>

														<span className="text-purple-600">•</span>

														<span className="text-purple-700">{new Date(s.at).toLocaleString()}</span>

													</div>

													<div className="mb-3 p-2 bg-white rounded border border-purple-100 break-words">

														{Array.isArray(s.proposedValue) ? s.proposedValue.join(", ") : s.proposedValue}

													</div>

													<div className="flex gap-2">

														<Button size="sm" onClick={()=>applySuggestion(s)} className="bg-green-600 hover:bg-green-700 text-xs">

															<Check className="h-3 w-3 mr-1" />

															Accept

														</Button>

														<Button size="sm" variant="outline" onClick={()=>rejectSuggestion(s.id)} className="border-red-200 text-red-700 hover:bg-red-50 text-xs">

															<X className="h-3 w-3 mr-1" />

															Reject

														</Button>

													</div>

												</div>

											))}

										</div>

									</section>

								)}

							</CardContent>

						</Card>

					);

				})}

			</div>

			

			{/* Enhanced Department Edit Dialog - Full Page Modal */}

			<Dialog open={deptEditDialog.open} onOpenChange={(open) => setDeptEditDialog({ open, dept: null })}>

				<DialogContent className="max-w-7xl h-[95vh] overflow-y-auto p-0">

					<div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 shadow-sm">

						<DialogHeader className="pb-0">

							<DialogTitle className="text-3xl font-bold text-slate-900 flex items-center gap-3">

								<Building2 className="h-8 w-8 text-blue-600" />

								{deptEditDialog.dept ? "Edit Department" : "Create New Department"}

							</DialogTitle>

							<p className="text-lg text-slate-600 mt-2">

								{deptEditDialog.dept ? "Update department information and risk management team" : "Set up a new department with its processes and risk profile"}

							</p>

					</DialogHeader>

					</div>

					<div className="p-6">

					<DepartmentEditForm 

						dept={deptEditDialog.dept} 

						onSave={(deptData) => {

							if (deptEditDialog.dept) {

								// Edit existing

								setDepartments(prev => prev.map(d => d.id === deptEditDialog.dept.id ? { ...d, ...deptData } : d));

							} else {

								// Add new

								setDepartments(prev => [...prev, { id: id(), ...deptData }]);

							}

							setDeptEditDialog({ open: false, dept: null });

						}}

					/>

					</div>

				</DialogContent>

			</Dialog>

		</div>

	);

}



function AddChip({ onAdd, placeholder }) { 

	const [v, setV] = useState(""); 

	return (

		<div className="flex items-center gap-3">

			<Input 

				value={v} 

				onChange={(e)=>setV(e.target.value)} 

				placeholder={placeholder}

				className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"

				onKeyPress={(e) => e.key === "Enter" && v.trim() && onAdd(v.trim()) && setV("")}

			/>

			<Button 

				onClick={()=>{ if(v.trim()) { onAdd(v.trim()); setV(""); } }}

				className="bg-blue-600 hover:bg-blue-700 px-4"

				disabled={!v.trim()}

			>

				<Plus className="h-4 w-4 mr-1" />

				Add

			</Button>

		</div>

	); 

}



function SuggestBox({ label, onSubmit }) { 

	const [v, setV] = useState(""); 

	return (

		<div className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-4 shadow-lg">

			<div className="text-sm font-medium text-slate-800 mb-2">{label}</div>

			<div className="flex items-center gap-2">

				<Input 

					value={v} 

					onChange={(e)=>setV(e.target.value)} 

					placeholder="Enter your suggestion..."

					className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"

				/>

				<Button 

					variant="outline" 

					onClick={()=>{ if(v.trim()) { onSubmit(v.trim()); setV(""); } }}

					className="border-blue-200 text-blue-700 hover:bg-blue-50"

				>

					Submit

				</Button>

			</div>

		</div>

	); 

}



// -------------------- Top Risks Report --------------------

function TopRisksReport({ risks, config }) {

	const [onlyFlagged, setOnlyFlagged] = useState(true);

	const [limit, setLimit] = useState(10);

	const [fields, setFields] = useState({ department: true, category: true, subcategory: true, causeEventConsequence: true, worstCase: true, actions: true, scores: true, owners: true, flags: true });

	const scored = risks

		.map(r => { const l = r.residualLikelihood ?? r.likelihood; const i = r.residualImpact ?? r.impact; return { ...r, residualScore: l * i }; })

		.filter(r => !onlyFlagged || r.topRisk)

		.sort((a,b)=> b.residualScore - a.residualScore)

		.slice(0, limit);

	return (

		<Card>

			<CardHeader><CardTitle>Top Risks Report</CardTitle></CardHeader>

			<CardContent className="space-y-4">

				<div className="flex flex-wrap items-center gap-3">

					<label className="flex items-center gap-2 text-sm">

						<input type="checkbox" className="h-4 w-4" checked={onlyFlagged} onChange={(e)=>setOnlyFlagged(e.target.checked)} /> Show only "Top Risk"

					</label>

					<div className="flex items-center gap-2">

						<Label>Max items</Label>

						<Input type="number" value={limit} onChange={(e)=>setLimit(Number(e.target.value||10))} className="w-24" />

					</div>

				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">

					{Object.keys(fields).map(k => (

						<label key={k} className="flex items-center gap-2 text-sm">

							<input type="checkbox" className="h-4 w-4" checked={fields[k]} onChange={(e)=>setFields(f=>({ ...f, [k]: e.target.checked }))} />

							{{ department:"Department", category:"Category", subcategory:"Subcategory", causeEventConsequence:"Cause/Event/Consequence", worstCase:"Worst-case", actions:"Mitigations", scores:"Scores", owners:"Owner/Champion", flags:"Flags" }[k]}

						</label>

					))}

				</div>

				<div className="rounded border p-3 bg-white">

					{scored.length === 0 ? (

						<div className="text-sm text-slate-600">No risks match your criteria.</div>

					) : (

						<div className="space-y-3">

							{scored.map(r => {

								const level = riskLevel(r.residualScore, config.scoring.thresholds);

								return (

									<div key={r.id} className="border rounded p-3">

										<div className="flex items-center justify-between">

											<div className="font-medium">{r.title}</div>

											<Badge className={level.tone}>Residual {r.residualScore}</Badge>

										</div>

										<div className="text-xs text-slate-600">{fields.flags && r.businessInterruption ? "Business Interruption " : ""}{fields.flags && r.topRisk ? "• Top Risk" : ""}</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">

											{fields.department && <div><span className="text-slate-500">Department:</span> {r.department || ""}</div>}

											{fields.category && <div><span className="text-slate-500">Category:</span> {r.category || ""}</div>}

											{fields.subcategory && <div><span className="text-slate-500">Subcategory:</span> {r.subcategory || ""}</div>}

											{fields.owners && <div><span className="text-slate-500">Owner/Champion:</span> {r.owner} / {r.champion}</div>}

											{fields.scores && (<div><span className="text-slate-500">Inherent/Residual:</span> {(r.likelihood||"-")}×{(r.impact||"-")} / {(r.residualLikelihood ?? r.likelihood)}×{(r.residualImpact ?? r.impact)}</div>)}

										</div>

										{fields.causeEventConsequence && (<div className="mt-2 text-sm"><span className="text-slate-500">Cause–Event–Consequence:</span> {[r.descriptionCause,r.descriptionEvent,r.descriptionConsequence].filter(Boolean).join(" → ")}</div>)}

										{fields.worstCase && r.worstCase && <div className="text-sm"><span className="text-slate-500">Worst-case:</span> {r.worstCase}</div>}

										{fields.actions && (

											<div className="mt-2">

												<div className="text-slate-500 text-sm">Mitigations:</div>

												{(r.mitigationActions||[]).length === 0 ? <div className="text-xs text-slate-500">No actions logged.</div> : (

													<ul className="list-disc ml-5 text-sm">{r.mitigationActions.map(a => (<li key={a.id}>{a.action} — {a.owner} — {a.status} — {a.dueDate?.slice(0,10)}</li>))}</ul>

												)}

											</div>

										)}

									</div>

								);

							})}

						</div>

					)}

				</div>

				<div className="flex gap-2">

					<Button onClick={()=>window.print()}>Print / Save as PDF</Button>

				</div>

			</CardContent>

		</Card>

	);

}



// -------------------- Export and Import --------------------

function ExportImport({ risks, incidents, setRisks, setIncidents }) {

	function download(content, filename) {

		const blob = new Blob([content], { type: "application/json" });

		const url = URL.createObjectURL(blob);

		const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);

	}

	function onExport() { download(JSON.stringify({ risks, incidents }, null, 2), `erm_export_${Date.now()}.json`); }

	function onImport(e) {

		const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader();

		reader.onload = () => { try { const data = JSON.parse(reader.result); if (Array.isArray(data.risks)) setRisks(data.risks); if (Array.isArray(data.incidents)) setIncidents(data.incidents); } catch { alert("Invalid JSON file"); } };

		reader.readAsText(file);

	}

	return (

		<div className="flex items-center gap-2">

			<Button variant="outline" onClick={onExport}><Download className="h-4 w-4 mr-2" /> Export</Button>

			<label className="inline-flex items-center gap-2 border rounded px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"><Upload className="h-4 w-4" /> Import<input type="file" accept="application/json" className="hidden" onChange={onImport} /></label>

		</div>

	);

}

// -------------------- Risk Report Drawer --------------------

function RiskReportDrawer({ risk, open, onOpenChange, config, audit }) {

	if (!risk) return null;

	

	const l0 = risk.likelihood, i0 = risk.impact;

	const rl = risk.residualLikelihood ?? risk.likelihood;

	const ri = risk.residualImpact ?? risk.impact;

	const s0 = l0 * i0, s1 = rl * ri;

	const lev0 = riskLevel(s0, config.scoring.thresholds);

	const lev1 = riskLevel(s1, config.scoring.thresholds);

	

	// Filter audit entries related to this risk

	const riskAudit = audit.filter(entry => 

		entry.details?.riskId === risk.id || 

		entry.type === "CREATE_RISK" && entry.details?.title === risk.title

	);

	

	return (

		<Dialog open={open} onOpenChange={onOpenChange}>

			<DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0">

				<div className="p-6" data-date={new Date().toLocaleDateString()}>

					<DialogHeader className="pb-6 border-b border-slate-200">

						<DialogTitle className="flex items-center justify-between text-2xl font-bold text-slate-900">

							<span>Risk Report: {risk.title}</span>

							<div className="flex items-center gap-3">

								<Badge variant={risk.status === "Approved" ? "default" : "secondary"} className="text-sm font-medium px-3 py-1.5">

									{risk.status}

								</Badge>

								{risk.businessInterruption && <Badge className="bg-sky-100 text-sky-800 text-sm font-medium px-3 py-1.5 border border-sky-200">Business Interruption</Badge>}

								{risk.topRisk && <Badge className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1.5 border border-amber-200">Top Risk</Badge>}

							</div>

						</DialogTitle>

					</DialogHeader>

					

					<div className="space-y-8 pt-6">

						{/* Executive Summary */}

						<div className="section">

							<h2 className="text-xl font-semibold text-slate-900 mb-4">Executive Summary</h2>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">

								<div>

									<Label className="text-sm font-semibold text-slate-700 mb-2 block">Department</Label>

									<div className="text-base text-slate-900">{risk.department || "Not specified"}</div>

								</div>

								<div>

									<Label className="text-sm font-semibold text-slate-700 mb-2 block">Category</Label>

									<div className="text-base text-slate-900">{risk.category || "Not specified"}</div>

								</div>

								<div>

									<Label className="text-sm font-semibold text-slate-700 mb-2 block">Subcategory</Label>

									<div className="text-base text-slate-900">{risk.subcategory || "Not specified"}</div>

								</div>

							</div>

						</div>

						

						{/* Risk Description */}

						<div className="section">

							<h2 className="text-xl font-semibold text-slate-900 mb-4">Risk Description</h2>

							<div className="p-4 bg-slate-50 rounded-lg border border-slate-200">

								{risk.descriptionCause && (

									<div className="mb-3">

										<Label className="text-sm font-semibold text-slate-700 mb-2 block">Cause</Label>

										<div className="text-base text-slate-900 leading-relaxed">{risk.descriptionCause}</div>

									</div>

								)}

								{risk.descriptionEvent && (

									<div className="mb-3">

										<Label className="text-sm font-semibold text-slate-700 mb-2 block">Event</Label>

										<div className="text-base text-slate-900 leading-relaxed">{risk.descriptionEvent}</div>

									</div>

								)}

								{risk.descriptionConsequence && (

									<div>

										<Label className="text-sm font-semibold text-slate-700 mb-2 block">Consequence</Label>

										<div className="text-base text-slate-900 leading-relaxed">{risk.descriptionConsequence}</div>

									</div>

								)}

							</div>

						</div>

						

						{/* Worst Case Scenario */}

						{risk.worstCase && (

							<div className="section">

								<h2 className="text-xl font-semibold text-slate-900 mb-4">Potential Worst Case Scenario</h2>

								<div className="p-4 bg-amber-50 rounded-lg border border-amber-200">

									<div className="text-base text-amber-900 leading-relaxed">{risk.worstCase}</div>

								</div>

							</div>

						)}

						

						{/* Risk Assessment */}

						<div className="section">

							<h2 className="text-xl font-semibold text-slate-900 mb-4">Risk Assessment</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

								<div className="p-4 bg-slate-50 rounded-lg border border-slate-200">

									<h3 className="text-lg font-semibold text-slate-800 mb-3">Inherent Risk</h3>

									<div className="mb-3">

										<Badge className={`${lev0.tone} text-base font-semibold px-4 py-2`}>L{risk.likelihood} × I{risk.impact} = {s0} ({lev0.label})</Badge>

									</div>

									{risk.likelihoodNotes && (

										<div className="text-sm text-slate-600 mb-2">

											<strong>Likelihood Notes:</strong> {risk.likelihoodNotes}

										</div>

									)}

									{risk.impactNotes && (

										<div className="text-sm text-slate-600">

											<strong>Impact Notes:</strong> {risk.impactNotes}

										</div>

									)}

								</div>

								<div className="p-4 bg-slate-50 rounded-lg border border-slate-200">

									<h3 className="text-lg font-semibold text-slate-800 mb-3">Residual Risk</h3>

									<div className="mb-3">

										<Badge className={`${lev1.tone} text-base font-semibold px-4 py-2`}>L{rl} × I{ri} = {s1} ({lev1.label})</Badge>

									</div>

									{risk.residualLikelihoodNotes && (

										<div className="text-sm text-slate-600 mb-2">

											<strong>Residual Likelihood Notes:</strong> {risk.residualLikelihoodNotes}

										</div>

									)}

									{risk.residualImpactNotes && (

										<div className="text-sm text-slate-600">

											<strong>Residual Impact Notes:</strong> {risk.residualImpactNotes}

										</div>

									)}

								</div>

							</div>

						</div>

						

						{/* Controls & Mitigations */}

						{(risk.existingControls && risk.existingControls.length > 0) || risk.controlOwner || risk.controlEffectiveness ? (

							<div className="section">

								<h2 className="text-xl font-semibold text-slate-900 mb-4">Controls & Mitigations</h2>

								<div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">

									{risk.existingControls && risk.existingControls.length > 0 && (

										<div>

											<Label className="text-sm font-semibold text-slate-700 mb-2 block">Existing Controls</Label>

											<div className="flex flex-wrap gap-2">

												{risk.existingControls.map((c, i) => (

													<Badge key={i} variant="outline" className="text-sm font-medium px-3 py-1.5 border-slate-300">{c}</Badge>

												))}

											</div>

										</div>

									)}

									{risk.controlOwner && (

										<div>

											<Label className="text-sm font-semibold text-slate-700 mb-2 block">Control Owner</Label>

											<div className="text-base text-slate-900">{risk.controlOwner}</div>

										</div>

									)}

									{risk.controlEffectiveness && (

										<div>

											<Label className="text-sm font-semibold text-slate-700 mb-2 block">Control Effectiveness</Label>

											<div className="text-base text-slate-900">{risk.controlEffectiveness}/5</div>

										</div>

									)}

								</div>

							</div>

						) : null}

						

						{/* Mitigation Actions */}

						<div className="section">

							<h2 className="text-xl font-semibold text-slate-900 mb-4">Mitigation Actions</h2>

							{(!risk.mitigationActions || risk.mitigationActions.length === 0) ? (

								<div className="text-center py-8 text-slate-500">

									<ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />

									<div className="text-base font-medium mb-2">No actions defined yet</div>

									<div className="text-sm text-slate-600">Define mitigation actions to reduce risk exposure</div>

								</div>

							) : (

								<div className="overflow-x-auto">

									<table className="w-full text-sm border border-slate-200 rounded-lg">

										<thead className="bg-slate-50">

											<tr>

												<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200">Action</th>

												<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200">Owner</th>

												<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200">Due Date</th>

												<th className="py-3 px-4 text-left font-semibold text-slate-700 border-b border-slate-200">Status</th>

											</tr>

										</thead>

										<tbody>

											{risk.mitigationActions.map(a => (

												<tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">

													<td className="py-3 px-4 text-slate-900">{a.action}</td>

													<td className="py-3 px-4 text-slate-700">{a.owner}</td>

													<td className="py-3 px-4 text-slate-700">{prettyDate(a.dueDate)}</td>

													<td className="py-3 px-4">

														<Badge variant="outline" className="text-xs font-medium px-2 py-1 border-slate-300">{a.status}</Badge>

													</td>

												</tr>

											))}

										</tbody>

									</table>

								</div>

							)}

						</div>

						

						{/* Approvals History */}

						{risk.approvals && risk.approvals.length > 0 && (

							<div className="section">

								<h2 className="text-xl font-semibold text-slate-900 mb-4">Approvals History</h2>

								<div className="space-y-3">

									{risk.approvals.map((a, i) => (

										<div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">

											<div className="flex items-center justify-between mb-2">

												<span className="font-semibold text-slate-900">{a.action}</span>

												<span className="text-sm text-slate-600">{prettyDate(a.at)}</span>

											</div>

											<div className="text-sm text-slate-700 mb-2">by {a.by}</div>

											{a.note && <div className="text-sm text-slate-600 italic">"{a.note}"</div>}

										</div>

									))}

								</div>

							</div>

						)}

						

						{/* ISO 31000 Fields */}

						{(risk.riskTreatment || risk.nextReviewDate) && (

							<div className="section">

								<h2 className="text-xl font-semibold text-slate-900 mb-4">ISO 31000 Alignment Fields</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

									{risk.riskTreatment && (

										<div>

											<Label className="text-sm font-semibold text-slate-700 mb-2 block">Risk Treatment Strategy</Label>

											<div className="text-base text-slate-900">{risk.riskTreatment}</div>

										</div>

									)}

									{risk.nextReviewDate && (

										<div className="md:col-span-2">

											<Label className="text-sm font-semibold text-slate-700 mb-2 block">Next Review Date</Label>

											<div className="text-base text-slate-900">{prettyDate(risk.nextReviewDate)}</div>

										</div>

									)}

								</div>

							</div>

						)}

						

						{/* Audit Trail */}

						{riskAudit.length > 0 && (

							<div className="section">

								<h2 className="text-xl font-semibold text-slate-900 mb-4">Audit Trail</h2>

								<div className="space-y-3">

									{riskAudit.slice(0, 10).map(entry => (

										<div key={entry.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">

											<div className="flex items-center justify-between mb-2">

												<span className="font-semibold text-slate-900">{entry.type}</span>

												<span className="text-sm text-slate-600">{new Date(entry.at).toLocaleString()}</span>

											</div>

											<div className="text-sm text-slate-700 mb-2">by {entry.actor}</div>

											{entry.details && (

												<div className="text-sm text-slate-600 break-words">

													{typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}

												</div>

											)}

										</div>

									))}

								</div>

							</div>

						)}

					</div>

					

					<div className="flex items-center justify-between gap-4 pt-8 border-t border-slate-200 mt-8">

						<div className="text-sm text-slate-600">

							Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}

						</div>

						<div className="flex items-center gap-3">

							<Button variant="outline" onClick={() => window.print()} className="h-10 px-6 border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500">

								<Download className="h-4 w-4 mr-2" />

								Print / Save PDF

							</Button>

							<Button onClick={() => onOpenChange(false)} className="h-10 px-6 bg-slate-700 hover:bg-slate-800 focus:ring-2 focus:ring-slate-500">Close</Button>

						</div>

					</div>

				</div>

			</DialogContent>

		</Dialog>

	);

}



// -------------------- Department Edit Form --------------------

function DepartmentEditForm({ dept, onSave }) {

	const [form, setForm] = useState({

		name: dept?.name || "",

		description: dept?.description || "",

		processes: dept?.processes || [],

		inherentRiskExamples: dept?.inherentRiskExamples || [],

		riskOwner: dept?.riskOwner || "",

		riskChampion: dept?.riskChampion || ""

	});

	

	function change(field, value) {

		setForm(prev => ({ ...prev, [field]: value }));

	}

	

	function addProcess() {

		const input = document.getElementById("processInput");

		if (input && input.value.trim()) {

			change("processes", [...form.processes, input.value.trim()]);

			input.value = "";

		}

	}

	

	function removeProcess(index) {

		change("processes", form.processes.filter((_, i) => i !== index));

	}

	

	function addRiskExample() {

		const input = document.getElementById("riskInput");

		if (input && input.value.trim()) {

			change("inherentRiskExamples", [...form.inherentRiskExamples, input.value.trim()]);

			input.value = "";

		}

	}

	

	function removeRiskExample(index) {

		change("inherentRiskExamples", form.inherentRiskExamples.filter((_, i) => i !== index));

	}

	

	return (

		<div className="space-y-8">

			{/* Enhanced Header Section */}

			<div className="text-center pb-8 border-b border-slate-200">

				<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">

					<Building2 className="h-8 w-8 text-blue-700" />

				</div>

				<h3 className="text-3xl font-bold text-slate-900 mb-3">

					{dept ? "Edit Department" : "Create New Department"}

				</h3>

				<p className="text-lg text-slate-600 max-w-2xl mx-auto">

					{dept ? "Update department information, processes, and risk management team assignments" : "Set up a new department with comprehensive information including processes, risk profile, and team structure"}

				</p>

			</div>



			{/* Enhanced Basic Information Section */}

			<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-sm">

				<h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">

					<Building2 className="h-6 w-6" />

					Basic Information

				</h4>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

					<div className="space-y-4">

						<Label className="text-base font-semibold text-blue-800">Department Name *</Label>

						<Input 

							value={form.name} 

							onChange={(e) => change("name", e.target.value)} 

							placeholder="e.g., Marketing, Operations, Finance"

							className="h-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"

						/>

					</div>

					

					<div className="space-y-4">

						<Label className="text-base font-semibold text-blue-800">Risk Owner Email</Label>

						<Input 

							value={form.riskOwner} 

							onChange={(e) => change("riskOwner", e.target.value)} 

							placeholder="owner@department.com"

							className="h-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"

						/>

					</div>

				</div>

				

				<div className="mt-8 space-y-4">

					<Label className="text-base font-semibold text-blue-800">Department Description</Label>

					<Textarea 

						rows={5} 

						value={form.description} 

						onChange={(e) => change("description", e.target.value)} 

						placeholder="Describe what this department does, its main responsibilities, key activities, and how it contributes to the organization's objectives..."

						className="border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base resize-none"

					/>

				</div>



				<div className="mt-8 space-y-4">

					<Label className="text-base font-semibold text-blue-800">Risk Champion Email</Label>

					<Input 

						value={form.riskChampion} 

						onChange={(e) => change("riskChampion", e.target.value)} 

						placeholder="champion@department.com"

						className="h-12 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"

					/>

				</div>

			</div>

			

			{/* Enhanced Core Processes Section */}

			<div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-200 shadow-sm">

				<h4 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-3">

					<Activity className="h-6 w-6" />

					Core Business Processes

				</h4>

				<div className="space-y-6">

					<div className="flex gap-4">

						<Input 

							id="processInput"

							placeholder="Enter a core process (e.g., Budget Planning, Quality Control, Customer Service)" 

							onKeyPress={(e) => e.key === "Enter" && addProcess()}

							className="flex-1 h-12 border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-base"

						/>

						<Button 

							onClick={addProcess}

							className="bg-emerald-600 hover:bg-emerald-700 px-8 h-12 text-base font-semibold shadow-sm"

						>

							<Plus className="h-4 w-4 mr-2" />

							Add Process

						</Button>

					</div>

					<div className="flex flex-wrap gap-3">

						{form.processes.map((process, index) => (

							<Badge key={index} variant="outline" className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 border-emerald-300 text-sm font-medium shadow-sm">

								<Activity className="h-3 w-3" />

								<span>{process}</span>

								<button 

									type="button" 

									onClick={() => removeProcess(index)}

									className="hover:text-red-600 transition-colors ml-1"

									title="Remove process"

								>

									<X className="h-3 w-3" />

								</button>

							</Badge>

						))}

					</div>

					{form.processes.length === 0 && (

						<div className="text-center py-8 text-emerald-600">

							<Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />

							<p className="text-sm italic">No processes added yet. Add the main business processes this department manages.</p>

						</div>

					)}

				</div>

			</div>

			

			{/* Enhanced Inherent Risk Examples Section */}

			<div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 shadow-sm">

				<h4 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-3">

					<AlertTriangle className="h-6 w-6" />

					Inherent Risk Examples

				</h4>

				<div className="space-y-6">

					<div className="flex gap-4">

						<Input 

							id="riskInput"

							placeholder="Enter a potential risk (e.g., Budget overrun, Quality failure, Staff turnover)" 

							onKeyPress={(e) => e.key === "Enter" && addRiskExample()}

							className="flex-1 h-12 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-base"

						/>

						<Button 

							onClick={addRiskExample}

							className="bg-amber-600 hover:bg-amber-700 px-8 h-12 text-base font-semibold shadow-sm"

						>

							<Plus className="h-4 w-4 mr-2" />

							Add Risk

						</Button>

					</div>

					<div className="flex flex-wrap gap-3">

						{form.inherentRiskExamples.map((example, index) => (

							<Badge key={index} variant="outline" className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 border-amber-300 text-sm font-medium shadow-sm">

								<AlertTriangle className="h-3 w-3" />

								<span>{example}</span>

								<button 

									type="button" 

									onClick={() => removeRiskExample(index)}

									className="hover:text-red-600 transition-colors ml-1"

									title="Remove risk example"

								>

									<X className="h-3 w-3" />

								</button>

							</Badge>

						))}

					</div>

					{form.inherentRiskExamples.length === 0 && (

						<div className="text-center py-8 text-amber-600">

							<AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />

							<p className="text-sm italic">No risk examples added yet. Add potential risks this department might face.</p>

						</div>

					)}

				</div>

			</div>

			

			{/* Enhanced Actions Section */}

			<div className="flex items-center justify-center gap-6 pt-8 border-t border-slate-200">

				<Button 

					onClick={() => onSave(form)}

					disabled={!form.name.trim()}

					size="lg"

					className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold shadow-lg"

				>

					<Save className="h-5 w-5 mr-2" />

					{dept ? "Update Department" : "Create Department"}

				</Button>

			</div>

		</div>

	);

}

// -------------------- Top Risks List Component - ISO 31000 Compliant --------------------

function TopRisksList({ risks, config, darkMode = false }) {

	const topRisks = useMemo(() => {

		return risks

			.filter(r => r.topRisk)

			.map(r => {

				const lRaw = r?.residualLikelihood ?? r?.likelihood;

				const iRaw = r?.residualImpact ?? r?.impact;

				const l = typeof lRaw === "number" && isFinite(lRaw) ? lRaw : 0;

				const i = typeof iRaw === "number" && isFinite(iRaw) ? iRaw : 0;

				return { ...r, residualScore: l * i };

			})

			.sort((a,b)=> b.residualScore - a.residualScore)

			.slice(0, 8); // Limit to 8 for better readability

	}, [risks]);

	

	if (topRisks.length === 0) {

		return (

			<div className={`text-center py-8 transition-colors duration-300 ${

				darkMode ? 'text-slate-400' : 'text-slate-500'

			}`}>

				<Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />

				<div className={`text-base font-medium mb-2 transition-colors duration-300 ${

					darkMode ? 'text-slate-300' : 'text-slate-700'

				}`}>No Priority Risks Identified</div>

				<div className={`text-sm transition-colors duration-300 ${

					darkMode ? 'text-slate-500' : 'text-slate-600'

				}`}>Flag risks as "Top Risk" to see them here</div>

			</div>

		);

	}

	

	return (

		<div className="space-y-6">

			{/* Enhanced Header with Professional Styling */}

			<div className={`bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm p-6 ${

				darkMode ? 'from-amber-900/20 to-orange-900/20 border-amber-700' : ''

			}`}>

				<div className="flex items-center justify-between mb-4">

					<div className="flex items-center gap-3">

						<div className={`p-3 rounded-xl ${

							darkMode ? 'bg-amber-700 text-amber-200' : 'bg-amber-100 text-amber-700'

						}`}>

							<AlertTriangle className="h-6 w-6" />

						</div>

						<div>

							<h3 className={`text-2xl font-bold transition-colors duration-300 ${

								darkMode ? 'text-amber-200' : 'text-amber-900'

							}`}>Top Risks</h3>

							<p className={`text-base transition-colors duration-300 ${

								darkMode ? 'text-amber-300' : 'text-amber-700'

							}`}>Critical risks requiring immediate attention</p>

						</div>

					</div>

				</div>

				

				{/* Enhanced Summary Stats */}

				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-amber-800/50 border-amber-700' : 'bg-white border-amber-200'

					}`}>

						<div className={`text-2xl font-bold text-amber-600`}>

							{topRisks.length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-amber-300' : 'text-amber-700'

						}`}>Total Top Risks</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-red-800/50 border-red-700' : 'bg-white border-red-200'

					}`}>

						<div className={`text-2xl font-bold text-red-600`}>

							{topRisks.filter(r => (r.residualLikelihood ?? r.likelihood) * (r.residualImpact ?? r.impact) >= 20).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-red-300' : 'text-red-700'

						}`}>Extreme Risk</div>

					</div>

					<div className={`text-center p-3 rounded-lg border transition-colors duration-300 ${

						darkMode ? 'bg-orange-800/50 border-orange-700' : 'bg-white border-orange-200'

					}`}>

						<div className={`text-2xl font-bold text-orange-600`}>

							{topRisks.filter(r => (r.residualLikelihood ?? r.likelihood) * (r.residualImpact ?? r.impact) >= 15).length}

						</div>

						<div className={`text-sm transition-colors duration-300 ${

							darkMode ? 'text-orange-300' : 'text-orange-700'

						}`}>High Risk</div>

					</div>

				</div>

			</div>

			

		<div className="space-y-3">

			{topRisks.map(r => {

				const level = riskLevel(r.residualScore, config.scoring.thresholds);

				return (

					<div key={r.id} className={`group relative flex flex-col p-4 rounded-lg border transition-all duration-300 hover-scale ${

						darkMode 

							? 'border-slate-700 hover:bg-slate-800' 

							: 'border-slate-200 hover:bg-slate-50'

					}`}>

						{/* Risk Title - Full width for better readability */}

						<div className="mb-3">

							<div className={`font-semibold text-sm leading-tight overflow-hidden transition-colors duration-300 ${

								darkMode ? 'text-slate-100' : 'text-slate-900'

							}`} title={r.title}>

								{r.title}

							</div>

						</div>

						

						{/* Bottom Row with Score and Actions */}

						<div className="flex items-center justify-between">

							{/* Residual Score with enhanced color coding */}

							<div className={`inline-flex items-center justify-center w-14 h-8 rounded-lg text-sm font-bold text-white shadow-md transition-all duration-300 ${

								r.residualScore <= 4 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :

								r.residualScore <= 12 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :

								r.residualScore <= 16 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :

								r.residualScore <= 20 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 

								'bg-gradient-to-r from-red-500 to-red-600'

							}`}>

								{r.residualScore}

							</div>

							

							{/* Business Interruption indicator */}

							{r.businessInterruption && (

								<Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 text-xs font-medium px-2 py-1 border border-cyan-200 shadow-sm">

									BI

								</Badge>

							)}

							

							{/* View/Edit buttons - only visible on hover */}

							<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">

								<Button 

									size="sm" 

									variant="outline" 

									onClick={()=>window.dispatchEvent(new CustomEvent("erm:viewRisk", { detail: { riskId: r.id } }))} 

									className={`h-8 px-3 text-sm transition-all duration-300 hover-lift focus-ring ${

										darkMode 

											? 'border-slate-600 hover:bg-slate-700 text-slate-300' 

											: 'border-slate-200 hover:bg-slate-50 text-slate-700'

									}`}

								>

									View

								</Button>

								<Button 

									size="sm" 

									onClick={()=>window.dispatchEvent(new CustomEvent("erm:editRisk", { detail: { riskId: r.id } }))} 

									className={`h-8 px-3 text-sm transition-all duration-300 hover-lift focus-ring ${

										darkMode 

											? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-100' 

											: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white'

									}`}

								>

									Edit

								</Button>

							</div>

						</div>

					</div>

				);

			})}

			</div>

		</div>

	);

}



// ============================================================================

// ERM Awareness Components

// ============================================================================



function ERMAwareness({ awareness, setAwareness, currentUser, onAudit, darkMode = false }) {

	const [activeTab, setActiveTab] = useState(awareness.settings?.showOverviewFirst ? "overview" : "overview");



	return (

		<div className="space-y-8 page-transition">

			{/* Header */}

			<div className="text-center space-y-4">

				<h1 className={`text-4xl font-bold transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>🎓 ERM Awareness & Training 🎓</h1>

				<p className={`text-xl transition-colors duration-300 ${

					darkMode ? 'text-slate-400' : 'text-slate-600'

				}`}>Build your risk management knowledge with ISO 31000 aligned content</p>

				<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${

					darkMode 

						? 'bg-slate-700 text-slate-300 border border-slate-600' 

						: 'bg-blue-100 text-blue-700 border border-blue-200'

				}`}>

					📚 {awareness.modules.length} Learning Modules Available

				</div>

			</div>



			{/* Sub-tabs */}

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

				<TabsList className={`grid w-full grid-cols-4 transition-all duration-300 ${

					darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-r from-slate-50 to-white border-slate-200'

				}`}>

					<TabsTrigger value="overview" className="text-base font-semibold transition-all duration-300 hover:scale-105 focus-ring">📖 Overview</TabsTrigger>

					<TabsTrigger value="modules" className="text-base font-semibold transition-all duration-300 hover:scale-105 focus-ring">🎯 Micro-Learning</TabsTrigger>

					<TabsTrigger value="procedure" className="text-base font-semibold transition-all duration-300 hover:scale-105 focus-ring">📋 Procedure</TabsTrigger>

					<TabsTrigger value="audit" className="text-base font-semibold transition-all duration-300 hover:scale-105 focus-ring">📊 Audit Trail</TabsTrigger>

				</TabsList>



				<TabsContent value="overview" className="mt-6">

					<AwarenessOverview awareness={awareness} darkMode={darkMode} />

				</TabsContent>



				<TabsContent value="modules" className="mt-6">

					<AwarenessModules 

						awareness={awareness} 

						setAwareness={setAwareness} 

						currentUser={currentUser} 

						onAudit={onAudit} 

						darkMode={darkMode}

					/>

				</TabsContent>



				<TabsContent value="procedure" className="mt-6">

					<AwarenessProcedure 

						awareness={awareness} 

						setAwareness={setAwareness} 

						currentUser={currentUser} 

						onAudit={onAudit} 

						darkMode={darkMode}

					/>

				</TabsContent>



				<TabsContent value="audit" className="mt-6">

					<AwarenessAudit awareness={awareness} darkMode={darkMode} />

				</TabsContent>

			</Tabs>

		</div>

	);

}



function AwarenessOverview({ awareness, darkMode = false }) {

	const principles = [

		"Integrated", "Structured & Comprehensive", "Customized", "Inclusive", 

		"Dynamic", "Best Information", "Human & Cultural Factors", "Continual Improvement"

	];

	

	const framework = [

		"Leadership & Commitment", "Integration", "Design", "Implementation", "Evaluation", "Improvement"

	];

	

	const process = [

		"Communication & Consultation", "Scope, Context & Criteria", 

		"Risk Assessment (Identification, Analysis, Evaluation)", "Risk Treatment", 

		"Monitoring & Review", "Recording & Reporting"

	];



	return (

		<div className="space-y-8">

			{/* Hero Section */}

			<div className={`text-center py-12 rounded-xl transition-all duration-300 hover-lift ${

				darkMode 

					? 'bg-gradient-to-r from-slate-800 via-blue-900 to-slate-700 border border-slate-600' 

					: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200'

			}`}>

				<h2 className={`text-3xl font-bold mb-3 transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>{awareness.overview.heroTitle}</h2>

				<p className={`text-lg transition-colors duration-300 ${

					darkMode ? 'text-slate-300' : 'text-slate-600'

				}`}>{awareness.overview.heroSubtitle}</p>

			</div>



			{/* Three Main Cards */}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

				{/* Principles Card */}

				<Card className={`card-enhanced transition-all duration-300 hover-lift card-entrance ${

					darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

				}`}>

					<CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">

						<CardTitle className="flex items-center gap-2 text-white">

							<Shield className="h-5 w-5 text-blue-200" />

							ISO 31000 Principles

						</CardTitle>

					</CardHeader>

					<CardContent className="p-6">

						<div className="space-y-3">

							{principles.map((principle, index) => (

								<div key={index} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${

									darkMode ? 'text-slate-300' : 'text-slate-700'

								}`}>

									<div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>

									{principle}

								</div>

							))}

						</div>

					</CardContent>

				</Card>



				{/* Framework Card */}

				<Card className={`card-enhanced transition-all duration-300 hover-lift ${

					darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

				}`}>

					<CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">

						<CardTitle className="flex items-center gap-2 text-white">

							<Building2 className="h-5 w-5 text-emerald-200" />

							Risk Management Framework

						</CardTitle>

					</CardHeader>

					<CardContent className="p-6">

						<div className="space-y-3">

							{framework.map((item, index) => (

								<div key={index} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${

									darkMode ? 'text-slate-300' : 'text-slate-700'

								}`}>

									<div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></div>

									{item}

								</div>

							))}

						</div>

					</CardContent>

				</Card>



				{/* Process Card */}

				<Card className={`card-enhanced transition-all duration-300 hover-lift ${

					darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

				}`}>

					<CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">

						<CardTitle className="flex items-center gap-2 text-white">

							<ArrowRight className="h-5 w-5 text-purple-200" />

							Risk Management Process

						</CardTitle>

					</CardHeader>

					<CardContent className="p-6">

						<div className="space-y-2">

							{process.map((item, index) => (

								<div key={index} className={`flex items-center gap-2 text-sm transition-colors duration-300 ${

									darkMode ? 'text-slate-300' : 'text-slate-700'

								}`}>

									<div className="w-2 h-2 rounded-full bg-purple-500"></div>

									{item}

								</div>

							))}

						</div>

					</CardContent>

				</Card>

			</div>



			{/* Tool Mapping */}

			<Card className={`transition-colors duration-300 ${

				darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

			}`}>

				<CardHeader>

					<CardTitle className={`transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>How This Tool Maps to ISO 31000</CardTitle>

				</CardHeader>

				<CardContent>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

						{awareness.overview.mapping.map((item, index) => {

							const IconComponent = icons[item.icon] || Shield;

							return (

								<div key={item.id} className={`p-6 rounded-xl border-2 transition-all duration-300 hover-lift stagger-item ${

									darkMode 

										? 'border-slate-600 bg-gradient-to-br from-slate-700/50 to-slate-600/50' 

										: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'

								}`}>

									<div className="flex items-start gap-4">

										<div className={`p-3 rounded-xl transition-all duration-300 ${

											darkMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-blue-100 to-indigo-100'

										}`}>

											<IconComponent className={`h-6 w-6 ${

												darkMode ? 'text-blue-200' : 'text-blue-600'

											}`} />

										</div>

										<div className="flex-1">

											<div className={`text-lg font-semibold mb-2 transition-colors duration-300 ${

												darkMode ? 'text-slate-100' : 'text-slate-900'

											}`}>{item.tool}</div>

											<div className={`text-base font-medium mb-2 px-3 py-1 rounded-lg inline-block ${

												darkMode 

													? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 

													: 'bg-blue-100 text-blue-700 border border-blue-200'

											}`}>

												{item.iso31000}

											</div>

											<div className={`text-base transition-colors duration-300 ${

												darkMode ? 'text-slate-400' : 'text-slate-600'

											}`}>{item.note}</div>

										</div>

									</div>

								</div>

							);

						})}

					</div>

				</CardContent>

			</Card>

		</div>

	);

}



function AwarenessModules({ awareness, setAwareness, currentUser, onAudit, darkMode = false }) {

	const [selectedModule, setSelectedModule] = useState(null);

	const [showQuiz, setShowQuiz] = useState(false);



	const userCompletions = awareness.completions.filter(c => c.userEmail === currentUser.email);

	const passedModules = userCompletions.filter(c => c.passed).length;

	const totalModules = awareness.modules.length;



	const handleModuleComplete = (moduleId, score, passed, note = "") => {

		const completion = {

			userEmail: currentUser.email,

			moduleId,

			score,

			passed,

			on: new Date().toISOString(),

			note

		};



		setAwareness(prev => ({

			...prev,

			completions: [...prev.completions.filter(c => !(c.userEmail === currentUser.email && c.moduleId === moduleId)), completion]

		}));



		onAudit(currentUser.email, "MODULE_COMPLETED", { moduleId, score, passed, note });

		setShowQuiz(false);

	};



	return (

		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

			{/* Left Panel - Module Catalog */}

			<div className="space-y-6">

				<div className={`p-6 rounded-xl transition-all duration-300 hover-lift ${

					darkMode 

						? 'bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600' 

						: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'

				}`}>

					<div className={`text-center mb-4 transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>

						<h3 className="text-xl font-semibold mb-3">📊 Your Progress</h3>

						<div className={`text-3xl font-bold ${

							darkMode ? 'text-blue-400' : 'text-blue-600'

						}`}>

							{passedModules}/{totalModules} modules passed

						</div>

						<div className={`text-sm mt-2 transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>

							{Math.round((passedModules / totalModules) * 100)}% completion rate

						</div>

					</div>

				</div>



				<div className="space-y-4">

					{awareness.modules.map((module) => {

						const completion = userCompletions.find(c => c.moduleId === module.id);

						const isLocked = completion?.passed;

						

						return (

							<Card 

								key={module.id} 

								className={`cursor-pointer card-enhanced transition-all duration-300 hover-lift hover-smooth ${

									darkMode 

										? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:from-slate-700 hover:to-slate-600' 

										: 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:from-slate-50 hover:to-white'

								} ${isLocked ? 'opacity-75' : ''}`}

								onClick={() => {

									if (!isLocked) {

										setSelectedModule(module);

										setShowQuiz(true);

									}

								}}

							>

								<CardContent className="p-6">

									<div className="flex items-center justify-between mb-4">

										<div className="flex-1">

											<div className={`text-lg font-semibold mb-2 transition-colors duration-300 ${

												darkMode ? 'text-slate-100' : 'text-slate-900'

											}`}>{module.title}</div>

											<div className={`text-base transition-colors duration-300 ${

												darkMode ? 'text-slate-400' : 'text-slate-600'

											}`}>{module.summary}</div>

										</div>

										<div className="flex items-center gap-3">

											{completion && (

												<Badge className={`${

													completion.passed 

														? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300" 

														: "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300"

												} font-medium px-3 py-1`}>

													{completion.passed ? "✅ Passed" : "❌ Failed"}

												</Badge>

											)}

											<div className={`text-sm font-medium px-3 py-1 rounded-full transition-colors duration-300 ${

												darkMode 

													? 'bg-slate-700 text-slate-300' 

													: 'bg-blue-100 text-blue-700'

											}`}>

												⏱️ {module.minutes} min

											</div>

										</div>

									</div>

									

									{completion && (

										<div className={`text-sm p-3 rounded-lg transition-colors duration-300 ${

											darkMode 

												? 'bg-slate-700/50 text-slate-400' 

												: 'bg-slate-100 text-slate-600'

										}`}>

											📅 Last attempt: {new Date(completion.on).toLocaleDateString()}

											{completion.note && ` - ${completion.note}`}

										</div>

									)}

								</CardContent>

							</Card>

						);

					})}

				</div>

			</div>



			{/* Right Panel - Module Content & Quiz */}

			<div className="space-y-6">

				{selectedModule && showQuiz ? (

					<QuizForm 

						module={selectedModule} 

						currentUser={currentUser} 

						onSubmit={handleModuleComplete}

						isLocked={false}

						darkMode={darkMode}

					/>

				) : (

					<div className={`p-12 text-center rounded-xl border-2 border-dashed transition-all duration-300 hover-lift ${

						darkMode 

							? 'border-slate-600 text-slate-400 bg-gradient-to-br from-slate-800 to-slate-700' 

							: 'border-slate-300 text-slate-500 bg-gradient-to-br from-slate-50 to-white'

					}`}>

						<Shield className="h-24 w-24 mx-auto mb-6 opacity-50" />

						<div className="text-2xl font-semibold mb-3">📚 Select a Module</div>

						<div className="text-base">Choose a module from the left to start your learning journey</div>

						<div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">

							<div className="text-blue-800 font-medium">💡 Learning Tip</div>

							<div className="text-blue-700 text-sm">Complete modules to unlock advanced content and track your progress</div>

						</div>

					</div>

				)}

			</div>

		</div>

	);

}

function QuizForm({ module, currentUser, onSubmit, isLocked, darkMode = false }) {

	const [currentQuestion, setCurrentQuestion] = useState(0);

	const [answers, setAnswers] = useState({});

	const [showResults, setShowResults] = useState(false);



	const handleAnswer = (questionId, answerIndex) => {

		setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));

	};



	const handleSubmit = () => {

		const score = Object.values(answers).filter((answer, index) => 

			answer === module.quiz[index].correct

		).length;

		

		const passed = score >= module.passScore;

		const note = passed ? "Successfully completed" : `Scored ${score}/${module.quiz.length}`;

		

		onSubmit(module.id, score, passed, note);

	};



	const resetQuiz = () => {

		setCurrentQuestion(0);

		setAnswers({});

		setShowResults(false);

	};



	if (isLocked) {

		return (

			<Card className={`card-enhanced transition-all duration-300 hover-lift ${

				darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

			}`}>

				<CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-xl">

					<CardTitle className="text-white text-xl font-semibold">🎓 Module Completed! 🎓</CardTitle>

					<p className="text-emerald-100 text-sm">Congratulations on your achievement!</p>

				</CardHeader>

				<CardContent className="p-8 text-center">

					<CheckCircle2 className="h-24 w-24 mx-auto mb-6 text-emerald-500" />

					<div className={`text-3xl font-bold mb-4 transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>Module Completed!</div>

					<div className={`text-lg transition-colors duration-300 ${

						darkMode ? 'text-slate-400' : 'text-slate-600'

					}`}>You have successfully passed this module</div>

					<div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">

						<div className="text-emerald-800 font-medium">Completion Date: {new Date(module.completedAt).toLocaleDateString()}</div>

						<div className="text-emerald-700 text-sm">Score: {module.score}%</div>

					</div>

				</CardContent>

			</Card>

		);

	}



	if (showResults) {

		const score = Object.values(answers).filter((answer, index) => 

			answer === module.quiz[index].correct

		).length;

		const passed = score >= module.passScore;



		return (

			<Card className={`card-enhanced transition-all duration-300 hover-lift ${

				darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

			}`}>

				<CardHeader className={`bg-gradient-to-r text-white rounded-t-xl ${

					passed ? 'from-emerald-600 to-teal-700' : 'from-amber-600 to-orange-700'

				}`}>

					<CardTitle className="text-white text-xl font-semibold">

						{passed ? "🎉 Quiz Results 🎉" : "📚 Quiz Results 📚"}

					</CardTitle>

					<p className={`text-sm ${passed ? 'text-emerald-100' : 'text-amber-100'}`}>

						{passed ? "Your performance summary" : "Review your answers"}

					</p>

				</CardHeader>

				<CardContent className="p-6">

					<div className="text-center mb-8">

						{passed ? (

							<CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-emerald-500" />

						) : (

							<AlertCircle className="h-20 w-20 mx-auto mb-6 text-amber-500" />

						)}

						<div className={`text-3xl font-bold mb-3 transition-colors duration-300 ${

							darkMode ? 'text-slate-100' : 'text-slate-900'

						}`}>

							{passed ? "Congratulations!" : "Keep Studying!"}

						</div>

						<div className={`text-xl transition-colors duration-300 ${

							darkMode ? 'text-slate-300' : 'text-slate-700'

						}`}>

							You scored <span className="font-bold text-2xl">{score}</span> out of <span className="font-bold">{module.quiz.length}</span>

						</div>

						<div className={`text-base mt-3 transition-colors duration-300 ${

							darkMode ? 'text-slate-400' : 'text-slate-600'

						}`}>

							{passed ? "You've successfully passed this module! 🎊" : `You need ${module.passScore} correct answers to pass. Keep learning! 📖`}

						</div>

					</div>



					<div className="space-y-6">

						{module.quiz.map((question, index) => {

							const userAnswer = answers[question.id];

							const isCorrect = userAnswer === question.correct;

							

							return (

								<div key={question.id} className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${

									isCorrect 

										? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-emerald-100' 

										: 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-amber-100'

								}`}>

									<div className={`font-semibold mb-4 text-lg transition-colors duration-300 ${

										darkMode ? 'text-slate-900' : 'text-slate-900'

									}`}>Question {index + 1}: {question.q}</div>

									<div className="space-y-3">

										{question.a.map((answer, answerIndex) => (

											<div key={answerIndex} className={`p-3 rounded-lg transition-all duration-300 ${

												answerIndex === question.correct 

													? 'bg-emerald-100 text-emerald-800 font-semibold border-2 border-emerald-300' 

													: answerIndex === userAnswer && answerIndex !== question.correct

														? 'bg-amber-100 text-amber-800 font-medium border-2 border-amber-300' 

														: 'bg-slate-50 text-slate-600 border border-slate-200'

											}`}>

												<span className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-sm font-bold ${

													answerIndex === question.correct 

														? 'bg-emerald-500 text-white' 

														: answerIndex === userAnswer && answerIndex !== question.correct

															? 'bg-amber-500 text-white' 

															: 'bg-slate-400 text-white'

												}">

													{answerIndex === question.correct ? "✓" : answerIndex === userAnswer && answerIndex !== question.correct ? "✗" : String.fromCharCode(65 + answerIndex)}

												</span>

												{answer}

											</div>

										))}

									</div>

								</div>

							);

						})}

					</div>



					<div className="flex gap-4 mt-8">

						<Button 

							onClick={handleSubmit} 

							className={`flex-1 transition-all duration-300 hover:scale-105 focus-ring ${

								passed 

									? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800' 

									: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'

							}`}

						>

							{passed ? "🎉 Complete Module 🎉" : "📤 Submit Results 📤"}

						</Button>

						{!passed && (

							<Button 

								variant="outline" 

								onClick={resetQuiz}

								className="transition-all duration-300 hover:scale-105 focus-ring border-amber-300 text-amber-700 hover:bg-amber-50"

							>

								🔄 Retry Quiz

							</Button>

						)}

					</div>

				</CardContent>

			</Card>

		);

	}



	const question = module.quiz[currentQuestion];



	return (

		<Card className={`card-enhanced transition-all duration-300 hover-lift ${

			darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

		}`}>

			<CardHeader className="bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-t-xl">

				<CardTitle className="text-white text-xl font-semibold">{module.title}</CardTitle>

				<div className="text-violet-100 text-sm">

					Question {currentQuestion + 1} of {module.quiz.length}

				</div>

			</CardHeader>

			<CardContent className="space-y-8 p-6">

				<div>

					<div className={`text-xl font-medium mb-6 transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>{question.q}</div>

					<div className="space-y-4">

						{question.a.map((answer, index) => (

							<Button

								key={index}

								variant={answers[question.id] === index ? "default" : "outline"}

								className={`w-full justify-start h-auto p-5 text-left transition-all duration-300 hover:scale-105 focus-ring ${

									answers[question.id] === index 

										? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg' 

										: 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50'

								}`}

								onClick={() => handleAnswer(question.id, index)}

							>

								{answer}

							</Button>

						))}

					</div>

				</div>



				<div className="flex justify-between gap-4">

					<Button 

						variant="outline" 

						onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}

						disabled={currentQuestion === 0}

						className="transition-all duration-300 hover:scale-105 focus-ring"

					>

						← Previous

					</Button>

					

					{currentQuestion === module.quiz.length - 1 ? (

						<Button 

							onClick={() => setShowResults(true)} 

							disabled={Object.keys(answers).length < module.quiz.length}

							className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 hover:scale-105 focus-ring"

						>

							Submit Quiz

						</Button>

					) : (

						<Button 

							onClick={() => setCurrentQuestion(prev => prev + 1)}

							disabled={!answers[question.id]}

							className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 focus-ring"

						>

							Next →

						</Button>

					)}

				</div>

			</CardContent>

		</Card>

	);

}



function AwarenessProcedure({ awareness, setAwareness, currentUser, onAudit, darkMode = false }) {

	const [editMode, setEditMode] = useState(false);

	const [editingSection, setEditingSection] = useState(null);

	const [editForm, setEditForm] = useState({ title: "", body: "" });



	const isAdmin = currentUser.role === "Admin";

	const isRiskChampion = currentUser.role === "Risk Champion";



	const handleEdit = (section) => {

		setEditingSection(section);

		setEditForm({ title: section.title, body: section.body });

	};



	const handleSave = () => {

		if (editingSection) {

			setAwareness(prev => ({

				...prev,

				procedure: prev.procedure.map(p => 

					p.id === editingSection.id 

						? { ...p, title: editForm.title, body: editForm.body }

						: p

				)

			}));

			

			onAudit(currentUser.email, "PROCEDURE_EDITED", { 

				sectionId: editingSection.id, 

				oldTitle: editingSection.title, 

				newTitle: editForm.title 

			});

		}

		setEditingSection(null);

		setEditForm({ title: "", body: "" });

	};



	const handlePrint = () => {

		window.print();

	};



	return (

		<div className="space-y-8">

			{/* Header with Controls */}

			<div className="flex items-center justify-between">

				<div>

					<h2 className={`text-3xl font-bold mb-3 transition-colors duration-300 ${

						darkMode ? 'text-slate-100' : 'text-slate-900'

					}`}>Risk Management Procedure</h2>

					<p className={`text-base transition-colors duration-300 ${

						darkMode ? 'text-slate-400' : 'text-slate-600'

					}`}>ISO 31000 aligned procedures for effective risk management</p>

				</div>

				<div className="flex items-center gap-4">

					{(isAdmin || isRiskChampion) && (

						<Button 

							variant={editMode ? "default" : "outline"}

							onClick={() => setEditMode(!editMode)}

							className="transition-all duration-300 hover:scale-105 focus-ring"

						>

							{editMode ? "Exit Edit Mode" : "Edit Mode"}

						</Button>

					)}

					<Button 

						variant="outline" 

						onClick={handlePrint}

						className="transition-all duration-300 hover:scale-105 focus-ring"

					>

						<FileText className="h-4 w-4 mr-2" />

						Print

					</Button>

				</div>

			</div>



			{/* Procedure Sections */}

			<div className="space-y-6">

				{awareness.procedure.map((section) => (

					<Card key={section.id} className={`card-enhanced transition-all duration-300 hover-lift ${

						darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

					}`}>

						<CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">

							{editingSection?.id === section.id ? (

								<div className="space-y-4">

									<Input

										value={editForm.title}

										onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}

										placeholder="Section title"

										className="bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-300"

									/>

									<div className="flex gap-3">

										<Button size="sm" onClick={handleSave} className="bg-white text-blue-700 hover:bg-white/90 transition-all duration-300">

											Save

										</Button>

										<Button size="sm" variant="outline" onClick={() => setEditingSection(null)} className="border-white/30 text-white hover:bg-white/20 transition-all duration-300">

											Cancel

										</Button>

									</div>

								</div>

							) : (

								<div className="flex items-center justify-between">

									<CardTitle className="text-white text-xl font-semibold">{section.title}</CardTitle>

									{editMode && (isAdmin || isRiskChampion) && (

										<Button size="sm" variant="outline" onClick={() => handleEdit(section)} className="border-white/30 text-white hover:bg-white/20 transition-all duration-300">

											Edit

										</Button>

									)}

								</div>

							)}

						</CardHeader>

						<CardContent className="p-6">

							{editingSection?.id === section.id ? (

								<Textarea

									value={editForm.body}

									onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}

									placeholder="Section content"

									rows={4}

									className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"

								/>

							) : (

								<div className={`prose max-w-none transition-colors duration-300 ${

									darkMode ? 'text-slate-300' : 'text-slate-700'

								}`}>

									{section.body}

								</div>

							)}

						</CardContent>

					</Card>

				))}

			</div>

		</div>

	);

}



function AwarenessAudit({ awareness, darkMode = false }) {

	return (

		<div className="space-y-8">

			<div>

				<h2 className={`text-3xl font-bold mb-3 transition-colors duration-300 ${

					darkMode ? 'text-slate-100' : 'text-slate-900'

				}`}>Audit Trail</h2>

				<p className={`text-base transition-colors duration-300 ${

					darkMode ? 'text-slate-400' : 'text-slate-600'

				}`}>Track all awareness and training activities</p>

			</div>



			<Card className={`card-enhanced transition-all duration-300 hover-lift ${

				darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'

			}`}>

				<CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-t-xl">

					<CardTitle className="text-white text-xl font-semibold">Activity Log</CardTitle>

					<p className="text-cyan-100 text-sm">Comprehensive tracking of all system activities</p>

				</CardHeader>

				<CardContent className="p-0">

					{awareness.auditTrail.length === 0 ? (

						<div className="text-center py-16 text-slate-500">

							<Activity className="h-20 w-20 mx-auto mb-6 opacity-50" />

							<div className="text-xl font-medium mb-3">No audit entries yet</div>

							<div className="text-base text-slate-600">Activities will appear here as they occur</div>

						</div>

					) : (

						<div className="overflow-x-auto">

							<table className="w-full text-sm">

								<thead className={`border-b transition-colors duration-300 ${

									darkMode ? 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-600' : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'

								}`}>

									<tr>

										<th className={`py-4 px-6 text-left font-semibold transition-colors duration-300 ${

											darkMode ? 'text-slate-300' : 'text-slate-700'

										}`}>Date/Time</th>

										<th className={`py-4 px-6 text-left font-semibold transition-colors duration-300 ${

											darkMode ? 'text-slate-300' : 'text-slate-700'

										}`}>User</th>

										<th className={`py-4 px-6 text-left font-semibold transition-colors duration-300 ${

											darkMode ? 'text-slate-300' : 'text-slate-700'

										}`}>Action</th>

										<th className={`py-4 px-6 text-left font-semibold transition-colors duration-300 ${

											darkMode ? 'text-slate-300' : 'text-slate-700'

										}`}>Details</th>

									</tr>

								</thead>

								<tbody className="divide-y divide-slate-100">

									{awareness.auditTrail.map((entry, index) => (

										<tr key={entry.id} className={`transition-all duration-300 hover:scale-[1.01] ${

											index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'

										} hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50`}>

											<td className="py-4 px-6 text-slate-600 font-medium">

												{new Date(entry.at).toLocaleString()}

											</td>

											<td className="py-4 px-6 text-slate-700 font-semibold">

												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

													{entry.by}

												</span>

											</td>

											<td className="py-4 px-6 text-slate-700">

												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">

													{entry.action}

												</span>

											</td>

											<td className="py-4 px-6 text-slate-600">

												<div className="max-w-xs truncate" title={JSON.stringify(entry.details)}>

													{JSON.stringify(entry.details)}

												</div>

											</td>

										</tr>

									))}

								</tbody>

							</table>

						</div>

					)}

				</CardContent>

			</Card>

		</div>

	);

}



// Helper function to get icon components

const icons = {

	ClipboardList,

	Grid3X3,

	CheckCircle2,

	ArrowRight,

	Settings,

	Shield,

	Building2,

	Activity,

	AlertCircle,

	FileText

};

