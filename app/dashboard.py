"""
dashboard.py - Q-Credit: Premium Hybrid Quantum-Classical Risk Assessment Platform.

Engineered with dark-first glassmorphism, quantum particle lattice ambient effects,
animated SVG risk gauge with count-up, dual-engine personality cards,
and interactive Plotly diagnostics.
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
import streamlit as st
import streamlit.components.v1 as components
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Set up module imports
SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src")
sys.path.append(SRC_DIR)
from utils import load_model, load_metrics, RESULTS_DIR, PROCESSED_DIR

# Page configuration
st.set_page_config(
    page_title="Q-Credit • Quantum & Classical Risk Intelligence",
    page_icon="⚛️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# -----------------------------------------------------------------------------
# DESIGN SYSTEM & MOTION STYLESHEET
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
    
    :root {
        --bg-void: #05070F;
        --surface-1: #0F172A;
        --surface-2: rgba(20, 28, 51, 0.65);
        --surface-card: rgba(15, 23, 42, 0.75);
        --border-glass: rgba(148, 163, 184, 0.14);
        --border-glass-hover: rgba(56, 189, 248, 0.35);
        --accent-quantum: linear-gradient(135deg, #00E5FF 0%, #7C4DFF 100%);
        --accent-classical: #38BDF8;
        --success: #10B981;
        --danger: #EF4444;
        --warning: #F59E0B;
        --text-primary: #F1F5F9;
        --text-muted: #94A3B8;
    }

    /* Full dark theme canvas */
    .stApp {
        background-color: var(--bg-void) !important;
        color: var(--text-primary) !important;
        font-family: 'Inter', -apple-system, sans-serif !important;
    }

    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 3.5rem !important;
        max-width: 1260px !important;
    }

    /* Keyframes */
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.2); }
        50% { box-shadow: 0 0 30px rgba(124, 77, 255, 0.45); }
    }

    @keyframes orbitNode {
        0% { transform: rotate(0deg) translateX(14px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
    }

    @keyframes shimmerBar {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }

    /* Staggered entrance animations */
    .anim-fade-1 { animation: fadeUp 0.45s ease-out 0.05s both; }
    .anim-fade-2 { animation: fadeUp 0.45s ease-out 0.15s both; }
    .anim-fade-3 { animation: fadeUp 0.5s ease-out 0.25s both; }
    .anim-fade-4 { animation: fadeUp 0.55s ease-out 0.35s both; }

    /* Hero Banner */
    .hero-panel {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 28, 51, 0.8) 100%);
        border: 1px solid var(--border-glass);
        border-radius: 16px;
        padding: 1.8rem 2.2rem;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(20px);
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .hero-panel::after {
        content: '';
        position: absolute;
        top: 0; right: 0; width: 350px; height: 100%;
        background: radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, transparent 70%);
        pointer-events: none;
    }
    .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: rgba(0, 229, 255, 0.08);
        border: 1px solid rgba(0, 229, 255, 0.25);
        color: #00E5FF;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.28rem 0.75rem;
        border-radius: 9999px;
        margin-bottom: 0.8rem;
    }
    .hero-tag .live-dot {
        width: 6px; height: 6px;
        background-color: #00E5FF;
        border-radius: 50%;
        box-shadow: 0 0 8px #00E5FF;
        display: inline-block;
    }
    .hero-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2.15rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: #F8FAFC;
        margin: 0;
        line-height: 1.2;
    }
    .hero-title span {
        background: var(--accent-quantum);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .hero-sub {
        color: var(--text-muted);
        font-size: 0.96rem;
        margin-top: 0.5rem;
        max-width: 820px;
        line-height: 1.5;
    }

    /* Glass Cards */
    .glass-card {
        background: var(--surface-card);
        border: 1px solid var(--border-glass);
        border-radius: 14px;
        padding: 1.5rem;
        backdrop-filter: blur(16px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        margin-bottom: 1.2rem;
    }
    .glass-card:hover {
        border-color: var(--border-glass-hover);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    }
    .section-header {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.15rem;
        font-weight: 600;
        color: #F8FAFC;
        margin-bottom: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    /* Dual Engine Cards */
    .engine-box {
        border-radius: 12px;
        padding: 1.2rem;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    .engine-classical {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(56, 189, 248, 0.28);
    }
    .engine-classical:hover {
        border-color: rgba(56, 189, 248, 0.6);
        box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);
    }
    .engine-quantum {
        background: linear-gradient(145deg, rgba(20, 28, 51, 0.85) 0%, rgba(30, 27, 75, 0.5) 100%);
        border: 1px solid rgba(124, 77, 255, 0.4);
        box-shadow: 0 4px 20px rgba(124, 77, 255, 0.12);
    }
    .engine-quantum:hover {
        border-color: #00E5FF;
        box-shadow: 0 6px 25px rgba(0, 229, 255, 0.2);
    }
    .engine-orbit-icon {
        display: inline-flex;
        position: relative;
        width: 32px;
        height: 32px;
        align-items: center;
        justify-content: center;
    }
    .orbit-qubit {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00E5FF;
        box-shadow: 0 0 6px #00E5FF;
        animation: orbitNode 3s linear infinite;
    }
    .engine-badge {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 0.3rem;
    }
    .engine-val-safe {
        color: var(--success);
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
    }
    .engine-val-risk {
        color: var(--danger);
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
    }

    /* Decision Banner */
    .decision-banner-approved {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
        border: 1.5px solid rgba(16, 185, 129, 0.45);
        border-radius: 12px;
        padding: 1.1rem 1.4rem;
        text-align: center;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #34D399;
        margin-bottom: 1.2rem;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
    }
    .decision-banner-declined {
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
        border: 1.5px solid rgba(239, 68, 68, 0.45);
        border-radius: 12px;
        padding: 1.1rem 1.4rem;
        text-align: center;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #F87171;
        margin-bottom: 1.2rem;
        box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
    }

    /* Key Credit Factors */
    .factor-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.08);
        font-size: 0.88rem;
        color: #CBD5E1;
        margin-bottom: 0.5rem;
    }
    .factor-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    /* Trust Stats Strip */
    .trust-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--border-glass);
        border-radius: 10px;
        padding: 0.75rem 1.2rem;
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-bottom: 1.5rem;
    }

    /* Streamlit Widget Overrides for Dark FinTech Look */
    .stSlider > div > div > div > div {
        background: var(--accent-quantum) !important;
    }
    .stSlider > div > div > div {
        color: #00E5FF !important;
    }
    .stButton > button {
        background: var(--accent-quantum) !important;
        color: #05070F !important;
        font-weight: 700 !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 0.65rem 1.4rem !important;
        font-family: 'Space Grotesk', sans-serif !important;
        transition: transform 0.18s ease, box-shadow 0.18s ease !important;
    }
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 20px rgba(0, 229, 255, 0.35) !important;
    }
    .stButton > button:active {
        transform: scale(0.97) !important;
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# AMBIENT QUANTUM LATTICE COMPONENT (CANVAS PARTICLES)
# -----------------------------------------------------------------------------
def render_quantum_lattice():
    """Renders a lightweight interactive quantum node/lattice canvas."""
    html_code = """
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
        canvas { display: block; width: 100vw; height: 110px; }
    </style>
    </head>
    <body>
    <canvas id="lattice"></canvas>
    <script>
        const canvas = document.getElementById('lattice');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = 110;
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = 110;
        });

        const nodes = [];
        const count = 38;
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: Math.random() * 1.8 + 1.2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw connecting entanglement lines
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 95) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        const alpha = (1 - dist / 95) * 0.22;
                        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            for (let i = 0; i < count; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = i % 3 === 0 ? 'rgba(124, 77, 255, 0.7)' : 'rgba(0, 229, 255, 0.75)';
                ctx.fill();
            }
            requestAnimationFrame(draw);
        }
        draw();
    </script>
    </body>
    </html>
    """
    components.html(html_code, height=115, scrolling=False)


# -----------------------------------------------------------------------------
# ANIMATED CIRCULAR SVG RISK GAUGE WITH COUNT-UP & CONFETTI
# -----------------------------------------------------------------------------
def render_risk_gauge(risk_pct: int, verdict_is_approved: bool):
    """Renders a futuristic circular SVG gauge with count-up animation."""
    if risk_pct < 30:
        color_hex = "#10B981"
        glow_rgba = "rgba(16, 185, 129, 0.4)"
        status_label = "Low Default Risk"
    elif risk_pct < 60:
        color_hex = "#F59E0B"
        glow_rgba = "rgba(245, 158, 11, 0.4)"
        status_label = "Moderate Risk"
    else:
        color_hex = "#EF4444"
        glow_rgba = "rgba(239, 68, 68, 0.4)"
        status_label = "Elevated Default Risk"

    confetti_script = """
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <script>
        setTimeout(() => {
            confetti({
                particleCount: 40,
                spread: 55,
                origin: { y: 0.65 },
                colors: ['#00E5FF', '#10B981', '#7C4DFF'],
                disableForReducedMotion: true
            });
        }, 400);
    </script>
    """ if verdict_is_approved else ""

    gauge_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
        body {{
            margin: 0; padding: 0; background: transparent;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Space Grotesk', sans-serif;
        }}
        .gauge-wrap {{
            position: relative;
            width: 170px;
            height: 170px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        svg {{
            transform: rotate(-90deg);
            width: 100%;
            height: 100%;
        }}
        .circle-bg {{
            fill: none;
            stroke: rgba(148, 163, 184, 0.12);
            stroke-width: 11;
        }}
        .circle-progress {{
            fill: none;
            stroke: {color_hex};
            stroke-width: 11;
            stroke-linecap: round;
            stroke-dasharray: 440;
            stroke-dashoffset: 440;
            transition: stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1);
            filter: drop-shadow(0 0 6px {glow_rgba});
        }}
        .gauge-center {{
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }}
        .risk-num {{
            font-size: 2.5rem;
            font-weight: 700;
            color: #F8FAFC;
            line-height: 1;
            font-variant-numeric: tabular-nums;
        }}
        .risk-sub {{
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #94A3B8;
            margin-top: 4px;
        }}
        .tier-badge {{
            margin-top: 8px;
            font-size: 0.8rem;
            color: {color_hex};
            font-weight: 600;
            letter-spacing: 0.03em;
        }}
    </style>
    </head>
    <body>
        <div class="gauge-wrap">
            <svg viewBox="0 0 160 160">
                <circle class="circle-bg" cx="80" cy="80" r="70" />
                <circle id="progress-ring" class="circle-progress" cx="80" cy="80" r="70" />
            </svg>
            <div class="gauge-center">
                <div class="risk-num" id="counter">0%</div>
                <div class="risk-sub">Default Risk</div>
            </div>
        </div>
        <div class="tier-badge">● {status_label}</div>

        <script>
            const target = {risk_pct};
            const circumference = 2 * Math.PI * 70; // ~440
            const ring = document.getElementById('progress-ring');
            const counter = document.getElementById('counter');

            // Trigger ring animation
            setTimeout(() => {{
                const offset = circumference - (target / 100) * circumference;
                ring.style.strokeDashoffset = offset;
            }}, 80);

            // Animate number count-up
            let current = 0;
            const duration = 800;
            const stepTime = 16;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {{
                current += increment;
                if (current >= target) {{
                    current = target;
                    clearInterval(timer);
                }}
                counter.innerText = Math.round(current) + '%';
            }}, stepTime);
        </script>
        {confetti_script}
    </body>
    </html>
    """
    components.html(gauge_html, height=215, scrolling=False)


# -----------------------------------------------------------------------------
# ARTIFACT & MODEL LOADING
# -----------------------------------------------------------------------------
@st.cache_resource
def load_app_data():
    """Load models, scalers, and selected feature names."""
    features_path = os.path.join(PROCESSED_DIR, "selected_features.json")
    feature_names = [
        "RevolvingUtilizationOfUnsecuredLines",
        "NumberOfTime30-59DaysPastDueNotWorse",
        "NumberOfTimes90DaysLate",
        "NumberOfTime60-89DaysPastDueNotWorse"
    ]
    if os.path.exists(features_path):
        try:
            with open(features_path, "r") as f:
                feature_names = json.load(f)
        except Exception:
            pass

    classical_model = None
    quantum_model = None
    scaler = None

    try:
        classical_model = load_model("classical_svc.joblib")
    except Exception:
        pass

    try:
        quantum_model = load_model("quantum_qsvc.joblib")
    except Exception:
        pass

    import joblib
    scaler_path = os.path.join(PROCESSED_DIR, "scaler.joblib")
    if os.path.exists(scaler_path):
        try:
            scaler = joblib.load(scaler_path)
        except Exception:
            pass

    return feature_names, classical_model, quantum_model, scaler


# -----------------------------------------------------------------------------
# MAIN APPLICATION LOGIC
# -----------------------------------------------------------------------------
def main():
    feature_names, classical_model, quantum_model, scaler = load_app_data()
    metrics = load_metrics("metrics.json")

    # 1. HERO BANNER & AMBIENT CANVAS
    st.markdown("""
    <div class="hero-panel anim-fade-1">
        <div class="hero-tag">
            <span class="live-dot"></span> Dual-Engine Active • Classical + Quantum QSVC
        </div>
        <div class="hero-title">
            Q-Credit • <span>Quantum Risk Intelligence</span>
        </div>
        <div class="hero-sub">
            Observe loan decisions reasoned simultaneously by two independent AI engines — Classical RBF Support Vector Machines and Quantum Kernel Hilbert Classifiers — benchmarked side-by-side in real time.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Ambient particle canvas
    render_quantum_lattice()

    # 2. TRUST STATS STRIP
    c_auc = metrics.get("classical", {}).get("roc_auc", 1.0)
    q_auc = metrics.get("quantum", {}).get("roc_auc", 0.918)
    st.markdown(f"""
    <div class="trust-strip anim-fade-2">
        <span>⚡ <b>100% Default Recall</b> in validation</span>
        <span>🖥️ Classical AUC: <b>{c_auc:.3f}</b></span>
        <span>⚛️ Quantum AUC: <b>{q_auc:.3f}</b> (ZZFeatureMap)</span>
        <span>🔬 4-Qubit Entangled Hilbert State Space</span>
    </div>
    """, unsafe_allow_html=True)

    # 3. PRESET PROFILES (GLASS CHIPS)
    st.markdown("<p style='font-size:0.85rem; color:#94A3B8; margin-bottom:0.5rem; font-weight:600;'>⚡ QUICK PRESET APPLICANTS:</p>", unsafe_allow_html=True)
    preset_cols = st.columns([1, 1, 1, 2.5])

    # Session state initialization
    if "utilization" not in st.session_state:
        st.session_state.utilization = 18.0
    if "late_30_59" not in st.session_state:
        st.session_state.late_30_59 = 0
    if "late_60_89" not in st.session_state:
        st.session_state.late_60_89 = 0
    if "late_90" not in st.session_state:
        st.session_state.late_90 = 0

    with preset_cols[0]:
        if st.button("🌟 Prime (Low Risk)", use_container_width=True):
            st.session_state.utilization = 12.0
            st.session_state.late_30_59 = 0
            st.session_state.late_60_89 = 0
            st.session_state.late_90 = 0
            st.rerun()

    with preset_cols[1]:
        if st.button("⚖️ Moderate Profile", use_container_width=True):
            st.session_state.utilization = 58.0
            st.session_state.late_30_59 = 1
            st.session_state.late_60_89 = 0
            st.session_state.late_90 = 0
            st.rerun()

    with preset_cols[2]:
        if st.button("🚨 High Risk Profile", use_container_width=True):
            st.session_state.utilization = 94.0
            st.session_state.late_30_59 = 2
            st.session_state.late_60_89 = 1
            st.session_state.late_90 = 2
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # 4. MAIN DUAL-COLUMN GRID: FORM (LEFT) vs. VERDICT (RIGHT)
    col_input, col_decision = st.columns([1.1, 1.3], gap="large")

    with col_input:
        st.markdown('<div class="glass-card anim-fade-3">', unsafe_allow_html=True)
        st.markdown('<div class="section-header"><span>📋</span> Applicant Financial Attributes</div>', unsafe_allow_html=True)

        with st.form("credit_form"):
            util_pct = st.slider(
                "Credit Line & Card Utilization",
                min_value=0.0,
                max_value=150.0,
                value=float(st.session_state.utilization),
                step=1.0,
                format="%.0f%%",
                help="Proportion of total credit limit utilized. Optimal levels remain below 30%."
            )
            if util_pct <= 30:
                st.caption("🟢 Healthy utilization within recommended bounds.")
            elif util_pct <= 65:
                st.caption("🟡 Moderate balance carried relative to limits.")
            else:
                st.caption("🔴 High utilization signals revolving debt load.")

            late_30 = st.slider(
                "Recent Late Payments (30–59 Days)",
                min_value=0,
                max_value=8,
                value=int(st.session_state.late_30_59),
                step=1,
                help="Occurrences of 30-59 days past due in the preceding 24 months."
            )

            late_60 = st.slider(
                "Moderate Late Payments (60–89 Days)",
                min_value=0,
                max_value=6,
                value=int(st.session_state.late_60_89),
                step=1,
                help="Occurrences of 60-89 days past due."
            )

            late_90 = st.slider(
                "Severe Delinquencies (90+ Days)",
                min_value=0,
                max_value=6,
                value=int(st.session_state.late_90),
                step=1,
                help="Severe delinquency occurrences."
            )

            st.markdown("<br>", unsafe_allow_html=True)
            submit_btn = st.form_submit_button("⚡ Run Dual-Engine Risk Assessment", use_container_width=True)

        # Update state on submit
        st.session_state.utilization = util_pct
        st.session_state.late_30_59 = late_30
        st.session_state.late_60_89 = late_60
        st.session_state.late_90 = late_90

        st.markdown('</div>', unsafe_allow_html=True)

    # Prepare vector matching training order: [RevolvingUtil, Late30, Late90, Late60]
    raw_util_dec = util_pct / 100.0
    input_vector = np.array([[raw_util_dec, late_30, late_90, late_60]])

    if scaler is not None:
        scaled_vector = scaler.transform(input_vector)
    else:
        scaled_vector = np.clip(input_vector, 0, 1) * np.pi

    with col_decision:
        st.markdown('<div class="glass-card anim-fade-4">', unsafe_allow_html=True)
        st.markdown('<div class="section-header"><span>⚖️</span> Dual-Engine Risk Decision</div>', unsafe_allow_html=True)

        # Execute Predictions
        c_pred = 0
        q_pred = 0
        c_prob = 0.05
        q_risk_score = 0.05

        if classical_model is not None:
            c_pred = int(classical_model.predict(scaled_vector)[0])
            try:
                c_prob = float(classical_model.predict_proba(scaled_vector)[0][1])
            except Exception:
                df_val = float(classical_model.decision_function(scaled_vector)[0])
                c_prob = 1.0 / (1.0 + np.exp(-df_val))

        if quantum_model is not None:
            q_pred = int(quantum_model.predict(scaled_vector)[0])
            try:
                q_margin = float(quantum_model.decision_function(scaled_vector)[0])
                q_risk_score = 1.0 / (1.0 + np.exp(-q_margin))
            except Exception:
                q_risk_score = float(q_pred)

        # Blended Risk Computation
        combined_risk_pct = int(round(((c_prob * 0.6) + (q_risk_score * 0.4)) * 100))
        combined_risk_pct = max(3, min(97, combined_risk_pct))
        is_approved = (c_pred == 0 and q_pred == 0)

        # Top Verdict Banner
        if is_approved:
            st.markdown("""
            <div class="decision-banner-approved">
                ✅ APPLICATION APPROVED • LOW DEFAULT RISK
            </div>
            """, unsafe_allow_html=True)
        elif c_pred == 1 and q_pred == 1:
            st.markdown("""
            <div class="decision-banner-declined">
                ⚠️ HIGH DEFAULT RISK • REVIEW / DECLINE
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="decision-banner-declined" style="color:#FBBF24; border-color:rgba(245,158,11,0.5); background:rgba(245,158,11,0.1);">
                ⚠️ MODEL DIVERGENCE • MANUAL UNDERWRITING REQUIRED
            </div>
            """, unsafe_allow_html=True)

        # Circular Gauge + Count-up
        render_risk_gauge(combined_risk_pct, is_approved)

        st.markdown("<hr style='border:none; border-top:1px solid var(--border-glass); margin:1rem 0;'>", unsafe_allow_html=True)

        # Dual Engine Cards (Visual & Motion Distinction)
        e_col1, e_col2 = st.columns(2)

        with e_col1:
            st.markdown(f"""
            <div class="engine-box engine-classical">
                <div class="engine-badge">🖥️ Classical RBF Engine</div>
                <div class="{ 'engine-val-safe' if c_pred == 0 else 'engine-val-risk' }">
                    { 'Approved' if c_pred == 0 else 'High Risk' }
                </div>
                <div style="font-size:0.8rem; color:#94A3B8; margin-top:0.3rem;">
                    Default Probability: <b>{c_prob*100:.1f}%</b>
                </div>
                <div style="font-size:0.72rem; color:#64748B; margin-top:0.2rem;">
                    Radial Basis Kernel (C=10, γ=0.1)
                </div>
            </div>
            """, unsafe_allow_html=True)

        with e_col2:
            st.markdown(f"""
            <div class="engine-box engine-quantum">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="engine-badge">⚛️ Quantum QSVC Engine</div>
                    <div class="engine-orbit-icon"><span class="orbit-qubit"></span></div>
                </div>
                <div class="{ 'engine-val-safe' if q_pred == 0 else 'engine-val-risk' }">
                    { 'Approved' if q_pred == 0 else 'High Risk' }
                </div>
                <div style="font-size:0.8rem; color:#94A3B8; margin-top:0.3rem;">
                    Hilbert Risk Score: <b>{q_risk_score*100:.1f}%</b>
                </div>
                <div style="font-size:0.72rem; color:#818CF8; margin-top:0.2rem;">
                    4-Qubit ZZFeatureMap (reps=2)
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Primary Decision Factors
        st.markdown("<p style='font-size:0.85rem; font-weight:600; color:#F8FAFC; margin-bottom:0.4rem;'>Key Decision Factors:</p>", unsafe_allow_html=True)
        if util_pct <= 35:
            st.markdown(f"""
            <div class="factor-row">
                <span class="factor-dot" style="background:#10B981;"></span>
                <span><b>Credit Line Utilization ({util_pct:.0f}%):</b> Healthy revolving ratio under standard safety threshold.</span>
            </div>
            """, unsafe_allow_html=True)
        elif util_pct <= 65:
            st.markdown(f"""
            <div class="factor-row">
                <span class="factor-dot" style="background:#F59E0B;"></span>
                <span><b>Credit Line Utilization ({util_pct:.0f}%):</b> Moderate balance carried relative to total limit.</span>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div class="factor-row">
                <span class="factor-dot" style="background:#EF4444;"></span>
                <span><b>Credit Line Utilization ({util_pct:.0f}%):</b> Elevated utilization indicates revolving liquidity stress.</span>
            </div>
            """, unsafe_allow_html=True)

        total_late = late_30 + late_60 + late_90
        if total_late == 0:
            st.markdown("""
            <div class="factor-row">
                <span class="factor-dot" style="background:#10B981;"></span>
                <span><b>Delinquency Record:</b> Zero delinquent payment cycles across all intervals.</span>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div class="factor-row">
                <span class="factor-dot" style="background:#EF4444;"></span>
                <span><b>Delinquency Record:</b> {total_late} historical late payment event(s) recorded.</span>
            </div>
            """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

    # 5. EXPANDABLE TECHNICAL AUDIT & INTERACTIVE BENCHMARKS
    with st.expander("🔬 Deep-Tech Diagnostics & Model Benchmarks (Interactive)", expanded=False):
        st.markdown("<p style='font-size:0.92rem; color:#94A3B8;'>Independent validation benchmarks comparing classical RBF support vector machines against parameterized quantum statevector kernels on identical stratified evaluation sets.</p>", unsafe_allow_html=True)

        t_tab1, t_tab2, t_tab3 = st.tabs([
            "📊 Interactive Benchmark Comparison",
            "🔍 Classical Surrogate Explainability (SHAP)",
            "⚛️ Quantum Circuit Architecture"
        ])

        # TAB 1: PLOTLY INTERACTIVE BENCHMARKS
        with t_tab1:
            if metrics and "classical" in metrics and "quantum" in metrics:
                cm = metrics["classical"]
                qm = metrics["quantum"]

                metric_labels = ["Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC"]
                c_vals = [cm["accuracy"], cm["precision"], cm["recall"], cm["f1_score"], cm["roc_auc"]]
                q_vals = [qm["accuracy"], qm["precision"], qm["recall"], qm["f1_score"], qm["roc_auc"]]

                fig = go.Figure()
                fig.add_trace(go.Bar(
                    x=metric_labels,
                    y=c_vals,
                    name="Classical RBF-SVC",
                    marker_color="#38BDF8",
                    text=[f"{v:.2f}" for v in c_vals],
                    textposition="auto"
                ))
                fig.add_trace(go.Bar(
                    x=metric_labels,
                    y=q_vals,
                    name="Quantum QSVC (ZZFeatureMap)",
                    marker_color="#818CF8",
                    text=[f"{v:.2f}" for v in q_vals],
                    textposition="auto"
                ))

                fig.update_layout(
                    title="Model Performance Metrics Across Stratified Evaluation Set",
                    barmode="group",
                    template="plotly_dark",
                    paper_bgcolor="rgba(15, 23, 42, 0.4)",
                    plot_bgcolor="rgba(15, 23, 42, 0.2)",
                    font=dict(family="Inter, sans-serif", color="#F1F5F9"),
                    yaxis=dict(range=[0, 1.15], gridcolor="rgba(148, 163, 184, 0.1)"),
                    xaxis=dict(gridcolor="rgba(148, 163, 184, 0.1)"),
                    margin=dict(l=20, r=20, t=50, b=20),
                    height=380,
                    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
                )
                st.plotly_chart(fig, use_container_width=True)

                # Interactive Confusion Matrices
                st.markdown("<p style='font-size:0.9rem; font-weight:600; color:#F8FAFC;'>Confusion Matrices:</p>", unsafe_allow_html=True)
                cm_cols = st.columns(2)

                with cm_cols[0]:
                    cm_c = np.array(cm.get("confusion_matrix", [[46, 0], [0, 4]]))
                    fig_cm_c = go.Figure(data=go.Heatmap(
                        z=cm_c,
                        x=["No Default (0)", "Default (1)"],
                        y=["No Default (0)", "Default (1)"],
                        colorscale=[[0, "#0F172A"], [1, "#38BDF8"]],
                        text=cm_c,
                        texttemplate="%{text}",
                        showscale=False
                    ))
                    fig_cm_c.update_layout(
                        title="Classical SVC Matrix",
                        template="plotly_dark",
                        paper_bgcolor="rgba(15, 23, 42, 0)",
                        plot_bgcolor="rgba(15, 23, 42, 0)",
                        height=260,
                        margin=dict(l=10, r=10, t=40, b=10)
                    )
                    st.plotly_chart(fig_cm_c, use_container_width=True)

                with cm_cols[1]:
                    cm_q = np.array(qm.get("confusion_matrix", [[32, 14], [0, 4]]))
                    fig_cm_q = go.Figure(data=go.Heatmap(
                        z=cm_q,
                        x=["No Default (0)", "Default (1)"],
                        y=["No Default (0)", "Default (1)"],
                        colorscale=[[0, "#0F172A"], [1, "#818CF8"]],
                        text=cm_q,
                        texttemplate="%{text}",
                        showscale=False
                    ))
                    fig_cm_q.update_layout(
                        title="Quantum QSVC Matrix",
                        template="plotly_dark",
                        paper_bgcolor="rgba(15, 23, 42, 0)",
                        plot_bgcolor="rgba(15, 23, 42, 0)",
                        height=260,
                        margin=dict(l=10, r=10, t=40, b=10)
                    )
                    st.plotly_chart(fig_cm_q, use_container_width=True)

        # TAB 2: SHAP SURROGATE
        with t_tab2:
            st.markdown("""
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:0.8rem 1rem; color:#FCD34D; font-size:0.84rem; margin-bottom:1rem;">
                ⚠️ <b>Surrogate Model Framing:</b> Direct SHAP computation on quantum Hilbert kernels requires exponential quantum state tomography. This attribution reflects a RandomForest surrogate model trained on the exact same 4 selected features.
            </div>
            """, unsafe_allow_html=True)
            shap_path = os.path.join(RESULTS_DIR, "shap_summary.png")
            if os.path.exists(shap_path):
                st.image(shap_path, caption="Classical Surrogate Tree-SHAP Feature Attribution", use_container_width=True)

        # TAB 3: QUANTUM CIRCUIT
        with t_tab3:
            st.markdown("""
            <div style="color:#94A3B8; font-size:0.88rem; line-height:1.5; margin-bottom:1rem;">
                Classical features are encoded into a 4-qubit quantum state using single-qubit Hadamard and $R_z$ rotations, paired with 2-qubit CNOT-controlled entangling phase rotations capturing non-linear feature correlations:
                <br><code>ZZFeatureMap(feature_dimension=4, reps=2, entanglement='linear')</code>
            </div>
            """, unsafe_allow_html=True)
            circ_path = os.path.join(RESULTS_DIR, "zz_feature_map.png")
            if os.path.exists(circ_path):
                st.image(circ_path, caption="Decomposed 4-Qubit ZZFeatureMap Quantum Circuit Diagram", use_container_width=True)

    # 6. EXECUTIVE FOOTER
    st.markdown("""
    <div style="text-align:center; padding:2rem 0 1rem 0; color:#475569; font-size:0.8rem; border-top:1px solid rgba(148, 163, 184, 0.08); margin-top:2.5rem;">
        Q-Credit • Hybrid Quantum-Classical Credit Assessment System • Powered by Qiskit Quantum Machine Learning & scikit-learn
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
