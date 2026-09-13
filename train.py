"""
train.py
HQML-OncoDetect: Hybrid Quantum ML Platform for Early Cancer Detection (SIH26139)

Training Pipeline:
1. Loads data/tcga_synthetic_cancer.csv
2. Stratified train/test split (80% train / 20% test)
3. Fits StandardScaler on training features and saves scaler to scaler.joblib
4. Trains HybridQNN using Cross-Entropy Loss and Adam optimizer (lr: 0.01, 20 epochs, batch size: 16)
5. Evaluates and tracks epoch loss and test accuracy
6. Saves trained PyTorch model weights to model.pth
"""

import os
import time
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

from quantum_model import HybridQNN

def train():
    # Set seeds for deterministic training reproducibility
    torch.manual_seed(42)
    np.random.seed(42)
    
    data_path = os.path.join("data", "tcga_synthetic_cancer.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Please run generate_data.py first.")
        
    print(f"[*] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    
    # Gene expression features start from 4th column (after Sample_ID, Cancer_Type, Label)
    gene_cols = [c for c in df.columns if c not in ["Sample_ID", "Cancer_Type", "Label"]]
    print(f"[+] Loaded {len(df)} samples across {len(gene_cols)} driver genes.")
    
    X = df[gene_cols].values
    y = df["Label"].values
    
    # 80/20 Stratified train-test split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[+] Train split: {X_train_raw.shape[0]} samples | Test split: {X_test_raw.shape[0]} samples")
    
    # Feature Standardization
    print("[*] Fitting StandardScaler on training cohort...")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_test = scaler.transform(X_test_raw)
    
    scaler_path = "scaler.joblib"
    joblib.dump(scaler, scaler_path)
    print(f"[+] Saved fitted scaler to: {scaler_path}")
    
    # Convert to PyTorch Tensors
    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.long)
    X_test_t = torch.tensor(X_test, dtype=torch.float32)
    y_test_t = torch.tensor(y_test, dtype=torch.long)
    
    # DataLoader
    batch_size = 16
    train_dataset = TensorDataset(X_train_t, y_train_t)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    # Initialize Hybrid Quantum Neural Network
    print("[*] Initializing Hybrid Classical-Quantum Neural Network...")
    model = HybridQNN(in_features=len(gene_cols), n_qubits=4, n_layers=2, n_classes=3)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=1e-4)
    
    num_epochs = 20
    print(f"\n{'='*65}")
    print(f"{'Epoch':^8} | {'Train Loss':^14} | {'Train Acc':^12} | {'Test Acc':^12} | {'Time (s)':^8}")
    print(f"{'='*65}")
    
    for epoch in range(1, num_epochs + 1):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * batch_x.size(0)
            preds = torch.argmax(outputs, dim=1)
            correct_train += (preds == batch_y).sum().item()
            total_train += batch_x.size(0)
            
        epoch_loss = running_loss / total_train
        train_acc = (correct_train / total_train) * 100.0
        
        # Test Evaluation
        model.eval()
        with torch.no_grad():
            test_outputs = model(X_test_t)
            test_preds = torch.argmax(test_outputs, dim=1)
            test_acc = (test_preds == y_test_t).sum().item() / y_test_t.size(0) * 100.0
            
        elapsed = time.time() - t0
        print(f"{epoch:^8d} | {epoch_loss:^14.4f} | {train_acc:^11.2f}% | {test_acc:^11.2f}% | {elapsed:^8.2f}")
        
    print(f"{'='*65}")
    
    # Final Test Set Evaluation & Metrics
    model.eval()
    with torch.no_grad():
        final_test_logits = model(X_test_t)
        final_preds = torch.argmax(final_test_logits, dim=1).numpy()
        
    class_names = ["Normal (0)", "BRCA (1)", "LUAD (2)"]
    print("\n--- Final Test Classification Report ---")
    print(classification_report(y_test, final_preds, target_names=class_names, digits=4))
    
    cm = confusion_matrix(y_test, final_preds)
    print("--- Confusion Matrix ---")
    print(cm)
    
    # Save Model Checkpoint
    model_save_path = "model.pth"
    torch.save(model.state_dict(), model_save_path)
    print(f"\n[+] Successfully saved trained quantum model weights to: {model_save_path}")

if __name__ == "__main__":
    train()
