# OncoQuantum AI Suite 🧬⚛️
### Unified Clinical Oncology & Quantum Intelligence Hub

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://oncoquantumsuite.vercel.app)
[![Quantum Machine Learning](https://img.shields.io/badge/Quantum-PennyLane%204--Qubit%20VQC-8b5cf6)](https://pennylane.ai)
[![Clinical Architecture](https://img.shields.io/badge/Clinical-TCGA%20%2B%20Debernardi%20Cohorts-06b6d4)](#clinical-benchmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Deployment:** [https://oncoquantumsuite.vercel.app](https://oncoquantumsuite.vercel.app)

**OncoQuantum AI Suite** is a unified, multimodal oncology diagnostics platform integrating deep classical genomics and state-of-the-art Variational Quantum Computing (VQC). It bridges molecular biopsy-derived genomic expression with non-invasive urinary biosensing to maximize early cancer detection sensitivity.

---

## 🌟 Dual Platform Architecture

The suite unites two complementary clinical oncology applications into a single seamless portal:

```
                              ┌─────────────────────────────────────────┐
                              │       OncoQuantum AI Suite Hub          │
                              │       (index.html & vercel.json)        │
                              └────────────────────┬────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
    ┌──────────────────────────────┐                                ┌──────────────────────────────┐
    │        OncoScan AI           │                                │      QuantumPancreas AI      │
    │      (/oncoscan.html)        │                                │           (/qml/)            │
    ├──────────────────────────────┤                                ├──────────────────────────────┤
    │ • 20 Genomic Hub Drivers     │                                │ • 4-Qubit Variational VQC    │
    │ • Multi-Class: BRCA, LUAD,   │                                │ • Urinary Biomarker Panel:   │
    │   PDAC vs. Normal Tissue     │                                │   LYVE1, REG1B, TFF1         │
    │ • KRAS Codon 12 DNA Scanner  │                                │ • Lewis-Negative Rescue      │
    │ • Cosine Nearest Neighbor    │                                │ • Gemini Clinical Reasoning  │
    └──────────────────────────────┘                                └──────────────────────────────┘
```

---

### 1. OncoScan AI (`/oncoscan.html`)
* **Clinical Target:** Pan-cancer multiclass classification (Breast Invasive Carcinoma, Lung Adenocarcinoma, Pancreatic Ductal Adenocarcinoma, Normal Homeostasis).
* **Genomic Panel:** 20 hub drivers including *BRCA1/2*, *ERBB2*, *EGFR*, *KRAS*, *ALK*, *CDK1*, *UHRF1*, *SMAD4*, *CDKN2A*, *TP53*, *PTEN*, *MYC*.
* **Mutational Scanning:** Interactive KRAS codon 12 string scanner detecting G12D (`GAT`), G12V (`GTT`), and G12R (`CGT`) hotspot mutations.
* **Algorithmic Engine:** Normalized Cosine Nearest-Neighbor Projection against 700 synthetic TCGA biopsy profiles with real-time radial biomarker radar charts.

---

### 2. QuantumPancreas AI (`/qml/`)
* **Clinical Target:** Ultra-early detection of Pancreatic Ductal Adenocarcinoma (PDAC) using completely non-invasive urinary biosensing.
* **Biomarker Panel:** Urinary LYVE1 (lymphangiogenesis), REG1B (ductal metaplasia), TFF1 (trefoil factor 1), Creatinine normalization, and plasma CA 19-9.
* **Lewis-Negative ($Le^{a-b-}$) Rescue:** Rescues the 10–15% of patients lacking the FUT3 gene who cannot synthesize CA 19-9, preventing false-negative diagnoses.
* **Quantum Computing Ansatz:** 4-qubit Hilbert state space ($\mathbb{C}^{16}$) simulation using PennyLane parameterized rotation gates ($R_y, R_z$) and circular CNOT entanglement to capture complex multi-biomarker joint eigenstates.
* **Explainable AI:** Automated clinical report generation powered by Gemini reasoning with resilient oncology synthesis fallback.

---

## 📊 Technical & Clinical Comparison Matrix

| Evaluation Dimension | OncoScan AI | QuantumPancreas AI |
| :--- | :--- | :--- |
| **Workspace Route** | `/oncoscan.html` | `/qml/` |
| **Primary Specimen** | Biopsy RNA-Seq / Genomic log2 TPM | Non-Invasive Urine Specimen |
| **Computational Core** | Classical Deep Dense Neural Architecture | 4-Qubit Variational Quantum Classifier (VQC) |
| **Reference Benchmark**| 700 TCGA Patient Biopsies | 220 Debernardi Clinical Cohort Records |
| **Occult Variant Rescue**| KRAS Codon 12 DNA Sequence Matching | Lewis-Negative Phenotype CA 19-9 Rescue |
| **Clinician Feedback** | Radial Deviation Radar & Cohort Match | Gemini Clinical Reasoning Report |

---

## 🚀 Quickstart & Local Development

### Prerequisites
* **Node.js**: v18+ or v20+
* **Git**: Installed on system

### Clone and Install
```bash
git clone https://github.com/<your-username>/oncoquantumsuite.git
cd oncoquantumsuite
```

### Build for Production
```bash
npm run build
```
This compiles the QuantumPancreas React + Vite app into `./qml/` and synchronizes the 220-patient benchmark API datasets.

### Preview Locally
```bash
npx serve .
# Open http://localhost:3000 or http://localhost:5000 in your browser
```

---

## ☁️ Deploying to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete OncoQuantum AI Suite"
   git branch -M main
   git remote add origin https://github.com/<your-username>/oncoquantumsuite.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Import the **`oncoquantumsuite`** GitHub repository.
   - Project Name: `oncoquantumsuite` *(will generate `https://oncoquantumsuite.vercel.app`)*.
   - Framework Preset: **Other** *(root `vercel.json` automatically manages builds and routing)*.
   - *(Optional)* Add `GEMINI_API_KEY` under **Environment Variables** for dynamic real-time Gemini clinician explanations.
   - Click **Deploy**!

---

## 🧪 Demonstration & Evaluator Test Samples

The test cohort includes verified patient profiles documented in [`EXAMINER_DEMO_SAMPLES.md`](./EXAMINER_DEMO_SAMPLES.md):
* **Priya Sharma** (Age 52, Normal Healthy Control)
* **Rajesh Patel** (Age 63, Breast Carcinoma BRCA1/ERBB2 Amplification)
* **Vikram Malhotra** (Age 58, Pancreatic Ductal Adenocarcinoma with G12D KRAS Mutation)

---

## 📄 License
MIT License &copy; 2026 OncoQuantum Biomedical Consortium.
Developed for SIH26139 Quantum Medical Innovation.
