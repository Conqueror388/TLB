"""
classical_model.py - Classical Baseline Model for Q-Credit.

Trains a Support Vector Classifier (SVC with RBF kernel) using GridSearchCV
over hyperparameters C and gamma on the full-size processed training dataset.
Records training wall-clock time and persists the optimal model artifact.
"""

import os
import sys
import time
import json
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

# Ensure src modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import load_processed_data, save_model, MODELS_DIR


def train_classical_model(cv_folds: int = 5, n_jobs: int = -1, random_state: int = 42):
    """
    Train an RBF-kernel SVC on the preprocessed training dataset with GridSearchCV.
    """
    print("=" * 60)
    print("PHASE 2: TRAINING CLASSICAL BASELINE MODEL (RBF SVC)")
    print("=" * 60)
    
    X_train, X_test, y_train, y_test, feature_names, _ = load_processed_data()
    print(f"[INFO] Loaded training data: X_train={X_train.shape}, y_train={y_train.shape}")
    
    # Define hyperparameter grid as specified:
    # C in [0.1, 1, 10], gamma in ['scale', 0.1, 1]
    param_grid = {
        "C": [0.1, 1.0, 10.0],
        "gamma": ["scale", 0.1, 1.0]
    }
    
    base_svc = SVC(kernel="rbf", probability=True, random_state=random_state)
    
    grid_search = GridSearchCV(
        estimator=base_svc,
        param_grid=param_grid,
        scoring="roc_auc",
        cv=cv_folds,
        n_jobs=n_jobs,
        verbose=1
    )
    
    print(f"[INFO] Running GridSearchCV over grid: {param_grid} with {cv_folds}-fold CV...")
    start_time = time.perf_counter()
    grid_search.fit(X_train, y_train)
    wall_clock_time = time.perf_counter() - start_time
    
    best_model = grid_search.best_estimator_
    best_params = grid_search.best_params_
    best_cv_score = grid_search.best_score_
    
    print(f"\n[RESULTS] Best Hyperparameters: {best_params}")
    print(f"[RESULTS] Best CV ROC-AUC: {best_cv_score:.4f}")
    print(f"[RESULTS] Training Wall-Clock Time: {wall_clock_time:.2f} seconds")
    
    # Save model and metadata
    save_model(best_model, "classical_svc.joblib")
    
    metadata = {
        "model_type": "Classical SVC (RBF kernel)",
        "best_params": best_params,
        "best_cv_roc_auc": float(best_cv_score),
        "train_samples": int(len(X_train)),
        "training_time_seconds": round(wall_clock_time, 4)
    }
    
    meta_path = os.path.join(MODELS_DIR, "classical_model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"[OK] Saved model metadata to {meta_path}\n")
    return best_model, metadata


if __name__ == "__main__":
    train_classical_model()
