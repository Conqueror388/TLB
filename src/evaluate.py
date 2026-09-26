"""
evaluate.py - Comparative Performance Evaluation for Q-Credit.

Computes standard classification metrics for both Classical SVC and Quantum QSVC:
- Accuracy
- Precision
- Recall
- F1 Score
- ROC-AUC
- Confusion Matrix

Generates side-by-side comparison visualizations and writes results to results/metrics.json.
"""

import os
import sys
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    ConfusionMatrixDisplay
)

# Ensure src modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import (
    load_processed_data,
    load_model,
    save_metrics,
    RESULTS_DIR,
    PROCESSED_DIR,
    MODELS_DIR
)


def compute_metrics(y_true, y_pred, y_score=None):
    """Calculate key classification performance metrics."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    auc = None
    if y_score is not None:
        try:
            auc = roc_auc_score(y_true, y_score)
        except Exception:
            # In case only one class is present in a tiny test split
            auc = 0.5
    else:
        auc = 0.5
        
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(auc), 4),
        "confusion_matrix": cm
    }


def plot_confusion_matrix(cm, title: str, output_path: str):
    """Plot and save confusion matrix figure."""
    fig, ax = plt.subplots(figsize=(5, 4))
    disp = ConfusionMatrixDisplay(confusion_matrix=np.array(cm), display_labels=["No Default (0)", "Default (1)"])
    disp.plot(cmap="Blues", ax=ax, values_format="d")
    ax.set_title(title, fontsize=12, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    print(f"[OK] Saved confusion matrix to {output_path}")


def plot_metrics_comparison(metrics_dict: dict, output_path: str):
    """Generate a clean side-by-side comparative bar chart."""
    metric_keys = ["accuracy", "precision", "recall", "f1_score", "roc_auc"]
    metric_labels = ["Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC"]
    
    classical_scores = [metrics_dict["classical"][k] for k in metric_keys]
    quantum_scores = [metrics_dict["quantum"][k] for k in metric_keys]
    
    x = np.arange(len(metric_labels))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(9, 5))
    rects1 = ax.bar(x - width/2, classical_scores, width, label="Classical RBF-SVC", color="#1f77b4")
    rects2 = ax.bar(x + width/2, quantum_scores, width, label="Quantum QSVC (ZZFeatureMap)", color="#9467bd")
    
    ax.set_ylabel("Score (0.0 to 1.0)", fontsize=11)
    ax.set_title("Classical vs Quantum Kernel Classifier Performance", fontsize=13, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=10)
    ax.set_ylim(0, 1.15)
    ax.legend(loc="upper right", frameon=True)
    ax.grid(axis="y", linestyle="--", alpha=0.5)
    
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f"{height:.2f}",
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha="center", va="bottom", fontsize=9, fontweight="bold")
            
    autolabel(rects1)
    autolabel(rects2)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    print(f"[OK] Saved metrics comparison chart to {output_path}")


def evaluate_models():
    """Run evaluation for classical and quantum models."""
    print("=" * 60)
    print("PHASE 4: EVALUATING CLASSICAL AND QUANTUM MODELS")
    print("=" * 60)
    
    # 1. Load classical test data
    _, X_test_full, _, y_test_full, _, _ = load_processed_data()
    
    # 2. Load quantum test data (subsample)
    q_test_x_path = os.path.join(PROCESSED_DIR, "X_test_quantum.npy")
    q_test_y_path = os.path.join(PROCESSED_DIR, "y_test_quantum.npy")
    if os.path.exists(q_test_x_path):
        X_test_q = np.load(q_test_x_path)
        y_test_q = np.load(q_test_y_path)
    else:
        # Fallback to first 60 instances of test set
        X_test_q = X_test_full[:60]
        y_test_q = y_test_full[:60]
        
    # 3. Load Models
    classical_model = load_model("classical_svc.joblib")
    quantum_model = load_model("quantum_qsvc.joblib")
    
    # Load training timing metadata
    classical_meta_path = os.path.join(MODELS_DIR, "classical_model_meta.json")
    quantum_meta_path = os.path.join(MODELS_DIR, "quantum_model_meta.json")
    
    classical_time = 0.0
    if os.path.exists(classical_meta_path):
        with open(classical_meta_path) as f:
            classical_time = json.load(f).get("training_time_seconds", 0.0)
            
    quantum_time = 0.0
    if os.path.exists(quantum_meta_path):
        with open(quantum_meta_path) as f:
            quantum_time = json.load(f).get("training_time_seconds", 0.0)

    # 4. Evaluate Classical Model (on quantum test set for direct apples-to-apples comparison)
    print(f"[INFO] Predicting with Classical SVC on {len(X_test_q)} samples...")
    y_pred_classical = classical_model.predict(X_test_q)
    try:
        y_score_classical = classical_model.predict_proba(X_test_q)[:, 1]
    except Exception:
        y_score_classical = classical_model.decision_function(X_test_q)
    classical_metrics = compute_metrics(y_test_q, y_pred_classical, y_score_classical)
    classical_metrics["training_time_seconds"] = classical_time

    # 5. Evaluate Quantum Model on identical quantum test set
    print(f"[INFO] Predicting with Quantum QSVC on {len(X_test_q)} samples...")
    y_pred_quantum = quantum_model.predict(X_test_q)
    try:
        y_score_quantum = quantum_model.decision_function(X_test_q)
    except Exception:
        y_score_quantum = y_pred_quantum
    quantum_metrics = compute_metrics(y_test_q, y_pred_quantum, y_score_quantum)
    quantum_metrics["training_time_seconds"] = quantum_time

    # Also compute classical on full test set for macro context
    y_pred_classical_full = classical_model.predict(X_test_full)
    try:
        y_score_classical_full = classical_model.predict_proba(X_test_full)[:, 1]
    except Exception:
        y_score_classical_full = classical_model.decision_function(X_test_full)
    classical_full_metrics = compute_metrics(y_test_full, y_pred_classical_full, y_score_classical_full)

    # 6. Aggregate results
    all_metrics = {
        "classical": classical_metrics,
        "quantum": quantum_metrics,
        "classical_full_test_benchmark": classical_full_metrics,
        "evaluation_samples": len(y_test_q)
    }

    # 7. Persist metrics and plots
    save_metrics(all_metrics, "metrics.json")
    
    cm_classical_path = os.path.join(RESULTS_DIR, "confusion_matrix_classical.png")
    cm_quantum_path = os.path.join(RESULTS_DIR, "confusion_matrix_quantum.png")
    comp_plot_path = os.path.join(RESULTS_DIR, "metrics_comparison.png")
    
    plot_confusion_matrix(classical_metrics["confusion_matrix"], "Classical SVC Confusion Matrix", cm_classical_path)
    plot_confusion_matrix(quantum_metrics["confusion_matrix"], "Quantum QSVC Confusion Matrix", cm_quantum_path)
    plot_metrics_comparison(all_metrics, comp_plot_path)
    
    print("\n" + "=" * 50)
    print("           EVALUATION SUMMARY")
    print("=" * 50)
    print(f"{'Metric':<15} | {'Classical SVC':<15} | {'Quantum QSVC':<15}")
    print("-" * 50)
    for k in ["accuracy", "precision", "recall", "f1_score", "roc_auc"]:
        print(f"{k.capitalize():<15} | {classical_metrics[k]:<15.4f} | {quantum_metrics[k]:<15.4f}")
    print(f"{'Train Time (s)':<15} | {classical_time:<15.2f} | {quantum_time:<15.2f}")
    print("=" * 50)
    
    return all_metrics


if __name__ == "__main__":
    evaluate_models()
