# ⚛️ Q-Credit: Hybrid Quantum-Classical Credit Risk Classifier

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/downloads/)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.0%2B-613399.svg)](https://qiskit.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A benchmarking project comparing classical **Support Vector Classifiers (RBF kernel)** with **Quantum Support Vector Classifiers (QSVC)** powered by parameterized quantum feature maps ($ZZ\text{FeatureMap}$) on financial loan default prediction.

---

## 🧭 Project Architecture

```
q-credit/
├── data/                  # Raw dataset (expects cs-training.csv, Kaggle format)
│   └── processed/         # X_train, X_test, y_train, y_test, scalers, metadata
├── src/
│   ├── preprocess.py      # Imputation, Mutual Info selection (top 4), [0, π] scaling, SMOTE
│   ├── classical_model.py # GridSearchCV over SVC(kernel='rbf', C, gamma)
│   ├── quantum_model.py   # ZZFeatureMap(4, reps=2), FidelityQuantumKernel, QSVC
│   ├── evaluate.py        # Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
│   ├── explain.py         # RandomForest surrogate model + SHAP summary plot
│   └── utils.py           # Paths, serialization, dataset generator fallback
├── app/
│   └── dashboard.py       # Streamlit interactive application with dual live inference
├── notebooks/
│   └── exploration.ipynb  # Interactive EDA and circuit inspection
├── models/                # Serialized model artifacts (.joblib)
├── results/               # metrics.json, confusion matrices, SHAP plot, circuit diagram
├── requirements.txt       # Project dependencies
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone & Navigate to Repository
```bash
cd q-credit
```

### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🚀 Step-by-Step Execution Workflow

### Phase 1: Preprocessing & Data Ingestion
Processes Kaggle's "Give Me Some Credit" dataset (`cs-training.csv`). If no file is detected in `data/`, the pipeline automatically synthesizes a realistic sample dataset to ensure zero-friction testing.
```bash
python src/preprocess.py
```
- Imputes missing variables (median strategy).
- Selects the top 4 predictive features via **Mutual Information** against `SeriousDlqin2yrs`.
- Scales inputs to $[0, \pi]$ using `MinMaxScaler` for single-qubit quantum rotation gates ($R_z$).
- Performs a 70/30 stratified train-test split and applies **SMOTE** on the training split only.

### Phase 2: Train Classical Baseline Model
```bash
python src/classical_model.py
```
- Fits `SVC(kernel='rbf')` using 5-fold cross-validation `GridSearchCV` over $C \in [0.1, 1.0, 10.0]$ and $\gamma \in [\text{'scale'}, 0.1, 1.0]$.
- Logs training wall-clock time and saves best estimator to `models/classical_svc.joblib`.

### Phase 3: Train Quantum Classifier (QSVC)
```bash
python src/quantum_model.py
```
- Subsamples 200 stratified training instances and 60 test instances (to bound classical simulation compute).
- Builds a 4-qubit `ZZFeatureMap` (`reps=2, entanglement='linear'`) wrapped in a `FidelityQuantumKernel`.
- Fits the `QSVC` classifier, logs wall-clock time, exports the circuit diagram to `results/zz_feature_map.png`, and saves model to `models/quantum_qsvc.joblib`.

### Phase 4: Comparative Evaluation & Metrics
```bash
python src/evaluate.py
```
- Evaluates both models across: Accuracy, Precision, Recall, F1 Score, and ROC-AUC.
- Generates side-by-side confusion matrices and exports `results/metrics.json` and `results/metrics_comparison.png`.

### Phase 5: Explainability with Surrogate SHAP
```bash
python src/explain.py
```
- Trains a `RandomForestClassifier` surrogate on the 4 features.
- Computes Tree SHAP values and exports `results/shap_summary.png`.
- *Note:* Clearly distinguishes classical surrogate explanations from quantum Hilbert embeddings.

### Phase 6: Launch Interactive Dashboard
```bash
streamlit run app/dashboard.py
```
Opens the interactive web application featuring:
- Live sliders for the 4 credit attributes with dual side-by-side inference.
- Complete performance metrics comparison table.
- Quantum circuit visualizer ($ZZ\text{FeatureMap}$).
- Classical surrogate SHAP summary.

---

## 🔬 Scientific Rigor & The "Quantum Advantage" Question

> **Honest Technical Framing:**  
> This project is designed as an **empirical, scientifically rigorous benchmark** comparing classical kernels and quantum kernels on tabular credit risk data. It is **not** a claim of proven quantum advantage.

### Key Considerations:
1. **Classical Simulation Bottleneck:**  
   Computing a quantum kernel matrix of size $N \times N$ on classical state-vector simulators scales with $O(N^2 \times 2^n)$ operations. Classical RBF kernels evaluate in fractions of a second, whereas simulated quantum kernels require tens of seconds to minutes for modest sample sizes ($N=200$).
   
2. **Inductive Bias on Tabular Data:**  
   Tabular tabular credit data does not possess inherent quantum symmetries or group structures (unlike quantum chemistry or lattice simulations). While the $ZZ\text{FeatureMap}$ maps data into an exponentially large $2^4 = 16$-dimensional Hilbert space, classical RBF and ensemble methods remain strong baselines for tabular patterns.
   
3. **Hardware Readiness:**  
   The primary value of this architecture is **algorithm prototyping**: testing hybrid quantum-classical interfaces today with small feature spaces, preparing pipelines for actual quantum processing units (QPUs) with error mitigation as hardware scales.

# TLB
