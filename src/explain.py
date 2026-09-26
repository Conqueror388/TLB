"""
explain.py - Model Explainability & Interpretability Surrogate for Q-Credit.

Trains a RandomForestClassifier as a classical surrogate model on the same 4 selected features.
Computes SHAP (SHapley Additive exPlanations) values to explain feature contributions.
Saves a SHAP summary plot as a static visual artifact for the dashboard.

IMPORTANT NOTE:
All explanations reflect the Classical Surrogate decision boundary,
NOT the high-dimensional Hilbert space embedding of the Quantum ZZFeatureMap.
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
import shap

# Ensure src modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import (
    load_processed_data,
    save_model,
    RESULTS_DIR,
    MODELS_DIR
)


def train_surrogate_and_explain(n_estimators: int = 100, random_state: int = 42):
    """
    Train a surrogate RandomForest on the 4 features and generate SHAP analysis.
    """
    print("=" * 60)
    print("PHASE 5: EXPLAINABILITY (RANDOM FOREST SURROGATE + SHAP)")
    print("=" * 60)
    
    # 1. Load preprocessed training & testing sets
    X_train, X_test, y_train, y_test, feature_names, _ = load_processed_data()
    if feature_names is None:
        feature_names = [f"Feature_{i}" for i in range(X_train.shape[1])]
        
    print(f"[INFO] Features for explanation: {feature_names}")
    
    # 2. Train Surrogate RandomForest
    print(f"[INFO] Fitting RandomForest surrogate on {len(X_train)} samples...")
    rf_surrogate = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=6,
        random_state=random_state
    )
    rf_surrogate.fit(X_train, y_train)
    save_model(rf_surrogate, "surrogate_rf.joblib")
    
    # 3. Compute SHAP Values using TreeExplainer
    print("[INFO] Computing SHAP values using TreeExplainer...")
    # Subsample test set for fast and clear SHAP plotting (e.g. 200 samples)
    eval_size = min(300, len(X_test))
    eval_indices = np.random.RandomState(random_state).choice(len(X_test), size=eval_size, replace=False)
    X_eval = X_test[eval_indices]
    
    explainer = shap.TreeExplainer(rf_surrogate)
    shap_values = explainer.shap_values(X_eval)
    
    # Handle binary classification format across different SHAP versions
    # In some versions, shap_values is a list of [class 0, class 1], or a 3D array (samples, features, classes)
    if isinstance(shap_values, list) and len(shap_values) == 2:
        shap_vals_target = shap_values[1]
    elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
        shap_vals_target = shap_values[:, :, 1]
    else:
        shap_vals_target = shap_values

    # 4. Generate SHAP Summary Plot
    shap_plot_path = os.path.join(RESULTS_DIR, "shap_summary.png")
    
    plt.figure(figsize=(9, 5))
    shap.summary_plot(
        shap_vals_target,
        X_eval,
        feature_names=feature_names,
        show=False
    )
    plt.title(
        "Feature Importance via Classical RF Surrogate\n(Note: Explains classical proxy; Hilbert-space quantum feature map is non-linear)",
        fontsize=10,
        fontweight="bold",
        pad=15
    )
    plt.tight_layout()
    plt.savefig(shap_plot_path, bbox_inches="tight", dpi=200)
    plt.close()
    
    print(f"[OK] Saved SHAP summary plot to {shap_plot_path}")
    print("[NOTE] SHAP explanation generated for Classical Surrogate, distinct from quantum state representation.\n")
    return rf_surrogate, shap_vals_target


if __name__ == "__main__":
    train_surrogate_and_explain()
