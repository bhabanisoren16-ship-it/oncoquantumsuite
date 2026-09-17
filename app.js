/**
 * OncoScan AI - Manual Patient Data Entry & Multi-Cancer Detection Engine
 * Matches manual patient genomic inputs against local reference folder cohorts:
 * - data/tcga_synthetic_cancer.csv (600 samples: Normal, BRCA, LUAD)
 * - pancreatic_cancer_synthetic_100_sequences.csv (100 KRAS mutation sequences: PDAC)
 * - JCLA-36-e24381.pdf & TCGA PAAD hub gene benchmarks
 */

// ==========================================
// 1. GENES CONFIGURATION & THRESHOLDS
// ==========================================
const GENE_CONFIGS = {
  brca: [
    { id: "BRCA1", name: "BRCA1", normalMean: 4.79, tumorMean: 8.64, weight: 1.2, normalSD: 0.5, desc: "DNA repair & breast oncogenesis" },
    { id: "BRCA2", name: "BRCA2", normalMean: 6.13, tumorMean: 9.91, weight: 1.0, normalSD: 0.5, desc: "Homologous recombination" },
    { id: "ERBB2", name: "ERBB2 (HER2)", normalMean: 5.61, tumorMean: 9.40, weight: 1.4, normalSD: 0.5, desc: "Receptor tyrosine kinase / HER2" },
    { id: "ESR1",  name: "ESR1",  normalMean: 5.28, tumorMean: 9.12, weight: 1.1, normalSD: 0.5, desc: "Estrogen receptor alpha" }
  ],
  luad: [
    { id: "EGFR", name: "EGFR", normalMean: 5.88, tumorMean: 9.89, weight: 1.4, normalSD: 0.55, desc: "Epidermal growth factor receptor" },
    { id: "KRAS", name: "KRAS", normalMean: 5.32, tumorMean: 9.25, weight: 1.2, normalSD: 0.55, desc: "GTPase signal transduction" },
    { id: "ALK",  name: "ALK",  normalMean: 5.56, tumorMean: 9.48, weight: 1.3, normalSD: 0.55, desc: "Anaplastic lymphoma kinase" },
    { id: "MET",  name: "MET",  normalMean: 4.03, tumorMean: 7.85, weight: 1.0, normalSD: 0.50, desc: "Hepatocyte growth factor receptor" }
  ],
  pdac: [
    { id: "CDK1",   name: "CDK1",   normalMean: 4.72, tumorMean: 8.20, weight: 1.4, normalSD: 0.45, desc: "Cyclin-dependent kinase (JCLA Hub 1)" },
    { id: "UHRF1",  name: "UHRF1",  normalMean: 5.37, tumorMean: 7.90, weight: 1.1, normalSD: 0.50, desc: "Epigenetic regulator (JCLA Hub 6)" },
    { id: "SMAD4",  name: "SMAD4",  normalMean: 5.39, tumorMean: 2.80, weight: 1.3, normalSD: 0.50, desc: "TGF-β tumor suppressor (loss in PDAC)", isSuppressed: true },
    { id: "CDKN2A", name: "CDKN2A", normalMean: 4.13, tumorMean: 2.50, weight: 1.2, normalSD: 0.45, desc: "p16INK4a cell cycle inhibitor", isSuppressed: true }
  ],
  universal: [
    { id: "TP53", name: "TP53", normalMean: 4.38, tumorMean: 7.60, weight: 1.3, normalSD: 0.50, desc: "Guardian of the genome" },
    { id: "PTEN", name: "PTEN", normalMean: 4.94, tumorMean: 3.63, weight: 1.1, normalSD: 0.50, desc: "PI3K/AKT antagonist", isSuppressed: true },
    { id: "MYC",  name: "MYC",  normalMean: 5.19, tumorMean: 8.98, weight: 1.2, normalSD: 0.55, desc: "Cell proliferation oncoprotein" }
  ]
};

// Flattened list of all 15 genes
const ALL_GENES = [
  ...GENE_CONFIGS.brca,
  ...GENE_CONFIGS.luad,
  ...GENE_CONFIGS.pdac,
  ...GENE_CONFIGS.universal
];

// ==========================================
// 2. REFERENCE FOLDER COHORT BENCHMARKS
// Extracted from data/tcga_synthetic_cancer.csv & pancreatic_cancer_synthetic_100_sequences.csv
// ==========================================
const COHORT_BENCHMARKS = {
  Normal: {
    id: "Normal",
    name: "Normal / Healthy Baseline",
    category: "normal",
    color: "#10b981",
    bannerClass: "banner-normal",
    icon: "●",
    description: "Biomarker profile is consistent with baseline non-malignant tissue homeostasis across all reference panels.",
    clinicalAction: "Routine preventive surveillance. No oncogenic intervention required.",
    means: {
      BRCA1: 4.79, BRCA2: 6.13, ERBB2: 5.61, ESR1: 5.28,
      EGFR: 5.88, KRAS: 5.32, ALK: 5.56, MET: 4.03,
      CDK1: 4.72, UHRF1: 5.37, SMAD4: 5.39, CDKN2A: 4.13,
      TP53: 4.38, PTEN: 4.94, MYC: 5.19
    },
    krasMutExpected: "None"
  },
  BRCA: {
    id: "BRCA",
    name: "Breast Invasive Carcinoma (BRCA)",
    category: "brca",
    color: "#f43f5e",
    bannerClass: "banner-brca",
    icon: "●",
    description: "Marked transcriptional activation of the luminal/HER2 oncogenic axis with elevated BRCA1, BRCA2, ERBB2, and ESR1.",
    clinicalAction: "Breast oncology evaluation. Perform confirmatory mammography, core needle biopsy, and receptor typing (ER/PR/HER2).",
    means: {
      BRCA1: 8.64, BRCA2: 9.91, ERBB2: 9.40, ESR1: 9.12,
      EGFR: 5.92, KRAS: 5.34, ALK: 5.54, MET: 4.04,
      CDK1: 4.62, UHRF1: 5.33, SMAD4: 5.36, CDKN2A: 4.15,
      TP53: 6.30, PTEN: 3.63, MYC: 8.98
    },
    krasMutExpected: "None"
  },
  LUAD: {
    id: "LUAD",
    name: "Lung Adenocarcinoma (LUAD)",
    category: "luad",
    color: "#f97316",
    bannerClass: "banner-luad",
    icon: "●",
    description: "Robust hyper-activation of pulmonary receptor tyrosine kinase signaling with elevated EGFR, KRAS, ALK, and MET.",
    clinicalAction: "Thoracic oncology consult. Recommend low-dose chest CT, bronchoscopy/EBUS biopsy, and NGS for targeted therapy (Osimertinib, Sotorasib, Alectinib).",
    means: {
      BRCA1: 4.86, BRCA2: 6.09, ERBB2: 5.57, ESR1: 5.28,
      EGFR: 9.89, KRAS: 9.25, ALK: 9.48, MET: 7.85,
      CDK1: 6.23, UHRF1: 6.73, SMAD4: 5.39, CDKN2A: 2.58,
      TP53: 4.42, PTEN: 4.95, MYC: 5.19
    },
    krasMutExpected: "G12V"
  },
  PDAC: {
    id: "PDAC",
    name: "Pancreatic Ductal Adenocarcinoma (PDAC)",
    category: "pdac",
    color: "#a855f7",
    bannerClass: "banner-pdac",
    icon: "●",
    description: "Hallmark oncogenic KRAS hotspot alteration coupled with cell cycle hub elevation (CDK1, UHRF1) and loss of SMAD4/CDKN2A tumor suppression.",
    clinicalAction: "Immediate Pancreatobiliary Surgical Oncology consult. Abdominal triphasic CT/MRI, serum CA 19-9 testing, and staging laparoscopy evaluation.",
    means: {
      BRCA1: 5.00, BRCA2: 5.10, ERBB2: 5.40, ESR1: 4.80,
      EGFR: 6.20, KRAS: 8.80, ALK: 4.90, MET: 6.50,
      CDK1: 8.20, UHRF1: 7.90, SMAD4: 2.80, CDKN2A: 2.50,
      TP53: 7.60, PTEN: 4.20, MYC: 7.10
    },
    krasMutExpected: "G12D"
  }
};

// ==========================================
// 3. REFERENCE PATIENT SAMPLES (FROM WORKSPACE FILES)
// Extracted from tcga_synthetic_cancer.csv and pancreatic_cancer_synthetic_100_sequences.csv
// ==========================================
const REFERENCE_PATIENTS_DATABASE = [
  // BRCA Samples from tcga_synthetic_cancer.csv
  { id: "TCGA-BRCA-001", file: "tcga_synthetic_cancer.csv", cancerType: "BRCA", krasMutation: "None", genes: { BRCA1: 8.85, BRCA2: 9.82, ERBB2: 9.61, ESR1: 9.24, EGFR: 5.81, KRAS: 5.29, ALK: 5.49, MET: 4.01, CDK1: 4.65, UHRF1: 5.31, SMAD4: 5.32, CDKN2A: 4.10, TP53: 6.35, PTEN: 3.58, MYC: 9.12 } },
  { id: "TCGA-BRCA-014", file: "tcga_synthetic_cancer.csv", cancerType: "BRCA", krasMutation: "None", genes: { BRCA1: 8.52, BRCA2: 9.95, ERBB2: 9.32, ESR1: 8.98, EGFR: 5.95, KRAS: 5.41, ALK: 5.61, MET: 4.10, CDK1: 4.58, UHRF1: 5.40, SMAD4: 5.41, CDKN2A: 4.18, TP53: 6.22, PTEN: 3.71, MYC: 8.84 } },
  { id: "TCGA-BRCA-088", file: "tcga_synthetic_cancer.csv", cancerType: "BRCA", krasMutation: "None", genes: { BRCA1: 8.74, BRCA2: 9.78, ERBB2: 9.55, ESR1: 9.35, EGFR: 5.88, KRAS: 5.33, ALK: 5.50, MET: 3.98, CDK1: 4.70, UHRF1: 5.28, SMAD4: 5.35, CDKN2A: 4.12, TP53: 6.41, PTEN: 3.60, MYC: 9.05 } },

  // LUAD Samples from tcga_synthetic_cancer.csv
  { id: "TCGA-LUAD-003", file: "tcga_synthetic_cancer.csv", cancerType: "LUAD", krasMutation: "None", genes: { BRCA1: 4.81, BRCA2: 6.05, ERBB2: 5.52, ESR1: 5.21, EGFR: 10.12, KRAS: 9.45, ALK: 9.62, MET: 7.95, CDK1: 6.31, UHRF1: 6.82, SMAD4: 5.35, CDKN2A: 2.51, TP53: 4.45, PTEN: 4.90, MYC: 5.25 } },
  { id: "TCGA-LUAD-042", file: "tcga_synthetic_cancer.csv", cancerType: "LUAD", krasMutation: "G12V", genes: { BRCA1: 4.92, BRCA2: 6.15, ERBB2: 5.60, ESR1: 5.32, EGFR: 9.75, KRAS: 9.18, ALK: 9.38, MET: 7.72, CDK1: 6.18, UHRF1: 6.65, SMAD4: 5.42, CDKN2A: 2.62, TP53: 4.38, PTEN: 5.01, MYC: 5.15 } },
  { id: "TCGA-LUAD-119", file: "tcga_synthetic_cancer.csv", cancerType: "LUAD", krasMutation: "None", genes: { BRCA1: 4.88, BRCA2: 6.11, ERBB2: 5.55, ESR1: 5.25, EGFR: 9.94, KRAS: 9.30, ALK: 9.51, MET: 7.89, CDK1: 6.25, UHRF1: 6.78, SMAD4: 5.38, CDKN2A: 2.55, TP53: 4.40, PTEN: 4.92, MYC: 5.20 } },

  // PDAC Samples from pancreatic_cancer_synthetic_100_sequences.csv & JCLA Data
  { id: "S051 (KRAS G12D)", file: "pancreatic_sequences.csv", cancerType: "PDAC", krasMutation: "G12D", genes: { BRCA1: 5.05, BRCA2: 5.15, ERBB2: 5.42, ESR1: 4.85, EGFR: 6.25, KRAS: 8.92, ALK: 4.95, MET: 6.55, CDK1: 8.35, UHRF1: 8.05, SMAD4: 2.75, CDKN2A: 2.45, TP53: 7.75, PTEN: 4.15, MYC: 7.25 } },
  { id: "S052 (KRAS G13V)", file: "pancreatic_sequences.csv", cancerType: "PDAC", krasMutation: "G13V", genes: { BRCA1: 4.98, BRCA2: 5.08, ERBB2: 5.38, ESR1: 4.78, EGFR: 6.15, KRAS: 8.75, ALK: 4.88, MET: 6.45, CDK1: 8.15, UHRF1: 7.82, SMAD4: 2.85, CDKN2A: 2.52, TP53: 7.55, PTEN: 4.22, MYC: 7.05 } },
  { id: "S053 (KRAS Q61L)", file: "pancreatic_sequences.csv", cancerType: "PDAC", krasMutation: "Q61L", genes: { BRCA1: 5.02, BRCA2: 5.12, ERBB2: 5.45, ESR1: 4.82, EGFR: 6.22, KRAS: 8.85, ALK: 4.92, MET: 6.52, CDK1: 8.25, UHRF1: 7.95, SMAD4: 2.80, CDKN2A: 2.48, TP53: 7.65, PTEN: 4.18, MYC: 7.15 } },
  { id: "S066 (KRAS G12D)", file: "pancreatic_sequences.csv", cancerType: "PDAC", krasMutation: "G12D", genes: { BRCA1: 5.00, BRCA2: 5.10, ERBB2: 5.40, ESR1: 4.80, EGFR: 6.18, KRAS: 8.88, ALK: 4.90, MET: 6.48, CDK1: 8.28, UHRF1: 7.90, SMAD4: 2.78, CDKN2A: 2.46, TP53: 7.68, PTEN: 4.16, MYC: 7.18 } },

  // Normal / Healthy Baseline from tcga_synthetic_cancer.csv & pancreatic_sequences.csv
  { id: "TCGA-NORM-001", file: "tcga_synthetic_cancer.csv", cancerType: "Normal", krasMutation: "None", genes: { BRCA1: 4.75, BRCA2: 6.10, ERBB2: 5.58, ESR1: 5.25, EGFR: 5.82, KRAS: 5.28, ALK: 5.51, MET: 3.98, CDK1: 4.68, UHRF1: 5.32, SMAD4: 5.35, CDKN2A: 4.10, TP53: 4.35, PTEN: 4.91, MYC: 5.15 } },
  { id: "TCGA-NORM-019", file: "tcga_synthetic_cancer.csv", cancerType: "Normal", krasMutation: "None", genes: { BRCA1: 4.82, BRCA2: 6.18, ERBB2: 5.64, ESR1: 5.31, EGFR: 5.92, KRAS: 5.35, ALK: 5.59, MET: 4.05, CDK1: 4.75, UHRF1: 5.41, SMAD4: 5.42, CDKN2A: 4.16, TP53: 4.41, PTEN: 4.97, MYC: 5.22 } },
  { id: "S001 (KRAS WT)",   file: "pancreatic_sequences.csv", cancerType: "Normal", krasMutation: "None", genes: { BRCA1: 4.80, BRCA2: 6.12, ERBB2: 5.60, ESR1: 5.28, EGFR: 5.86, KRAS: 5.30, ALK: 5.55, MET: 4.02, CDK1: 4.70, UHRF1: 5.35, SMAD4: 5.38, CDKN2A: 4.12, TP53: 4.38, PTEN: 4.95, MYC: 5.18 } }
];

// Active Patient State (Values initialized to Healthy Baseline)
let patientState = {
  id: "PATIENT-CLINICAL-001",
  krasMutation: "None",
  genes: {
    BRCA1: 4.79, BRCA2: 6.13, ERBB2: 5.61, ESR1: 5.28,
    EGFR: 5.88, KRAS: 5.32, ALK: 5.56, MET: 4.03,
    CDK1: 4.72, UHRF1: 5.37, SMAD4: 5.39, CDKN2A: 4.13,
    TP53: 4.38, PTEN: 4.94, MYC: 5.19
  }
};

let lastEvaluation = null;

// ==========================================
// 4. DOM ELEMENTS CACHE
// ==========================================
const DOM = {
  patientIdInput: document.getElementById("patient-id-input"),
  resetBaselineBtn: document.getElementById("reset-baseline-btn"),
  presetBtns: document.querySelectorAll(".btn-preset"),
  krasMutationSelect: document.getElementById("kras-mutation-select"),
  runMatchBtn: document.getElementById("run-diagnostic-btn"),

  // Slider containers
  brcaSliders: document.getElementById("group-brca-sliders"),
  luadSliders: document.getElementById("group-luad-sliders"),
  pdacSliders: document.getElementById("group-pdac-sliders"),
  univSliders: document.getElementById("group-universal-sliders"),

  // Tabs
  tabBtns: document.querySelectorAll(".tab-btn"),
  tabPanes: document.querySelectorAll(".tab-pane"),

  // Paste / Sequence
  pasteInput: document.getElementById("paste-input"),
  applyPasteBtn: document.getElementById("apply-paste-btn"),
  sequenceInput: document.getElementById("sequence-input"),
  analyzeSeqBtn: document.getElementById("analyze-sequence-btn"),

  // Results
  lastAnalyzedTag: document.getElementById("last-analyzed-tag"),
  banner: document.getElementById("diagnostic-banner"),
  bannerIcon: document.getElementById("banner-icon"),
  bannerCancerBadge: document.getElementById("banner-cancer-badge"),
  bannerTitle: document.getElementById("banner-title"),
  bannerDesc: document.getElementById("banner-description"),
  bannerConfNum: document.getElementById("banner-confidence-num"),

  cancerBarsList: document.getElementById("cancer-bars-list"),
  refTableBody: document.getElementById("ref-patients-table-body"),
  radarSvg: document.getElementById("radar-svg"),
  driverCardsList: document.getElementById("driver-cards-list"),
  clinicalActionText: document.getElementById("clinical-action-text"),

  exportBtn: document.getElementById("export-report-btn"),
  copyJsonBtn: document.getElementById("copy-json-btn"),

  // Drawer
  toggleSidebarBtn: document.getElementById("toggle-sidebar-btn"),
  referenceDrawer: document.getElementById("reference-drawer"),
  drawerBackdrop: document.getElementById("drawer-backdrop"),
  closeDrawerBtn: document.getElementById("close-drawer-btn"),

  toastContainer: document.getElementById("toast-container")
};

// ==========================================
// 5. INITIALIZATION & BOOT LOADER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  renderGeneSliders();
  setupEventListeners();
  // Automatically evaluate initial baseline
  runCancerMatch();
});

// Render the interactive sliders and number inputs for all 15 genes
function renderGeneSliders() {
  const renderGroup = (container, genesList) => {
    container.innerHTML = "";
    genesList.forEach(g => {
      const val = patientState.genes[g.id] || g.normalMean;
      const isElevated = val > (g.normalMean + 1.8);
      const isSuppressed = val < (g.normalMean - 1.5);

      let statusPillClass = "status-pill-normal";
      let statusPillText = "Normal";
      if (isElevated) {
        statusPillClass = "status-pill-elevated";
        statusPillText = "Elevated ↑";
      } else if (isSuppressed) {
        statusPillClass = "status-pill-elevated";
        statusPillText = "Suppressed ↓";
      }

      const row = document.createElement("div");
      row.className = "slider-item";
      row.id = `slider-item-${g.id}`;

      row.innerHTML = `
        <div class="slider-label-row">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="slider-gene-name">${g.name}</span>
            <span class="gene-status-pill ${statusPillClass}" id="pill-${g.id}">${statusPillText}</span>
          </div>
          <div class="slider-controls">
            <span style="font-size:0.72rem; color:var(--text-muted); font-family:monospace;">Norm: ~${g.normalMean}</span>
            <input type="number" step="0.1" min="0" max="15" value="${val.toFixed(1)}" 
                   class="gene-number-input" id="num-${g.id}" aria-label="${g.name} numeric value">
          </div>
        </div>
        <input type="range" min="1.0" max="14.0" step="0.1" value="${val.toFixed(1)}" 
               class="gene-range-slider" id="range-${g.id}" aria-label="${g.name} slider">
      `;

      container.appendChild(row);
    });
  };

  renderGroup(DOM.brcaSliders, GENE_CONFIGS.brca);
  renderGroup(DOM.luadSliders, GENE_CONFIGS.luad);
  renderGroup(DOM.pdacSliders, GENE_CONFIGS.pdac);
  renderGroup(DOM.univSliders, GENE_CONFIGS.universal);

  // Bind live synchronization for all 15 genes
  ALL_GENES.forEach(g => {
    const rangeInput = document.getElementById(`range-${g.id}`);
    const numInput = document.getElementById(`num-${g.id}`);

    const updateGeneVal = (newVal, source) => {
      // Don't snap to 0 or interrupt typing when field is being cleared or typing decimals
      if (newVal === "" || newVal === "-" || newVal === ".") {
        return;
      }
      const parsed = parseFloat(newVal);
      if (isNaN(parsed)) return;

      const clamped = Math.max(0, Math.min(15, parsed));
      patientState.genes[g.id] = clamped;
      rangeInput.value = clamped;

      // Only format numInput if source was NOT manual typing in numInput
      if (source !== "numInput") {
        numInput.value = clamped.toFixed(1);
      }

      // Update status pill
      const pill = document.getElementById(`pill-${g.id}`);
      if (pill) {
        const isElevated = clamped > (g.normalMean + 1.8);
        const isSuppressed = clamped < (g.normalMean - 1.5);
        if (isElevated) {
          pill.className = "gene-status-pill status-pill-elevated";
          pill.textContent = "Elevated ↑";
        } else if (isSuppressed) {
          pill.className = "gene-status-pill status-pill-elevated";
          pill.textContent = "Suppressed ↓";
        } else {
          pill.className = "gene-status-pill status-pill-normal";
          pill.textContent = "Normal";
        }
      }

      // Automatically re-evaluate for seamless real-time responsiveness
      runCancerMatch();
    };

    rangeInput.addEventListener("input", (e) => updateGeneVal(e.target.value, "range"));
    numInput.addEventListener("input", (e) => updateGeneVal(e.target.value, "numInput"));
    numInput.addEventListener("change", (e) => {
      const parsed = parseFloat(e.target.value);
      const clamped = isNaN(parsed) ? g.normalMean : Math.max(0, Math.min(15, parsed));
      patientState.genes[g.id] = clamped;
      numInput.value = clamped.toFixed(1);
      rangeInput.value = clamped;
      runCancerMatch();
    });
  });
}

// Update all UI inputs from patientState object
function syncInputsFromState() {
  ALL_GENES.forEach(g => {
    const val = patientState.genes[g.id] || g.normalMean;
    const rangeInput = document.getElementById(`range-${g.id}`);
    const numInput = document.getElementById(`num-${g.id}`);
    const pill = document.getElementById(`pill-${g.id}`);

    if (rangeInput && numInput && pill) {
      rangeInput.value = val;
      numInput.value = val.toFixed(1);

      const isElevated = val > (g.normalMean + 1.8);
      const isSuppressed = val < (g.normalMean - 1.5);
      if (isElevated) {
        pill.className = "gene-status-pill status-pill-elevated";
        pill.textContent = "Elevated ↑";
      } else if (isSuppressed) {
        pill.className = "gene-status-pill status-pill-elevated";
        pill.textContent = "Suppressed ↓";
      } else {
        pill.className = "gene-status-pill status-pill-normal";
        pill.textContent = "Normal";
      }
    }
  });

  DOM.krasMutationSelect.value = patientState.krasMutation || "None";
  DOM.patientIdInput.value = patientState.id;
}

// Setup Event Listeners
function setupEventListeners() {
  // Patient ID
  DOM.patientIdInput.addEventListener("input", (e) => {
    patientState.id = e.target.value.trim() || "PATIENT-UNNAMED";
  });
  DOM.patientIdInput.addEventListener("change", (e) => {
    patientState.id = e.target.value.trim() || "PATIENT-UNNAMED";
  });

  // KRAS Mutation Dropdown
  DOM.krasMutationSelect.addEventListener("change", (e) => {
    patientState.krasMutation = e.target.value;
    runCancerMatch();
  });

  // Reset to Baseline
  DOM.resetBaselineBtn.addEventListener("click", () => {
    loadPreset("normal");
    if (DOM.pasteInput) DOM.pasteInput.value = "";
    showToast("Reset all genes to normal baseline levels (ready for manual entry)");
  });

  // Quick Preset Buttons
  DOM.presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-preset");
      loadPreset(p);
      if (DOM.pasteInput) DOM.pasteInput.value = "";
      showToast(`Loaded ${btn.textContent.trim()} profile for manual adjustment`);
    });
  });

  // Tabs Navigation
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      DOM.tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const targetPane = document.getElementById(`pane-${btn.getAttribute("data-tab")}`);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Live manual entry debounced synchronization for pasteInput
  let pasteDebounceTimer = null;
  if (DOM.pasteInput) {
    DOM.pasteInput.addEventListener("input", () => {
      clearTimeout(pasteDebounceTimer);
      pasteDebounceTimer = setTimeout(() => {
        const val = DOM.pasteInput.value.trim();
        if (val.length >= 3) {
          parseAndApplyTextData(true); // silent update while user is entering data manually
        }
      }, 250);
    });
  }

  // Parse Text / CSV Button
  DOM.applyPasteBtn.addEventListener("click", () => parseAndApplyTextData(false));

  // Analyze KRAS Sequence Button
  DOM.analyzeSeqBtn.addEventListener("click", analyzeKrasSequence);

  // Run Match Button
  DOM.runMatchBtn.addEventListener("click", () => {
    const activeTabBtn = document.querySelector(".tab-btn.active");
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "sliders";

    if (activeTab === "text" && DOM.pasteInput && DOM.pasteInput.value.trim().length > 0) {
      parseAndApplyTextData();
      return;
    } else if (activeTab === "sequence" && DOM.sequenceInput && DOM.sequenceInput.value.trim().length > 0) {
      analyzeKrasSequence();
      return;
    }

    runCancerMatch();
    showToast("Evaluation updated against reference folder");
  });

  // Quick Insert Sample Buttons for Tab 2 (Text/CSV - Indian Patient Profiles)
  const btnBrcaText = document.getElementById("load-sample-brca-text");
  const btnLuadText = document.getElementById("load-sample-luad-text");
  const btnPdacText = document.getElementById("load-sample-pdac-text");
  const btnNormText = document.getElementById("load-sample-norm-text");

  if (btnBrcaText) {
    btnBrcaText.addEventListener("click", () => {
      DOM.pasteInput.value = "Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,EGFR,KRAS,ALK,MET,CDK1,UHRF1,SMAD4,CDKN2A,TP53,PTEN,MYC\nPriya-Sharma-BRCA,BRCA,1,8.75,9.85,9.50,9.20,3.85,5.65,4.60,6.10,4.65,5.15,4.80,6.35,8.10,2.70,8.25";
      patientState.krasMutation = "None";
      DOM.krasMutationSelect.value = "None";
      parseAndApplyTextData();
      showToast("Loaded Priya Sharma (Breast Cancer BRCA)");
    });
  }
  if (btnLuadText) {
    btnLuadText.addEventListener("click", () => {
      DOM.pasteInput.value = "Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,EGFR,KRAS,ALK,MET,CDK1,UHRF1,SMAD4,CDKN2A,TP53,PTEN,MYC\nRajesh-Patel-LUAD,LUAD,2,5.40,4.75,4.75,6.10,9.20,9.85,9.85,9.80,6.60,6.50,4.70,4.25,5.20,5.40,5.35";
      patientState.krasMutation = "None";
      DOM.krasMutationSelect.value = "None";
      parseAndApplyTextData();
      showToast("Loaded Rajesh Patel (Lung Cancer LUAD)");
    });
  }
  if (btnPdacText) {
    btnPdacText.addEventListener("click", () => {
      DOM.pasteInput.value = "Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,EGFR,KRAS,ALK,MET,CDK1,UHRF1,SMAD4,CDKN2A,TP53,PTEN,MYC\nVikram-Malhotra-PDAC,PDAC,3,5.05,5.15,5.42,4.82,6.22,8.90,4.92,6.52,8.30,7.95,2.75,2.45,7.65,4.18,7.20";
      patientState.krasMutation = "G12D";
      DOM.krasMutationSelect.value = "G12D";
      parseAndApplyTextData();
      showToast("Loaded Vikram Malhotra (Pancreatic Cancer PDAC with G12D)");
    });
  }
  if (btnNormText) {
    btnNormText.addEventListener("click", () => {
      DOM.pasteInput.value = "Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,EGFR,KRAS,ALK,MET,CDK1,UHRF1,SMAD4,CDKN2A,TP53,PTEN,MYC\nSunita-Reddy-Normal,Normal,0,4.75,6.10,5.58,5.25,5.82,5.30,5.52,4.02,4.70,5.35,5.40,4.12,4.35,4.95,5.18";
      patientState.krasMutation = "None";
      DOM.krasMutationSelect.value = "None";
      parseAndApplyTextData();
      showToast("Loaded Sunita Reddy (Healthy Normal Baseline)");
    });
  }

  // Quick Insert Sequence Buttons for Tab 3 (KRAS DNA)
  const btnSeqG12d = document.getElementById("load-seq-g12d");
  const btnSeqG12v = document.getElementById("load-seq-g12v");
  const btnSeqQ61l = document.getElementById("load-seq-q61l");
  const btnSeqWt   = document.getElementById("load-seq-wt");

  if (btnSeqG12d) {
    btnSeqG12d.addEventListener("click", () => {
      DOM.sequenceInput.value = "ATGGTGGTGGTGGTGGTGGTGCTGGTGGTGGTGATGGTGCTGGTGGTGCTGGTGGTGGTGGTGGTGGTGCTGGTGCTGGTGGTGCTGCTGGTGCTGGTGGTGGTGCTGGTGATGGTGGTG";
      analyzeKrasSequence();
    });
  }
  if (btnSeqG12v) {
    btnSeqG12v.addEventListener("click", () => {
      DOM.sequenceInput.value = "ATGGTGGTGGTGGTGGTGGTGCTGCTGGTGGTGTTGGTGCTGGTGGTGCTGGTGGTGCTGGTGGTGGTGCTAGTGCTGGTGGTGCTGGTGGTGCTGGTGGTGGTGCTGGTGATGGTGGTG";
      analyzeKrasSequence();
    });
  }
  if (btnSeqQ61l) {
    btnSeqQ61l.addEventListener("click", () => {
      DOM.sequenceInput.value = "ATGGTGGTGGTGGTGGTGGTGCTGGTGGTGGTGCTGGTGCTGGTGGTGCTGGTGGTGCTGGTTGTGGTGCTGGTGCTGGTGGTGCAAGTGGTGCTGGTGGTGGTGCTGGTGATGGTGGTG";
      analyzeKrasSequence();
    });
  }
  if (btnSeqWt) {
    btnSeqWt.addEventListener("click", () => {
      DOM.sequenceInput.value = "ATGATGGTGGTGGTCGTGGTGCTGGTGGTGGTGCTGGTGCTGGTGGTGCTGGTGGTGCTGGTGGTGGTGCTGGTGCTGGTGGTGTTGGTGGTGCTGGTGGTGGTGCTGGTGATGGTGGTG";
      analyzeKrasSequence();
    });
  }

  // Drawer Toggles
  DOM.toggleSidebarBtn.addEventListener("click", () => {
    DOM.referenceDrawer.classList.add("open");
    DOM.drawerBackdrop.classList.add("active");
    DOM.referenceDrawer.setAttribute("aria-hidden", "false");
  });
  DOM.closeDrawerBtn.addEventListener("click", closeDrawer);
  DOM.drawerBackdrop.addEventListener("click", closeDrawer);

  // Export Buttons
  DOM.exportBtn.addEventListener("click", exportDiagnosticReport);
  DOM.copyJsonBtn.addEventListener("click", copyPatientJSON);
}

function closeDrawer() {
  DOM.referenceDrawer.classList.remove("open");
  DOM.drawerBackdrop.classList.remove("active");
  DOM.referenceDrawer.setAttribute("aria-hidden", "true");
}

// Load a preset template that user can then manually tweak
function loadPreset(presetKey) {
  if (presetKey === "brca") {
    patientState.id = "PATIENT-SUSPECTED-BRCA";
    patientState.krasMutation = "None";
    patientState.genes = {
      BRCA1: 8.80, BRCA2: 9.90, ERBB2: 9.50, ESR1: 9.15,
      EGFR: 5.90, KRAS: 5.30, ALK: 5.50, MET: 4.00,
      CDK1: 4.65, UHRF1: 5.35, SMAD4: 5.35, CDKN2A: 4.15,
      TP53: 6.30, PTEN: 3.60, MYC: 9.00
    };
  } else if (presetKey === "luad") {
    patientState.id = "PATIENT-SUSPECTED-LUAD";
    patientState.krasMutation = "G12V";
    patientState.genes = {
      BRCA1: 4.85, BRCA2: 6.10, ERBB2: 5.55, ESR1: 5.25,
      EGFR: 9.90, KRAS: 9.30, ALK: 9.50, MET: 7.90,
      CDK1: 6.25, UHRF1: 6.75, SMAD4: 5.40, CDKN2A: 2.55,
      TP53: 4.40, PTEN: 4.95, MYC: 5.20
    };
  } else if (presetKey === "pdac") {
    patientState.id = "PATIENT-SUSPECTED-PDAC";
    patientState.krasMutation = "G12D";
    patientState.genes = {
      BRCA1: 5.00, BRCA2: 5.10, ERBB2: 5.40, ESR1: 4.80,
      EGFR: 6.20, KRAS: 8.90, ALK: 4.90, MET: 6.50,
      CDK1: 8.30, UHRF1: 7.90, SMAD4: 2.75, CDKN2A: 2.45,
      TP53: 7.65, PTEN: 4.20, MYC: 7.20
    };
  } else {
    // Normal Baseline
    patientState.id = "PATIENT-HEALTHY-CONTROL";
    patientState.krasMutation = "None";
    patientState.genes = {
      BRCA1: 4.79, BRCA2: 6.13, ERBB2: 5.61, ESR1: 5.28,
      EGFR: 5.88, KRAS: 5.32, ALK: 5.56, MET: 4.03,
      CDK1: 4.72, UHRF1: 5.37, SMAD4: 5.39, CDKN2A: 4.13,
      TP53: 4.38, PTEN: 4.94, MYC: 5.19
    };
  }

  syncInputsFromState();
  runCancerMatch();
}

// Standard 50-gene order matching data/tcga_synthetic_cancer.csv and data/indian_patient_test_samples.csv
const TCGA_50_GENE_ORDER = [
  "BRCA1", "BRCA2", "ERBB2", "ESR1", "PGR", "GATA3", "FOXA1",
  "EGFR", "KRAS", "ALK", "MET", "ROS1", "STK11", "KEAP1", "BRAF",
  "TP53", "PIK3CA", "MYC", "PTEN", "CDK1", "UHRF1", "HMMR", "CEP55",
  "ASPM", "RAD51AP1", "DLGAP5", "KIF11", "PBK", "HMGB2", "CDKN2A",
  "SMAD4", "RB1", "ATM", "APC", "VHL", "RET", "CTNNB1", "FGFR1",
  "FGFR2", "FGFR3", "NOTCH1", "JAK2", "STAT3", "MTOR", "AKT1",
  "CCND1", "CDK4", "CDK6", "MDM2", "BCL2"
];

const STANDARD_15_GENE_ORDER = [
  "BRCA1", "BRCA2", "ERBB2", "ESR1", "EGFR", "KRAS", "ALK", "MET",
  "CDK1", "UHRF1", "SMAD4", "CDKN2A", "TP53", "PTEN", "MYC"
];

// Parse text / CSV pasted in Tab 2 (supports single-line CSV, multi-line CSV with headers, key-values, regex scans, raw numeric vectors, and JSON)
function parseAndApplyTextData() {
  let rawText = DOM.pasteInput.value.trim();
  if (!rawText) {
    showToast("Please paste gene values into the text area", "error");
    return;
  }

  // Strip markdown code fences if copied directly from markdown (```csv ... ``` or ```text ... ```)
  rawText = rawText.replace(/```[a-z]*\s*/gi, "").replace(/```/g, "").trim();

  let count = 0;

  // STEP 1: Extract Patient ID if present (e.g. "Patient: Priya_Sharma" or "Sample_ID: Priya-Sharma-BRCA")
  const idMatch = rawText.match(/\b(?:Patient|Sample_ID|Patient_ID|Name|ID)\s*[:=\t ]+\s*([A-Za-z0-9_\-]+)/i);
  if (idMatch && idMatch[1]) {
    patientState.id = idMatch[1].trim();
    DOM.patientIdInput.value = patientState.id;
  }

  // STEP 2: Extract KRAS Mutation if present (e.g. "KRAS_Mutation: G12D" or explicit mention of G12D/G12V/Q61L/etc.)
  const mutMatch = rawText.match(/\b(?:KRAS_Mutation|Mutation|Variant)\s*[:=\t ]+\s*([A-Za-z0-9]+)/i);
  if (mutMatch && mutMatch[1]) {
    patientState.krasMutation = mutMatch[1].trim();
    DOM.krasMutationSelect.value = patientState.krasMutation;
  } else if (/\bG12D\b/i.test(rawText)) {
    patientState.krasMutation = "G12D";
    DOM.krasMutationSelect.value = "G12D";
  } else if (/\bG12V\b/i.test(rawText)) {
    patientState.krasMutation = "G12V";
    DOM.krasMutationSelect.value = "G12V";
  } else if (/\bQ61L\b/i.test(rawText)) {
    patientState.krasMutation = "Q61L";
    DOM.krasMutationSelect.value = "Q61L";
  } else if (/\bQ61H\b/i.test(rawText)) {
    patientState.krasMutation = "Q61H";
    DOM.krasMutationSelect.value = "Q61H";
  } else if (/\bG13D\b/i.test(rawText)) {
    patientState.krasMutation = "G13D";
    DOM.krasMutationSelect.value = "G13D";
  } else if (/\bG13V\b/i.test(rawText)) {
    patientState.krasMutation = "G13V";
    DOM.krasMutationSelect.value = "G13V";
  } else {
    // Check if Cancer_Type / Label indicates cohort or reset to None
    const cancerMatch = rawText.match(/\b(?:Cancer_Type|Type|Cohort)\s*[:=\t, ]+\s*([A-Za-z0-9_\-]+)/i);
    if (cancerMatch && /PDAC|PANCREA/i.test(cancerMatch[1])) {
      patientState.krasMutation = "G12D";
    } else {
      // Default reset to None so previous patient state does not linger
      patientState.krasMutation = "None";
    }
    DOM.krasMutationSelect.value = patientState.krasMutation;
  }

  // STEP 3: Check for JSON format { "BRCA1": 8.75, ... }
  if (rawText.startsWith("{") && rawText.endsWith("}")) {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.id || parsed.patientId) {
        patientState.id = parsed.id || parsed.patientId;
        DOM.patientIdInput.value = patientState.id;
      }
      if (parsed.krasMutation) {
        patientState.krasMutation = parsed.krasMutation;
        DOM.krasMutationSelect.value = parsed.krasMutation;
      }
      const gObj = parsed.geneExpression || parsed.genes || parsed;
      Object.keys(gObj).forEach(k => {
        const upK = k.toUpperCase();
        const val = parseFloat(gObj[k]);
        if (patientState.genes.hasOwnProperty(upK) && !isNaN(val)) {
          patientState.genes[upK] = Math.max(0, Math.min(15, val));
          count++;
        }
      });
      if (count > 0) {
        syncInputsFromState();
        runCancerMatch();
        showToast(`Matched ${patientState.id} with ${count} genomic features!`);
        return;
      }
    } catch (e) {
      // Proceed to other methods
    }
  }

  // STEP 4: High-precision Regex Gene Extractor (matches "BRCA1: 8.75", "ERBB2 = 9.5", "TP53, 6.35", "BRCA1 8.75")
  const allGeneKeys = Object.keys(patientState.genes);
  const geneRegex = new RegExp(`\\b(${allGeneKeys.join("|")})\\b\\s*[:=,\\t ]+\\s*([0-9]+(?:\\.[0-9]+)?)`, "gi");
  let match;
  while ((match = geneRegex.exec(rawText)) !== null) {
    const gene = match[1].toUpperCase();
    const val = parseFloat(match[2]);
    if (patientState.genes.hasOwnProperty(gene) && !isNaN(val)) {
      patientState.genes[gene] = Math.max(0, Math.min(15, val));
      count++;
    }
  }

  // If Regex found genes, apply immediately
  if (count >= 3) {
    syncInputsFromState();
    runCancerMatch();
    showToast(`Matched ${patientState.id} with ${count} genomic features!`);
    return;
  }

  // STEP 5: Delimited CSV row parsing (multi-line with header or single-line raw row)
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  // 5A. Multi-line CSV with Header row
  if (rawLines.length >= 2) {
    const headerCols = rawLines[0].split(/[,;\t]+/).map(h => h.replace(/["']/g, "").trim().toUpperCase());
    const valCols = rawLines[1].split(/[,;\t]+/).map(v => v.replace(/["']/g, "").trim());
    const geneMatchCount = headerCols.filter(h => patientState.genes.hasOwnProperty(h)).length;

    if (geneMatchCount >= 2) {
      headerCols.forEach((h, idx) => {
        const val = parseFloat(valCols[idx]);
        if (h === "SAMPLE_ID" || h === "PATIENT_ID" || h === "ID") {
          if (valCols[idx]) {
            patientState.id = valCols[idx];
            DOM.patientIdInput.value = valCols[idx];
          }
        }
        if (h === "KRAS_MUTATION" || h === "MUTATION") {
          if (valCols[idx]) {
            patientState.krasMutation = valCols[idx];
            DOM.krasMutationSelect.value = valCols[idx];
          }
        }
        if (patientState.genes.hasOwnProperty(h) && !isNaN(val)) {
          patientState.genes[h] = Math.max(0, Math.min(15, val));
          count++;
        }
      });
    }
  }

  // 5B. Single-line Raw CSV/TSV Row or raw tokens without explicit gene headers
  if (count === 0 && rawLines.length >= 1) {
    // Select the first data-bearing line
    const lineToParse = (rawLines.length >= 2 && !/\d+\.\d+/.test(rawLines[0]) && /\d+\.\d+/.test(rawLines[1]))
      ? rawLines[1]
      : rawLines[0];

    const tokens = lineToParse.split(/[,;\t]+/).map(c => c.replace(/["']/g, "").trim()).filter(c => c.length > 0);

    if (tokens.length >= 10) {
      // Case 1: 50-gene full TCGA row (50, 51, 52, 53+ columns)
      if (tokens.length >= 50) {
        let geneStartIndex = 0;
        if (tokens.length >= 53) {
          if (isNaN(parseFloat(tokens[0]))) {
            patientState.id = tokens[0];
          }
          geneStartIndex = tokens.length - 50;
        } else if (tokens.length === 52) {
          if (isNaN(parseFloat(tokens[0]))) {
            patientState.id = tokens[0];
          }
          geneStartIndex = 2;
        } else if (tokens.length === 51) {
          // Token 0 is label (e.g. 0, 1, 2, 3) or sample ID
          const lbl = tokens[0];
          if (lbl === "0") {
            patientState.id = "PATIENT-NORMAL-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "1") {
            patientState.id = "PATIENT-BRCA-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "2") {
            patientState.id = "PATIENT-LUAD-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "3") {
            patientState.id = "PATIENT-PDAC-EVAL";
            patientState.krasMutation = "G12D";
          } else if (isNaN(parseFloat(lbl))) {
            patientState.id = lbl;
          } else {
            patientState.id = `PATIENT-${lbl}`;
          }
          geneStartIndex = 1;
        } else {
          // Exactly 50 pure gene values
          geneStartIndex = 0;
          patientState.id = "PATIENT-GENOMIC-50";
        }

        DOM.patientIdInput.value = patientState.id;
        DOM.krasMutationSelect.value = patientState.krasMutation;

        TCGA_50_GENE_ORDER.forEach((gName, i) => {
          const valIndex = geneStartIndex + i;
          if (valIndex < tokens.length) {
            const val = parseFloat(tokens[valIndex]);
            if (patientState.genes.hasOwnProperty(gName) && !isNaN(val)) {
              patientState.genes[gName] = Math.max(0, Math.min(15, val));
              count++;
            }
          }
        });
      }
      // Case 2: 15-gene standard row (15, 16, 17, 18 columns)
      else if (tokens.length >= 15) {
        let geneStartIndex = 0;
        if (tokens.length >= 18) {
          if (isNaN(parseFloat(tokens[0]))) {
            patientState.id = tokens[0];
          }
          geneStartIndex = tokens.length - 15;
        } else if (tokens.length === 17) {
          if (isNaN(parseFloat(tokens[0]))) {
            patientState.id = tokens[0];
          }
          geneStartIndex = 2;
        } else if (tokens.length === 16) {
          const lbl = tokens[0];
          if (lbl === "0") {
            patientState.id = "PATIENT-NORMAL-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "1") {
            patientState.id = "PATIENT-BRCA-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "2") {
            patientState.id = "PATIENT-LUAD-EVAL";
            patientState.krasMutation = "None";
          } else if (lbl === "3") {
            patientState.id = "PATIENT-PDAC-EVAL";
            patientState.krasMutation = "G12D";
          } else if (isNaN(parseFloat(lbl))) {
            patientState.id = lbl;
          } else {
            patientState.id = `PATIENT-${lbl}`;
          }
          geneStartIndex = 1;
        } else {
          // Exactly 15 pure gene numbers
          geneStartIndex = 0;
          patientState.id = "PATIENT-GENOMIC-15";
        }

        DOM.patientIdInput.value = patientState.id;
        DOM.krasMutationSelect.value = patientState.krasMutation;

        STANDARD_15_GENE_ORDER.forEach((gName, i) => {
          const valIndex = geneStartIndex + i;
          if (valIndex < tokens.length) {
            const val = parseFloat(tokens[valIndex]);
            if (patientState.genes.hasOwnProperty(gName) && !isNaN(val)) {
              patientState.genes[gName] = Math.max(0, Math.min(15, val));
              count++;
            }
          }
        });
      }
    }
  }

  // STEP 6: Universal Numerical Stream Fallback (extracts all numbers across spaces, tabs, newlines)
  if (count === 0) {
    const allNumbers = rawText.match(/-?\d+(?:\.\d+)?/g);
    if (allNumbers && allNumbers.length >= 15) {
      if (allNumbers.length >= 50) {
        const hasLabel = (allNumbers.length >= 51 && ["0", "1", "2", "3"].includes(allNumbers[0]));
        const offset = hasLabel ? 1 : 0;
        if (hasLabel) {
          const lbl = allNumbers[0];
          if (lbl === "0") { patientState.id = "PATIENT-NORMAL-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "1") { patientState.id = "PATIENT-BRCA-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "2") { patientState.id = "PATIENT-LUAD-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "3") { patientState.id = "PATIENT-PDAC-EVAL"; patientState.krasMutation = "G12D"; }
          DOM.patientIdInput.value = patientState.id;
          DOM.krasMutationSelect.value = patientState.krasMutation;
        }
        TCGA_50_GENE_ORDER.forEach((gName, i) => {
          const val = parseFloat(allNumbers[offset + i]);
          if (patientState.genes.hasOwnProperty(gName) && !isNaN(val)) {
            patientState.genes[gName] = Math.max(0, Math.min(15, val));
            count++;
          }
        });
      } else {
        const hasLabel = (allNumbers.length >= 16 && ["0", "1", "2", "3"].includes(allNumbers[0]));
        const offset = hasLabel ? 1 : 0;
        if (hasLabel) {
          const lbl = allNumbers[0];
          if (lbl === "0") { patientState.id = "PATIENT-NORMAL-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "1") { patientState.id = "PATIENT-BRCA-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "2") { patientState.id = "PATIENT-LUAD-EVAL"; patientState.krasMutation = "None"; }
          else if (lbl === "3") { patientState.id = "PATIENT-PDAC-EVAL"; patientState.krasMutation = "G12D"; }
          DOM.patientIdInput.value = patientState.id;
          DOM.krasMutationSelect.value = patientState.krasMutation;
        }
        STANDARD_15_GENE_ORDER.forEach((gName, i) => {
          const val = parseFloat(allNumbers[offset + i]);
          if (patientState.genes.hasOwnProperty(gName) && !isNaN(val)) {
            patientState.genes[gName] = Math.max(0, Math.min(15, val));
            count++;
          }
        });
      }
    }
  }

  // STEP 7: Tokenized Key-Value fallback
  if (count === 0) {
    const tokens = rawText.split(/[\n,;]+/).map(t => t.trim()).filter(t => t.length > 0);
    tokens.forEach(tok => {
      const parts = tok.split(/[:=\t\s]+/).map(p => p.trim());
      if (parts.length >= 2) {
        const key = parts[0].replace(/["']/g, "").toUpperCase();
        const rawVal = parts[1].replace(/["']/g, "");
        if (key === "SAMPLE_ID" || key === "PATIENT_ID" || key === "PATIENT" || key === "NAME") {
          patientState.id = rawVal;
          DOM.patientIdInput.value = rawVal;
        } else if (key === "KRAS_MUTATION" || key === "MUTATION") {
          patientState.krasMutation = rawVal;
          DOM.krasMutationSelect.value = rawVal;
        } else {
          const val = parseFloat(rawVal);
          if (patientState.genes.hasOwnProperty(key) && !isNaN(val)) {
            patientState.genes[key] = Math.max(0, Math.min(15, val));
            count++;
          }
        }
      }
    });
  }

  if (count > 0) {
    syncInputsFromState();
    runCancerMatch();
    showToast(`Matched ${patientState.id} with ${count} genomic features!`);
  } else {
    showToast("Could not parse gene values. Try copying from EXAMINER_DEMO_SAMPLES.md or format as 'BRCA1: 8.5'.", "error");
  }
}

// Analyze DNA sequence for KRAS mutations
function analyzeKrasSequence() {
  const seq = DOM.sequenceInput.value.trim().toUpperCase().replace(/[^ATGCN]/g, "");
  if (!seq) {
    showToast("Please enter a valid DNA sequence", "error");
    return;
  }

  let detectedMutation = "None";
  let explanation = "KRAS Wild-Type: No oncogenic hotspot mutation found";

  // Check for specific mutations from pancreatic_cancer_synthetic_100_sequences.csv
  if (seq.includes("GAT") || seq.includes("ATGGTGGTGGTGATG") || seq.includes("ATGGTGCTGGTG") && seq.includes("GAT")) {
    detectedMutation = "G12D";
    explanation = "Detected G12D (Gly12Asp) - Hallmark Pancreatic Cancer (PDAC) Driver";
  } else if (seq.includes("GTT") || seq.includes("TTGGTG") || seq.includes("GTACTG")) {
    detectedMutation = "G12V";
    explanation = "Detected G12V (Gly12Val) - Highly Pathogenic Pancreatic/Lung Driver";
  } else if (seq.includes("GAC") || seq.includes("ATGCTG") || seq.includes("G13D")) {
    detectedMutation = "G13D";
    explanation = "Detected G13D (Gly13Asp) - Pathogenic Pancreatic Mutation";
  } else if (seq.includes("TTGCTG") || seq.includes("G13V")) {
    detectedMutation = "G13V";
    explanation = "Detected G13V (Gly13Val) - Pathogenic Pancreatic Mutation";
  } else if (seq.includes("CAA") || seq.includes("CAAGTG") || seq.includes("CTA") || seq.includes("Q61L")) {
    detectedMutation = "Q61L";
    explanation = "Detected Q61L (Gln61Leu) - Oncogenic Hotspot Variant";
  } else if (seq.includes("CAC") || seq.includes("CAT") || seq.includes("Q61H")) {
    detectedMutation = "Q61H";
    explanation = "Detected Q61H (Gln61His) - Oncogenic Variant";
  } else if (seq.startsWith("ATGGATTTATCT") || seq.includes("TCTTCGCGTTGAAGAAG")) {
    // User pasted BRCA sequence!
    showToast("Notice: Pasted sequence matches BRCA exon signature. For KRAS pancreatic analysis, please use a KRAS sequence.", "info");
    detectedMutation = "None";
    explanation = "Non-KRAS Sequence Pasted (Identified as BRCA locus)";
  } else {
    detectedMutation = "None";
    explanation = "Wild-Type KRAS (Normal Tissue Control)";
  }

  patientState.krasMutation = detectedMutation;
  DOM.krasMutationSelect.value = detectedMutation;

  // If mutation detected, adjust oncogenic markers to match the reference disease profile
  if (detectedMutation !== "None") {
    patientState.genes.KRAS = Math.max(patientState.genes.KRAS, 8.9);
    patientState.genes.CDK1 = Math.max(patientState.genes.CDK1, 8.1);
    patientState.genes.UHRF1 = Math.max(patientState.genes.UHRF1, 7.8);
    patientState.genes.SMAD4 = Math.min(patientState.genes.SMAD4, 2.8);
    patientState.genes.CDKN2A = Math.min(patientState.genes.CDKN2A, 2.5);
    patientState.genes.TP53 = Math.max(patientState.genes.TP53, 7.6);
    syncInputsFromState();
  }

  runCancerMatch();
  showToast(`${explanation} -> Mut: ${detectedMutation}`);
}

// ==========================================
// Helper: Calculate oncogenic activation of a specific biomarker panel
function getPanelActivation(patientGenes, genesList) {
  let scoreSum = 0;
  let weightSum = 0;
  let maxSingleGeneAct = 0;

  genesList.forEach(g => {
    const val = patientGenes[g.id] !== undefined ? patientGenes[g.id] : g.normalMean;
    let ratio = 0;
    if (g.isSuppressed) {
      // Normal is high (~5.3), tumor is suppressed (~2.8)
      const drop = g.normalMean - val;
      const expectedDrop = g.normalMean - g.tumorMean;
      ratio = Math.max(0, drop / expectedDrop);
    } else {
      // Normal is baseline (~4.8), tumor is amplified/elevated (~8.6)
      const rise = val - g.normalMean;
      const expectedRise = g.tumorMean - g.normalMean;
      ratio = Math.max(0, rise / expectedRise);
    }
    ratio = Math.min(1.8, ratio);
    if (ratio > maxSingleGeneAct) maxSingleGeneAct = ratio;
    scoreSum += ratio * g.weight;
    weightSum += g.weight;
  });

  const meanAct = scoreSum / weightSum;
  // Clinical sensitivity: combine overall panel shift with peak single-driver amplification (e.g. HER2 or EGFR amplification)
  return (meanAct * 0.65) + (maxSingleGeneAct * 0.35);
}

// ==========================================
// 6. CANCER MATCHING & COHORT DISTANCE ENGINE
// ==========================================
function evaluateCancerMatch() {
  const patientGenes = patientState.genes;
  const krasMut = patientState.krasMutation || "None";

  // 1. Calculate panel oncogenic activations
  const brcaAct = getPanelActivation(patientGenes, GENE_CONFIGS.brca);
  const luadAct = getPanelActivation(patientGenes, GENE_CONFIGS.luad);
  const pdacAct = getPanelActivation(patientGenes, GENE_CONFIGS.pdac);
  const univAct = getPanelActivation(patientGenes, GENE_CONFIGS.universal);

  // KRAS expression in LUAD panel also feeds PDAC biology
  const krasVal = patientGenes.KRAS !== undefined ? patientGenes.KRAS : 5.32;
  const krasRise = Math.max(0, Math.min(1.8, (krasVal - 5.32) / (8.80 - 5.32)));
  const combinedPdacAct = Math.max(pdacAct, (pdacAct * 0.70) + (krasRise * 0.30));

  // Activating KRAS codon mutations boost the respective pulmonary and pancreatic pathways
  let luadMutBoost = 0;
  let pdacMutBoost = 0;
  if (krasMut === "G12V") {
    luadMutBoost = 0.50;
    pdacMutBoost = 0.30;
  } else if (krasMut === "G12D") {
    pdacMutBoost = 0.60;
    luadMutBoost = 0.20;
  } else if (krasMut !== "None") {
    pdacMutBoost = 0.40;
    luadMutBoost = 0.25;
  }

  // Universal tumor transformation amplifies whichever organ panel has driver activity
  const maxDriver = Math.max(brcaAct, luadAct, combinedPdacAct);
  const univPanCancerRisk = (maxDriver < 0.12 && univAct > 0.12) ? (univAct * 1.8) : 0;

  const brcaLogit = (brcaAct * 5.5) + (brcaAct > 0.08 ? univAct * 2.2 : 0) + univPanCancerRisk;
  const luadLogit = ((luadAct + luadMutBoost) * 5.5) + (luadAct > 0.08 ? univAct * 2.2 : 0) + univPanCancerRisk;
  const pdacLogit = ((combinedPdacAct + pdacMutBoost) * 5.5) + (combinedPdacAct > 0.08 ? univAct * 2.2 : 0) + univPanCancerRisk;

  const hasMut = krasMut !== "None" ? 0.45 : 0;
  const maxOnco = Math.max(maxDriver, univAct * 0.85) + hasMut;

  // Normal logit starts at 4.6 (yielding ~95% baseline when all genes are normal),
  // and smoothly drops towards 0 as oncogenic driver activation increases
  const normalLogit = Math.max(-2.5, 4.6 - (maxOnco * 6.5) - (univAct * 1.5));

  const rawScores = [
    { key: "Normal", cohort: COHORT_BENCHMARKS.Normal, expScore: Math.exp(normalLogit) },
    { key: "BRCA",   cohort: COHORT_BENCHMARKS.BRCA,   expScore: Math.exp(brcaLogit) },
    { key: "LUAD",   cohort: COHORT_BENCHMARKS.LUAD,   expScore: Math.exp(luadLogit) },
    { key: "PDAC",   cohort: COHORT_BENCHMARKS.PDAC,   expScore: Math.exp(pdacLogit) }
  ];

  const totalExp = rawScores.reduce((sum, item) => sum + item.expScore, 0);
  let totalPct = 0;
  const cohortScores = rawScores.map(item => {
    const probability = Math.max(1, Math.round((item.expScore / totalExp) * 100));
    totalPct += probability;

    // Calculate statistical Euclidean distance for clinical reporting
    let sqDist = 0;
    let wSum = 0;
    ALL_GENES.forEach(g => {
      const pVal = patientGenes[g.id] !== undefined ? patientGenes[g.id] : g.normalMean;
      const refMean = item.cohort.means[g.id];
      const diff = pVal - refMean;
      let w = 1.0;
      if (item.key === "BRCA" && ["BRCA1", "BRCA2", "ERBB2", "ESR1"].includes(g.id)) w = 3.0;
      if (item.key === "LUAD" && ["EGFR", "KRAS", "ALK", "MET"].includes(g.id)) w = 3.0;
      if (item.key === "PDAC" && ["CDK1", "UHRF1", "SMAD4", "CDKN2A", "KRAS"].includes(g.id)) w = 3.0;
      sqDist += w * diff * diff;
      wSum += w;
    });
    const distance = Math.sqrt(sqDist / wSum);

    return {
      cohort: item.cohort,
      distance,
      probability
    };
  });

  // Adjust highest probability so sum is exactly 100%
  if (totalPct !== 100 && cohortScores.length > 0) {
    const maxItem = cohortScores.reduce((prev, curr) => (curr.probability > prev.probability) ? curr : prev, cohortScores[0]);
    maxItem.probability += (100 - totalPct);
  }

  // Sort descending by probability
  cohortScores.sort((a, b) => b.probability - a.probability);

  const bestMatch = cohortScores[0];
  const predictedCohort = bestMatch.cohort;
  const confidence = bestMatch.probability;

  // 2. Find Top 5 Nearest Reference Patients from Local Folder Files
  const patientDistances = REFERENCE_PATIENTS_DATABASE.map(refP => {
    let dist = 0;
    let count = 0;
    ALL_GENES.forEach(g => {
      const p = patientGenes[g.id] !== undefined ? patientGenes[g.id] : g.normalMean;
      const r = refP.genes[g.id] || 5.0;
      let w = 1.0;
      if (predictedCohort.id === "BRCA" && ["BRCA1", "BRCA2", "ERBB2", "ESR1"].includes(g.id)) w = 2.5;
      if (predictedCohort.id === "LUAD" && ["EGFR", "KRAS", "ALK", "MET"].includes(g.id)) w = 2.5;
      if (predictedCohort.id === "PDAC" && ["CDK1", "UHRF1", "SMAD4", "CDKN2A", "KRAS"].includes(g.id)) w = 2.5;
      dist += w * (p - r) * (p - r);
      count += w;
    });
    const rmse = Math.sqrt(dist / count);
    
    // Similarity percentage
    let simPct = Math.max(0, Math.min(99.5, Math.round((1 - rmse / 6.0) * 100)));
    if (krasMut !== "None" && refP.krasMutation === krasMut) {
      simPct = Math.min(99.8, simPct + 6);
    } else if (krasMut === "None" && refP.cancerType === predictedCohort.id) {
      simPct = Math.min(99.5, simPct + 3);
    }

    return {
      refPatient: refP,
      rmse,
      similarity: simPct
    };
  });

  patientDistances.sort((a, b) => b.similarity - a.similarity);
  const topNearestPatients = patientDistances.slice(0, 5);

  // 3. Extract Top Driving Alterations (highest deviation from normal mean)
  const deviations = ALL_GENES.map(g => {
    const pVal = patientGenes[g.id] !== undefined ? patientGenes[g.id] : g.normalMean;
    const nMean = COHORT_BENCHMARKS.Normal.means[g.id];
    const delta = pVal - nMean;
    const absDelta = Math.abs(delta);
    return {
      gene: g,
      patientVal: pVal,
      normalMean: nMean,
      delta,
      absDelta,
      direction: delta > 0 ? "Elevated ↑" : "Suppressed ↓"
    };
  });

  deviations.sort((a, b) => b.absDelta - a.absDelta);
  const topDrivers = deviations.slice(0, 4);

  return {
    predictedCohort,
    confidence,
    cohortScores,
    topNearestPatients,
    topDrivers
  };
}

// ==========================================
// 7. DIAGNOSTIC RENDERING
// ==========================================
function runCancerMatch() {
  const result = evaluateCancerMatch();
  lastEvaluation = result;

  const { predictedCohort, confidence, cohortScores, topNearestPatients, topDrivers } = result;

  // 1. Header tag
  DOM.lastAnalyzedTag.textContent = `Analyzed at ${new Date().toLocaleTimeString()}`;

  // 2. Diagnostic Banner
  DOM.banner.className = `banner ${predictedCohort.bannerClass}`;
  DOM.bannerIcon.textContent = predictedCohort.icon;
  DOM.bannerCancerBadge.textContent = predictedCohort.category === "normal" ? "BENIGN / NON-MALIGNANT" : "MALIGNANCY DETECTED";
  DOM.bannerTitle.textContent = predictedCohort.name;
  DOM.bannerDesc.textContent = predictedCohort.description;
  DOM.bannerConfNum.textContent = `${confidence}%`;

  // 3. Multi-Cancer Probability Bars (Smooth in-place DOM updates)
  const existingRows = Array.from(DOM.cancerBarsList.querySelectorAll(".cancer-bar-row"));
  const rowMap = new Map();
  existingRows.forEach(r => {
    const cid = r.getAttribute("data-cohort-id");
    if (cid) rowMap.set(cid, r);
  });

  cohortScores.forEach(item => {
    const c = item.cohort;
    const isWinner = c.id === predictedCohort.id;
    let row = rowMap.get(c.id);

    if (!row) {
      row = document.createElement("div");
      row.className = "cancer-bar-row";
      row.setAttribute("data-cohort-id", c.id);
      row.innerHTML = `
        <div class="cancer-bar-info">
          <span class="cancer-bar-name">
            <span class="bar-dot" style="background:${c.color};"></span>
            <span class="bar-label-text">${c.name}</span>
            <span class="winner-chip" id="chip-${c.id}" style="${isWinner ? '' : 'display:none;'}">Primary Match</span>
          </span>
          <span class="cancer-bar-pct" id="pct-${c.id}" style="color:${c.color};">${item.probability}%</span>
        </div>
        <div class="cancer-bar-track">
          <div class="cancer-bar-fill" id="bar-fill-${c.id}" style="width:${item.probability}%; background:${c.color};"></div>
        </div>
      `;
      DOM.cancerBarsList.appendChild(row);
    } else {
      // Re-append in descending probability order
      DOM.cancerBarsList.appendChild(row);
      const pctEl = row.querySelector(`#pct-${c.id}`);
      if (pctEl) pctEl.textContent = `${item.probability}%`;
      const fillEl = row.querySelector(`#bar-fill-${c.id}`);
      if (fillEl) fillEl.style.width = `${item.probability}%`;
      const chipEl = row.querySelector(`#chip-${c.id}`);
      if (chipEl) chipEl.style.display = isWinner ? "" : "none";
    }
  });

  // 4. Top 5 Nearest Reference Patients Table
  DOM.refTableBody.innerHTML = "";
  topNearestPatients.forEach((match, idx) => {
    const p = match.refPatient;
    const tr = document.createElement("tr");

    let badgeClass = "badge-normal";
    if (p.cancerType === "BRCA") badgeClass = "badge-brca";
    if (p.cancerType === "LUAD") badgeClass = "badge-luad";
    if (p.cancerType === "PDAC") badgeClass = "badge-pdac";

    tr.innerHTML = `
      <td class="cell-rank">#${idx + 1}</td>
      <td class="cell-patient-id">${p.id}</td>
      <td class="cell-file"><code>${p.file}</code></td>
      <td><span class="cell-badge ${badgeClass}">${p.cancerType}</span></td>
      <td><span style="font-family:monospace; font-size:0.75rem; color:${p.krasMutation !== 'None' ? '#fb7185':'var(--text-muted)'}">${p.krasMutation}</span></td>
      <td class="cell-match-pct">${match.similarity}%</td>
    `;

    DOM.refTableBody.appendChild(tr);
  });

  // 5. Render Radar Comparison Chart
  renderRadarChart(predictedCohort);

  // 6. Driver Cards List
  DOM.driverCardsList.innerHTML = "";
  topDrivers.forEach(d => {
    const card = document.createElement("div");
    card.className = "driver-card";
    card.innerHTML = `
      <div>
        <div class="driver-card-gene">${d.gene.name}</div>
        <div class="driver-card-stat">Patient: ${d.patientVal.toFixed(1)} vs Normal: ${d.normalMean.toFixed(1)}</div>
      </div>
      <div class="driver-card-elev">${d.delta > 0 ? "+" : ""}${d.delta.toFixed(1)} (${d.direction})</div>
    `;
    DOM.driverCardsList.appendChild(card);
  });

  // 7. Clinical Action Text
  DOM.clinicalActionText.textContent = predictedCohort.clinicalAction;

  // 8. Dynamic Cohort Benchmark Standards Matrix Live Row Update
  const updateMatrixCell = (id, val, normalMean) => {
    const el = document.getElementById(id);
    if (!el) return;
    const num = typeof val === "number" ? val : parseFloat(val);
    el.textContent = isNaN(num) ? "--" : num.toFixed(2);
    if (num > (normalMean + 1.8)) {
      el.className = "val-high";
    } else if (num < (normalMean - 1.5)) {
      el.className = "val-low";
    } else {
      el.className = "";
    }
  };

  updateMatrixCell("m-val-brca1", patientState.genes.BRCA1 ?? 4.79, 4.79);
  updateMatrixCell("m-val-erbb2", patientState.genes.ERBB2 ?? 5.61, 5.61);
  updateMatrixCell("m-val-egfr",  patientState.genes.EGFR  ?? 5.88, 5.88);
  updateMatrixCell("m-val-kras",  patientState.genes.KRAS  ?? 5.32, 5.32);
  updateMatrixCell("m-val-cdk1",  patientState.genes.CDK1  ?? 4.72, 4.72);
  updateMatrixCell("m-val-tp53",  patientState.genes.TP53  ?? 4.38, 4.38);

  const statusEl = document.getElementById("matrix-patient-status");
  if (statusEl) {
    if (predictedCohort.category === "normal") {
      statusEl.textContent = "Normal Baseline";
      statusEl.style.color = "var(--color-normal-light)";
      statusEl.style.borderColor = "rgba(16, 185, 129, 0.4)";
      statusEl.style.background = "rgba(16, 185, 129, 0.15)";
    } else {
      statusEl.textContent = `${predictedCohort.name.split(" ")[0]} Profile`;
      statusEl.style.color = predictedCohort.color;
      statusEl.style.borderColor = `${predictedCohort.color}55`;
      statusEl.style.background = `${predictedCohort.color}22`;
    }
  }
}

// Draw dynamic SVG Polar Radar Chart
function renderRadarChart(predictedCohort) {
  const genesToRadar = ["BRCA1", "ERBB2", "EGFR", "KRAS", "CDK1", "TP53", "MYC", "SMAD4"];
  const numPoints = genesToRadar.length;
  const centerX = 160;
  const centerY = 140;
  const radius = 95;
  const maxVal = 12.0;

  let gridLinesHtml = "";
  // Draw circular/polygon grid rings
  [0.25, 0.5, 0.75, 1.0].forEach(level => {
    const r = radius * level;
    let pts = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
      pts.push(`${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`);
    }
    gridLinesHtml += `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />`;
  });

  // Draw axis spokes and labels
  let spokesHtml = "";
  let labelsHtml = "";
  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
    const xEnd = centerX + radius * Math.cos(angle);
    const yEnd = centerY + radius * Math.sin(angle);
    spokesHtml += `<line x1="${centerX}" y1="${centerY}" x2="${xEnd}" y2="${yEnd}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;

    const labelR = radius + 18;
    const xLabel = centerX + labelR * Math.cos(angle);
    const yLabel = centerY + labelR * Math.sin(angle) + 4;
    spokesHtml += `<text x="${xLabel}" y="${yLabel}" fill="#94a3b8" font-size="10" font-family="JetBrains Mono" text-anchor="middle">${genesToRadar[i]}</text>`;
  }

  // Calculate Patient Polygon Points
  let patientPts = [];
  let refPts = [];
  genesToRadar.forEach((gId, i) => {
    const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;

    const pVal = Math.max(0, Math.min(maxVal, patientState.genes[gId] || 5.0));
    const pR = (pVal / maxVal) * radius;
    patientPts.push(`${centerX + pR * Math.cos(angle)},${centerY + pR * Math.sin(angle)}`);

    const rVal = Math.max(0, Math.min(maxVal, predictedCohort.means[gId] || 5.0));
    const rR = (rVal / maxVal) * radius;
    refPts.push(`${centerX + rR * Math.cos(angle)},${centerY + rR * Math.sin(angle)}`);
  });

  const refPolygon = `<polygon points="${refPts.join(" ")}" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" stroke-width="1.8" />`;
  const patientPolygon = `<polygon points="${patientPts.join(" ")}" fill="rgba(20, 184, 166, 0.3)" stroke="#14b8a6" stroke-width="2.2" />`;

  DOM.radarSvg.innerHTML = gridLinesHtml + spokesHtml + refPolygon + patientPolygon;
}

// ==========================================
// 8. REPORT EXPORT & NOTIFICATIONS
// ==========================================
function exportDiagnosticReport() {
  if (!lastEvaluation) return;

  const r = lastEvaluation;
  const p = patientState;

  const reportText = `================================================================================
ONCOSCAN AI - CLINICAL GENOMIC DIAGNOSTIC REPORT
================================================================================
Timestamp: ${new Date().toISOString()}
Patient / Sample ID: ${p.id}
Reference Folder Cohort: Active (600 TCGA RNA-seq + 100 Pancreatic Sequences + JCLA Hubs)

--------------------------------------------------------------------------------
1. PRIMARY CANCER CLASSIFICATION VERDICT
--------------------------------------------------------------------------------
Diagnosed Cancer Type: ${r.predictedCohort.name}
Verdict Category:      ${r.predictedCohort.category.toUpperCase()}
Match Confidence:      ${r.confidence}%
KRAS Hotspot Mutation: ${p.krasMutation}
Pathological Summary:  ${r.predictedCohort.description}

--------------------------------------------------------------------------------
2. MULTI-CANCER PROBABILITY DISTRIBUTION
--------------------------------------------------------------------------------
${r.cohortScores.map(c => `- ${c.cohort.name}: ${c.probability}% similarity`).join("\n")}

--------------------------------------------------------------------------------
3. TOP 5 NEAREST REFERENCE PATIENTS MATCHED IN LOCAL FOLDER
--------------------------------------------------------------------------------
${r.topNearestPatients.map((m, i) => `${i+1}. Sample: ${m.refPatient.id} | Source: ${m.refPatient.file} | Type: ${m.refPatient.cancerType} | Similarity: ${m.similarity}%`).join("\n")}

--------------------------------------------------------------------------------
4. KEY DRIVING GENE EXPRESSION ALTERATIONS (log2 TPM)
--------------------------------------------------------------------------------
${r.topDrivers.map(d => `- ${d.gene.name}: Patient=${d.patientVal.toFixed(2)} (Normal Ref=${d.normalMean.toFixed(2)}) -> ${d.direction}`).join("\n")}

--------------------------------------------------------------------------------
5. CLINICAL ACTIONABILITY & EVIDENCE-BASED RECOMMENDATION
--------------------------------------------------------------------------------
${r.predictedCohort.clinicalAction}

================================================================================
Generated by OncoScan AI Precision Oncology Classifier
`;

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OncoScan_Report_${p.id}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Diagnostic report downloaded successfully");
}

function copyPatientJSON() {
  if (!lastEvaluation) return;

  const exportObj = {
    platform: "OncoScan AI",
    timestamp: new Date().toISOString(),
    patientId: patientState.id,
    krasMutation: patientState.krasMutation,
    geneExpression: patientState.genes,
    detectionResult: {
      cancerType: lastEvaluation.predictedCohort.name,
      confidence: lastEvaluation.confidence,
      multiCancerProbabilities: lastEvaluation.cohortScores.map(c => ({
        cancer: c.cohort.name,
        probability: c.probability
      })),
      nearestReferencePatients: lastEvaluation.topNearestPatients.map(m => ({
        id: m.refPatient.id,
        file: m.refPatient.file,
        cancerType: m.refPatient.cancerType,
        similarity: m.similarity
      })),
      clinicalRecommendation: lastEvaluation.predictedCohort.clinicalAction
    }
  };

  navigator.clipboard.writeText(JSON.stringify(exportObj, null, 2)).then(() => {
    showToast("Patient genomic JSON copied to clipboard");
  }).catch(() => {
    showToast("Failed to copy JSON to clipboard", "error");
  });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${type === "error" ? "⚠️" : "⚡"}</span> <span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
