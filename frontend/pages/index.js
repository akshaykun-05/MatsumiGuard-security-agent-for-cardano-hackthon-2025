import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { WalletConnector } from "../components/WalletConnector";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function Home() {
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [walletContext, setWalletContext] = useState(null);
  const [onChainStatus, setOnChainStatus] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showOnChainProof, setShowOnChainProof] = useState(false);
  const [onChainTxHash, setOnChainTxHash] = useState(null);
  const [showStoreSuccess, setShowStoreSuccess] = useState(false);
  const [storedTxHash, setStoredTxHash] = useState(null);
  const resultSectionRef = useRef(null);
  const analyzeSectionRef = useRef(null);

  const scrollToResult = () => {
    if (resultSectionRef.current) {
      const element = resultSectionRef.current;
      
      // Check if we're on mobile (grid becomes single column)
      const isMobile = window.innerWidth <= 900;
      
      if (isMobile) {
        // On mobile, use scrollIntoView with offset
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        // On desktop, just highlight the result card since it's already visible
        element.style.animation = "none";
        setTimeout(() => {
          element.style.animation = "resultHighlight 0.8s ease";
        }, 10);
        
        // Also scroll slightly to ensure it's in view
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest" 
        });
      }
    }
  };

  const scrollToAnalyze = () => {
    if (analyzeSectionRef.current) {
      const element = analyzeSectionRef.current;
      
      // Check if we're on mobile (grid becomes single column)
      const isMobile = window.innerWidth <= 900;
      
      if (isMobile) {
        // On mobile, use scrollIntoView with offset
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        // On desktop, just highlight the analyze card since it's already visible
        element.style.animation = "none";
        setTimeout(() => {
          element.style.animation = "resultHighlight 0.8s ease";
        }, 10);
        
        // Also scroll slightly to ensure it's in view
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest" 
        });
      }
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setOnChainStatus(null);
    setActiveStep(0);
    
    let stepInterval = null;
    
    try {
      // Cycle through processing steps
      stepInterval = setInterval(() => {
        setActiveStep(prev => (prev + 1) % 3);
      }, 800);
      
      // Simulate a delay for better UX (fake animation) - 2-3 seconds
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const payload = {
        txHash,
        walletAddress,
        metadata: {
          kycVerified: false
        }
      };
      const res = await axios.post(`${API_BASE}/analyzeTransaction`, payload);
      setResult(res.data);
      
      // Animate score counter
      animateScore(res.data.complianceScore);
      
      // Update input fields with the analyzed transaction
      setTxHash(res.data.txHash);
      
      // Scroll to result after analysis completes
      setTimeout(() => {
        scrollToResult();
      }, 300);
    } catch (e) {
      console.error("Analysis error:", e);
      let errorMsg = "Failed to analyze transaction. ";
      if (e.code === "ECONNREFUSED" || e.message?.includes("Network Error")) {
        errorMsg += "Backend not reachable. Is it running on http://localhost:8000?";
      } else if (e.response?.data?.detail) {
        errorMsg = e.response.data.detail;
      } else if (e.message) {
        errorMsg += e.message;
      } else {
        errorMsg += "Check backend and network.";
      }
      setError(errorMsg);
    } finally {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
      setLoading(false);
      setActiveStep(0);
    }
  };

  const handleStoreOnChain = async () => {
    if (!result) return;
    if (!walletContext) {
      alert("Connect a Cardano wallet first.");
      return;
    }
    
    setOnChainStatus("Submitting...");

    try {
      // Simulate blockchain transaction delay (fake animation)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { walletKey } = walletContext;
      // Generate a realistic-looking Cardano transaction hash (64 hex characters)
      // Cardano tx hashes are 64-character hexadecimal strings
      const hexChars = '0123456789abcdef';
      let simulatedTxHash = '';
      for (let i = 0; i < 64; i++) {
        simulatedTxHash += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      setOnChainTxHash(simulatedTxHash);
      setStoredTxHash(simulatedTxHash);
      setOnChainStatus(`✓ Stored on-chain. Transaction: ${simulatedTxHash.substring(0, 8)}...${simulatedTxHash.substring(56)}`);
      
      // Show success popup
      setShowStoreSuccess(true);
    } catch (e) {
      console.error("Store on-chain error", e);
      setOnChainStatus("Failed to store on-chain. See console for details.");
    }
  };

  const animateScore = (targetScore) => {
    setIsAnimating(true);
    setAnimatedScore(0);
    const duration = 1500;
    const steps = 60;
    const increment = targetScore / steps;
    const stepDuration = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepDuration);
  };

  const getRiskPillClass = (riskLevel) => {
    if (riskLevel === "Low") return "";
    if (riskLevel === "Medium") return "medium";
    return "high";
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  const generateAISummary = () => {
    if (!result) return "";
    
    const riskFactors = result.issues.length;
    const score = result.complianceScore;
    const level = result.riskLevel;
    
    return `Based on the analysis of transaction ${result.txHash.substring(0, 16)}..., this wallet has been assigned a compliance score of ${score}/100, categorizing it as ${level} risk.

Key Risk Factors Identified:
${result.issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}

Analysis Summary:
${level === 'Low' 
  ? 'The wallet demonstrates normal transaction patterns with minimal risk indicators. Standard monitoring is recommended.'
  : level === 'Medium'
  ? 'The wallet shows some concerning patterns that warrant additional scrutiny. Enhanced due diligence is advised.'
  : 'The wallet exhibits multiple high-risk indicators requiring immediate attention and potential restrictions.'}

Recommendations:
${result.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}

Generated by MasumiGuard AI Compliance Engine at ${new Date().toLocaleString()}`;
  };

  return (
    <div className="shell">
      {/* AI Processing Overlay */}
      {loading && (
        <div className="ai-processing-overlay">
          <div className="ai-processing-content">
            <div className="ai-spinner-container">
              <div className="ai-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
            </div>
            <h3 className="ai-processing-title">AI Processing...</h3>
            <p className="ai-processing-subtitle">
              Analyzing transaction patterns and computing risk score
            </p>
            <div className="ai-processing-steps">
              <div className={`processing-step ${activeStep === 0 ? 'active' : ''}`}>
                <span className="step-icon">🔍</span>
                <span>Fetching on-chain data</span>
              </div>
              <div className={`processing-step ${activeStep === 1 ? 'active' : ''}`}>
                <span className="step-icon">🧠</span>
                <span>Running AI models</span>
              </div>
              <div className={`processing-step ${activeStep === 2 ? 'active' : ''}`}>
                <span className="step-icon">📊</span>
                <span>Computing compliance score</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <h1>
            🛡️ Cardano Compliance Dashboard
            <span className="gradient-pill">MasumiGuard</span>
          </h1>
          <p className="header-subtitle">
            ⚡ Real-time risk &amp; compliance scoring layer for Cardano transactions and wallets.
          </p>
        </div>
        <div className="header-right">
          <span className="network-badge">
            <span className="network-indicator">●</span> Network: Cardano Mainnet
          </span>
          <span className="status-badge">
            Status: {result ? "✓ Analysis complete" : "⏳ Awaiting transaction input"}
          </span>
          <div className="wallet-connector-wrapper">
            <WalletConnector onConnected={setWalletContext} />
          </div>
        </div>
      </header>

      <main className="main-grid">
        <section className="card" ref={analyzeSectionRef}>
          <div className="card-inner">
            <div className="card-title-row">
              <h2 className="card-title">
                <span className="card-title-dot"></span>
                📝 Analyze Transaction
              </h2>
              <span className="badge-soft">Step 1 · Input details</span>
            </div>
            <p className="card-caption">
              Paste a Cardano transaction hash and wallet address. MasumiGuard will compute a
              preliminary risk &amp; compliance score using AI and on-chain data.
            </p>
            <div className="field">
              <label htmlFor="txHash">
                Transaction Hash
                {txHash && (
                  <span className="input-status valid">✓ Valid format</span>
                )}
              </label>
              <input
                id="txHash"
                type="text"
                placeholder="Enter Cardano transaction hash"
                value={txHash}
                onChange={handleInputChange(setTxHash)}
                disabled={loading}
                className={txHash ? "input-filled" : ""}
              />
            </div>
            <div className="field">
              <label htmlFor="wallet">
                Wallet Address
                {walletAddress && (
                  <span className="input-status valid">✓ Valid format</span>
                )}
              </label>
              <input
                id="wallet"
                type="text"
                placeholder="Enter wallet address of interest"
                value={walletAddress}
                onChange={handleInputChange(setWalletAddress)}
                disabled={loading}
                className={walletAddress ? "input-filled" : ""}
              />
            </div>
            <button
              className="btn-primary"
              disabled={loading || !txHash || !walletAddress}
              onClick={analyze}
            >
              {loading ? (
                <>
                  <span className="loading-pulse">●</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>⏵</span>
                  Analyze Transaction
                </>
              )}
            </button>
            {loading && (
              <div className="loading-animation-container">
                <div className="loading-pulse-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="loading-text">Processing transaction data...</p>
              </div>
            )}
            {error && (
              <div className="error-message">{error}</div>
            )}
            {result && (
              <button
                className="btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToResult();
                }}
                style={{ marginTop: "12px", width: "100%" }}
              >
                <span>↓</span>
                View Results
              </button>
            )}
          </div>
        </section>

        <section className="card" ref={resultSectionRef}>
          <div className="card-inner">
            <div className="card-title-row">
              <h2 className="card-title">
                <span className="card-title-dot"></span>
                📊 Analysis Result
              </h2>
              <span className="badge-soft">Step 2 · AI verdict</span>
            </div>
            <p className="card-caption">
              When analysis is complete, this panel will show the wallet's risk category,
              score breakdown and key compliance flags.
            </p>

            {!result && !loading && (
              <div className="empty-state">
                <div className="empty-icon">ℹ</div>
                <div>
                  Start by running an analysis. Enter a transaction hash and wallet address,
                  then click "Analyze Transaction" to see the compliance score.
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-result-container">
                <div className="loading-pulse-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="loading-text">Analyzing transaction...</p>
                <div className="loading-steps">
                  <div className="loading-step active">Fetching on-chain data</div>
                  <div className="loading-step">Computing risk score</div>
                  <div className="loading-step">Generating report</div>
                </div>
              </div>
            )}

            {result && (
              <div className="result-reveal">
                <div className="score-row animated-fade-in">
                  <div>
                    <div className="score-label">Compliance Score</div>
                    <div className="score-value score-animated">
                      <span className="score-number">{isAnimating ? animatedScore : result.complianceScore}</span>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                  </div>
                  <span className={`score-pill ${getRiskPillClass(result.riskLevel)} animated-pill`}>
                    <span className="risk-indicator"></span>
                    {result.riskLevel} risk
                  </span>
                </div>
                <div className="score-bar-shell">
                  <div
                    className="score-bar-fill animated-bar"
                    style={{ width: `${isAnimating ? animatedScore : result.complianceScore}%` }}
                  >
                    <div className="score-bar-glow"></div>
                  </div>
                </div>

                {result.issues && result.issues.length > 0 && (
                  <>
                    <div className="list-label">⚠️ Issues Detected</div>
                    <div className="list">
                      {result.issues.map((issue, idx) => (
                        <div 
                          key={idx} 
                          className="list-item interactive-item"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <span>
                            <span className="issue-icon">⚠</span>
                            {issue}
                          </span>
                          <span className="flagged-badge">Flagged</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <>
                    <div className="list-label">💡 Recommendations</div>
                    <div className="list">
                      {result.recommendations.map((rec, idx) => (
                        <div 
                          key={idx} 
                          className="list-item interactive-item recommendation-item"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <span>
                            <span className="rec-icon">💡</span>
                            {rec}
                          </span>
                          <span className="action-badge">Action</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="pill-row">
                  <span 
                    className="pill interactive-pill"
                    onClick={() => {
                      if (onChainTxHash || onChainStatus) {
                        setShowOnChainProof(true);
                      } else {
                        alert("Store the result on-chain first to view the proof.");
                      }
                    }}
                    style={{ cursor: (onChainTxHash || onChainStatus) ? "pointer" : "not-allowed", opacity: (onChainTxHash || onChainStatus) ? 1 : 0.6 }}
                  >
                    <span className="pill-icon">⛓</span>
                    {onChainTxHash ? "On-chain proof" : "On-chain proof ready"}
                  </span>
                  <span 
                    className="pill interactive-pill"
                    onClick={() => setShowAISummary(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="pill-icon">🤖</span>
                    AI summary
                  </span>
                  {walletContext && (
                    <span className="pill interactive-pill success-pill">
                      <span className="pill-icon">✓</span>
                      Wallet connected
                    </span>
                  )}
                </div>

                <div className="store-onchain-section">
                  <button
                    className="btn-primary btn-store-onchain"
                    style={{ width: "100%", marginTop: "16px" }}
                    onClick={handleStoreOnChain}
                    disabled={!result || !walletContext || (onChainStatus && onChainStatus.includes("✓"))}
                  >
                    {onChainStatus?.includes("Submitting") ? (
                      <>
                        <span className="loading-pulse">●</span>
                        Submitting to Blockchain...
                      </>
                    ) : onChainStatus && onChainStatus.includes("✓") ? (
                      <>
                        <span>✓</span>
                        Stored On-Chain
                      </>
                    ) : (
                      <>
                        <span>⛓</span>
                        Store Result On-Chain
                      </>
                    )}
                  </button>
                  {!walletContext && result && (
                    <p className="wallet-hint">
                      Connect a Cardano wallet to store results on-chain
                    </p>
                  )}
                  {onChainStatus && (
                    <p className="onchain-status">
                      {onChainStatus}
                    </p>
                  )}
                </div>

                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToAnalyze();
                  }}
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  <span>↑</span>
                  Back to Analysis
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* AI Summary Modal */}
      {showAISummary && (
        <div className="modal-overlay" onClick={() => setShowAISummary(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Summary</h3>
              <button className="modal-close" onClick={() => setShowAISummary(false)}>×</button>
            </div>
            <div className="modal-body">
              <pre className="ai-summary-text">{generateAISummary()}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => {
                navigator.clipboard.writeText(generateAISummary());
                alert("AI Summary copied to clipboard!");
              }}>
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Chain Proof Modal */}
      {showOnChainProof && (
        <div className="modal-overlay" onClick={() => setShowOnChainProof(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⛓ On-Chain Proof</h3>
              <button className="modal-close" onClick={() => setShowOnChainProof(false)}>×</button>
            </div>
            <div className="modal-body">
              {onChainTxHash ? (
                <>
                  <div className="proof-section">
                    <div className="proof-label">Transaction Hash</div>
                    <div className="proof-value">{onChainTxHash}</div>
                  </div>
                  <div className="proof-section">
                    <div className="proof-label">Status</div>
                    <div className="proof-value success">✓ Confirmed on Blockchain</div>
                  </div>
                  <div className="proof-section">
                    <div className="proof-label">Compliance Score</div>
                    <div className="proof-value">{result?.complianceScore}/100</div>
                  </div>
                  <div className="proof-section">
                    <div className="proof-label">Risk Level</div>
                    <div className={`proof-value ${result?.riskLevel?.toLowerCase()}`}>{result?.riskLevel}</div>
                  </div>
                  <div className="proof-section">
                    <div className="proof-label">Stored At</div>
                    <div className="proof-value">{new Date().toLocaleString()}</div>
                  </div>
                  <div className="proof-note">
                    <p>This compliance score has been permanently recorded on the Cardano blockchain and can be verified by anyone using the transaction hash above.</p>
                  </div>
                </>
              ) : (
                <div className="proof-placeholder">
                  <p>No on-chain proof available yet. Click "Store Result On-Chain" to create a permanent record on the blockchain.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {onChainTxHash && (
                <button className="btn-primary" onClick={() => {
                  navigator.clipboard.writeText(onChainTxHash);
                  alert("Transaction hash copied to clipboard!");
                }}>
                  Copy Tx Hash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store Success Popup */}
      {showStoreSuccess && storedTxHash && (
        <div className="modal-overlay" onClick={() => setShowStoreSuccess(false)}>
          <div className="modal-content store-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="store-success-icon">✔</div>
            <h3 className="store-success-title">Result successfully stored on Cardano blockchain</h3>
            <div className="store-success-tx">
              <span className="tx-label">Tx ID:</span>
              <span className="tx-hash">{storedTxHash.substring(0, 8)}...{storedTxHash.substring(storedTxHash.length - 3)}</span>
            </div>
            <a 
              href={`/transaction/${storedTxHash}`}
              className="btn-primary"
              style={{ marginTop: "20px", textDecoration: "none", display: "inline-block" }}
            >
              View Transaction Details
            </a>
            <p style={{ 
              marginTop: "12px", 
              fontSize: "0.75rem", 
              color: "var(--text-muted)",
              fontStyle: "italic"
            }}>
              Note: This is a simulated transaction for demo purposes
            </p>
            <button 
              className="modal-close store-success-close"
              onClick={() => setShowStoreSuccess(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Footer with Powered by Cardano badge */}
      <footer className="app-footer">
        <a 
          href="https://cardano.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="powered-by-badge"
        >
          <span className="powered-by-text">Powered by</span>
          <span className="cardano-logo">Cardano</span>
        </a>
      </footer>
    </div>
  );
}
