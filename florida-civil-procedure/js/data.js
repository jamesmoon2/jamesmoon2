/**
 * Florida Civil Procedure - Data Configuration
 * Complete workflow specification with timing, costs, documents, and decision logic
 * Enhanced with detailed Trial Phase, ADR options, and expandable branches
 *
 * References:
 * - Florida Rules of Civil Procedure (Fla.R.Civ.P.)
 * - Florida Statutes (particularly Ch. 768.79 for Proposals for Settlement)
 * - Florida Rules of Appellate Procedure (Fla.R.App.P.)
 */

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
    Settlement: "#84cc16",
    PreTrial: "#ef4444",
    TrialPrep: "#dc2626",
    Trial: "#ec4899",
    TrialPhase: "#db2777",
    PostTrial: "#6366f1",
    Enforce: "#8b5cf6",
    Appeal: "#14b8a6"
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
        availableFrom: 0,  // From complaint filed
        availableUntil: 26, // Until trial begins
        stage: "ADR"
    },
    {
        id: "settlement-anytime",
        name: "Settlement Negotiations",
        rule: "1.730",
        description: "Parties may negotiate settlement at any point",
        availableFrom: 0,
        availableUntil: 27, // Until verdict
        stage: "Settlement"
    },
    {
        id: "proposal-settlement",
        name: "Proposal for Settlement",
        rule: "768.79/1.442",
        description: "Available 30+ days after service on defendant, must be 45+ days before trial",
        availableFrom: 5,  // After service complete
        availableUntil: 24, // Before pretrial conference
        stage: "Settlement",
        timing: {
            earliest: "30 days after service on defendant",
            latest: "45 days before trial or first day of trial docket"
        }
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
        y: 700,
        stage: "Filing",
        volume: 100,
        duration: "Day 1",
        cost: "2-5h+$400",
        documents: ["Complaint", "Summons", "Civil Cover Sheet", "Corporate Disclosure Statement"],
        owner: "Attorney",
        trigger: "File",
        deadline: "flexible",
        notes: "Statute of limitations must be checked before filing"
    },
    {
        id: 1,
        name: "Service\nRequired",
        rule: "1.070",
        x: 260,
        y: 200,
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
        x: 420,
        y: 150,
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
        x: 420,
        y: 230,
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
        x: 420,
        y: 310,
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
        x: 580,
        y: 240,
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
        x: 580,
        y: 380,
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
        x: 740,
        y: 500,
        stage: "Responsive",
        volume: 35,
        duration: "20d",
        cost: "15-30h",
        documents: ["Motion to Dismiss", "Memorandum of Law", "Proposed Order"],
        owner: "Opposing Counsel",
        trigger: "Legal Defect",
        deadline: "strict",
        isDecision: true,
        notes: "20 days from service to file; extends answer deadline"
    },
    {
        id: 8,
        name: "Answer\nFiled",
        rule: "1.110",
        x: 740,
        y: 750,
        stage: "Responsive",
        volume: 65,
        duration: "20d",
        cost: "10-20h",
        documents: ["Answer", "Affirmative Defenses", "Counterclaim (if any)"],
        owner: "Opposing Counsel",
        trigger: "No MTD Filed",
        deadline: "strict"
    },
    {
        id: 9,
        name: "MTD\nGranted",
        rule: "1.140",
        x: 900,
        y: 450,
        stage: "Resolution",
        volume: 12,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Defective Complaint",
        deadline: "flexible",
        notes: "Often granted with leave to amend"
    },
    {
        id: 10,
        name: "MTD\nDenied",
        rule: "",
        x: 900,
        y: 550,
        stage: "Responsive",
        volume: 23,
        duration: "30-60d",
        cost: "n/a",
        documents: ["Court Order"],
        owner: "Court",
        trigger: "Valid Complaint",
        deadline: "flexible"
    },

    // ============================================
    // CASE MANAGEMENT (ID 11)
    // ============================================
    {
        id: 11,
        name: "Case Mgmt\nConference",
        rule: "1.200",
        x: 1060,
        y: 700,
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
        expandsGroup: "adr",
        notes: "Court sets discovery deadlines, trial date, and ADR requirements"
    },

    // ============================================
    // ADR OPTIONS (IDs 12, 80-81)
    // ============================================
    {
        id: 12,
        name: "Court-Ordered\nMediation",
        rule: "1.700-1.730",
        x: 1220,
        y: 500,
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
        x: 1220,
        y: 600,
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
        x: 1380,
        y: 600,
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
        x: 1380,
        y: 450,
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
        x: 1380,
        y: 800,
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
        notes: "Standard discovery period is 6-12 months depending on case complexity"
    },
    {
        id: 15,
        name: "Interrogatories",
        rule: "1.340",
        x: 1540,
        y: 700,
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
        x: 1540,
        y: 780,
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
        x: 1540,
        y: 860,
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
        x: 1700,
        y: 700,
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
        x: 1700,
        y: 780,
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
        x: 1860,
        y: 740,
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
        x: 2020,
        y: 700,
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
        x: 1860,
        y: 860,
        stage: "ExpertDisc",
        volume: 50,
        duration: "90d before trial",
        cost: "5-10h+$5K+",
        documents: ["Expert Disclosure", "Expert Report", "CV"],
        owner: "Expert Witness",
        trigger: "Expert Needed",
        deadline: "court-set",
        notes: "Must disclose opinions, basis, qualifications per 1.280(b)(5)"
    },

    // ============================================
    // SUMMARY JUDGMENT & SETTLEMENT (IDs 20-23)
    // ============================================
    {
        id: 20,
        name: "Summary\nJudgment",
        rule: "1.510",
        x: 2180,
        y: 800,
        stage: "PreTrial",
        volume: 32,
        duration: "Post-Discovery",
        cost: "40-80h",
        documents: ["Motion for Summary Judgment", "Statement of Undisputed Facts", "Supporting Affidavits"],
        owner: "Attorney",
        trigger: "No Material Facts",
        deadline: "court-set",
        isDecision: true,
        notes: "Must be served at least 40 days before hearing per 1.510(c)"
    },
    {
        id: 21,
        name: "MSJ\nGranted",
        rule: "",
        x: 2340,
        y: 750,
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
        x: 2340,
        y: 850,
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
        x: 2180,
        y: 650,
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
        x: 2500,
        y: 800,
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
        x: 2500,
        y: 650,
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
        x: 2660,
        y: 650,
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
        x: 2500,
        y: 920,
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
        x: 2660,
        y: 920,
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
        x: 2660,
        y: 750,
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
        x: 2820,
        y: 800,
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
        x: 2820,
        y: 650,
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
        x: 2980,
        y: 650,
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
        x: 2980,
        y: 730,
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
        x: 3140,
        y: 650,
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
        notes: "Must be made at close of plaintiff's evidence to preserve for appeal"
    },
    {
        id: 64,
        name: "Defendant's\nCase-in-Chief",
        rule: "90.612",
        x: 3140,
        y: 730,
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
        x: 3140,
        y: 810,
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
        x: 3140,
        y: 890,
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
        x: 3300,
        y: 800,
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
        x: 3460,
        y: 800,
        stage: "PostTrial",
        volume: 2.5,
        duration: "15d",
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
        x: 3460,
        y: 680,
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
        x: 3620,
        y: 680,
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
        x: 3620,
        y: 760,
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
        x: 3620,
        y: 840,
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
        x: 3780,
        y: 800,
        stage: "PostTrial",
        volume: 6,
        duration: "10d",
        cost: "3-5h",
        documents: ["Final Judgment"],
        owner: "Court",
        trigger: "Case Finalized",
        deadline: "strict"
    },

    // ============================================
    // ENFORCEMENT (IDs 31-32)
    // ============================================
    {
        id: 31,
        name: "Enforcement?",
        rule: "1.550",
        x: 3940,
        y: 720,
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
        x: 4100,
        y: 680,
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
        x: 3940,
        y: 900,
        stage: "Appeal",
        volume: 2,
        duration: "30d",
        cost: "n/a",
        documents: [],
        owner: "Client",
        trigger: "Reversible Error?",
        deadline: "strict",
        isDecision: true,
        notes: "30 days from rendition of final order"
    },
    {
        id: 34,
        name: "Notice of\nAppeal",
        rule: "9.110(b)",
        x: 4100,
        y: 900,
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
    // EXCEPTION PATHS (IDs 100-102)
    // ============================================
    {
        id: 100,
        name: "DEFAULT",
        rule: "1.500",
        x: 900,
        y: 800,
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
        name: "DISMISSAL",
        rule: "1.420(e)",
        x: 1700,
        y: 960,
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
        x: 2020,
        y: 800,
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

    // Responsive Pleadings
    { source: 5, target: 7, volume: 35, label: "MTD Filed", trigger: "Defect" },
    { source: 5, target: 8, volume: 57, label: "Answer", trigger: "20 Days" },
    { source: 7, target: 9, volume: 12, label: "Granted", trigger: "Defective" },
    { source: 7, target: 10, volume: 23, label: "Denied", trigger: "Valid" },
    { source: 5, target: 100, volume: 5, label: "Default", trigger: "No Answer", isException: true },

    // Case Management & ADR
    { source: 8, target: 11, volume: 65, label: "Case Management", trigger: "Answer Filed" },
    { source: 10, target: 11, volume: 23, label: "Case Management", trigger: "Answer Required" },
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
    { source: 15, target: 17, volume: 35, label: "Check Compliance", trigger: "30 Days" },
    { source: 16, target: 17, volume: 35, label: "Check Compliance", trigger: "30 Days" },
    { source: 40, target: 17, volume: 20, label: "Check Compliance", trigger: "30 Days" },
    { source: 41, target: 17, volume: 20, label: "Review Testimony", trigger: "After Depo" },
    { source: 17, target: 18, volume: 25, label: "Motion to Compel", trigger: "Non-Compliance" },
    { source: 18, target: 102, volume: 3, label: "Sanctions", trigger: "Willful", isException: true },
    { source: 14, target: 101, volume: 2, label: "Dismissal", trigger: "Inactive", isException: true },
    { source: 14, target: 19, volume: 50, label: "Expert Designation", trigger: "Deadline Approaching" },

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
    { source: 27, target: 28, volume: 2.5, label: "Consider Post-Trial", trigger: "10-15 Days" },
    { source: 28, target: 29, volume: 1.5, label: "New Trial Motion", trigger: "Error Found" },
    { source: 28, target: 70, volume: 1, label: "JNOV Motion", trigger: "No Evidence" },
    { source: 28, target: 71, volume: 0.5, label: "Remittitur/Additur", trigger: "Improper Damages" },
    { source: 28, target: 72, volume: 5, label: "Tax Costs", trigger: "Prevailing Party" },
    { source: 27, target: 30, volume: 3.5, label: "Final Judgment", trigger: "Accept Verdict" },
    { source: 29, target: 30, volume: 1, label: "Motion Denied", trigger: "No Error" },
    { source: 70, target: 30, volume: 0.5, label: "Motion Denied", trigger: "Evidence Existed" },
    { source: 71, target: 30, volume: 0.5, label: "Adjusted Judgment", trigger: "Motion Granted" },
    { source: 72, target: 30, volume: 5, label: "Costs Awarded", trigger: "Motion Granted" },

    // Enforcement & Appeal
    { source: 30, target: 31, volume: 4, label: "Enforce?", trigger: "Non-Payment" },
    { source: 31, target: 32, volume: 3, label: "Execute", trigger: "Assets Found" },
    { source: 30, target: 33, volume: 2, label: "Appeal?", trigger: "Error Alleged" },
    { source: 33, target: 34, volume: 2, label: "File Appeal", trigger: "Within 30 Days" }
];

export const CONFIG = {
    chart: {
        width: 4400,
        height: 1200,
        initialZoom: 0.38,
        minZoom: 0.15,
        maxZoom: 3
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
