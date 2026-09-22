import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DatasetPipelineTab } from "./components/DatasetPipelineTab";
import { QuantumArchitectureTab } from "./components/QuantumArchitectureTab";
import { BenchmarkLabTab } from "./components/BenchmarkLabTab";
import { ClinicalInferenceTab } from "./components/ClinicalInferenceTab";
import { QuantumBackgroundCanvas } from "./components/QuantumBackgroundCanvas";
import { QuantumCursor } from "./components/QuantumCursor";
import { PatientRecord, ModelBenchmark } from "./types";
import { computeBenchmarks } from "./utils/qmlSimulator";
import { Atom, ExternalLink } from "lucide-react";

// Synthetic initial cohort fallback to ensure instant hydration
const INITIAL_FALLBACK_PATIENTS: PatientRecord[] = Array.from({ length: 60 }, (_, i) => {
  const isPDAC = i >= 32;
  return {
    patient_id: isPDAC ? `PAT-PDAC-${2001 + i}` : `PAT-CTRL-${1001 + i}`,
    age: isPDAC ? 66 + (i % 8) : 54 + (i % 12),
    sex: i % 2 === 0 ? 1 : 0,
    creatinine: parseFloat((0.85 + (i % 5) * 0.12).toFixed(2)),
    lyve1: parseFloat((isPDAC ? 3.8 + (i % 6) * 1.2 : 0.4 + (i % 4) * 0.25).toFixed(2)),
    reg1b: parseFloat((isPDAC ? 280 + (i % 10) * 45 : 25 + (i % 8) * 8).toFixed(1)),
    tff1: parseFloat((isPDAC ? 450 + (i % 10) * 65 : 45 + (i % 8) * 12).toFixed(1)),
    plasma_ca19_9: parseFloat((isPDAC ? (i === 35 ? 14.5 : 55 + (i % 10) * 25) : 12 + (i % 7) * 3).toFixed(1)),
    diagnosis: isPDAC ? 1 : 0,
  };
});

const DEFAULT_PATIENT: Partial<PatientRecord> = {
  patient_id: "PAT-CLINICAL-LIVE",
  age: 66,
  sex: 1, // Male
  creatinine: 1.15,
  lyve1: 4.85,
  reg1b: 380.0,
  tff1: 520.0,
  plasma_ca19_9: 68.0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("inference");
  const [threshold, setThreshold] = useState<number>(0.45);
  const [dataset, setDataset] = useState<PatientRecord[]>(INITIAL_FALLBACK_PATIENTS);
  const [benchmarks, setBenchmarks] = useState<ModelBenchmark[]>(() =>
    computeBenchmarks(INITIAL_FALLBACK_PATIENTS, 0.45)
  );

  // Persistent patient biomarker input data:
  // Switching between "Patient Inference & AI" and "Model Benchmarks" will NOT reset or alter user inputs or localhost payloads
  const [patient, setPatient] = useState<Partial<PatientRecord>>(() => {
    try {
      const saved = localStorage.getItem("oncoquantum_patient_input");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && typeof parsed.age === "number") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not retrieve saved patient inputs from localStorage:", e);
    }
    return DEFAULT_PATIENT;
  });

  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiReport, setGeminiReport] = useState<string | null>(() => {
    try {
      return localStorage.getItem("oncoquantum_gemini_report") || null;
    } catch (e) {
      return null;
    }
  });
  const [reportSource, setReportSource] = useState<string>(() => {
    try {
      return localStorage.getItem("oncoquantum_report_source") || "gemini-3.8-flash";
    } catch (e) {
      return "gemini-3.8-flash";
    }
  });
  const [reportNotice, setReportNotice] = useState<string | null>(() => {
    try {
      return localStorage.getItem("oncoquantum_report_notice") || null;
    } catch (e) {
      return null;
    }
  });

  // Persist patient input changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("oncoquantum_patient_input", JSON.stringify(patient));
    } catch (e) {}
  }, [patient]);

  // Persist report data to localStorage
  useEffect(() => {
    try {
      if (geminiReport) {
        localStorage.setItem("oncoquantum_gemini_report", geminiReport);
        localStorage.setItem("oncoquantum_report_source", reportSource);
        if (reportNotice) {
          localStorage.setItem("oncoquantum_report_notice", reportNotice);
        } else {
          localStorage.removeItem("oncoquantum_report_notice");
        }
      } else {
        localStorage.removeItem("oncoquantum_gemini_report");
        localStorage.removeItem("oncoquantum_report_notice");
      }
    } catch (e) {}
  }, [geminiReport, reportSource, reportNotice]);

  // Fetch full 220 records from backend CSV endpoint
  useEffect(() => {
    fetch("/api/dataset")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDataset(data.data);
          setBenchmarks(computeBenchmarks(data.data, threshold));
        }
      })
      .catch((err) => {
        console.warn("Dataset API warming up, using initial cached cohort.", err);
      });
  }, []);

  // Update benchmarks whenever threshold or dataset updates
  useEffect(() => {
    setBenchmarks(computeBenchmarks(dataset, threshold));
  }, [threshold, dataset]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Animation Canvas */}
      <QuantumBackgroundCanvas />

      {/* Interactive Quantum Biosensing Cursor */}
      <QuantumCursor />

      {/* Top Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} threshold={threshold} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Patient Inference Tab is kept mounted with display styling so inputs, focus, and localhost payloads are never lost */}
        <div style={{ display: activeTab === "inference" ? "block" : "none" }}>
          <ClinicalInferenceTab
            threshold={threshold}
            setThreshold={setThreshold}
            patient={patient}
            setPatient={setPatient}
            geminiReport={geminiReport}
            setGeminiReport={setGeminiReport}
            reportSource={reportSource}
            setReportSource={setReportSource}
            reportNotice={reportNotice}
            setReportNotice={setReportNotice}
            isLoadingGemini={isLoadingGemini}
            setIsLoadingGemini={setIsLoadingGemini}
          />
        </div>
        {activeTab === "benchmark" && (
          <BenchmarkLabTab benchmarks={benchmarks} threshold={threshold} setThreshold={setThreshold} />
        )}
        {activeTab === "quantum" && <QuantumArchitectureTab />}
        {activeTab === "dataset" && (
          <DatasetPipelineTab
            dataset={dataset}
            onSelectPatient={(selectedRecord) => {
              setPatient(selectedRecord);
              setActiveTab("inference");
            }}
          />
        )}
      </main>

      {/* Scientific Reference Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <Atom className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">
              QuantumPancreas Hybrid QML Platform &bull; PennyLane + Scikit-Learn + Gemini
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Reference: Debernardi et al., PLoS Med 2020 (10.1371/journal.pmed.1003489)</span>
            <span className="text-cyan-400 font-mono">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
