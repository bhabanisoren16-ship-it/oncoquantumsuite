# OncoQuantum AI Suite &bull; Unified Demonstration & Patient Test Cases

Welcome to the unified oncology evaluation suite. Use this guide to demonstrate live cancer detection to the examiner:
* **Central Oncology Portal (Selection Hub)**: **[http://localhost:8080](http://localhost:8080)** (or `index.html`)
* **Platform 1 (OncoScan AI - Genomic Pan-Cancer)**: **[http://localhost:8080/oncoscan.html](http://localhost:8080/oncoscan.html)**
* **Platform 2 (QuantumPancreas AI - Hybrid 4-Qubit QML)**: **[http://localhost:3000](http://localhost:3000)**

---

## Patient 1: Priya Sharma (Breast Cancer &bull; BRCA)

* **Clinical Profile**: 48-year-old female presenting with palpable left breast lesion.
* **Genomic Signature**: Markedly elevated $BRCA1$, $BRCA2$, $ERBB2$ (HER2), and $ESR1$ (Estrogen Receptor).
* **Expected Disease Result**: **Breast Invasive Carcinoma (BRCA)** (~83%–95% probability).
* **Nearest Cohort Match**: `TCGA-BRCA-001` (Similarity: ~98%).

### Copy & Paste String (Full CSV Format):
```csv
Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,PGR,GATA3,FOXA1,EGFR,KRAS,ALK,MET,ROS1,STK11,KEAP1,BRAF,TP53,PIK3CA,MYC,PTEN,CDK1,UHRF1,HMMR,CEP55,ASPM,RAD51AP1,DLGAP5,KIF11,PBK,HMGB2,CDKN2A,SMAD4,RB1,ATM,APC,VHL,RET,CTNNB1,FGFR1,FGFR2,FGFR3,NOTCH1,JAK2,STAT3,MTOR,AKT1,CCND1,CDK4,CDK6,MDM2,BCL2
Priya-Sharma-BRCA,BRCA,1,8.7500,9.8500,9.5000,9.2000,9.6500,9.6000,9.4500,3.8500,5.6500,4.6000,6.1000,4.5500,5.1500,4.4500,5.2500,8.1000,5.9000,8.2500,2.7000,6.4500,5.1500,3.7500,5.2000,6.3500,4.3500,4.2000,5.6500,3.9500,5.9500,6.3500,4.8000,4.9500,4.4000,4.0500,4.3500,4.5000,3.1000,5.6500,5.9500,5.3000,6.8500,5.2500,5.2000,3.9500,5.4500,8.7500,6.4500,5.7000,5.3500,4.8500
```

### Quick Key-Value Copy:
```text
Patient: Priya_Sharma, BRCA1: 8.75, BRCA2: 9.85, ERBB2: 9.50, ESR1: 9.20, EGFR: 5.85, KRAS: 5.30, CDK1: 4.65, TP53: 6.35, PTEN: 3.60, MYC: 9.10
```

---

## Patient 2: Rajesh Patel (Lung Cancer &bull; LUAD)

* **Clinical Profile**: 56-year-old male with persistent cough and pulmonary nodule on low-dose CT.
* **Genomic Signature**: Hyper-activated receptor tyrosine kinase oncogenes: $EGFR$, $KRAS$, $ALK$, and $MET$.
* **Expected Disease Result**: **Lung Adenocarcinoma (LUAD)** (~83%–95% probability).
* **Nearest Cohort Match**: `TCGA-LUAD-003` (Similarity: ~97%).

### Copy & Paste String (Full CSV Format):
```csv
Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,PGR,GATA3,FOXA1,EGFR,KRAS,ALK,MET,ROS1,STK11,KEAP1,BRAF,TP53,PIK3CA,MYC,PTEN,CDK1,UHRF1,HMMR,CEP55,ASPM,RAD51AP1,DLGAP5,KIF11,PBK,HMGB2,CDKN2A,SMAD4,RB1,ATM,APC,VHL,RET,CTNNB1,FGFR1,FGFR2,FGFR3,NOTCH1,JAK2,STAT3,MTOR,AKT1,CCND1,CDK4,CDK6,MDM2,BCL2
Rajesh-Patel-LUAD,LUAD,2,5.4000,4.7500,4.7500,6.1000,5.1000,5.3000,3.7500,9.2000,9.8500,9.8500,9.8000,7.3000,8.9000,10.3000,9.5000,5.2000,3.8000,5.3500,5.4000,6.6000,6.5000,6.1500,4.5000,5.7500,5.8500,3.8000,6.3000,4.3000,4.9000,4.2500,4.7000,5.2500,4.9500,4.4000,4.6500,4.5500,5.7500,4.4500,4.6500,7.0000,5.6500,5.9500,6.2500,5.7500,4.7500,5.9000,5.5000,5.0000,8.1000,6.5000
```

### Quick Key-Value Copy:
```text
Patient: Rajesh_Patel, EGFR: 9.95, KRAS: 9.35, ALK: 9.55, MET: 7.90, CDK1: 6.25, UHRF1: 6.75, CDKN2A: 2.55, TP53: 4.40, PTEN: 4.95, MYC: 5.20
```

---

## Patient 3: Vikram Malhotra (Pancreatic Cancer &bull; PDAC)

* **Clinical Profile**: 61-year-old male presenting with painless jaundice and elevated serum CA 19-9.
* **Genomic Signature**: $KRAS\text{ G12D}$ hotspot alteration, elevated $CDK1$ & $UHRF1$, loss of $SMAD4$ & $CDKN2A$ suppression.
* **Expected Disease Result**: **Pancreatic Ductal Adenocarcinoma (PDAC)** (~86%–96% probability).
* **Nearest Cohort Match**: `S051 (KRAS G12D)` (Similarity: ~99%).

### Copy & Paste String (Full CSV Format):
```csv
Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,PGR,GATA3,FOXA1,EGFR,KRAS,ALK,MET,ROS1,STK11,KEAP1,BRAF,TP53,PIK3CA,MYC,PTEN,CDK1,UHRF1,HMMR,CEP55,ASPM,RAD51AP1,DLGAP5,KIF11,PBK,HMGB2,CDKN2A,SMAD4,RB1,ATM,APC,VHL,RET,CTNNB1,FGFR1,FGFR2,FGFR3,NOTCH1,JAK2,STAT3,MTOR,AKT1,CCND1,CDK4,CDK6,MDM2,BCL2
Vikram-Malhotra-PDAC,PDAC,3,5.0500,5.1500,5.4200,4.8200,5.1000,5.2000,4.9000,6.2200,8.9000,4.9200,6.5200,5.1000,5.3000,5.4000,5.5000,7.6500,5.4000,7.2000,4.1800,8.3000,7.9500,7.8000,7.6000,7.9000,6.8000,6.9000,7.1000,6.5000,7.2000,2.4500,2.7500,4.8000,4.6000,4.3000,4.4000,4.6000,4.8000,5.2000,5.3000,5.1000,5.4000,5.2000,5.6000,5.8000,5.4000,6.5000,7.1000,6.8000,5.9000,4.9000
```

### Quick Key-Value Copy:
```text
Patient: Vikram_Malhotra, Mutation: G12D, KRAS: 8.90, CDK1: 8.30, UHRF1: 7.95, SMAD4: 2.75, CDKN2A: 2.45, TP53: 7.65, PTEN: 4.18, MYC: 7.20
```

### DNA Sequence Demonstration for Vikram Malhotra (Tab 3):
Paste this nucleotide read into the **"KRAS DNA Sequence"** tab:
```text
ATGGTGGTGGTGGTGGTGGTGCTGGTGGTGGTGATGGTGCTGGTGGTGCTGGTGGTGGTGGTGGTGGTGCTGGTGCTGGTGGTGCTGCTGGTGCTGGTGGTGGTGCTGGTGATGGTGGTG
```
*Result*: Screens codon 12, flags **G12D (Gly12Asp)**, and evaluates patient as **Pancreatic Cancer (PDAC)**.

---

## Patient 4: Sunita Reddy (Healthy Normal Baseline &bull; Non-Malignant)

* **Clinical Profile**: 42-year-old female presenting for routine annual preventive oncology screening.
* **Genomic Signature**: Non-malignant tissue baseline homeostasis across all 15 panels. No driver alterations.
* **Expected Disease Result**: **Normal / Healthy Baseline** (~86%–98% probability).
* **Nearest Cohort Match**: `TCGA-NORM-001` (Similarity: ~98%).

### Copy & Paste String (Full CSV Format):
```csv
Sample_ID,Cancer_Type,Label,BRCA1,BRCA2,ERBB2,ESR1,PGR,GATA3,FOXA1,EGFR,KRAS,ALK,MET,ROS1,STK11,KEAP1,BRAF,TP53,PIK3CA,MYC,PTEN,CDK1,UHRF1,HMMR,CEP55,ASPM,RAD51AP1,DLGAP5,KIF11,PBK,HMGB2,CDKN2A,SMAD4,RB1,ATM,APC,VHL,RET,CTNNB1,FGFR1,FGFR2,FGFR3,NOTCH1,JAK2,STAT3,MTOR,AKT1,CCND1,CDK4,CDK6,MDM2,BCL2
Sunita-Reddy-Normal,Normal,0,4.7500,6.1000,5.5800,5.2500,5.1000,5.2000,5.3000,5.8200,5.3000,5.5200,4.0200,5.1000,5.2000,5.1500,5.2500,4.3500,5.1000,5.1800,4.9500,4.7000,5.3500,4.8000,4.9000,4.8500,4.7500,4.9000,5.1000,4.8000,5.0500,4.1200,5.4000,4.9000,4.8500,4.9500,5.1000,5.0500,5.1500,5.2000,5.1000,5.2500,5.1500,5.2000,5.3000,5.1000,5.0500,5.1500,5.2000,5.1000,5.1500,5.2000
```

### Quick Key-Value Copy:
```text
Patient: Sunita_Reddy, Mutation: None, BRCA1: 4.75, ERBB2: 5.58, EGFR: 5.82, KRAS: 5.30, CDK1: 4.70, UHRF1: 5.35, SMAD4: 5.40, CDKN2A: 4.12, TP53: 4.35, PTEN: 4.95, MYC: 5.18
```

---

## Platform 2 (Hybrid QML &bull; QuantumPancreas AI) Demonstration Cases
**URL**: [http://localhost:3000](http://localhost:3000)

### Case A: Early Pancreatic Cancer with False-Negative Blood Test (Lewis-Negative Rescue)
* **Clinical Context**: 67-year-old male with early Stage I PDAC. Blood test CA 19-9 is falsely low (14.5 U/mL) because patient cannot synthesize sialyl Lewis-A.
* **Urinary Biomarkers**:
  * **LYVE1**: 4.85 ng/mL (Elevated lymphatic marker)
  * **REG1B**: 320.0 ng/mL (Markedly elevated islet-derived glycoprotein)
  * **TFF1**: 510.0 ng/mL (High mucin-associated peptide)
  * **Creatinine**: 0.95 mg/mL (Normalized urine concentration)
  * **Plasma CA 19-9**: 14.5 U/mL (Normal blood range, would miss cancer!)
* **Quantum Classifier Result**:
  * 4-Qubit angle embedding correlations flag **High Risk Malignancy (>88% Probability)**.
  * Demonstrates the core pitch: non-invasive urine QML catches early cancers missed by blood tests.

### Case B: Benign Pancreatic Control (Healthy / Chronic Pancreatitis Control)
* **Clinical Context**: 52-year-old female with benign condition.
* **Urinary Biomarkers**:
  * **LYVE1**: 0.35 ng/mL
  * **REG1B**: 22.0 ng/mL
  * **TFF1**: 38.0 ng/mL
  * **Creatinine**: 0.88 mg/mL
  * **Plasma CA 19-9**: 11.0 U/mL
* **Quantum Classifier Result**: **Low Risk / Benign (<15% Probability)**.
