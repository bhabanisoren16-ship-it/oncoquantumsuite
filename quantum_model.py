"""
quantum_model.py
HQML-OncoDetect: Hybrid Quantum ML Platform for Early Cancer Detection (SIH26139)

Defines the classical-quantum hybrid neural network:
- Classical Dimensionality Reduction: 50 gene expression features -> 4 quantum angles
- Quantum Device: PennyLane default.qubit (4 wires)
- Quantum Embedding: AngleEmbedding (rotation='Y')
- Variational Ansatz: 2 StronglyEntanglingLayers
- Quantum Measurement: PauliZ expectation values on all 4 qubits
- Classical Output Head: Linear layer (4 -> 3 classes) with LogSoftmax
"""

import numpy as np
import torch
import torch.nn as nn
import pennylane as qml
import matplotlib.pyplot as plt

# Quantum architecture configuration
NUM_QUBITS = 4
NUM_LAYERS = 2
NUM_CLASSES = 3

dev = qml.device("default.qubit", wires=NUM_QUBITS)

@qml.qnode(dev, interface="torch", diff_method="backprop")
def qnode_circuit(inputs, weights):
    """
    4-Qubit Variational Quantum Classifier Circuit:
    1. Angle Embedding: Encodes 4 scaled features into Pauli-Y rotation angles.
    2. Strongly Entangling Layers: 2 variational layers of arbitrary single-qubit
       rotations combined with circular CNOT entangling gates.
    3. Measurement: Pauli-Z expectation values on all 4 qubits.
    """
    # Angle embedding on 4 qubits
    qml.AngleEmbedding(inputs, wires=range(NUM_QUBITS), rotation="Y")
    
    # Strongly entangling variational ansatz
    qml.StronglyEntanglingLayers(weights, wires=range(NUM_QUBITS))
    
    # Expectation values of Pauli-Z operator on each qubit
    return [qml.expval(qml.PauliZ(i)) for i in range(NUM_QUBITS)]


class HybridQNN(nn.Module):
    """
    Classical-Quantum Hybrid Neural Network for Multi-Class Cancer Classification.
    """
    def __init__(self, in_features=50, n_qubits=NUM_QUBITS, n_layers=NUM_LAYERS, n_classes=NUM_CLASSES):
        super().__init__()
        self.in_features = in_features
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.n_classes = n_classes
        
        # Classical Dimensionality Reduction: 50 -> 4
        # Multi-layer reduction preserving non-linear gene interactions
        self.dim_reduction = nn.Sequential(
            nn.Linear(in_features, 16),
            nn.ReLU(),
            nn.Linear(16, n_qubits),
            nn.Tanh() # Bounded to [-1, 1], subsequently scaled to [-pi, pi]
        )
        
        # Variational Quantum Layer
        weight_shapes = {"weights": (n_layers, n_qubits, 3)}
        self.q_layer = qml.qnn.TorchLayer(qnode_circuit, weight_shapes)
        
        # Classical Classification Head: 4 quantum expectation values -> 3 class logits
        self.classifier = nn.Linear(n_qubits, n_classes)
        self.log_softmax = nn.LogSoftmax(dim=-1)

    def forward(self, x):
        """
        Forward pass returning unnormalized class logits.
        """
        # 1. Classical reduction to rotation angle bounds [-pi, pi]
        angles = self.dim_reduction(x) * np.pi
        
        # 2. Quantum circuit execution
        q_out = self.q_layer(angles)
        
        # 3. Output head logits
        logits = self.classifier(q_out)
        return logits

    def forward_with_quantum_state(self, x):
        """
        Forward pass that also returns intermediate quantum representations
        for dashboard interpretability (angles, expectation values, probabilities).
        """
        angles = self.dim_reduction(x) * np.pi
        q_out = self.q_layer(angles)
        logits = self.classifier(q_out)
        probs = torch.softmax(logits, dim=-1)
        log_probs = self.log_softmax(logits)
        
        return {
            "angles": angles,
            "quantum_expectations": q_out,
            "logits": logits,
            "probabilities": probs,
            "log_probabilities": log_probs
        }


def draw_circuit(as_mpl=False, weights=None):
    """
    Draws the quantum circuit schematic.
    Returns:
        ASCII string if as_mpl is False, or Matplotlib Figure if as_mpl is True.
    """
    dummy_inputs = torch.zeros(NUM_QUBITS)
    if weights is None:
        weights = torch.zeros((NUM_LAYERS, NUM_QUBITS, 3))
        
    if as_mpl:
        qml.drawer.use_style("black_white")
        fig, ax = qml.draw_mpl(qnode_circuit)(dummy_inputs, weights)
        return fig
    else:
        drawer = qml.draw(qnode_circuit)
        return drawer(dummy_inputs, weights)


if __name__ == "__main__":
    print("Testing Quantum Model Architecture...")
    model = HybridQNN(in_features=50)
    print(f"[+] HybridQNN initialized successfully.")
    
    dummy_x = torch.randn(2, 50)
    out = model.forward_with_quantum_state(dummy_x)
    print(f"[+] Forward pass shape - Logits: {out['logits'].shape}, Probs: {out['probabilities'].shape}")
    print(f"[+] Quantum Expectations shape: {out['quantum_expectations'].shape}")
    print("\n--- Quantum Circuit Schematic (ASCII) ---")
    print(draw_circuit(as_mpl=False))
