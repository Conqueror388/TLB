"""
preprocess.py - Data ingestion and preprocessing pipeline for Q-Credit.

Steps:
1. Load dataset (cs-training.csv in Kaggle 'Give Me Some Credit' format).
2. Impute missing values using median statistics.
3. Select top 4 features using mutual information against 'SeriousDlqin2yrs'.
4. Perform stratified 70/30 train/test split.
5. Scale selected features to [0, pi] with MinMaxScaler.
6. Apply SMOTE oversampling on training split only.
7. Save processed arrays and metadata to data/processed/.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import mutual_info_classif
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE

# Ensure src modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import (
    get_data_filepath,
    save_processed_data,
    create_sample_dataset_if_missing,
    PROCESSED_DIR
)


def load_and_clean_data(csv_path: str):
    """Load raw dataset and separate features from target."""
    create_sample_dataset_if_missing(csv_path)
    
    df = pd.read_csv(csv_path)
    print(f"[INFO] Loaded dataset shape: {df.shape}")
    
    # Drop unwanted ID or index columns if present
    for col in ["Unnamed: 0", "ID", "id"]:
        if col in df.columns:
            df = df.drop(columns=[col])
            
    target_col = "SeriousDlqin2yrs"
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in {csv_path}")
        
    # Drop rows where target is NaN (if any)
    df = df.dropna(subset=[target_col])
    
    y = df[target_col].astype(int).values
    X = df.drop(columns=[target_col])
    feature_names = X.columns.tolist()
    
    print(f"[INFO] Class balance: {np.bincount(y)} (Default rate: {np.mean(y):.2%})")
    return X, y, feature_names


def run_pipeline(csv_path: str = None, top_k: int = 4, random_state: int = 42):
    """Execute complete data preparation pipeline."""
    if csv_path is None:
        csv_path = get_data_filepath("cs-training.csv")
        
    X_df, y, raw_feature_names = load_and_clean_data(csv_path)
    
    # Step 1: Impute missing values with median
    imputer = SimpleImputer(strategy="median")
    X_imputed = imputer.fit_transform(X_df)
    
    # Step 2: Feature selection via Mutual Information
    print(f"[INFO] Calculating Mutual Information against target for {len(raw_feature_names)} features...")
    # Subsample for mutual_info calculation if dataset is massive (e.g. 150k rows) to run quickly
    n_total = len(y)
    if n_total > 15000:
        idx = np.random.RandomState(random_state).choice(n_total, size=15000, replace=False)
        mi_scores = mutual_info_classif(X_imputed[idx], y[idx], random_state=random_state)
    else:
        mi_scores = mutual_info_classif(X_imputed, y, random_state=random_state)
        
    top_indices = np.argsort(mi_scores)[::-1][:top_k]
    selected_features = [raw_feature_names[i] for i in top_indices]
    
    print("\n--- Feature Selection (Mutual Information) ---")
    for rank, idx in enumerate(top_indices, start=1):
        print(f"Rank {rank}: {raw_feature_names[idx]} (Score: {mi_scores[idx]:.4f})")
        
    X_selected = X_imputed[:, top_indices]
    
    # Save min/max statistics of selected raw features for interactive sliders
    raw_stats = {}
    for i, fname in enumerate(selected_features):
        vals = X_selected[:, i]
        raw_stats[fname] = {
            "min": float(np.percentile(vals, 1)),
            "max": float(np.percentile(vals, 99)),
            "median": float(np.median(vals)),
            "mean": float(np.mean(vals))
        }
    with open(os.path.join(PROCESSED_DIR, "feature_stats.json"), "w") as f:
        json.dump(raw_stats, f, indent=2)
        
    # Step 3: Stratified 70/30 train/test split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_selected,
        y,
        test_size=0.30,
        random_state=random_state,
        stratify=y
    )
    print(f"[INFO] Train split: {X_train_raw.shape[0]} samples, Test split: {X_test_raw.shape[0]} samples")
    
    # Step 4: Scale to [0, pi] using MinMaxScaler (critical for quantum rotation gates)
    scaler = MinMaxScaler(feature_range=(0, np.pi))
    X_train_scaled = scaler.fit_transform(X_train_raw)
    X_test_scaled = scaler.transform(X_test_raw)
    
    # Step 5: SMOTE on training split only
    print("[INFO] Applying SMOTE oversampling to training set...")
    smote = SMOTE(random_state=random_state)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)
    print(f"[INFO] Post-SMOTE train distribution: {np.bincount(y_train_resampled)}")
    
    # Step 6: Save processed outputs
    save_processed_data(
        X_train=X_train_resampled,
        X_test=X_test_scaled,
        y_train=y_train_resampled,
        y_test=y_test,
        feature_names=selected_features,
        scaler=scaler
    )
    
    print("[SUCCESS] Preprocessing completed successfully!\n")
    return X_train_resampled, X_test_scaled, y_train_resampled, y_test, selected_features


if __name__ == "__main__":
    run_pipeline()
