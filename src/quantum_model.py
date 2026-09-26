"""
quantum_model.py - Quantum Support Vector Classifier (QSVC) for Q-Credit.

Builds a parameterized quantum feature map:
    ZZFeatureMap(feature_dimension=4, reps=2, entanglement='linear')
Uses FidelityQuantumKernel to project 4D classical credit data into quantum Hilbert space.
Trains a QSVC on a stratified subsample of 200 training instances and evaluates kernel computation.
Records training wall-clock time and exports circuit visualization.
"""

import os
import sys
import time
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server/CLI environments
import matplotlib.pyplot as plt

# Qiskit imports
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit_machine_learning.algorithms import QSVC

# Ensure src modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import (
    load_processed_data,
    save_model,
    MODELS_DIR,
    RESULTS_DIR,
    PROCESSED_DIR
)


def get_stratified_subsample(X, y, n_samples: int, random_state: int = 42):
    """Obtain a balanced / stratified subsample of specified size."""
    rng = np.random.RandomState(random_state)
    classes, counts = np.unique(y, return_counts=True)
    
    selected_indices = []
    for cls in classes:
        cls_indices = np.where(y == cls)[0]
        # Proportional count or balanced count
        cls_target_n = int(np.round(n_samples * (len(cls_indices) / len(y))))
        # Ensure at least 1 sample per class
        cls_target_n = max(1, min(cls_target_n, len(cls_indices)))
        chosen = rng.choice(cls_indices, size=cls_target_n, replace=False)
        selected_indices.extend(chosen)
        
    # If rounding caused off-by-one or small discrepancy, adjust randomly
    if len(selected_indices) < n_samples:
        remaining = np.setdiff1d(np.arange(len(y)), selected_indices)
        extra = rng.choice(remaining, size=n_samples - len(selected_indices), replace=False)
        selected_indices.extend(extra)
    elif len(selected_indices) > n_samples:
        selected_indices = rng.choice(selected_indices, size=n_samples, replace=False)
        
    selected_indices = np.array(selected_indices)
    rng.shuffle(selected_indices)
    return X[selected_indices], y[selected_indices], selected_indices


def generate_circuit_diagram(feature_map, output_path: str = None):
    """Draw and save the decomposed ZZFeatureMap circuit."""
    if output_path is None:
        output_path = os.path.join(RESULTS_DIR, "zz_feature_map.png")
        
    try:
        fig = feature_map.decompose().draw(output="mpl")
        fig.savefig(output_path, bbox_inches="tight", dpi=200)
        plt.close(fig)
        print(f"[OK] Saved decomposed quantum circuit diagram to {output_path}")
    except Exception as e:
        print(f"[WARN] Matplotlib circuit draw failed ({e}), falling back to text circuit...")
        try:
            text_drawing = str(feature_map.decompose().draw(output="text"))
            text_path = os.path.join(RESULTS_DIR, "zz_feature_map.txt")
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(text_drawing)
            print(f"[OK] Saved text quantum circuit to {text_path}")
            
            fig, ax = plt.subplots(figsize=(12, 5))
            ax.text(0.02, 0.5, text_drawing, fontfamily="monospace", fontsize=9, va="center")
            ax.axis("off")
            fig.savefig(output_path, bbox_inches="tight", dpi=200)
            plt.close(fig)
        except Exception as e2:
            print(f"[WARN] Text circuit fallback error: {e2}")


def train_quantum_model(
    n_train: int = 200,
    n_test: int = 60,
    reps: int = 2,
    entanglement: str = "linear",
    random_state: int = 42
):
    """
    Train a QSVC using ZZFeatureMap and FidelityQuantumKernel.
    """
    print("=" * 60)
    print("PHASE 3: TRAINING QUANTUM MODEL (QSVC with ZZFeatureMap)")
    print("=" * 60)
    
    # 1. Load preprocessed data
    X_train_full, X_test_full, y_train_full, y_test_full, feature_names, _ = load_processed_data()
    
    # 2. Stratified subsampling (200 train / 60 test)
    n_train = min(n_train, len(X_train_full))
    n_test = min(n_test, len(X_test_full))
    
    print(f"[INFO] Subsampling: {n_train} train instances, {n_test} test instances...")
    X_train_q, y_train_q, train_idx = get_stratified_subsample(
        X_train_full, y_train_full, n_samples=n_train, random_state=random_state
    )
    X_test_q, y_test_q, test_idx = get_stratified_subsample(
        X_test_full, y_test_full, n_samples=n_test, random_state=random_state
    )
    
    # Persist the exact quantum subsamples for direct apples-to-apples evaluation
    np.save(os.path.join(PROCESSED_DIR, "X_train_quantum.npy"), X_train_q)
    np.save(os.path.join(PROCESSED_DIR, "y_train_quantum.npy"), y_train_q)
    np.save(os.path.join(PROCESSED_DIR, "X_test_quantum.npy"), X_test_q)
    np.save(os.path.join(PROCESSED_DIR, "y_test_quantum.npy"), y_test_q)
    
    print(f"[INFO] Quantum training label distribution: {np.bincount(y_train_q)}")
    print(f"[INFO] Quantum test label distribution: {np.bincount(y_test_q)}")
    
    # 3. Build ZZFeatureMap
    num_features = X_train_q.shape[1]  # 4 features
    print(f"[INFO] Constructing ZZFeatureMap(feature_dimension={num_features}, reps={reps}, entanglement='{entanglement}')...")
    feature_map = ZZFeatureMap(
        feature_dimension=num_features,
        reps=reps,
        entanglement=entanglement
    )
    
    # Export circuit visualization
    generate_circuit_diagram(feature_map)
    
    # 4. Construct Quantum Kernel
    print("[INFO] Constructing FidelityQuantumKernel...")
    quantum_kernel = FidelityQuantumKernel(feature_map=feature_map)
    
    # 5. Initialize QSVC
    qsvc = QSVC(quantum_kernel=quantum_kernel)
    
    # 6. Fit QSVC and measure wall-clock time
    print(f"[INFO] Fitting QSVC on {n_train} samples. This executes quantum state-vector / circuit evaluations...")
    start_time = time.perf_counter()
    qsvc.fit(X_train_q, y_train_q)
    wall_clock_time = time.perf_counter() - start_time
    
    print(f"\n[RESULTS] Quantum QSVC Training Complete!")
    print(f"[RESULTS] Training Wall-Clock Time: {wall_clock_time:.2f} seconds ({wall_clock_time/60:.2f} minutes)")
    
    # 7. Compute train kernel matrix preview
    try:
        sample_kernel_matrix = quantum_kernel.evaluate(X_train_q[:10], X_train_q[:10])
        np.save(os.path.join(RESULTS_DIR, "sample_train_kernel_matrix.npy"), sample_kernel_matrix)
        print(f"[OK] Saved 10x10 sample kernel matrix preview to results/.")
    except Exception as e:
        print(f"[WARN] Could not save preview kernel matrix: {e}")
        
    # 8. Save Model and Metadata
    save_model(qsvc, "quantum_qsvc.joblib")
    
    metadata = {
        "model_type": "Quantum SVC (QSVC with ZZFeatureMap)",
        "feature_dimension": num_features,
        "reps": reps,
        "entanglement": entanglement,
        "train_samples": n_train,
        "test_samples": n_test,
        "training_time_seconds": round(wall_clock_time, 4)
    }
    
    meta_path = os.path.join(MODELS_DIR, "quantum_model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"[OK] Saved quantum model metadata to {meta_path}\n")
    return qsvc, metadata


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train Quantum QSVC Model")
    parser.add_argument("--train-samples", type=int, default=150, help="Number of training instances (default: 150, max recommended 200)")
    parser.add_argument("--test-samples", type=int, default=50, help="Number of test instances (default: 50)")
    parser.add_argument("--reps", type=int, default=2, help="Feature map repetitions (default: 2)")
    args = parser.parse_args()
    
    train_quantum_model(n_train=args.train_samples, n_test=args.test_samples, reps=args.reps)
