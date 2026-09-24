"""
app.py
HQML-OncoDetect: Hybrid Quantum ML Platform for Early Cancer Detection (SIH26139)
Modern, Clinical-Grade Streamlit Dashboard for Multi-Class Quantum Genomic Oncology
"""

import os
import io
import time
import numpy as np
import pandas as pd
import torch
import joblib
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import matplotlib.pyplot as plt

from quantum_model import HybridQNN, NUM_QUBITS, NUM_LAYERS, draw_circuit

# ==========================================
# PAGE CONFIGURATION & METADATA
# ==========================================
st.set_page_config(
    page_title="HQML-OncoDetect | Quantum Cancer Detection",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==========================================
# CUSTOM STYLING (DARK GLASSMORPHISM)
# ==========================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Main Background & Cards */
    .stApp {
        background: linear-gradient(135deg, #090d16 0%, #0d1322 50%, #080d1a 100%);
        color: #e2e8f0;
    }
    
    /* Glassmorphism Containers */
    .metric-card {
        background: rgba(18, 26, 45, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .metric-card:hover {
        border-color: rgba(99, 102, 241, 0.4);
        transform: translateY(-2px);
    }
    
    /* Verdict Banners */
    .verdict-banner-normal {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%);
        border-left: 5px solid #10b981;
        border-radius: 12px;
        padding: 18px 24px;
        margin-bottom: 24px;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
    }
    
    .verdict-banner-brca {
        background: linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.05) 100%);
        border-left: 5px solid #f43f5e;
        border-radius: 12px;
        padding: 18px 24px;
        margin-bottom: 24px;
        box-shadow: 0 0 25px rgba(244, 63, 94, 0.15);
    }
    
    .verdict-banner-luad {
        background: linear-gradient(90deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.05) 100%);
        border-left: 5px solid #f97316;
        border-radius: 12px;
        padding: 18px 24px;
        margin-bottom: 24px;
        box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
    }
    
    .badge-pill {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    
    .badge-quantum {
        background: rgba(139, 92, 246, 0.25);
        color: #c4b5fd;
        border: 1px solid rgba(139, 92, 246, 0.4);
    }
    
    .badge-tcga {
        background: rgba(59, 130, 246, 0.25);
        color: #93c5fd;
        border: 1px solid rgba(59, 130, 246, 0.4);
    }
    
    /* Code/Terminal style */
    pre, code {
        font-family: 'JetBrains Mono', monospace !important;
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# MODEL & SCALER LOADER (CACHED)
# ==========================================
@st.cache_resource
def load_model_and_scaler():
    """
    Loads pre-trained hybrid model and standard scaler.
    """
    model_path = "model.pth"
    scaler_path = "scaler.joblib"
    
    if not os.path.exists(scaler_path) or not os.path.exists(model_path):
        return None, None, "Model or Scaler checkpoint missing. Please execute train.py."
    
    try:
        scaler = joblib.load(scaler_path)
        in_features = len(scaler.mean_)
        model = HybridQNN(in_features=in_features, n_qubits=NUM_QUBITS, n_layers=NUM_LAYERS, n_classes=3)
        state_dict = torch.load(model_path, map_location=torch.device('cpu'), weights_only=True)
        model.load_state_dict(state_dict)
        model.eval()
        return model, scaler, None
    except Exception as e:
        return None, None, str(e)

# ==========================================
# 50 CANONICAL GENE NAMES (ORDER MUST MATCH)
# ==========================================
GENES = [
    "BRCA1", "BRCA2", "ERBB2", "ESR1", "PGR", "GATA3", "FOXA1",
    "EGFR", "KRAS", "ALK", "MET", "ROS1", "STK11", "KEAP1", "BRAF",
    "TP53", "PIK3CA", "MYC", "PTEN", "CDK1", "UHRF1", "HMMR", "CEP55",
    "ASPM", "RAD51AP1", "DLGAP5", "KIF11", "PBK", "HMGB2", "CDKN2A",
    "SMAD4", "RB1", "ATM", "APC", "VHL", "RET", "CTNNB1", "FGFR1",
    "FGFR2", "FGFR3", "NOTCH1", "JAK2", "STAT3", "MTOR", "AKT1",
    "CCND1", "CDK4", "CDK6", "MDM2", "BCL2"
]

CLASS_NAMES = ["Normal / Healthy Tissue", "Breast Invasive Carcinoma (BRCA)", "Lung Adenocarcinoma (LUAD)"]
CLASS_COLORS = ["#10b981", "#f43f5e", "#f97316"]

# ==========================================
# INFERENCE & ATTRIBUTION ENGINE
# ==========================================
def predict_patient(patient_features, model, scaler):
    """
    Runs patient feature vector through scaler and HybridQNN.
    Returns probabilities, expectation values, and feature gradients/attribution.
    """
    # patient_features is 1D array of length 50
    scaled_features = scaler.transform(patient_features.reshape(1, -1))
    tensor_in = torch.tensor(scaled_features, dtype=torch.float32, requires_grad=True)
    
    # Model forward pass with quantum states
    state = model.forward_with_quantum_state(tensor_in)
    probs = state["probabilities"].squeeze().detach().numpy()
    expectations = state["quantum_expectations"].squeeze().detach().numpy()
    angles = state["angles"].squeeze().detach().numpy()
    logits = state["logits"]
    
    # Feature attribution via saliency / input gradients for the predicted class
    pred_class_idx = int(np.argmax(probs))
    model.zero_grad()
    target_logit = logits[0, pred_class_idx]
    target_logit.backward()
    
    # Saliency magnitude: |grad * input| (Integrated Gradients proxy / input-gradient attribution)
    grad = tensor_in.grad.squeeze().detach().numpy()
    attributions = np.abs(grad * scaled_features.squeeze())
    
    return {
        "predicted_class": pred_class_idx,
        "class_name": CLASS_NAMES[pred_class_idx],
        "confidence": float(probs[pred_class_idx]),
        "probabilities": probs,
        "quantum_expectations": expectations,
        "angles": angles,
        "attributions": attributions
    }

# ==========================================
# MAIN APPLICATION INTERFACE
# ==========================================
def main():
    # Header Banner
    st.markdown("""
    <div style="padding: 10px 0 20px 0;">
        <div style="display: flex; gap: 10px; margin-bottom: 8px;">
            <span class="badge-pill badge-quantum">⚛️ 4-Qubit Variational QNN</span>
            <span class="badge-pill badge-tcga">🧬 TCGA Multi-Cohort Precision Oncology</span>
            <span class="badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3);">
                Precision Oncology Solution
            </span>
        </div>
        <h1 style="font-weight: 700; margin: 0; font-size: 2.2rem; letter-spacing: -0.02em; background: linear-gradient(90deg, #ffffff, #c7d2fe, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            HQML-OncoDetect: Hybrid Quantum ML Platform for Early Cancer Detection
        </h1>
        <p style="color: #94a3b8; margin-top: 6px; font-size: 1.05rem;">
            End-to-End Quantum-Classical Genomic Analysis for Multi-Class Oncogenic Classification & Driver Gene Attribution.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Model Loading
    model, scaler, err = load_model_and_scaler()
    if err:
        st.error(f"⚠️ Model Initialization Notice: {err}")
        st.info("💡 To train the quantum model and initialize artifacts, run `python train.py` in your terminal.")
        st.stop()
        
    # ==========================================
    # SIDEBAR: DATA INPUT & QUANTUM SPECS
    # ==========================================
    st.sidebar.markdown("### 📥 Patient Data Input")
    input_source = st.sidebar.radio(
        "Choose Data Source:",
        ["✍️ Manual Patient Entry (Sliders)", "⚡ One-Click Demo Profiles", "📁 Upload Patient RNA-seq CSV"],
        index=0
    )
    
    patient_data = None
    patient_id = "UNKNOWN"
    
    if input_source == "✍️ Manual Patient Entry (Sliders)":
        patient_id = st.sidebar.text_input("Patient / Case ID:", value="PATIENT-MANUAL-001")
        st.sidebar.markdown("##### ⚡ Quick-Fill Template:")
        col_m1, col_m2, col_m3 = st.sidebar.columns(3)
        
        if "manual_preset" not in st.session_state:
            st.session_state.manual_preset = "normal"
            
        if col_m1.button("🟢 Normal", use_container_width=True, key="m_norm"):
            st.session_state.manual_preset = "normal"
        if col_m2.button("🌸 BRCA", use_container_width=True, key="m_brca"):
            st.session_state.manual_preset = "brca"
        if col_m3.button("🫁 LUAD", use_container_width=True, key="m_luad"):
            st.session_state.manual_preset = "luad"
            
        # Defaults based on preset
        defaults = {g: 5.0 for g in GENES}
        if st.session_state.manual_preset == "brca":
            defaults.update({"BRCA1": 8.8, "BRCA2": 9.8, "ERBB2": 9.5, "ESR1": 9.2, "TP53": 6.4, "MYC": 9.0})
        elif st.session_state.manual_preset == "luad":
            defaults.update({"EGFR": 9.9, "KRAS": 9.3, "ALK": 9.5, "MET": 7.9, "CDKN2A": 2.5})
            
        st.sidebar.markdown("##### 🌸 Breast Drivers (log2 TPM):")
        m_brca1 = st.sidebar.slider("BRCA1", 1.0, 14.0, defaults["BRCA1"], 0.1, key="sl_brca1")
        m_erbb2 = st.sidebar.slider("ERBB2 (HER2)", 1.0, 14.0, defaults["ERBB2"], 0.1, key="sl_erbb2")
        m_esr1  = st.sidebar.slider("ESR1", 1.0, 14.0, defaults["ESR1"], 0.1, key="sl_esr1")
        
        st.sidebar.markdown("##### 🫁 Lung Drivers (log2 TPM):")
        m_egfr  = st.sidebar.slider("EGFR", 1.0, 14.0, defaults["EGFR"], 0.1, key="sl_egfr")
        m_kras  = st.sidebar.slider("KRAS", 1.0, 14.0, defaults["KRAS"], 0.1, key="sl_kras")
        m_alk   = st.sidebar.slider("ALK", 1.0, 14.0, defaults["ALK"], 0.1, key="sl_alk")
        
        st.sidebar.markdown("##### 🛡️ General Regulators:")
        m_tp53  = st.sidebar.slider("TP53", 1.0, 14.0, defaults["TP53"], 0.1, key="sl_tp53")
        m_myc   = st.sidebar.slider("MYC", 1.0, 14.0, defaults["MYC"], 0.1, key="sl_myc")
        
        # Build 50-feature array
        manual_dict = defaults.copy()
        manual_dict["BRCA1"] = m_brca1
        manual_dict["ERBB2"] = m_erbb2
        manual_dict["ESR1"] = m_esr1
        manual_dict["EGFR"] = m_egfr
        manual_dict["KRAS"] = m_kras
        manual_dict["ALK"] = m_alk
        manual_dict["TP53"] = m_tp53
        manual_dict["MYC"] = m_myc
        
        patient_data = np.array([manual_dict[g] for g in GENES])
        st.sidebar.success(f"Configured patient: **{patient_id}**")
        
    elif input_source == "⚡ One-Click Demo Profiles":
        st.sidebar.markdown("Select a calibrated clinical test profile:")
        col_btn1, col_btn2, col_btn3 = st.sidebar.columns(3)
        
        # Session state to hold selected demo profile
        if "selected_demo" not in st.session_state:
            st.session_state.selected_demo = "brca"
            
        if col_btn1.button("🟢 Normal", use_container_width=True, help="Load Healthy Control Profile"):
            st.session_state.selected_demo = "normal"
        if col_btn2.button("🔴 BRCA", use_container_width=True, help="Load Breast Invasive Carcinoma Profile"):
            st.session_state.selected_demo = "brca"
        if col_btn3.button("🟠 LUAD", use_container_width=True, help="Load Lung Adenocarcinoma Profile"):
            st.session_state.selected_demo = "luad"
            
        demo_map = {
            "normal": ("data/sample_normal.csv", "DEMO-PATIENT-NORMAL-01", "Healthy Control"),
            "brca": ("data/sample_brca.csv", "DEMO-PATIENT-BRCA-01", "Breast Invasive Carcinoma (BRCA)"),
            "luad": ("data/sample_luad.csv", "DEMO-PATIENT-LUAD-01", "Lung Adenocarcinoma (LUAD)")
        }
        
        demo_file, demo_pid, demo_desc = demo_map[st.session_state.selected_demo]
        if os.path.exists(demo_file):
            df_demo = pd.read_csv(demo_file)
            patient_id = df_demo["Sample_ID"].iloc[0] if "Sample_ID" in df_demo.columns else demo_pid
            # Extract 50 gene columns
            patient_data = df_demo[[g for g in GENES if g in df_demo.columns]].iloc[0].values
            st.sidebar.success(f"Loaded Profile: **{demo_desc}** (`{patient_id}`)")
        else:
            st.sidebar.error(f"Sample file {demo_file} not found. Please run generate_data.py.")
            st.stop()
            
    else: # File upload
        uploaded_file = st.sidebar.file_uploader(
            "Upload Gene Expression CSV (log2 TPM or FPKM)",
            type=["csv"],
            help="CSV must contain columns for 50 driver genes or at least matching gene symbols."
        )
        if uploaded_file is not None:
            try:
                df_upload = pd.read_csv(uploaded_file)
                st.sidebar.success("File uploaded successfully!")
                patient_id = df_upload["Sample_ID"].iloc[0] if "Sample_ID" in df_upload.columns else uploaded_file.name
                
                # Check for missing genes
                missing = [g for g in GENES if g not in df_upload.columns]
                if missing:
                    st.sidebar.warning(f"⚠️ {len(missing)} genes missing from upload. Defaulting to baseline normal expression for missing markers.")
                    for g in missing:
                        df_upload[g] = 5.0
                patient_data = df_upload[GENES].iloc[0].values
            except Exception as e:
                st.sidebar.error(f"Error reading CSV: {e}")
                st.stop()
        else:
            st.info("👈 Please select a demo patient profile or upload a patient RNA-seq CSV from the sidebar.")
            st.stop()
            
    # Sidebar Quantum System Status
    st.sidebar.markdown("---")
    st.sidebar.markdown("### ⚛️ Quantum Circuit Architecture")
    st.sidebar.markdown(r"""
    - **Simulated Qubits:** `4 Qubits` (Wires 0–3)
    - **Quantum Device:** `PennyLane default.qubit`
    - **Encoding:** `RY AngleEmbedding` ($[-\pi, \pi]$)
    - **Ansatz:** `StronglyEntanglingLayers (2 Layers)`
    - **Entanglement:** All-to-all Circular CNOTs
    - **Observable:** Pauli-Z Expectation $\langle Z_i \rangle \in [-1, 1]$
    - **Backprop:** Analytical Automatic Differentiation
    """)

    # ==========================================
    # LIVE INFERENCE EXECUTION
    # ==========================================
    with st.spinner("Processing Genomic Features through Classical-Quantum Pipeline..."):
        results = predict_patient(patient_data, model, scaler)
        
    pred_idx = results["predicted_class"]
    confidence = results["confidence"]
    probs = results["probabilities"]
    expectations = results["quantum_expectations"]
    angles = results["angles"]
    attributions = results["attributions"]
    
    # ==========================================
    # SECTION 1: CLINICAL DIAGNOSTIC BANNER
    # ==========================================
    if pred_idx == 0:
        st.markdown(f"""
        <div class="verdict-banner-normal">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="color: #10b981; margin: 0; font-size: 1.6rem; font-weight: 700;">
                        🟢 Normal / Healthy Profile Confirmed
                    </h2>
                    <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 0.95rem;">
                        Patient <strong>{patient_id}</strong> exhibits non-malignant, baseline gene expression across onco-driver panels.
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.8rem; color: #6ee7b7; text-transform: uppercase;">Confidence</span>
                    <h2 style="color: #10b981; margin: 0; font-size: 2rem; font-weight: 800;">{confidence*100:.1f}%</h2>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    elif pred_idx == 1:
        st.markdown(f"""
        <div class="verdict-banner-brca">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="color: #f43f5e; margin: 0; font-size: 1.6rem; font-weight: 700;">
                        🚨 Malignant Profile Detected: Breast Invasive Carcinoma (BRCA)
                    </h2>
                    <p style="margin: 6px 0 0 0; color: #fecdd3; font-size: 0.95rem;">
                        Patient <strong>{patient_id}</strong> presents elevated estrogen-pathway and BRCA oncogenic drivers requiring immediate clinical oncology consult.
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.8rem; color: #fda4af; text-transform: uppercase;">Confidence</span>
                    <h2 style="color: #f43f5e; margin: 0; font-size: 2rem; font-weight: 800;">{confidence*100:.1f}%</h2>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="verdict-banner-luad">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="color: #f97316; margin: 0; font-size: 1.6rem; font-weight: 700;">
                        🚨 Malignant Profile Detected: Lung Adenocarcinoma (LUAD)
                    </h2>
                    <p style="margin: 6px 0 0 0; color: #ffedd5; font-size: 0.95rem;">
                        Patient <strong>{patient_id}</strong> demonstrates characteristic EGFR/KRAS/ALK activation signature indicative of primary pulmonary adenocarcinoma.
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.8rem; color: #fdba74; text-transform: uppercase;">Confidence</span>
                    <h2 style="color: #f97316; margin: 0; font-size: 2rem; font-weight: 800;">{confidence*100:.1f}%</h2>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
    # ==========================================
    # SECTION 2: PROBABILITY DISTRIBUTION & QUANTUM METRICS
    # ==========================================
    col_prob, col_quantum = st.columns([1.1, 0.9])
    
    with col_prob:
        st.markdown("### 📊 Calibrated Multi-Class Probability Distribution")
        
        fig_prob = go.Figure()
        fig_prob.add_trace(go.Bar(
            y=CLASS_NAMES,
            x=probs * 100,
            orientation='h',
            text=[f"{p*100:.2f}%" for p in probs],
            textposition='auto',
            marker=dict(
                color=CLASS_COLORS,
                line=dict(color='rgba(255, 255, 255, 0.3)', width=1.5)
            )
        ))
        
        fig_prob.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#e2e8f0', family='Outfit'),
            xaxis=dict(
                title="Probability (%)",
                range=[0, 105],
                gridcolor='rgba(255, 255, 255, 0.08)',
                zerolinecolor='rgba(255, 255, 255, 0.15)'
            ),
            yaxis=dict(
                autorange="reversed",
                tickfont=dict(size=13, weight=600)
            ),
            margin=dict(l=10, r=20, t=20, b=30),
            height=260
        )
        st.plotly_chart(fig_prob, use_container_width=True)

    with col_quantum:
        st.markdown("### ⚛️ Real-Time Quantum State Expectations")
        
        q_cols = st.columns(4)
        for i in range(NUM_QUBITS):
            with q_cols[i]:
                st.markdown(f"""
                <div class="metric-card" style="text-align: center; padding: 14px 10px;">
                    <div style="font-size: 0.8rem; color: #a5b4fc; text-transform: uppercase;">Qubit q[{i}]</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #818cf8; margin: 4px 0;">
                        {expectations[i]:+.3f}
                    </div>
                    <div style="font-size: 0.72rem; color: #94a3b8;">⟨Z{i}⟩ Pauli Exp</div>
                    <div style="font-size: 0.7rem; color: #cbd5e1; margin-top: 4px; font-family: monospace;">
                        θ = {angles[i]/np.pi:.2f}π
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
        st.markdown("""
        <div style="margin-top: 14px; font-size: 0.82rem; color: #94a3b8; background: rgba(30, 41, 59, 0.4); border-radius: 8px; padding: 10px 14px;">
            ℹ️ <em>Pauli-Z expectation values range between [-1.0, +1.0], representing measurement projections along the computational basis after parameterized multi-qubit entanglement.</em>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # ==========================================
    # SECTION 3: TOP 5 BIOMARKER FEATURE ATTRIBUTION & RADAR
    # ==========================================
    col_attr, col_radar = st.columns([1, 1])
    
    with col_attr:
        st.markdown("### 🎯 Top 5 Biomarker Feature Attributions")
        st.markdown(
            "Gradient-weighted saliency scores identifying which specific driver genes exerted the highest influence on this diagnosis:"
        )
        
        # Sort and pick top 5
        top_indices = np.argsort(attributions)[::-1][:5]
        top_genes = [GENES[i] for i in top_indices]
        top_scores = attributions[top_indices]
        
        # Normalize top scores for percentage display
        score_sum = np.sum(top_scores) if np.sum(top_scores) > 0 else 1.0
        pct_scores = (top_scores / score_sum) * 100
        
        fig_attr = px.bar(
            x=pct_scores[::-1],
            y=top_genes[::-1],
            orientation='h',
            text=[f"{s:.1f}%" for s in pct_scores[::-1]],
            labels={'x': 'Attribution Weight (%)', 'y': 'Driver Gene'},
            color=pct_scores[::-1],
            color_continuous_scale="Purples"
        )
        fig_attr.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#e2e8f0', family='Outfit'),
            xaxis=dict(gridcolor='rgba(255, 255, 255, 0.08)'),
            coloraxis_showscale=False,
            margin=dict(l=10, r=20, t=10, b=30),
            height=280
        )
        st.plotly_chart(fig_attr, use_container_width=True)

    with col_radar:
        st.markdown("### 🧬 Patient Expression vs Reference Baseline")
        st.markdown(
            "Comparison of key oncogenic markers against the standard non-malignant tissue baseline (log2 TPM):"
        )
        
        key_benchmark_genes = ["BRCA1", "ERBB2", "EGFR", "KRAS", "TP53", "MYC", "CDK1"]
        patient_key_vals = [patient_data[GENES.index(g)] for g in key_benchmark_genes]
        # Normal baseline for comparison
        normal_bench_vals = [5.1, 5.0, 5.2, 5.0, 5.1, 5.3, 5.0]
        
        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(
            r=patient_key_vals,
            theta=key_benchmark_genes,
            fill='toself',
            name=f'Patient ({patient_id})',
            line_color='#6366f1',
            fillcolor='rgba(99, 102, 241, 0.3)'
        ))
        fig_radar.add_trace(go.Scatterpolar(
            r=normal_bench_vals,
            theta=key_benchmark_genes,
            fill='toself',
            name='Healthy Baseline',
            line_color='#10b981',
            fillcolor='rgba(16, 185, 129, 0.15)'
        ))
        
        fig_radar.update_layout(
            polar=dict(
                bgcolor='rgba(0,0,0,0)',
                radialaxis=dict(visible=True, range=[0, 12], gridcolor='rgba(255, 255, 255, 0.15)')
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#e2e8f0', family='Outfit'),
            showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
            margin=dict(l=20, r=20, t=10, b=30),
            height=280
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    st.markdown("---")

    # ==========================================
    # SECTION 4: INTERACTIVE QUANTUM CIRCUIT VIEWER
    # ==========================================
    st.markdown("### ⚛️ Interactive Variational Quantum Circuit Schematic")
    st.markdown(
        "Visualizing the parameterized quantum gate layout: Angle Embeddings ($R_Y(\\theta)$), circular $CNOT$ entangling mesh, and $Z$-basis measurements:"
    )
    
    tab_mpl, tab_ascii, tab_workspace = st.tabs(["🖼️ Graphic Circuit Diagram", "📄 ASCII Netlist", "📂 Local Cohort Explorer (Workspace KRAS Data)"])
    
    with tab_mpl:
        try:
            fig_circuit = draw_circuit(as_mpl=True)
            fig_circuit.patch.set_facecolor('#0f172a')
            for ax in fig_circuit.get_axes():
                ax.set_facecolor('#0f172a')
            st.pyplot(fig_circuit)
            plt.close(fig_circuit)
        except Exception as e:
            st.warning(f"Matplotlib circuit rendering fallback: {e}")
            st.code(draw_circuit(as_mpl=False))
            
    with tab_ascii:
        st.markdown("**Text Schematic (PennyLane QNode Drawer):**")
        st.code(draw_circuit(as_mpl=False), language="text")
        
    with tab_workspace:
        st.markdown("#### 🔬 Analysis of Workspace KRAS DNA Sequences (`pancreatic_cancer_synthetic_100_sequences.csv`)")
        st.markdown("""
        In addition to the 3-class TCGA RNA-seq cohort, your workspace includes a dedicated KRAS codon-mutation DNA sequence dataset (S001 to S100) and clinical oncology research (*J Clin Lab Anal 2022*).
        """)
        local_seq_path = "pancreatic_cancer_synthetic_100_sequences.csv"
        if os.path.exists(local_seq_path):
            df_seq = pd.read_csv(local_seq_path)
            st.dataframe(df_seq.head(10), use_container_width=True)
            col_kras1, col_kras2 = st.columns(2)
            with col_kras1:
                fig_mut = px.pie(df_seq, names='Mutation', title="KRAS Mutation Variant Distribution", hole=0.4,
                                 color_discrete_sequence=px.colors.sequential.Teal)
                fig_mut.update_layout(paper_bgcolor='rgba(0,0,0,0)', font=dict(color='#e2e8f0'))
                st.plotly_chart(fig_mut, use_container_width=True)
            with col_kras2:
                fig_class = px.bar(df_seq['Class'].value_counts(), title="Sequence Class Split",
                                   color_discrete_sequence=['#6366f1'])
                fig_class.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                        font=dict(color='#e2e8f0'))
                st.plotly_chart(fig_class, use_container_width=True)
        else:
            st.info("Local file `pancreatic_cancer_synthetic_100_sequences.csv` not found in root.")

    # ==========================================
    # SECTION 5: CLINICAL DIAGNOSTIC REPORT DOWNLOAD
    # ==========================================
    st.markdown("---")
    report_content = f"""================================================================================
HQML-ONCODETECT CLINICAL GENOMIC DIAGNOSTIC REPORT
================================================================================
Date/Time: {time.strftime('%Y-%m-%d %H:%M:%S')}
Patient ID: {patient_id}
Algorithm: Hybrid Quantum Neural Network (PennyLane 4-Qubit Strongly Entangled Classifier)

CLINICAL VERDICT:
- Predicted Diagnosis: {CLASS_NAMES[pred_idx]}
- Confidence Score: {confidence * 100:.2f}%
- Multi-Class Distribution:
    * Normal / Healthy: {probs[0]*100:.2f}%
    * Breast Invasive Carcinoma (BRCA): {probs[1]*100:.2f}%
    * Lung Adenocarcinoma (LUAD): {probs[2]*100:.2f}%

QUANTUM EXPECTATION VALUES (⟨Z_i⟩):
- Qubit 0: {expectations[0]:+.4f} (Rotation Angle: {angles[0]:.4f} rad)
- Qubit 1: {expectations[1]:+.4f} (Rotation Angle: {angles[1]:.4f} rad)
- Qubit 2: {expectations[2]:+.4f} (Rotation Angle: {angles[2]:.4f} rad)
- Qubit 3: {expectations[3]:+.4f} (Rotation Angle: {angles[3]:.4f} rad)

TOP 5 DRIVER GENE ATTRIBUTIONS:
{chr(10).join([f"- {g}: Saliency Impact = {pct_scores[i]:.2f}%" for i, g in enumerate(top_genes)])}

SUMMARY & CLINICAL RECOMMENDATION:
{
  "Patient gene expression is consistent with normal baseline tissue homeostasis." if pred_idx == 0 else
  "High oncogenic activation signature detected in breast cancer regulatory pathways (BRCA1/ERBB2/ESR1). Recommend confirmatory histopathology and oncology review." if pred_idx == 1 else
  "Elevated pulmonary adenocarcinoma signature detected in RTK/RAS signaling pathways (EGFR/KRAS/ALK). Recommend CT follow-up and targeted biomarker validation."
}
================================================================================
Generated by HQML-OncoDetect AI Platform
"""
    st.download_button(
        label="📥 Download Clinical Diagnostic Report (TXT)",
        data=report_content,
        file_name=f"HQML_OncoReport_{patient_id}.txt",
        mime="text/plain",
        help="Download official diagnostic summary report with quantum observables and gene attributions"
    )

if __name__ == "__main__":
    main()
