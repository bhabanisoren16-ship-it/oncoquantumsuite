"""
generate_data.py
HQML-OncoDetect: Hybrid Quantum ML Platform for Early Cancer Detection (SIH26139)

Generates a synthetic RNA-seq expression dataset mimicking TCGA (The Cancer Genome Atlas):
- 600 patient samples:
    * Class 0: Healthy / Normal Tissue (200 samples)
    * Class 1: Breast Invasive Carcinoma [BRCA] (200 samples)
    * Class 2: Lung Adenocarcinoma [LUAD] (200 samples)
- 50 realistic cancer driver and hub genes
- Exports:
    * data/tcga_synthetic_cancer.csv
    * data/sample_normal.csv
    * data/sample_brca.csv
    * data/sample_luad.csv
"""

import os
import numpy as np
import pandas as pd

# Define 50 realistic cancer driver genes
# Incorporates canonical biomarkers + TCGA/JCLA validated hub genes
GENES = [
    # BRCA Drivers & Markers
    "BRCA1", "BRCA2", "ERBB2", "ESR1", "PGR", "GATA3", "FOXA1",
    # LUAD Drivers & Markers
    "EGFR", "KRAS", "ALK", "MET", "ROS1", "STK11", "KEAP1", "BRAF",
    # Universal Pan-Cancer Hubs & Regulators (including JCLA PAAD findings)
    "TP53", "PIK3CA", "MYC", "PTEN", "CDK1", "UHRF1", "HMMR", "CEP55",
    "ASPM", "RAD51AP1", "DLGAP5", "KIF11", "PBK", "HMGB2", "CDKN2A",
    "SMAD4", "RB1", "ATM", "APC", "VHL", "RET", "CTNNB1", "FGFR1",
    "FGFR2", "FGFR3", "NOTCH1", "JAK2", "STAT3", "MTOR", "AKT1",
    "CCND1", "CDK4", "CDK6", "MDM2", "BCL2"
]

def generate_cohort(n_normal=200, n_brca=200, n_luad=200, seed=42):
    np.random.seed(seed)
    total_samples = n_normal + n_brca + n_luad
    
    data = []
    
    # Base expression levels for 50 genes (normal baseline: ~4.5 - 6.0 log2 TPM)
    normal_base = np.random.uniform(4.0, 6.2, size=len(GENES))
    gene_idx = {g: i for i, g in enumerate(GENES)}
    
    # 1. Normal Cohort (Class 0)
    for i in range(n_normal):
        expr = normal_base + np.random.normal(0, 0.45, size=len(GENES))
        sample = {
            "Sample_ID": f"TCGA-NORM-{i+1:03d}",
            "Cancer_Type": "Normal",
            "Label": 0
        }
        for g_idx, g in enumerate(GENES):
            sample[g] = round(max(0.1, expr[g_idx]), 4)
        data.append(sample)
        
    # 2. BRCA Cohort (Class 1)
    brca_elevated = ["BRCA1", "BRCA2", "ERBB2", "ESR1", "PGR", "GATA3", "FOXA1", "CCND1", "MYC"]
    for i in range(n_brca):
        expr = normal_base + np.random.normal(0, 0.50, size=len(GENES))
        # Inject BRCA biological signature
        for g in brca_elevated:
            # Overexpression with clinical heterogeneity
            boost = np.random.uniform(2.8, 4.8)
            expr[gene_idx[g]] += boost
        # Specific tumor suppressors downregulated or mutated
        expr[gene_idx["PTEN"]] -= np.random.uniform(0.8, 1.8)
        expr[gene_idx["TP53"]] += np.random.uniform(1.2, 2.5) # mutated accumulation
        
        sample = {
            "Sample_ID": f"TCGA-BRCA-{i+1:03d}",
            "Cancer_Type": "BRCA",
            "Label": 1
        }
        for g_idx, g in enumerate(GENES):
            sample[g] = round(max(0.1, expr[g_idx]), 4)
        data.append(sample)
        
    # 3. LUAD Cohort (Class 2)
    luad_elevated = ["EGFR", "KRAS", "ALK", "MET", "ROS1", "STK11", "KEAP1", "BRAF", "MDM2"]
    for i in range(n_luad):
        expr = normal_base + np.random.normal(0, 0.50, size=len(GENES))
        # Inject LUAD biological signature
        for g in luad_elevated:
            boost = np.random.uniform(2.8, 5.0)
            expr[gene_idx[g]] += boost
        # Proliferation hubs elevated
        expr[gene_idx["CDK1"]] += np.random.uniform(1.0, 2.2)
        expr[gene_idx["UHRF1"]] += np.random.uniform(0.9, 2.0)
        expr[gene_idx["CDKN2A"]] -= np.random.uniform(1.0, 2.0) # CDKN2A deletion common in lung
        
        sample = {
            "Sample_ID": f"TCGA-LUAD-{i+1:03d}",
            "Cancer_Type": "LUAD",
            "Label": 2
        }
        for g_idx, g in enumerate(GENES):
            sample[g] = round(max(0.1, expr[g_idx]), 4)
        data.append(sample)
        
    df = pd.DataFrame(data)
    # Reorder columns: Sample_ID, Cancer_Type, Label, followed by 50 genes
    cols = ["Sample_ID", "Cancer_Type", "Label"] + GENES
    df = df[cols]
    return df

def main():
    os.makedirs("data", exist_ok=True)
    
    print(f"[*] Generating synthetic TCGA RNA-seq dataset with {len(GENES)} driver genes...")
    df = generate_cohort(n_normal=200, n_brca=200, n_luad=200, seed=42)
    
    output_path = os.path.join("data", "tcga_synthetic_cancer.csv")
    df.to_csv(output_path, index=False)
    print(f"[+] Saved complete cohort dataset to: {output_path} (Shape: {df.shape})")
    print(f"[+] Class distribution:\n{df['Cancer_Type'].value_counts()}")
    
    # Generate 3 independent isolated test patient samples for live demo inference
    # Normal demo sample
    np.random.seed(101)
    normal_demo = generate_cohort(n_normal=1, n_brca=0, n_luad=0, seed=101)
    normal_demo["Sample_ID"] = "DEMO-PATIENT-NORMAL-01"
    normal_demo_path = os.path.join("data", "sample_normal.csv")
    normal_demo.to_csv(normal_demo_path, index=False)
    print(f"[+] Saved demo Normal sample to: {normal_demo_path}")
    
    # BRCA demo sample
    brca_demo = generate_cohort(n_normal=0, n_brca=1, n_luad=0, seed=202)
    brca_demo["Sample_ID"] = "DEMO-PATIENT-BRCA-01"
    brca_demo_path = os.path.join("data", "sample_brca.csv")
    brca_demo.to_csv(brca_demo_path, index=False)
    print(f"[+] Saved demo BRCA sample to: {brca_demo_path}")
    
    # LUAD demo sample
    luad_demo = generate_cohort(n_normal=0, n_brca=0, n_luad=1, seed=303)
    luad_demo["Sample_ID"] = "DEMO-PATIENT-LUAD-01"
    luad_demo_path = os.path.join("data", "sample_luad.csv")
    luad_demo.to_csv(luad_demo_path, index=False)
    print(f"[+] Saved demo LUAD sample to: {luad_demo_path}")

if __name__ == "__main__":
    main()
