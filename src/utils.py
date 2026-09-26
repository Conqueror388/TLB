"""
utils.py - Common helper functions and path constants for Q-Credit.
"""

import os
import json
import joblib
import numpy as np

# Directory paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results")

for directory in [DATA_DIR, PROCESSED_DIR, MODELS_DIR, RESULTS_DIR]:
    try:
        os.makedirs(directory, exist_ok=True)
    except OSError:
        pass


def get_data_filepath(filename: str = "cs-training.csv") -> str:
    """Return the absolute path to the dataset file."""
    return os.path.join(DATA_DIR, filename)


def save_processed_data(X_train, X_test, y_train, y_test, feature_names=None, scaler=None):
    """Save preprocessed numpy arrays and metadata."""
    np.save(os.path.join(PROCESSED_DIR, "X_train.npy"), X_train)
    np.save(os.path.join(PROCESSED_DIR, "X_test.npy"), X_test)
    np.save(os.path.join(PROCESSED_DIR, "y_train.npy"), y_train)
    np.save(os.path.join(PROCESSED_DIR, "y_test.npy"), y_test)
    
    if feature_names is not None:
        with open(os.path.join(PROCESSED_DIR, "selected_features.json"), "w") as f:
            json.dump(list(feature_names), f, indent=2)
            
    if scaler is not None:
        joblib.dump(scaler, os.path.join(PROCESSED_DIR, "scaler.joblib"))
        
    print(f"[OK] Saved processed data to {PROCESSED_DIR}")


def load_processed_data():
    """Load preprocessed numpy arrays and metadata."""
    X_train = np.load(os.path.join(PROCESSED_DIR, "X_train.npy"))
    X_test = np.load(os.path.join(PROCESSED_DIR, "X_test.npy"))
    y_train = np.load(os.path.join(PROCESSED_DIR, "y_train.npy"))
    y_test = np.load(os.path.join(PROCESSED_DIR, "y_test.npy"))
    
    features_path = os.path.join(PROCESSED_DIR, "selected_features.json")
    feature_names = None
    if os.path.exists(features_path):
        with open(features_path, "r") as f:
            feature_names = json.load(f)
            
    scaler_path = os.path.join(PROCESSED_DIR, "scaler.joblib")
    scaler = None
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        
    return X_train, X_test, y_train, y_test, feature_names, scaler


def save_model(model, filename: str):
    """Persist a trained model artifact."""
    filepath = os.path.join(MODELS_DIR, filename)
    joblib.dump(model, filepath)
    print(f"[OK] Model saved to {filepath}")


def load_model(filename: str):
    """Load a persisted model artifact."""
    filepath = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Model file not found: {filepath}")
    return joblib.load(filepath)


def save_metrics(metrics_dict: dict, filename: str = "metrics.json"):
    """Save dictionary of metrics to results directory."""
    filepath = os.path.join(RESULTS_DIR, filename)
    with open(filepath, "w") as f:
        json.dump(metrics_dict, f, indent=4)
    print(f"[OK] Metrics saved to {filepath}")


def load_metrics(filename: str = "metrics.json") -> dict:
    """Load dictionary of metrics from results directory."""
    filepath = os.path.join(RESULTS_DIR, filename)
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r") as f:
        return json.load(f)


def create_sample_dataset_if_missing(csv_path: str, n_samples: int = 1500) -> bool:
    """
    If Kaggle cs-training.csv is not present, generate a realistic sample dataset
    matching Kaggle's 'Give Me Some Credit' schema so the pipeline runs out-of-the-box.
    """
    if os.path.exists(csv_path) and os.path.getsize(csv_path) > 100:
        return False

    print(f"[INFO] Dataset '{csv_path}' not found. Generating sample Kaggle Give-Me-Some-Credit data ({n_samples} rows)...")
    np.random.seed(42)
    
    # Target: SeriousDlqin2yrs (imbalanced credit default, ~7% defaults)
    y = np.random.binomial(n=1, p=0.07, size=n_samples)
    
    # Correlated features
    revolving_util = np.random.exponential(scale=0.3, size=n_samples) + y * 0.5
    age = np.random.normal(loc=52, scale=14, size=n_samples).clip(21, 95).astype(int)
    num_30_59_days_late = np.random.poisson(lam=0.2 + y * 1.5, size=n_samples)
    debt_ratio = np.random.exponential(scale=0.4, size=n_samples) + y * 0.2
    
    monthly_income = np.random.lognormal(mean=8.5, sigma=0.8, size=n_samples)
    # inject ~15% NaNs in income like real Kaggle dataset
    nan_mask_inc = np.random.rand(n_samples) < 0.15
    monthly_income[nan_mask_inc] = np.nan
    
    open_lines = np.random.poisson(lam=8.5, size=n_samples).clip(0, 40)
    num_90_days_late = np.random.poisson(lam=0.1 + y * 1.2, size=n_samples)
    num_real_estate = np.random.poisson(lam=1.0, size=n_samples).clip(0, 10)
    num_60_89_days_late = np.random.poisson(lam=0.1 + y * 0.9, size=n_samples)
    
    num_dependents = np.random.poisson(lam=0.7, size=n_samples).astype(float)
    nan_mask_dep = np.random.rand(n_samples) < 0.05
    num_dependents[nan_mask_dep] = np.nan
    
    import pandas as pd
    df = pd.DataFrame({
        "Unnamed: 0": np.arange(1, n_samples + 1),
        "SeriousDlqin2yrs": y,
        "RevolvingUtilizationOfUnsecuredLines": revolving_util,
        "age": age,
        "NumberOfTime30-59DaysPastDueNotWorse": num_30_59_days_late,
        "DebtRatio": debt_ratio,
        "MonthlyIncome": monthly_income,
        "NumberOfOpenCreditLinesAndLoans": open_lines,
        "NumberOfTimes90DaysLate": num_90_days_late,
        "NumberRealEstateLoansOrLines": num_real_estate,
        "NumberOfTime60-89DaysPastDueNotWorse": num_60_89_days_late,
        "NumberOfDependents": num_dependents
    })
    
    df.to_csv(csv_path, index=False)
    print(f"[OK] Generated sample Kaggle dataset saved to {csv_path}")
    return True
