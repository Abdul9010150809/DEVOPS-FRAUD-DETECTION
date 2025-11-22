/**
 * ruleEngine.js
 * Deterministic logic to catch known bad patterns.
 */

// Predefined patterns for sensitive data (Simulated Regex)
const SENSITIVE_PATTERNS = [
    /AKIA[0-9A-Z]{16}/,          // AWS Access Key ID
    /BEGIN PRIVATE KEY/,         // SSH Keys
    /password\s*=\s*['"][^'"]+/, // Hardcoded passwords
    /api_key\s*:/                // Generic API keys
];

const BLACKLISTED_EXTENSIONS = ['.exe', '.dll', '.sh', '.bat'];

const evaluate = (commitData) => {
    let riskScore = 0;
    let violations = [];

    const { message, diff, timestamp } = commitData;

    // 1. Check for Hardcoded Secrets
    SENSITIVE_PATTERNS.forEach((pattern) => {
        if (pattern.test(diff) || pattern.test(message)) {
            riskScore += 50;
            violations.push('Potential hardcoded secret detected');
        }
    });

    // 2. Check for Suspicious File Extensions
    // (Assuming commitData.files is an array of filenames)
    if (commitData.files) {
        commitData.files.forEach(file => {
            if (BLACKLISTED_EXTENSIONS.some(ext => file.endsWith(ext))) {
                riskScore += 30;
                violations.push(`Suspicious binary/script file detected: ${file}`);
            }
        });
    }

    // 3. Temporal Anomaly (e.g., Commit made between 1 AM and 4 AM)
    const hour = new Date(timestamp).getHours();
    if (hour >= 1 && hour <= 4) {
        riskScore += 10;
        violations.push('Commit made outside standard business hours (1AM-4AM)');
    }

    return {
        score: Math.min(riskScore, 100), // Cap at 100
        violations: violations
    };
};

module.exports = { evaluate };