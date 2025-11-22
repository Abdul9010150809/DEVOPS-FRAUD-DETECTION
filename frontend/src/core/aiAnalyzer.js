/**
 * aiAnalyzer.js
 * Interface for ML-based anomaly detection.
 */

// Simulates an API call to the Python ML Service
// In production: await axios.post('http://ml-service:5000/predict', data)
const predictRisk = async (commitData) => {
    console.log(`[AI Analyzer] Analyzing commit patterns for Author: ${commitData.author}`);
    
    let aiScore = 0;
    let reason = "Normal behavior";

    // SIMULATION LOGIC:
    
    // 1. NLP Check: Very short commit messages often indicate rushed/bot code
    if (commitData.message.length < 10) {
        aiScore += 20;
        reason = "Abnormally short commit message (Low semantic value)";
    }

    // 2. Anomaly Check: Large diffs (changing 1000+ lines) are suspicious
    if (commitData.linesChanged > 1000) {
        aiScore += 45;
        reason = "Massive code alteration detected (Statistical Anomaly)";
    }

    // 3. Author History (Mock): If author is 'unknown' or new
    if (commitData.author === "unknown_user") {
        aiScore += 60;
        reason = "Unrecognized author profile pattern";
    }

    return {
        riskScore: Math.min(aiScore, 100),
        analysisSummary: reason
    };
};

module.exports = { predictRisk };