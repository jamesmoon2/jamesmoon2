/**
 * Florida Civil Procedure - Data Configuration
 * Complete workflow specification with timing, costs, documents, and decision logic
 * Enhanced with detailed Trial Phase, ADR options, and expandable branches
 *
 * References:
 * - Florida Rules of Civil Procedure (Fla.R.Civ.P.)
 * - Florida Statutes (particularly Ch. 768.79 for Proposals for Settlement)
 * - Florida Rules of Appellate Procedure (Fla.R.App.P.)
 * - Florida Evidence Code (Ch. 90)
 */

/**
 * Phase Groups - High-level litigation phase filters
 * Each phase contains multiple stages that can be toggled together
 */
export const PHASE_GROUPS = {
    pleadings: {
        id: "pleadings",
        name: "Pleadings",
        shortName: "Pleadings",
        description: "Filing through Answer",
        stages: ["Filing", "Service", "ServiceIssue", "Responsive", "Amendment", "Dismissal"],
        icon: "📋",
        enabled: true
    },
    caseManagement: {
        id: "caseManagement",
        name: "Case Management",
        shortName: "Case Mgmt",
        description: "Case management and complexity tracks",
        stages: ["CaseMgmt", "ComplexLit"],
        icon: "📊",
        enabled: true
    },
    adr: {
        id: "adr",
        name: "ADR & Settlement",
        shortName: "ADR",
        description: "Mediation, arbitration, and settlement",
        stages: ["ADR", "Arbitration", "Settlement", "Resolution"],
        icon: "🤝",
        enabled: true
    },
    discovery: {
        id: "discovery",
        name: "Discovery",
        shortName: "Discovery",
        description: "Discovery tools, disputes, and e-discovery",
        stages: ["Discovery", "DiscTools", "DiscMotions", "EDiscovery"],
        icon: "🔍",
        enabled: true
    },
    experts: {
        id: "experts",
        name: "Experts & Daubert",
        shortName: "Experts",
        description: "Expert designation and Daubert challenges",
        stages: ["ExpertDisc", "Daubert"],
        icon: "🎓",
        enabled: true
    },
    trial: {
        id: "trial",
        name: "Trial Track",
        shortName: "Trial",
        description: "Pretrial, trial prep, and trial phases",
        stages: ["PreTrial", "TrialPrep", "Trial", "TrialPhase"],
        icon: "⚖️",
        enabled: true
    },
    postJudgment: {
        id: "postJudgment",
        name: "Post-Judgment",
        shortName: "Post-Judg",
        description: "Post-trial motions, fees, and enforcement",
        stages: ["PostTrial", "Fees", "Enforce"],
        icon: "📜",
        enabled: true
    },
    appeals: {
        id: "appeals",
        name: "Appeals",
        shortName: "Appeals",
        description: "Appeals, interlocutory review, and stays",
        stages: ["Appeal", "Interlocutory", "Stay"],
        icon: "🏛️",
        enabled: true
    },
    emergency: {
        id: "emergency",
        name: "Emergency Relief",
        shortName: "Emergency",
        description: "TRO and preliminary injunctions",
        stages: ["Emergency", "Injunction"],
        icon: "🚨",
        enabled: true
    },
    thirdParty: {
        id: "thirdParty",
        name: "Third-Party",
        shortName: "3rd Party",
        description: "Impleader, cross-claims, interpleader",
        stages: ["ThirdParty"],
        icon: "👥",
        enabled: true
    }
};

/**
 * Get all stages for a given phase
 */
export function getStagesForPhase(phaseId) {
    const phase = PHASE_GROUPS[phaseId];
    return phase ? phase.stages : [];
}

/**
 * Get the phase that contains a given stage
 */
export function getPhaseForStage(stageName) {
    for (const [phaseId, phase] of Object.entries(PHASE_GROUPS)) {
        if (phase.stages.includes(stageName)) {
            return phaseId;
        }
    }
    return null;
}

/**
 * Get nodes filtered by enabled phases
 */
export function getNodesByPhases(enabledPhases) {
    const enabledStages = new Set();
    for (const phaseId of enabledPhases) {
        const phase = PHASE_GROUPS[phaseId];
        if (phase) {
            phase.stages.forEach(stage => enabledStages.add(stage));
        }
    }
    return NODES.filter(node => enabledStages.has(node.stage));
}

export const STAGE_COLORS = {
    Filing: "#3b82f6",
    Service: "#0891b2",
    ServiceIssue: "#0e7490",
    Responsive: "#8b5cf6",
    Resolution: "#10b981",
    CaseMgmt: "#14b8a6",
    ADR: "#22c55e",
    Arbitration: "#16a34a",
    Discovery: "#f59e0b",
    DiscTools: "#fb923c",
    DiscMotions: "#ea580c",
    ExpertDisc: "#f97316",
    EDiscovery: "#d97706",
    Daubert: "#b45309",
    Settlement: "#84cc16",
    PreTrial: "#ef4444",
    TrialPrep: "#dc2626",
    Trial: "#ec4899",
    TrialPhase: "#db2777",
    PostTrial: "#6366f1",
    Fees: "#7c3aed",
    Enforce: "#8b5cf6",
    Appeal: "#14b8a6",
    Interlocutory: "#0d9488",
    Emergency: "#be123c",
    Injunction: "#e11d48",
    ThirdParty: "#7e22ce",
    Amendment: "#4f46e5",
    Stay: "#0891b2",
    Dismissal: "#64748b",
    ComplexLit: "#0f766e"
};

/**
 * Node Groups - Define expandable/collapsible sections
 * Each group contains child node IDs that can be expanded/collapsed
 */
export const NODE_GROUPS = {
    discovery: {
        id: "discovery-group",
        name: "Discovery Phase",
        parentNodeId: 14,
        childNodeIds: [15, 16, 40, 41, 42],
        expanded: true,
        color: "#f59e0b"
    },
    eDiscovery: {
        id: "ediscovery-group",
        name: "E-Discovery",
        parentNodeId: 14,
        childNodeIds: [200, 201, 202, 203, 204],
        expanded: false,
        color: "#d97706"
    },
    trialPrep: {
        id: "trial-prep-group",
        name: "Pretrial Preparation",
        parentNodeId: 24,
        childNodeIds: [50, 51, 52, 53],
        expanded: true,
        color: "#dc2626"
    },
    trial: {
        id: "trial-group",
        name: "Trial Phase",
        parentNodeId: 26,
        childNodeIds: [60, 61, 62, 63, 64, 65, 66],
        expanded: true,
        color: "#ec4899"
    },
    postTrial: {
        id: "post-trial-group",
        name: "Post-Trial Motions",
        parentNodeId: 28,
        childNodeIds: [29, 70, 71, 72],
        expanded: true,
        color: "#6366f1"
    },
    adr: {
        id: "adr-group",
        name: "ADR Options",
        parentNodeId: 11,
        childNodeIds: [12, 80, 81],
        expanded: true,
        color: "#22c55e"
    },
    emergency: {
        id: "emergency-group",
        name: "Emergency Relief",
        parentNodeId: 110,
        childNodeIds: [111, 112, 113, 114, 115],
        expanded: true,
        color: "#be123c"
    },
    interlocutory: {
        id: "interlocutory-group",
        name: "Interlocutory Appeals",
        parentNodeId: 120,
        childNodeIds: [121, 122, 123, 124],
        expanded: false,
        color: "#0d9488"
    },
    thirdParty: {
        id: "third-party-group",
        name: "Third-Party Practice",
        parentNodeId: 130,
        childNodeIds: [131, 132, 133, 134],
        expanded: false,
        color: "#7e22ce"
    },
    daubert: {
        id: "daubert-group",
        name: "Daubert/Expert Challenges",
        parentNodeId: 19,
        childNodeIds: [140, 141, 142],
        expanded: false,
        color: "#b45309"
    },
    fees: {
        id: "fees-group",
        name: "Attorney's Fees & Costs",
        parentNodeId: 30,
        childNodeIds: [150, 151, 152, 153, 154],
        expanded: false,
        color: "#7c3aed"
    },
    stay: {
        id: "stay-group",
        name: "Stay Pending Appeal",
        parentNodeId: 33,
        childNodeIds: [160, 161, 162, 163],
        expanded: false,
        color: "#0891b2"
    },
    amendment: {
        id: "amendment-group",
        name: "Amended Pleadings",
        parentNodeId: 8,
        childNodeIds: [170, 171, 172, 173],
        expanded: false,
        color: "#4f46e5"
    },
    dismissal: {
        id: "dismissal-group",
        name: "Voluntary Dismissal",
        parentNodeId: 0,
        childNodeIds: [180, 181, 182],
        expanded: false,
        color: "#64748b"
    },
    complexity: {
        id: "complexity-group",
        name: "Case Complexity Tracks",
        parentNodeId: 11,
        childNodeIds: [190, 191, 192],
        expanded: false,
        color: "#0f766e"
    }
};

/**
 * Parallel Processes - These can occur at various times during litigation
 * Not tied to a single point in the workflow
 */
export const PARALLEL_PROCESSES = [
    {
        id: "mediation-anytime",
        name: "Voluntary Mediation",
        rule: "1.700",
        description: "Parties may agree to mediate at any time during the litigation",
        availableFrom: 0,
        availableUntil: 26,
        stage: "ADR"
    },
    {
        id: "settlement-anytime",
        name: "Settlement Negotiations",
        rule: "1.730",
        description: "Parties may negotiate settlement at any point",
        availableFrom: 0,
        availableUntil: 27,
        stage: "Settlement"
    },
    {
        id: "proposal-settlement",
        name: "Proposal for Settlement",
        rule: "768.79/1.442",
        description: "Available 30+ days after service on defendant, must be 45+ days before trial",
        availableFrom: 5,
        availableUntil: 24,
        stage: "Settlement",
        timing: {
            earliest: "30 days after service on defendant",
            latest: "45 days before trial or first day of trial docket"
        }
    },
    {
        id: "emergency-relief",
        name: "Emergency Relief",
        rule: "1.610",
        description: "TRO or emergency injunctive relief available at any time",
        availableFrom: 0,
        availableUntil: 30,
        stage: "Emergency"
    },
    {
        id: "interlocutory-review",
        name: "Interlocutory Review",
        rule: "9.130",
        description: "Certiorari or interlocutory appeal from non-final orders",
        availableFrom: 7,
        availableUntil: 30,
        stage: "Interlocutory"
    }
];

export const NODES = [
    // ============================================
    // FILING & SERVICE PHASE (IDs 0-6)
    // ============================================
    {
        id: 0,
        name: "Complaint\nFiled",
        rule: "1.100",
        x: 100,
        y: 600,
        stage: "Filing",
        volume: 100,
        duration: "Day 1",
        cost: "2-5h+$400",
        documents: ["Complaint", "Summons", "Civil Cover Sheet", "Corporate Disclosure Statement"],
        owner: "Attorney",
        trigger: "File",
        deadline: "flexible",
        isExpandable: true,
        expandsGroup: "dismissal",
        notes: "Statute of limitations must be checked before filing. Consider voluntary dismissal options."
    },
    {
        id: 1,
        name: "Service\nRequired",
        rule: "1.070",
        x: 280,
        y: 300,
        stage: "Service",
        volume: 100,
        duration: "120d",
        cost: "$50-200",
        documents: ["Summons"],
        owner: "Paralegal",
        trigger: "Auto",
        deadline: "strict",
        isDecision: true,
        notes: "Must serve within 120 days or face dismissal without prejudice"
    },
    {
        id: 2,
        name: "Personal\nService",
        rule: "1.070(b)",
        x: 440,
        y: 200,
        stage: "Service",
        volume: 60,
        duration: "1-30d",
        cost: "$75-150",
        documents: ["Return of Service"],
        owner: "Process Server",
        trigger: "Known Address",
        deadline: "strict"
    },
    {
        id: 3,
        name: "Substituted\nService",
        rule: "1.070(e)",
        x: 440,
        y: 300,
        stage: "Service",
        volume: 25,
        duration: "15-45d",
        cost: "$100-200",
        documents: ["Affidavit of Service"],
        owner: "Process Server",
        trigger: "Unknown Location",
        deadline: "strict"
    },
    {
        id: 4,
        name: "Publication",
        rule: "1.070(d)",
        x: 440,
        y: 400,
        stage: "Service",
        volume: 3,
        duration: "60-90d",
        cost: "$200-500",
        documents: ["Motion for Service by Publication", "Affidavit of Diligent Search"],
        owner: "Attorney",
        trigger: "Court Order Required",
        deadline: "strict"
    },
    {
        id: 5,
        name: "Service\nComplete",
        rule: "1.070(i)",
        x: 600,
        y: 300,
        stage: "Service",
        volume: 92,
        duration: "10d",
        cost: "1h",
        documents: ["Proof of Service"],
        owner: "Paralegal",
        trigger: "Valid Service",
        deadline: "strict"
    },
    {
        id: 6,
        name: "Insufficient\nService",
        rule: "1.140(b)",
        x: 600,
        y: 450,
        stage: "ServiceIssue",
        volume: 8,
        duration: "n/a",
        cost: "2-4h",
        documents: ["Motion to Quash"],
        owner: "Opposing Counsel",
        trigger: "Improper Service",
        deadline: "flexible",
        isException: true
    },

    // ============================================
    // RESPONSIVE PLEADINGS (IDs 7-10)
    // ============================================
    {
        id: 7,
        name: "MTD Filed",
        rule: "1.140",
        x: 760,
        y: 450,
        stage: "Responsive",
        volume: 35,
        duration: "20d",
        cost: "15-30h",
        documents: ["Motion to Dismiss", "Memorandum of Law", "Proposed Order"],
        owner: "Opposing Counsel",
        trigger: "Legal Defect",
        deadline: "strict",
        isDecision: true,
        notes: "20 days from service to file; extends answer deadline. Consider interlocutory appeal if denied."
    },
    {
        id: 8,
        name: "Answer\nFiled",
        rule: "1.110",
        x: 760,
        y: 600,
        stage: "Responsive",
        volume: 65,
        duration: "20d",
        cost: "10-20h",
        documents: ["Answer", "Affirmative Defenses", "Counterclaim (if any)"],
        owner: "Opposing Counsel",
        trigger: "No MTD Filed",
        deadline: "strict",
        isExpandable: true,
        expandsGroup: "amendment",
        notes: "Amendment as of right available before answer. Consider third-party practice."
    },
    {
        id: 9,
        name: "MTD\nGranted",
        rule: "1.140",
        x: 920,
        y: 400,
        stage: "Resolution",
        volume: 12,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Defective Complaint",
        deadline: "flexible",
        notes: "Often granted with leave to amend. 30 days to appeal if with prejudice."
    },
    {
        id: 10,
        name: "MTD\nDenied",
        rule: "",
        x: 920,
        y: 500,
        stage: "Responsive",
        volume: 23,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Valid Complaint",
        deadline: "flexible",
        notes: "Consider certiorari for jurisdictional or immunity issues"
    },

    // ============================================
    // CASE MANAGEMENT (ID 11)
    // ============================================
    {
        id: 11,
        name: "Case Mgmt\nConference",
        rule: "1.200",
        x: 1080,
        y: 600,
        stage: "CaseMgmt",
        volume: 88,
        duration: "45-90d",
        cost: "3-5h",
        documents: ["Case Management Order", "Joint Case Management Report"],
        owner: "Court",
        trigger: "Answer Filed",
        deadline: "court-set",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "complexity",
        notes: "Court sets discovery deadlines, trial date, and ADR requirements. Request appropriate complexity track."
    },

    // ============================================
    // ADR OPTIONS (IDs 12, 80-81)
    // ============================================
    {
        id: 12,
        name: "Court-Ordered\nMediation",
        rule: "1.700-1.730",
        x: 1240,
        y: 450,
        stage: "ADR",
        volume: 70,
        duration: "90-180d",
        cost: "8-16h+$1.5K",
        documents: ["Mediation Summary", "Confidential Position Statement"],
        owner: "All Parties",
        trigger: "Court Ordered",
        deadline: "court-set",
        isDecision: true,
        group: "adr",
        notes: "Mediator must be certified; process is confidential under 44.405"
    },
    {
        id: 80,
        name: "Non-Binding\nArbitration",
        rule: "1.820",
        x: 1240,
        y: 550,
        stage: "Arbitration",
        volume: 15,
        duration: "60-120d",
        cost: "10-20h+$2K",
        documents: ["Arbitration Brief", "Exhibit List", "Witness List"],
        owner: "All Parties",
        trigger: "Court Ordered or Stipulated",
        deadline: "court-set",
        isDecision: true,
        group: "adr",
        notes: "Mandatory in some circuits for cases under $50K; non-binding allows trial de novo"
    },
    {
        id: 81,
        name: "Arbitration\nAward",
        rule: "1.820",
        x: 1400,
        y: 550,
        stage: "Arbitration",
        volume: 15,
        duration: "30d",
        cost: "n/a",
        documents: ["Arbitration Award", "Request for Trial De Novo (if rejecting)"],
        owner: "Arbitrator",
        trigger: "Arbitration Complete",
        deadline: "court-set",
        isDecision: true,
        group: "adr",
        notes: "20 days to request trial de novo or award becomes final"
    },
    {
        id: 13,
        name: "Settlement\nReached",
        rule: "1.730",
        x: 1400,
        y: 400,
        stage: "Resolution",
        volume: 28,
        duration: "30d",
        cost: "5-10h",
        documents: ["Settlement Agreement", "Stipulation of Dismissal", "Release"],
        owner: "Attorneys",
        trigger: "Agreement Reached",
        deadline: "flexible"
    },

    // ============================================
    // DISCOVERY PHASE (IDs 14-19, 40-42)
    // ============================================
    {
        id: 14,
        name: "Discovery\nBegins",
        rule: "1.280",
        x: 1400,
        y: 700,
        stage: "Discovery",
        volume: 60,
        duration: "6-12mo",
        cost: "80-200h",
        documents: ["Discovery Plan"],
        owner: "Attorney",
        trigger: "Scheduling Order",
        deadline: "court-set",
        isExpandable: true,
        expandsGroup: "discovery",
        notes: "Standard discovery period is 6-12 months. Issue litigation hold immediately. Consider ESI protocol."
    },
    {
        id: 15,
        name: "Interrogatories",
        rule: "1.340",
        x: 1560,
        y: 620,
        stage: "DiscTools",
        volume: 60,
        duration: "30d response",
        cost: "10-20h",
        documents: ["Interrogatories", "Answers to Interrogatories"],
        owner: "Attorney",
        trigger: "Discovery Request Served",
        deadline: "strict",
        group: "discovery",
        notes: "Limited to 30 interrogatories including subparts without court order"
    },
    {
        id: 16,
        name: "Requests for\nProduction",
        rule: "1.350",
        x: 1560,
        y: 700,
        stage: "DiscTools",
        volume: 60,
        duration: "30d response",
        cost: "15-40h",
        documents: ["Request for Production", "Response to RFP"],
        owner: "Paralegal",
        trigger: "Discovery Request Served",
        deadline: "strict",
        group: "discovery"
    },
    {
        id: 40,
        name: "Requests for\nAdmissions",
        rule: "1.370",
        x: 1560,
        y: 780,
        stage: "DiscTools",
        volume: 50,
        duration: "30d response",
        cost: "5-10h",
        documents: ["Requests for Admission", "Response to RFA"],
        owner: "Attorney",
        trigger: "Discovery Request Served",
        deadline: "strict",
        group: "discovery",
        notes: "Deemed admitted if not timely denied; powerful tool for summary judgment"
    },
    {
        id: 41,
        name: "Depositions",
        rule: "1.310",
        x: 1720,
        y: 620,
        stage: "DiscTools",
        volume: 55,
        duration: "Varies",
        cost: "20-50h+$2K",
        documents: ["Notice of Deposition", "Subpoena Duces Tecum", "Deposition Transcript"],
        owner: "Attorney",
        trigger: "Discovery Plan",
        deadline: "court-set",
        group: "discovery",
        notes: "7-hour limit per deponent; may need court order for extension"
    },
    {
        id: 42,
        name: "Subpoena\nDuces Tecum",
        rule: "1.351",
        x: 1720,
        y: 700,
        stage: "DiscTools",
        volume: 40,
        duration: "30d",
        cost: "3-5h",
        documents: ["Subpoena for Records", "Custodian Affidavit"],
        owner: "Paralegal",
        trigger: "Third-Party Records Needed",
        deadline: "strict",
        group: "discovery",
        notes: "For obtaining records from non-parties"
    },
    {
        id: 17,
        name: "Discovery\nDispute?",
        rule: "",
        x: 1880,
        y: 660,
        stage: "DiscMotions",
        volume: 35,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "n/a",
        trigger: "After 30d Response Period",
        deadline: "flexible",
        isDecision: true
    },
    {
        id: 18,
        name: "Motion to\nCompel",
        rule: "1.380",
        x: 2040,
        y: 620,
        stage: "DiscMotions",
        volume: 25,
        duration: "30d",
        cost: "8-15h",
        documents: ["Motion to Compel", "Certificate of Good Faith Conference"],
        owner: "Attorney",
        trigger: "Failed to Respond",
        deadline: "flexible",
        notes: "Must certify good faith effort to resolve before filing"
    },
    {
        id: 19,
        name: "Expert\nDesignation",
        rule: "1.280(b)(5)",
        x: 1880,
        y: 780,
        stage: "ExpertDisc",
        volume: 50,
        duration: "90d before trial",
        cost: "5-10h+$5K+",
        documents: ["Expert Disclosure", "Expert Report", "CV"],
        owner: "Expert Witness",
        trigger: "Expert Needed",
        deadline: "court-set",
        isExpandable: true,
        expandsGroup: "daubert",
        notes: "Must disclose opinions, basis, qualifications per 1.280(b)(5). Prepare for Daubert challenge."
    },

    // ============================================
    // E-DISCOVERY MODULE (IDs 200-204)
    // ============================================
    {
        id: 200,
        name: "Litigation\nHold",
        rule: "1.280",
        x: 1400,
        y: 850,
        stage: "EDiscovery",
        volume: 60,
        duration: "Immediate",
        cost: "2-5h",
        documents: ["Litigation Hold Notice", "Custodian Acknowledgment"],
        owner: "Attorney",
        trigger: "Complaint Filed/Anticipated",
        deadline: "strict",
        group: "eDiscovery",
        notes: "Must preserve all potentially relevant ESI. Failure risks spoliation sanctions."
    },
    {
        id: 201,
        name: "ESI Protocol\nConference",
        rule: "1.280(d)",
        x: 1560,
        y: 850,
        stage: "EDiscovery",
        volume: 50,
        duration: "Before CMC",
        cost: "3-5h",
        documents: ["ESI Protocol Agreement", "Search Term List"],
        owner: "Attorney",
        trigger: "Discovery Planning",
        deadline: "court-set",
        group: "eDiscovery",
        notes: "Agree on formats, search terms, date ranges, custodians"
    },
    {
        id: 202,
        name: "Proportionality\nAnalysis",
        rule: "1.280(b)(1)",
        x: 1720,
        y: 850,
        stage: "EDiscovery",
        volume: 40,
        duration: "Ongoing",
        cost: "5-10h",
        documents: ["Proportionality Brief"],
        owner: "Attorney",
        trigger: "Scope Dispute",
        deadline: "flexible",
        isDecision: true,
        group: "eDiscovery",
        notes: "Balance burden/cost against likely benefit. Consider TAR/predictive coding."
    },
    {
        id: 203,
        name: "Cost-Shifting\nMotion",
        rule: "1.280(c)",
        x: 1880,
        y: 850,
        stage: "EDiscovery",
        volume: 15,
        duration: "30d",
        cost: "8-15h",
        documents: ["Motion for Cost-Shifting", "Cost Declaration"],
        owner: "Attorney",
        trigger: "Disproportionate Burden",
        deadline: "flexible",
        group: "eDiscovery",
        notes: "Requesting party may be required to bear costs of production"
    },
    {
        id: 204,
        name: "Spoliation\nMotion",
        rule: "1.380(b)",
        x: 2040,
        y: 850,
        stage: "EDiscovery",
        volume: 5,
        duration: "30d",
        cost: "15-30h",
        documents: ["Motion for Sanctions", "Forensic Report"],
        owner: "Attorney",
        trigger: "Evidence Destroyed",
        deadline: "flexible",
        isDecision: true,
        group: "eDiscovery",
        notes: "Sanctions range from adverse inference to default judgment"
    },

    // ============================================
    // DAUBERT/EXPERT CHALLENGES (IDs 140-142)
    // ============================================
    {
        id: 140,
        name: "Daubert\nMotion Filed",
        rule: "90.702",
        x: 2040,
        y: 780,
        stage: "Daubert",
        volume: 30,
        duration: "60d before trial",
        cost: "15-30h",
        documents: ["Motion to Exclude Expert", "Memorandum of Law"],
        owner: "Attorney",
        trigger: "Expert Disclosure Received",
        deadline: "court-set",
        group: "daubert",
        notes: "Florida adopted Daubert in 2019. Challenge methodology, not conclusions."
    },
    {
        id: 141,
        name: "Daubert\nHearing",
        rule: "90.702",
        x: 2200,
        y: 780,
        stage: "Daubert",
        volume: 25,
        duration: "30-45d before trial",
        cost: "20-40h",
        documents: ["Expert Testimony", "Scientific Literature"],
        owner: "Court",
        trigger: "Motion Filed",
        deadline: "court-set",
        isDecision: true,
        group: "daubert",
        notes: "Gatekeeper function: reliable methodology + proper application"
    },
    {
        id: 142,
        name: "Expert\nExcluded/Admitted",
        rule: "90.702",
        x: 2360,
        y: 780,
        stage: "Daubert",
        volume: 25,
        duration: "Immediate",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Hearing Complete",
        deadline: "flexible",
        group: "daubert",
        notes: "If excluded, consider interlocutory appeal or summary judgment implications"
    },

    // ============================================
    // SUMMARY JUDGMENT & SETTLEMENT (IDs 20-23)
    // ============================================
    {
        id: 20,
        name: "Summary\nJudgment",
        rule: "1.510",
        x: 2200,
        y: 700,
        stage: "PreTrial",
        volume: 32,
        duration: "Post-Discovery",
        cost: "40-80h",
        documents: ["Motion for Summary Judgment", "Statement of Undisputed Facts", "Supporting Affidavits"],
        owner: "Attorney",
        trigger: "No Material Facts",
        deadline: "court-set",
        isDecision: true,
        notes: "Must be served at least 40 days before hearing per 1.510(c). Use RFAs strategically."
    },
    {
        id: 21,
        name: "MSJ\nGranted",
        rule: "",
        x: 2360,
        y: 650,
        stage: "Resolution",
        volume: 16,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Final Summary Judgment"],
        owner: "Court",
        trigger: "No Genuine Issues",
        deadline: "flexible"
    },
    {
        id: 22,
        name: "MSJ\nDenied",
        rule: "",
        x: 2360,
        y: 750,
        stage: "PreTrial",
        volume: 16,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Material Issues Exist",
        deadline: "flexible"
    },
    {
        id: 23,
        name: "Proposal for\nSettlement",
        rule: "768.79/1.442",
        x: 2200,
        y: 550,
        stage: "Settlement",
        volume: 25,
        duration: "30d to accept",
        cost: "3-5h",
        documents: ["Proposal for Settlement"],
        owner: "Attorney",
        trigger: "Strategic Timing",
        deadline: "strict",
        isDecision: true,
        isParallel: true,
        notes: "Available 30+ days after service; must be 45+ days before trial. Fee-shifting if judgment worse than rejected offer by 25%."
    },

    // ============================================
    // PRETRIAL PHASE (IDs 24, 50-53)
    // ============================================
    {
        id: 24,
        name: "Pretrial\nConference",
        rule: "1.200",
        x: 2520,
        y: 700,
        stage: "PreTrial",
        volume: 15,
        duration: "30d before trial",
        cost: "10-20h",
        documents: ["Pretrial Statement", "Witness List", "Exhibit List", "Proposed Jury Instructions"],
        owner: "Attorney",
        trigger: "Trial Approaching",
        deadline: "court-set",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "trialPrep",
        notes: "Final opportunity to narrow issues, stipulate to facts, resolve evidentiary disputes"
    },
    {
        id: 50,
        name: "Motions\nin Limine",
        rule: "90.104",
        x: 2520,
        y: 550,
        stage: "TrialPrep",
        volume: 14,
        duration: "14-30d before trial",
        cost: "10-25h",
        documents: ["Motion in Limine", "Memorandum of Law", "Response"],
        owner: "Attorney",
        trigger: "Evidentiary Issues",
        deadline: "court-set",
        group: "trialPrep",
        notes: "Used to exclude prejudicial evidence; ruling preserves objection for appeal"
    },
    {
        id: 51,
        name: "Trial\nSubpoenas",
        rule: "1.410",
        x: 2680,
        y: 550,
        stage: "TrialPrep",
        volume: 14,
        duration: "10d before trial",
        cost: "3-5h",
        documents: ["Subpoena for Trial", "Subpoena Duces Tecum"],
        owner: "Paralegal",
        trigger: "Witness/Document Needed",
        deadline: "strict",
        group: "trialPrep",
        notes: "Must be served reasonable time before trial; include witness fees"
    },
    {
        id: 52,
        name: "Jury\nInstructions",
        rule: "1.470",
        x: 2520,
        y: 850,
        stage: "TrialPrep",
        volume: 6,
        duration: "10-14d before trial",
        cost: "8-15h",
        documents: ["Proposed Jury Instructions", "Verdict Form"],
        owner: "Attorney",
        trigger: "Jury Trial",
        deadline: "court-set",
        group: "trialPrep",
        notes: "Use Florida Standard Jury Instructions where available; request special instructions with legal authority"
    },
    {
        id: 53,
        name: "Final\nWitness/Exhibit List",
        rule: "1.200",
        x: 2680,
        y: 850,
        stage: "TrialPrep",
        volume: 15,
        duration: "5-10d before trial",
        cost: "5-10h",
        documents: ["Final Witness List", "Final Exhibit List", "Exhibit Binder"],
        owner: "Paralegal",
        trigger: "Pretrial Order",
        deadline: "court-set",
        group: "trialPrep"
    },
    {
        id: 25,
        name: "Final\nSettlement",
        rule: "",
        x: 2680,
        y: 650,
        stage: "Resolution",
        volume: 9,
        duration: "Immediate",
        cost: "5-10h",
        documents: ["Settlement Agreement", "Stipulation of Dismissal"],
        owner: "All Parties",
        trigger: "Agreement Reached",
        deadline: "flexible",
        notes: "Many cases settle on courthouse steps"
    },

    // ============================================
    // TRIAL PHASE (IDs 26, 60-66)
    // ============================================
    {
        id: 26,
        name: "Trial\nBegins",
        rule: "1.430",
        x: 2840,
        y: 700,
        stage: "Trial",
        volume: 6,
        duration: "3-15 days",
        cost: "200-400h",
        documents: ["Trial Exhibits", "Trial Brief"],
        owner: "Attorney",
        trigger: "No Settlement",
        deadline: "court-set",
        isExpandable: true,
        expandsGroup: "trial"
    },
    {
        id: 60,
        name: "Voir Dire\n(Jury Selection)",
        rule: "1.431",
        x: 2840,
        y: 550,
        stage: "TrialPhase",
        volume: 5,
        duration: "0.5-2 days",
        cost: "20-40h",
        documents: ["Jury Questionnaire", "Peremptory Challenge List"],
        owner: "Attorney",
        trigger: "Jury Trial",
        deadline: "court-set",
        group: "trial",
        notes: "3 peremptory challenges each side; unlimited for-cause challenges. Melbourne hearing for cause challenges."
    },
    {
        id: 61,
        name: "Opening\nStatements",
        rule: "1.430",
        x: 3000,
        y: 550,
        stage: "TrialPhase",
        volume: 5,
        duration: "1-4 hours",
        cost: "10-20h prep",
        documents: ["Opening Statement Outline"],
        owner: "Attorney",
        trigger: "After Jury Sworn",
        deadline: "court-set",
        group: "trial",
        notes: "Plaintiff goes first; defendant may reserve until case-in-chief"
    },
    {
        id: 62,
        name: "Plaintiff's\nCase-in-Chief",
        rule: "90.612",
        x: 3000,
        y: 650,
        stage: "TrialPhase",
        volume: 5,
        duration: "1-5 days",
        cost: "40-100h",
        documents: ["Direct Exam Outlines", "Exhibits"],
        owner: "Plaintiff Attorney",
        trigger: "After Openings",
        deadline: "court-set",
        group: "trial"
    },
    {
        id: 63,
        name: "Motion for\nDirected Verdict",
        rule: "1.480",
        x: 3160,
        y: 550,
        stage: "TrialPhase",
        volume: 5,
        duration: "30 min",
        cost: "2-5h",
        documents: ["Oral Motion", "Written Motion (if requested)"],
        owner: "Defendant Attorney",
        trigger: "End of Plaintiff's Case",
        deadline: "strict",
        isDecision: true,
        group: "trial",
        notes: "Must be made at close of plaintiff's evidence to preserve for appeal and JNOV"
    },
    {
        id: 64,
        name: "Defendant's\nCase-in-Chief",
        rule: "90.612",
        x: 3160,
        y: 650,
        stage: "TrialPhase",
        volume: 4,
        duration: "1-5 days",
        cost: "40-100h",
        documents: ["Direct Exam Outlines", "Exhibits"],
        owner: "Defendant Attorney",
        trigger: "Directed Verdict Denied",
        deadline: "court-set",
        group: "trial"
    },
    {
        id: 65,
        name: "Closing\nArguments",
        rule: "1.430",
        x: 3160,
        y: 750,
        stage: "TrialPhase",
        volume: 4,
        duration: "2-4 hours",
        cost: "15-30h prep",
        documents: ["Closing Argument Outline"],
        owner: "Attorney",
        trigger: "Evidence Closed",
        deadline: "court-set",
        group: "trial",
        notes: "Plaintiff opens, defendant responds, plaintiff rebuts"
    },
    {
        id: 66,
        name: "Jury\nInstructions Read",
        rule: "1.470(b)",
        x: 3160,
        y: 850,
        stage: "TrialPhase",
        volume: 4,
        duration: "1-2 hours",
        cost: "n/a",
        documents: ["Final Jury Instructions"],
        owner: "Court",
        trigger: "After Closings",
        deadline: "court-set",
        group: "trial",
        notes: "Object to instructions before jury retires to preserve error"
    },
    {
        id: 27,
        name: "Verdict",
        rule: "1.480",
        x: 3320,
        y: 700,
        stage: "Trial",
        volume: 6,
        duration: "Hours-Days",
        cost: "n/a",
        documents: ["Jury Verdict Form", "Polling Results"],
        owner: "Jury/Judge",
        trigger: "Jury Deliberation",
        deadline: "court-set",
        notes: "May poll jury; verdict must be unanimous in civil cases"
    },

    // ============================================
    // POST-TRIAL PHASE (IDs 28-30, 70-72)
    // ============================================
    {
        id: 28,
        name: "Post-Trial\nMotions?",
        rule: "1.530",
        x: 3480,
        y: 700,
        stage: "PostTrial",
        volume: 2.5,
        duration: "10d",
        cost: "20-40h",
        documents: ["Motion"],
        owner: "Attorney",
        trigger: "Legal Error?",
        deadline: "strict",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "postTrial",
        notes: "Critical: 10 days to file most post-trial motions from verdict/judgment"
    },
    {
        id: 29,
        name: "Motion for\nNew Trial",
        rule: "1.530",
        x: 3480,
        y: 580,
        stage: "PostTrial",
        volume: 1.5,
        duration: "30d",
        cost: "25-50h",
        documents: ["Motion for New Trial", "Memorandum"],
        owner: "Attorney",
        trigger: "Error Identified",
        deadline: "strict",
        group: "postTrial",
        notes: "10 days from verdict; tolls appeal deadline"
    },
    {
        id: 70,
        name: "JNOV Motion",
        rule: "1.480(b)",
        x: 3640,
        y: 580,
        stage: "PostTrial",
        volume: 1,
        duration: "30d",
        cost: "20-40h",
        documents: ["Motion for Judgment Notwithstanding Verdict"],
        owner: "Attorney",
        trigger: "No Competent Evidence",
        deadline: "strict",
        group: "postTrial",
        notes: "Must have moved for directed verdict to preserve; 10 days from verdict"
    },
    {
        id: 71,
        name: "Remittitur/\nAdditur",
        rule: "1.535",
        x: 3640,
        y: 660,
        stage: "PostTrial",
        volume: 0.5,
        duration: "30d",
        cost: "10-20h",
        documents: ["Motion for Remittitur/Additur"],
        owner: "Attorney",
        trigger: "Excessive/Inadequate Damages",
        deadline: "strict",
        group: "postTrial",
        notes: "Alternative to new trial on damages only"
    },
    {
        id: 72,
        name: "Motion to\nTax Costs",
        rule: "1.525",
        x: 3640,
        y: 740,
        stage: "PostTrial",
        volume: 5,
        duration: "30d after judgment",
        cost: "3-8h",
        documents: ["Motion to Tax Costs", "Bill of Costs", "Supporting Invoices"],
        owner: "Attorney",
        trigger: "Prevailing Party",
        deadline: "strict",
        group: "postTrial",
        notes: "30 days from judgment to file; include taxable costs per 57.041"
    },
    {
        id: 30,
        name: "Final\nJudgment",
        rule: "1.080(a)",
        x: 3800,
        y: 700,
        stage: "PostTrial",
        volume: 6,
        duration: "10d",
        cost: "3-5h",
        documents: ["Final Judgment"],
        owner: "Court",
        trigger: "Case Finalized",
        deadline: "strict",
        isExpandable: true,
        expandsGroup: "fees"
    },

    // ============================================
    // ATTORNEY'S FEES & COSTS TRACK (IDs 150-154)
    // ============================================
    {
        id: 150,
        name: "Fee Entitlement\nMotion",
        rule: "57.105/768.79",
        x: 3800,
        y: 550,
        stage: "Fees",
        volume: 20,
        duration: "30d from judgment",
        cost: "5-10h",
        documents: ["Motion for Attorney's Fees", "Legal Basis"],
        owner: "Attorney",
        trigger: "Prevailing Party/Contract/Statute",
        deadline: "strict",
        group: "fees",
        notes: "Establish entitlement first (contract, statute, proposal for settlement)"
    },
    {
        id: 151,
        name: "Fee Amount\nProceeding",
        rule: "1.525",
        x: 3960,
        y: 550,
        stage: "Fees",
        volume: 18,
        duration: "60-90d",
        cost: "10-20h",
        documents: ["Fee Affidavit", "Billing Records", "Expert Fee Testimony"],
        owner: "Attorney",
        trigger: "Entitlement Established",
        deadline: "court-set",
        group: "fees",
        notes: "Rowe factors: time, skill, complexity, results. Expert testimony may be required."
    },
    {
        id: 152,
        name: "57.105\nSanctions",
        rule: "57.105",
        x: 3960,
        y: 630,
        stage: "Fees",
        volume: 5,
        duration: "21d safe harbor",
        cost: "5-15h",
        documents: ["Motion for Sanctions", "21-Day Safe Harbor Letter"],
        owner: "Attorney",
        trigger: "Frivolous Claim/Defense",
        deadline: "strict",
        group: "fees",
        notes: "Must serve 21-day safe harbor before filing. Fees against party AND attorney."
    },
    {
        id: 153,
        name: "768.79\nFee Consequences",
        rule: "768.79",
        x: 3960,
        y: 470,
        stage: "Fees",
        volume: 10,
        duration: "Post-Judgment",
        cost: "5-10h",
        documents: ["Motion for Fees", "Proposal for Settlement", "Judgment Comparison"],
        owner: "Attorney",
        trigger: "Rejected Proposal",
        deadline: "strict",
        group: "fees",
        notes: "If judgment 25%+ worse than rejected offer: fees from date of offer"
    },
    {
        id: 154,
        name: "Fee Award\nEntered",
        rule: "1.525",
        x: 4120,
        y: 550,
        stage: "Fees",
        volume: 15,
        duration: "Varies",
        cost: "n/a",
        documents: ["Fee Judgment"],
        owner: "Court",
        trigger: "Hearing Complete",
        deadline: "flexible",
        group: "fees"
    },

    // ============================================
    // ENFORCEMENT (IDs 31-32)
    // ============================================
    {
        id: 31,
        name: "Enforcement?",
        rule: "1.550",
        x: 3960,
        y: 700,
        stage: "Enforce",
        volume: 4,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "Client",
        trigger: "Non-Payment",
        deadline: "flexible",
        isDecision: true,
        notes: "20-year judgment lien; must record in each county"
    },
    {
        id: 32,
        name: "Execution",
        rule: "Ch. 56",
        x: 4120,
        y: 700,
        stage: "Enforce",
        volume: 3,
        duration: "Ongoing",
        cost: "10-30h",
        documents: ["Writ of Execution", "Writ of Garnishment", "Debtor's Examination"],
        owner: "Sheriff",
        trigger: "Assets Identified",
        deadline: "flexible",
        notes: "Homestead and head-of-family exemptions apply"
    },

    // ============================================
    // APPEAL (IDs 33-34)
    // ============================================
    {
        id: 33,
        name: "Appeal?",
        rule: "9.110",
        x: 3960,
        y: 850,
        stage: "Appeal",
        volume: 2,
        duration: "30d",
        cost: "n/a",
        documents: [],
        owner: "Client",
        trigger: "Reversible Error?",
        deadline: "strict",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "stay",
        notes: "30 days from rendition of final order. Consider stay pending appeal."
    },
    {
        id: 34,
        name: "Notice of\nAppeal",
        rule: "9.110(b)",
        x: 4120,
        y: 850,
        stage: "Appeal",
        volume: 2,
        duration: "30d",
        cost: "50-150h",
        documents: ["Notice of Appeal", "Directions to Clerk", "Designation to Court Reporter"],
        owner: "Attorney",
        trigger: "File Appeal",
        deadline: "strict",
        notes: "Jurisdictional deadline; cross-appeal within 10 days"
    },

    // ============================================
    // STAY PENDING APPEAL (IDs 160-163)
    // ============================================
    {
        id: 160,
        name: "Motion for\nStay",
        rule: "9.310",
        x: 3960,
        y: 950,
        stage: "Stay",
        volume: 1.5,
        duration: "With Notice of Appeal",
        cost: "5-10h",
        documents: ["Motion to Stay Pending Appeal"],
        owner: "Attorney",
        trigger: "Appeal Filed",
        deadline: "strict",
        group: "stay",
        notes: "Automatic stay of money judgment upon posting supersedeas bond"
    },
    {
        id: 161,
        name: "Supersedeas\nBond",
        rule: "45.045",
        x: 4120,
        y: 950,
        stage: "Stay",
        volume: 1.5,
        duration: "Immediate",
        cost: "Bond Premium",
        documents: ["Supersedeas Bond", "Surety Application"],
        owner: "Attorney",
        trigger: "Stay Sought",
        deadline: "strict",
        isDecision: true,
        group: "stay",
        notes: "Generally judgment amount + 2 years interest + costs. May seek reduction."
    },
    {
        id: 162,
        name: "Bond\nReduction Motion",
        rule: "45.045",
        x: 4280,
        y: 900,
        stage: "Stay",
        volume: 0.5,
        duration: "30d",
        cost: "5-10h",
        documents: ["Motion to Reduce Bond", "Financial Affidavit"],
        owner: "Attorney",
        trigger: "Excessive Bond",
        deadline: "flexible",
        group: "stay",
        notes: "Show bond would cause irreparable harm; offer alternative security"
    },
    {
        id: 163,
        name: "Stay\nGranted/Denied",
        rule: "9.310",
        x: 4280,
        y: 1000,
        stage: "Stay",
        volume: 1.5,
        duration: "Varies",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Bond Posted/Motion Decided",
        deadline: "flexible",
        group: "stay"
    },

    // ============================================
    // EMERGENCY/INJUNCTIVE RELIEF (IDs 110-115)
    // ============================================
    {
        id: 110,
        name: "Emergency\nRelief Needed?",
        rule: "1.610",
        x: 100,
        y: 200,
        stage: "Emergency",
        volume: 15,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "Client",
        trigger: "Irreparable Harm",
        deadline: "flexible",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "emergency",
        notes: "Available at any time. Must show irreparable harm and likelihood of success."
    },
    {
        id: 111,
        name: "TRO\nApplication",
        rule: "1.610(a)",
        x: 260,
        y: 100,
        stage: "Emergency",
        volume: 10,
        duration: "Same Day",
        cost: "10-20h",
        documents: ["Motion for TRO", "Verified Complaint", "Affidavits", "Proposed Order"],
        owner: "Attorney",
        trigger: "Immediate Harm",
        deadline: "strict",
        group: "emergency",
        notes: "Ex parte allowed only if immediate irreparable harm shown. Bond usually required."
    },
    {
        id: 112,
        name: "TRO\nHearing",
        rule: "1.610(a)",
        x: 420,
        y: 50,
        stage: "Injunction",
        volume: 10,
        duration: "Same Day",
        cost: "5-10h",
        documents: ["Evidence of Harm"],
        owner: "Court",
        trigger: "TRO Filed",
        deadline: "strict",
        isDecision: true,
        group: "emergency",
        notes: "Ex parte TRO: 15 days max. Must set preliminary injunction hearing."
    },
    {
        id: 113,
        name: "TRO\nGranted",
        rule: "1.610",
        x: 580,
        y: 50,
        stage: "Injunction",
        volume: 7,
        duration: "15 days max",
        cost: "Bond Required",
        documents: ["TRO Order", "Bond"],
        owner: "Court",
        trigger: "Irreparable Harm Shown",
        deadline: "strict",
        group: "emergency",
        notes: "Bond protects defendant if TRO wrongfully issued. Must expedite PI hearing."
    },
    {
        id: 114,
        name: "Preliminary\nInjunction Hearing",
        rule: "1.610(c)",
        x: 740,
        y: 100,
        stage: "Injunction",
        volume: 10,
        duration: "Within 15d of TRO",
        cost: "20-40h",
        documents: ["Evidence", "Witness Testimony", "Brief"],
        owner: "Attorney",
        trigger: "TRO Expires",
        deadline: "court-set",
        isDecision: true,
        group: "emergency",
        notes: "Four-part test: likelihood of success, irreparable harm, balance of harms, public interest"
    },
    {
        id: 115,
        name: "Preliminary\nInjunction Ruling",
        rule: "1.610",
        x: 900,
        y: 100,
        stage: "Injunction",
        volume: 10,
        duration: "Immediate",
        cost: "n/a",
        documents: ["PI Order", "Modified Bond"],
        owner: "Court",
        trigger: "Hearing Complete",
        deadline: "flexible",
        isDecision: true,
        group: "emergency",
        notes: "If granted, remains in effect through trial. Interlocutory appeal available under 9.130."
    },

    // ============================================
    // INTERLOCUTORY APPEALS (IDs 120-124)
    // ============================================
    {
        id: 120,
        name: "Interlocutory\nReview?",
        rule: "9.130",
        x: 1080,
        y: 250,
        stage: "Interlocutory",
        volume: 5,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "Attorney",
        trigger: "Non-Final Order",
        deadline: "flexible",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "interlocutory",
        notes: "Limited categories: injunctions, class cert, arbitration, jurisdiction, immunity"
    },
    {
        id: 121,
        name: "Petition for\nCertiorari",
        rule: "9.100",
        x: 1240,
        y: 200,
        stage: "Interlocutory",
        volume: 3,
        duration: "30d from order",
        cost: "20-40h",
        documents: ["Petition for Writ of Certiorari", "Appendix"],
        owner: "Attorney",
        trigger: "Discovery Order/Other",
        deadline: "strict",
        group: "interlocutory",
        notes: "For orders not appealable under 9.130. Must show departure from essential requirements of law."
    },
    {
        id: 122,
        name: "Interlocutory\nAppeal",
        rule: "9.130",
        x: 1240,
        y: 300,
        stage: "Interlocutory",
        volume: 2,
        duration: "30d from order",
        cost: "25-50h",
        documents: ["Notice of Appeal", "Brief"],
        owner: "Attorney",
        trigger: "Enumerated Order",
        deadline: "strict",
        group: "interlocutory",
        notes: "Injunctions, venue, class certification, arbitration compelled/denied"
    },
    {
        id: 123,
        name: "Writ of\nMandamus/Prohibition",
        rule: "9.030",
        x: 1400,
        y: 200,
        stage: "Interlocutory",
        volume: 1,
        duration: "Varies",
        cost: "15-30h",
        documents: ["Petition for Writ"],
        owner: "Attorney",
        trigger: "Judge Exceeded Authority",
        deadline: "flexible",
        group: "interlocutory",
        notes: "Mandamus: compel act. Prohibition: prevent act. Rarely granted."
    },
    {
        id: 124,
        name: "Interlocutory\nRuling",
        rule: "9.130/9.100",
        x: 1400,
        y: 300,
        stage: "Interlocutory",
        volume: 3,
        duration: "60-120d",
        cost: "n/a",
        documents: ["Appellate Opinion"],
        owner: "DCA",
        trigger: "Briefing Complete",
        deadline: "flexible",
        isDecision: true,
        group: "interlocutory",
        notes: "Case proceeds in trial court unless stay obtained"
    },

    // ============================================
    // THIRD-PARTY PRACTICE (IDs 130-134)
    // ============================================
    {
        id: 130,
        name: "Third-Party\nPractice?",
        rule: "1.180",
        x: 920,
        y: 700,
        stage: "ThirdParty",
        volume: 15,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "Attorney",
        trigger: "Indemnity/Contribution",
        deadline: "flexible",
        isDecision: true,
        isExpandable: true,
        expandsGroup: "thirdParty",
        notes: "Consider impleader for indemnification, contribution, or liability shift"
    },
    {
        id: 131,
        name: "Third-Party\nComplaint",
        rule: "1.180",
        x: 920,
        y: 850,
        stage: "ThirdParty",
        volume: 10,
        duration: "Before Answer/With Leave",
        cost: "15-25h",
        documents: ["Third-Party Complaint", "Summons"],
        owner: "Defendant Attorney",
        trigger: "Indemnity Claim",
        deadline: "court-set",
        group: "thirdParty",
        notes: "As of right before answering; leave required after. Must serve third-party defendant."
    },
    {
        id: 132,
        name: "Cross-Claim",
        rule: "1.170(g)",
        x: 1080,
        y: 850,
        stage: "ThirdParty",
        volume: 8,
        duration: "With Answer",
        cost: "10-20h",
        documents: ["Cross-Claim"],
        owner: "Co-Defendant Attorney",
        trigger: "Claims Against Co-Party",
        deadline: "strict",
        group: "thirdParty",
        notes: "Claims between co-defendants. Must arise from same transaction/occurrence."
    },
    {
        id: 133,
        name: "Interpleader",
        rule: "1.240",
        x: 1080,
        y: 950,
        stage: "ThirdParty",
        volume: 3,
        duration: "Varies",
        cost: "10-15h",
        documents: ["Interpleader Complaint", "Deposit of Funds"],
        owner: "Stakeholder Attorney",
        trigger: "Competing Claims",
        deadline: "flexible",
        group: "thirdParty",
        notes: "Stakeholder deposits funds with court; claimants litigate entitlement"
    },
    {
        id: 134,
        name: "Third-Party\nResolution",
        rule: "1.180",
        x: 1240,
        y: 850,
        stage: "ThirdParty",
        volume: 10,
        duration: "With Main Case",
        cost: "Varies",
        documents: ["Judgment"],
        owner: "Court",
        trigger: "Trial/Settlement",
        deadline: "flexible",
        group: "thirdParty"
    },

    // ============================================
    // AMENDED PLEADINGS (IDs 170-173)
    // ============================================
    {
        id: 170,
        name: "Amendment\nas of Right",
        rule: "1.190(a)",
        x: 760,
        y: 750,
        stage: "Amendment",
        volume: 30,
        duration: "Before responsive pleading",
        cost: "5-15h",
        documents: ["Amended Complaint/Answer"],
        owner: "Attorney",
        trigger: "Pleading Deficiency",
        deadline: "flexible",
        group: "amendment",
        notes: "One amendment as of right before responsive pleading served"
    },
    {
        id: 171,
        name: "Leave to\nAmend",
        rule: "1.190(a)",
        x: 920,
        y: 750,
        stage: "Amendment",
        volume: 25,
        duration: "Motion Required",
        cost: "5-10h",
        documents: ["Motion for Leave to Amend", "Proposed Amended Pleading"],
        owner: "Attorney",
        trigger: "After Answer/Prior Amendment",
        deadline: "court-set",
        isDecision: true,
        group: "amendment",
        notes: "Liberally granted unless prejudice, bad faith, or futility"
    },
    {
        id: 172,
        name: "Relation Back",
        rule: "1.190(c)",
        x: 920,
        y: 850,
        stage: "Amendment",
        volume: 10,
        duration: "n/a",
        cost: "n/a",
        documents: [],
        owner: "Attorney",
        trigger: "SOL Issue",
        deadline: "flexible",
        group: "amendment",
        notes: "Amendment relates back if same conduct/transaction/occurrence. Critical for SOL."
    },
    {
        id: 173,
        name: "Amendment\nGranted/Denied",
        rule: "1.190",
        x: 1080,
        y: 750,
        stage: "Amendment",
        volume: 25,
        duration: "30d",
        cost: "n/a",
        documents: ["Court Order", "Amended Pleading Filed"],
        owner: "Court",
        trigger: "Motion Decided",
        deadline: "flexible",
        group: "amendment"
    },

    // ============================================
    // VOLUNTARY DISMISSAL (IDs 180-182)
    // ============================================
    {
        id: 180,
        name: "Voluntary\nDismissal (1x)",
        rule: "1.420(a)(1)",
        x: 100,
        y: 450,
        stage: "Dismissal",
        volume: 10,
        duration: "Before Answer",
        cost: "1-2h",
        documents: ["Notice of Voluntary Dismissal"],
        owner: "Plaintiff Attorney",
        trigger: "Strategic Decision",
        deadline: "strict",
        group: "dismissal",
        notes: "One free dismissal without prejudice before answer or MSJ. Second dismissal = with prejudice."
    },
    {
        id: 181,
        name: "Stipulated\nDismissal",
        rule: "1.420(a)(1)(B)",
        x: 260,
        y: 450,
        stage: "Dismissal",
        volume: 15,
        duration: "Any Time",
        cost: "1-2h",
        documents: ["Stipulation of Dismissal"],
        owner: "All Parties",
        trigger: "Agreement",
        deadline: "flexible",
        group: "dismissal",
        notes: "All parties stipulate; usually without prejudice unless specified"
    },
    {
        id: 182,
        name: "Court-Ordered\nDismissal",
        rule: "1.420(a)(2)",
        x: 260,
        y: 550,
        stage: "Dismissal",
        volume: 5,
        duration: "Motion Required",
        cost: "3-5h",
        documents: ["Motion for Voluntary Dismissal", "Order"],
        owner: "Plaintiff Attorney",
        trigger: "After Answer",
        deadline: "court-set",
        isDecision: true,
        group: "dismissal",
        notes: "Court may impose terms and conditions. Consider counterclaims."
    },

    // ============================================
    // CASE COMPLEXITY TRACKS (IDs 190-192)
    // ============================================
    {
        id: 190,
        name: "Expedited\nTrack",
        rule: "1.200",
        x: 1080,
        y: 450,
        stage: "ComplexLit",
        volume: 20,
        duration: "6-9 months",
        cost: "Lower",
        documents: ["Track Designation"],
        owner: "Court",
        trigger: "Simple Case/<$50K",
        deadline: "court-set",
        group: "complexity",
        notes: "Limited discovery, shorter deadlines, early trial date"
    },
    {
        id: 191,
        name: "Standard\nTrack",
        rule: "1.200",
        x: 1240,
        y: 380,
        stage: "ComplexLit",
        volume: 50,
        duration: "12-18 months",
        cost: "Moderate",
        documents: ["Case Management Order"],
        owner: "Court",
        trigger: "Typical Civil Case",
        deadline: "court-set",
        group: "complexity",
        notes: "Standard discovery periods and trial scheduling"
    },
    {
        id: 192,
        name: "Complex\nBusiness Track",
        rule: "Admin Order",
        x: 1240,
        y: 450,
        stage: "ComplexLit",
        volume: 10,
        duration: "18-36 months",
        cost: "Higher",
        documents: ["Complex Litigation Designation"],
        owner: "Court",
        trigger: "Complex Commercial/High $",
        deadline: "court-set",
        isDecision: true,
        group: "complexity",
        notes: "Available in Miami-Dade, Hillsborough, others. Experienced judge, special procedures."
    },

    // ============================================
    // EXCEPTION PATHS (IDs 100-102)
    // ============================================
    {
        id: 100,
        name: "DEFAULT",
        rule: "1.500",
        x: 920,
        y: 600,
        stage: "Resolution",
        volume: 5,
        duration: "20d",
        cost: "5-10h",
        documents: ["Motion for Default", "Affidavit of Non-Military Service"],
        owner: "Attorney",
        trigger: "No Answer Filed",
        deadline: "strict",
        isException: true,
        notes: "Must wait until answer deadline passes; prove-up hearing required for damages"
    },
    {
        id: 101,
        name: "DISMISSAL\n(Lack of Pros.)",
        rule: "1.420(e)",
        x: 1720,
        y: 860,
        stage: "Resolution",
        volume: 2,
        duration: "60d",
        cost: "n/a",
        documents: ["Order of Dismissal"],
        owner: "Court",
        trigger: "Lack of Prosecution",
        deadline: "court-set",
        isException: true,
        notes: "No record activity for 10 months triggers notice; 60 days to show good cause"
    },
    {
        id: 102,
        name: "SANCTIONS",
        rule: "1.380(b)",
        x: 2040,
        y: 700,
        stage: "DiscMotions",
        volume: 3,
        duration: "After Order",
        cost: "Attorney Fees",
        documents: ["Sanctions Order"],
        owner: "Court",
        trigger: "Willful Violation",
        deadline: "flexible",
        isException: true,
        notes: "Can include striking pleadings, adverse inference, or contempt"
    }
];

export const LINKS = [
    // Filing to Service
    { source: 0, target: 1, volume: 100, label: "Service Required", trigger: "Automatic" },
    { source: 1, target: 2, volume: 60, label: "Personal Service", trigger: "Known Address" },
    { source: 1, target: 3, volume: 25, label: "Substituted", trigger: "Unknown" },
    { source: 1, target: 4, volume: 3, label: "Publication", trigger: "Court Order" },
    { source: 2, target: 5, volume: 58, label: "Completed", trigger: "Valid" },
    { source: 3, target: 5, volume: 23, label: "Completed", trigger: "Valid" },
    { source: 4, target: 5, volume: 3, label: "Completed", trigger: "Valid" },
    { source: 2, target: 6, volume: 2, label: "Insufficient", trigger: "Bad Service", isException: true },

    // Emergency Relief Track
    { source: 0, target: 110, volume: 15, label: "Emergency Relief?", trigger: "Irreparable Harm" },
    { source: 110, target: 111, volume: 10, label: "TRO Application", trigger: "Immediate Harm" },
    { source: 111, target: 112, volume: 10, label: "TRO Hearing", trigger: "Filed" },
    { source: 112, target: 113, volume: 7, label: "TRO Granted", trigger: "Harm Shown" },
    { source: 112, target: 114, volume: 3, label: "Denied - PI Hearing", trigger: "Need Full Hearing" },
    { source: 113, target: 114, volume: 7, label: "PI Hearing", trigger: "TRO Expiring" },
    { source: 114, target: 115, volume: 10, label: "PI Ruling", trigger: "Hearing Complete" },
    { source: 115, target: 120, volume: 3, label: "Interlocutory Appeal", trigger: "PI Denied/Granted" },

    // Voluntary Dismissal
    { source: 0, target: 180, volume: 10, label: "Vol. Dismissal", trigger: "Before Answer" },
    { source: 180, target: 181, volume: 5, label: "Stipulated", trigger: "Agreement" },
    { source: 8, target: 182, volume: 5, label: "Court-Ordered Dismissal", trigger: "After Answer" },

    // Responsive Pleadings
    { source: 5, target: 7, volume: 35, label: "MTD Filed", trigger: "Defect" },
    { source: 5, target: 8, volume: 57, label: "Answer", trigger: "20 Days" },
    { source: 7, target: 9, volume: 12, label: "Granted", trigger: "Defective" },
    { source: 7, target: 10, volume: 23, label: "Denied", trigger: "Valid" },
    { source: 5, target: 100, volume: 5, label: "Default", trigger: "No Answer", isException: true },

    // Interlocutory Review
    { source: 10, target: 120, volume: 3, label: "Interlocutory Review?", trigger: "Order Entered" },
    { source: 120, target: 121, volume: 3, label: "Certiorari", trigger: "Discovery/Other" },
    { source: 120, target: 122, volume: 2, label: "Interlocutory Appeal", trigger: "Enumerated Order" },
    { source: 121, target: 123, volume: 1, label: "Writ", trigger: "Extraordinary" },
    { source: 121, target: 124, volume: 2, label: "Ruling", trigger: "Briefing Complete" },
    { source: 122, target: 124, volume: 2, label: "Ruling", trigger: "Briefing Complete" },

    // Third-Party Practice
    { source: 8, target: 130, volume: 15, label: "Third-Party Practice?", trigger: "Indemnity" },
    { source: 130, target: 131, volume: 10, label: "Third-Party Complaint", trigger: "Indemnity Claim" },
    { source: 130, target: 132, volume: 8, label: "Cross-Claim", trigger: "Co-Party Claim" },
    { source: 130, target: 133, volume: 3, label: "Interpleader", trigger: "Competing Claims" },
    { source: 131, target: 134, volume: 10, label: "Resolution", trigger: "Trial/Settlement" },
    { source: 132, target: 134, volume: 8, label: "Resolution", trigger: "Trial/Settlement" },
    { source: 133, target: 134, volume: 3, label: "Resolution", trigger: "Trial/Settlement" },

    // Amended Pleadings
    { source: 8, target: 170, volume: 30, label: "Amendment as of Right", trigger: "Before Answer" },
    { source: 8, target: 171, volume: 25, label: "Leave to Amend", trigger: "After Answer" },
    { source: 170, target: 11, volume: 30, label: "Continue", trigger: "Amendment Filed" },
    { source: 171, target: 172, volume: 10, label: "Relation Back?", trigger: "SOL Issue" },
    { source: 171, target: 173, volume: 25, label: "Ruling", trigger: "Motion Decided" },
    { source: 173, target: 11, volume: 25, label: "Continue", trigger: "Amendment Filed" },

    // Case Management & Complexity Tracks
    { source: 8, target: 11, volume: 65, label: "Case Management", trigger: "Answer Filed" },
    { source: 10, target: 11, volume: 23, label: "Case Management", trigger: "Answer Required" },
    { source: 11, target: 190, volume: 20, label: "Expedited Track", trigger: "Simple Case" },
    { source: 11, target: 191, volume: 50, label: "Standard Track", trigger: "Typical Case" },
    { source: 11, target: 192, volume: 10, label: "Complex Business", trigger: "Complex/High $" },
    { source: 190, target: 14, volume: 20, label: "Discovery", trigger: "Track Assigned" },
    { source: 191, target: 14, volume: 50, label: "Discovery", trigger: "Track Assigned" },
    { source: 192, target: 14, volume: 10, label: "Discovery", trigger: "Track Assigned" },

    // ADR
    { source: 11, target: 12, volume: 70, label: "Court-Ordered Mediation", trigger: "CMO" },
    { source: 11, target: 80, volume: 15, label: "Non-Binding Arbitration", trigger: "Court Order/Stipulation" },
    { source: 12, target: 13, volume: 28, label: "Settled", trigger: "Agreement" },
    { source: 80, target: 81, volume: 15, label: "Arbitration Award", trigger: "Hearing Complete" },
    { source: 81, target: 13, volume: 8, label: "Accept Award", trigger: "No De Novo Request" },
    { source: 81, target: 14, volume: 7, label: "Trial De Novo", trigger: "Reject Award" },
    { source: 12, target: 14, volume: 42, label: "Impasse", trigger: "No Deal" },
    { source: 11, target: 14, volume: 18, label: "Discovery", trigger: "No Mediation" },

    // Discovery Phase
    { source: 14, target: 15, volume: 60, label: "Interrogatories", trigger: "Discovery Plan" },
    { source: 14, target: 16, volume: 60, label: "RFPs", trigger: "Discovery Plan" },
    { source: 14, target: 40, volume: 50, label: "RFAs", trigger: "Discovery Plan" },
    { source: 14, target: 41, volume: 55, label: "Depositions", trigger: "Discovery Plan" },
    { source: 14, target: 42, volume: 40, label: "Third-Party Subpoenas", trigger: "Records Needed" },

    // E-Discovery
    { source: 14, target: 200, volume: 60, label: "Litigation Hold", trigger: "Immediate" },
    { source: 200, target: 201, volume: 50, label: "ESI Protocol", trigger: "Discovery Planning" },
    { source: 201, target: 202, volume: 40, label: "Proportionality", trigger: "Scope Issues" },
    { source: 202, target: 203, volume: 15, label: "Cost-Shifting", trigger: "Burden" },
    { source: 202, target: 204, volume: 5, label: "Spoliation", trigger: "Destruction", isException: true },

    // Discovery Disputes
    { source: 15, target: 17, volume: 35, label: "Check Compliance", trigger: "30 Days" },
    { source: 16, target: 17, volume: 35, label: "Check Compliance", trigger: "30 Days" },
    { source: 40, target: 17, volume: 20, label: "Check Compliance", trigger: "30 Days" },
    { source: 41, target: 17, volume: 20, label: "Review Testimony", trigger: "After Depo" },
    { source: 17, target: 18, volume: 25, label: "Motion to Compel", trigger: "Non-Compliance" },
    { source: 18, target: 102, volume: 3, label: "Sanctions", trigger: "Willful", isException: true },
    { source: 14, target: 101, volume: 2, label: "Dismissal", trigger: "Inactive", isException: true },
    { source: 14, target: 19, volume: 50, label: "Expert Designation", trigger: "Deadline Approaching" },

    // Daubert/Expert Challenges
    { source: 19, target: 140, volume: 30, label: "Daubert Motion", trigger: "Expert Disclosed" },
    { source: 140, target: 141, volume: 25, label: "Daubert Hearing", trigger: "Motion Filed" },
    { source: 141, target: 142, volume: 25, label: "Ruling", trigger: "Hearing Complete" },
    { source: 142, target: 20, volume: 20, label: "To Summary Judgment", trigger: "Expert Admitted/Excluded" },

    // Summary Judgment & Proposals for Settlement
    { source: 17, target: 20, volume: 32, label: "Summary Judgment", trigger: "Discovery Complete" },
    { source: 19, target: 20, volume: 30, label: "Summary Judgment", trigger: "Discovery Complete" },
    { source: 14, target: 23, volume: 25, label: "Proposal for Settlement", trigger: "30+ Days After Service", isParallel: true },
    { source: 20, target: 21, volume: 16, label: "Granted", trigger: "No Material Facts" },
    { source: 20, target: 22, volume: 16, label: "Denied", trigger: "Issues Remain" },
    { source: 23, target: 13, volume: 10, label: "Accepted", trigger: "Within 30 Days" },
    { source: 23, target: 24, volume: 15, label: "Rejected/Expired", trigger: "After 30 Days" },

    // Pretrial Phase
    { source: 22, target: 24, volume: 15, label: "Pretrial Conference", trigger: "Trial Soon" },
    { source: 24, target: 50, volume: 14, label: "Motions in Limine", trigger: "Evidentiary Issues" },
    { source: 24, target: 51, volume: 14, label: "Trial Subpoenas", trigger: "Witnesses Needed" },
    { source: 24, target: 52, volume: 6, label: "Jury Instructions", trigger: "Jury Trial" },
    { source: 24, target: 53, volume: 15, label: "Final Lists", trigger: "Pretrial Order" },
    { source: 50, target: 26, volume: 14, label: "Proceed to Trial", trigger: "Rulings Made" },
    { source: 51, target: 26, volume: 14, label: "Proceed to Trial", trigger: "Subpoenas Served" },
    { source: 52, target: 26, volume: 6, label: "Proceed to Trial", trigger: "Instructions Filed" },
    { source: 53, target: 26, volume: 15, label: "Proceed to Trial", trigger: "Lists Filed" },
    { source: 24, target: 25, volume: 9, label: "Settled", trigger: "Agreement" },

    // Trial Phase
    { source: 26, target: 60, volume: 5, label: "Jury Selection", trigger: "Trial Start" },
    { source: 60, target: 61, volume: 5, label: "Opening Statements", trigger: "Jury Sworn" },
    { source: 61, target: 62, volume: 5, label: "Plaintiff's Case", trigger: "After Openings" },
    { source: 62, target: 63, volume: 5, label: "Directed Verdict Motion", trigger: "Plaintiff Rests" },
    { source: 63, target: 64, volume: 4, label: "Defense Case", trigger: "Motion Denied" },
    { source: 63, target: 30, volume: 1, label: "Granted", trigger: "No Evidence" },
    { source: 64, target: 65, volume: 4, label: "Closing Arguments", trigger: "Evidence Closed" },
    { source: 65, target: 66, volume: 4, label: "Jury Instructed", trigger: "Closings Done" },
    { source: 66, target: 27, volume: 4, label: "Deliberation", trigger: "Instructions Read" },
    { source: 26, target: 27, volume: 1, label: "Bench Trial", trigger: "No Jury" },

    // Post-Trial
    { source: 27, target: 28, volume: 2.5, label: "Consider Post-Trial", trigger: "10 Days" },
    { source: 28, target: 29, volume: 1.5, label: "New Trial Motion", trigger: "Error Found" },
    { source: 28, target: 70, volume: 1, label: "JNOV Motion", trigger: "No Evidence" },
    { source: 28, target: 71, volume: 0.5, label: "Remittitur/Additur", trigger: "Improper Damages" },
    { source: 28, target: 72, volume: 5, label: "Tax Costs", trigger: "Prevailing Party" },
    { source: 27, target: 30, volume: 3.5, label: "Final Judgment", trigger: "Accept Verdict" },
    { source: 29, target: 30, volume: 1, label: "Motion Denied", trigger: "No Error" },
    { source: 70, target: 30, volume: 0.5, label: "Motion Denied", trigger: "Evidence Existed" },
    { source: 71, target: 30, volume: 0.5, label: "Adjusted Judgment", trigger: "Motion Granted" },
    { source: 72, target: 30, volume: 5, label: "Costs Awarded", trigger: "Motion Granted" },

    // Attorney's Fees
    { source: 30, target: 150, volume: 20, label: "Fee Entitlement", trigger: "Prevailing Party" },
    { source: 150, target: 151, volume: 18, label: "Fee Amount", trigger: "Entitlement Established" },
    { source: 150, target: 152, volume: 5, label: "57.105 Sanctions", trigger: "Frivolous" },
    { source: 150, target: 153, volume: 10, label: "768.79 Fees", trigger: "Rejected Proposal" },
    { source: 151, target: 154, volume: 15, label: "Fee Award", trigger: "Hearing Complete" },
    { source: 153, target: 154, volume: 10, label: "Fee Award", trigger: "Comparison Made" },

    // Enforcement & Appeal
    { source: 30, target: 31, volume: 4, label: "Enforce?", trigger: "Non-Payment" },
    { source: 31, target: 32, volume: 3, label: "Execute", trigger: "Assets Found" },
    { source: 30, target: 33, volume: 2, label: "Appeal?", trigger: "Error Alleged" },
    { source: 33, target: 34, volume: 2, label: "File Appeal", trigger: "Within 30 Days" },

    // Stay Pending Appeal
    { source: 33, target: 160, volume: 1.5, label: "Motion for Stay", trigger: "Appeal Filed" },
    { source: 160, target: 161, volume: 1.5, label: "Supersedeas Bond", trigger: "Stay Sought" },
    { source: 161, target: 162, volume: 0.5, label: "Bond Reduction", trigger: "Excessive" },
    { source: 161, target: 163, volume: 1, label: "Stay Granted", trigger: "Bond Posted" },
    { source: 162, target: 163, volume: 0.5, label: "Ruling", trigger: "Motion Decided" }
];

export const CONFIG = {
    chart: {
        width: 3900,
        height: 1200,
        initialZoom: 0.75,
        minZoom: 0.2,
        maxZoom: 6
    },
    node: {
        width: 18,
        singleLineHeight: 28,
        multiLineHeight: 45,
        borderRadius: 3
    },
    decision: {
        size: 20
    },
    document: {
        width: 10,
        height: 14,
        offsetY: 4
    },
    expandable: {
        indicatorSize: 12,
        collapseAnimation: 300
    }
};

/**
 * Helper function to get nodes by group
 */
export function getNodesByGroup(groupId) {
    const group = NODE_GROUPS[groupId];
    if (!group) return [];
    return NODES.filter(node => group.childNodeIds.includes(node.id));
}

/**
 * Helper function to get parallel processes available at a given node
 */
export function getAvailableParallelProcesses(nodeId) {
    return PARALLEL_PROCESSES.filter(
        process => process.availableFrom <= nodeId && process.availableUntil >= nodeId
    );
}

/**
 * Get all strict deadline nodes
 */
export function getStrictDeadlineNodes() {
    return NODES.filter(node => node.deadline === 'strict');
}

/**
 * Get critical path through litigation
 */
export function getCriticalPath() {
    return [0, 1, 2, 5, 8, 11, 14, 20, 24, 26, 27, 30];
}

/**
 * Get all fee-related nodes
 */
export function getFeeNodes() {
    return NODES.filter(node => node.stage === 'Fees');
}

/**
 * Get emergency relief track nodes
 */
export function getEmergencyTrackNodes() {
    return NODES.filter(node => ['Emergency', 'Injunction'].includes(node.stage));
}
