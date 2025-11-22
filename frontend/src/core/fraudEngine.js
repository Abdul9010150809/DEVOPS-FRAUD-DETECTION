/**
 * fraudEngine.js
 * Core logic aggregator that combines Rules and AI scores.
 */

const ruleEngine = require('./ruleEngine');
const aiAnalyzer = require('./aiAnalyzer');
// const alertsController = require('../api/alertsController'); // To save alerts to DB

const THRESHOLD_HIGH = 70;
const THRESHOLD_MEDIUM = 40;

const analyzeCommit = async (commitData) => {
    console.log(`--- Starting Fraud Analysis for Commit: ${commitData.id} ---`);

    // 1. Run Rule-Based Checks (Deterministic)
    const ruleResult = ruleEngine.evaluate(commitData);
    console.log(`[Rule Engine] Score: ${ruleResult.score}, Violations: ${ruleResult.violations.length}`);

    // 2. Run AI Analysis (Probabilistic)
    const aiResult = await aiAnalyzer.predictRisk(commitData);
    console.log(`[AI Analyzer] Score: ${aiResult.riskScore}, Reason: ${aiResult.analysisSummary}`);

    // 3. Weighted Scoring Algorithm
    // Rules are usually weighted higher because they represent definite failures (like secrets)
    const finalScore = (ruleResult.score * 0.6) + (aiResult.riskScore * 0.4);
    
    let severity = 'safe';
    if (finalScore >= THRESHOLD_HIGH) severity = 'high';
    else if (finalScore >= THRESHOLD_MEDIUM) severity = 'medium';

    const result = {
        commitId: commitData.id,
        finalRiskScore: Math.round(finalScore),
        severity: severity,
        breakdown: {
            ruleViolations: ruleResult.violations,
            aiAnalysis: aiResult.analysisSummary
        }
    };

    // 4. Action Trigger
    if (severity !== 'safe') {
        console.warn(`!!! FRAUD ALERT TRIGGERED [${severity.toUpperCase()}] !!!`);
        // In production: await alertsController.createAlert(result);
    } else {
        console.log(`Commit deemed safe.`);
    }

    return result;
};

module.exports = { analyzeCommit };