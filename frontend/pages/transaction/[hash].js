import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function TransactionDetail({ initialHash }) {
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        const hash = initialHash || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : null);
        
        if (!hash || hash.length !== 64) {
          setError("Invalid transaction hash");
          return;
        }

        const res = await axios.get(`${API_BASE}/transaction/${hash}`);
        
        if (res.data.success) {
          setTxData(res.data.data);
        } else {
          setError("Failed to fetch transaction data");
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(
          err.response?.data?.detail ||
          err.message ||
          "Failed to load transaction"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [initialHash]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Transaction Details - Loading</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.loaderWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.loaderText}>Fetching transaction data from blockchain...</p>
            <div style={styles.dots}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Transaction Error</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.header}>
            <Link href="/" style={styles.link}>
              ← Back to Dashboard
            </Link>
          </div>
          <div style={{ ...styles.card, borderLeftColor: "#ff4444", borderLeftWidth: "4px" }}>
            <div style={styles.errorHeader}>
              <span style={styles.errorIcon}>⚠️</span>
              <h1 style={styles.errorTitle}>Error Loading Transaction</h1>
            </div>
            <p style={styles.errorText}>{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!txData) {
    return (
      <>
        <Head>
          <title>Transaction Not Found</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.header}>
            <Link href="/" style={styles.link}>
              ← Back to Dashboard
            </Link>
          </div>
          <div style={styles.card}>
            <p style={styles.text}>No transaction data available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Transaction {txData.hash.substring(0, 16)}...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/" style={styles.link}>
            ← Back to Dashboard
          </Link>
          <h1 style={styles.mainTitle}>📊 Transaction Explorer</h1>
          <p style={styles.subtitle}>Cardano Blockchain Analysis</p>
        </div>

        {/* Status Badge */}
        <div style={styles.statusBar}>
          <div style={styles.statusContent}>
            <span style={styles.statusIcon}>✓</span>
            <span style={styles.statusText}>
              <strong>Status:</strong> {txData.status}
            </span>
            <span style={styles.confirmationBadge}>
              {txData.confirmations.toLocaleString()} confirmations
            </span>
          </div>
        </div>

        {/* Transaction Hash */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔗</span>
            <div style={styles.sectionTitle}>Transaction Hash</div>
          </div>
          <div style={styles.hashBox}>
            <code style={styles.code}>{txData.hash}</code>
            <button
              onClick={() => copyToClipboard(txData.hash)}
              style={{
                ...styles.copyBtn,
                backgroundColor: copied ? "#4caf50" : "#00d9ff",
                transition: "background-color 0.3s",
              }}
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>

        {/* Overview Grid */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📈</span>
            <div style={styles.sectionTitle}>Overview</div>
          </div>
          <div style={styles.grid}>
            <div style={styles.gridItem}>
              <div style={styles.label}>Status</div>
              <div style={{ ...styles.value, color: "#4caf50" }}>✓ {txData.status}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Block Height</div>
              <div style={styles.value}>{txData.block}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Epoch</div>
              <div style={styles.value}>{txData.epoch}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Slot</div>
              <div style={styles.value}>{txData.slot.toLocaleString()}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Fee</div>
              <div style={{ ...styles.value, color: "#ffc107" }}>{txData.fee}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Size</div>
              <div style={styles.value}>{txData.size} bytes</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Confirmations</div>
              <div style={{ ...styles.value, color: "#4caf50" }}>{txData.confirmations.toLocaleString()}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Timestamp</div>
              <div style={styles.value}>{new Date(txData.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Inputs Section */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📥</span>
            <div style={styles.sectionTitle}>Inputs ({txData.inputs.length})</div>
          </div>
          <div style={styles.tableContainer}>
            {txData.inputs.map((input, idx) => (
              <div key={idx} style={styles.tableRow}>
                <div style={styles.rowNumber}>#{idx + 1}</div>
                <div style={styles.rowContent}>
                  <div style={styles.rowLabel}>Address</div>
                  <code style={styles.smallCode}>{input.address}</code>
                  <div style={styles.rowAmount}>{input.amount}</div>
                  {input.tokens > 0 && (
                    <div style={styles.tokenBadge}>+ {input.tokens} token(s)</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outputs Section */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📤</span>
            <div style={styles.sectionTitle}>Outputs ({txData.outputs.length})</div>
          </div>
          <div style={styles.tableContainer}>
            {txData.outputs.map((output, idx) => (
              <div key={idx} style={styles.tableRow}>
                <div style={styles.rowNumber}>#{idx + 1}</div>
                <div style={styles.rowContent}>
                  <div style={styles.rowLabel}>Address</div>
                  <code style={styles.smallCode}>{output.address}</code>
                  <div style={styles.rowAmount}>{output.amount}</div>
                  {output.tokens > 0 && (
                    <div style={styles.tokenBadge}>+ {output.tokens} token(s)</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        {txData.metadata && (
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📝</span>
              <div style={styles.sectionTitle}>Metadata</div>
            </div>
            <div style={styles.metadataBox}>
              <pre style={styles.json}>{JSON.stringify(txData.metadata, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Validity */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>⏰</span>
            <div style={styles.sectionTitle}>Validity Period</div>
          </div>
          <div style={styles.grid}>
            <div style={styles.gridItem}>
              <div style={styles.label}>Valid From (Slot)</div>
              <div style={styles.value}>{txData.validity.valid_from.toLocaleString()}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Valid To (Slot)</div>
              <div style={styles.value}>{txData.validity.valid_to.toLocaleString()}</div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Slot Range</div>
              <div style={styles.value}>
                {(txData.validity.valid_to - txData.validity.valid_from).toLocaleString()}
              </div>
            </div>
            <div style={styles.gridItem}>
              <div style={styles.label}>Era</div>
              <div style={styles.value}>{txData.era}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <span style={styles.footerIcon}>💡</span>
            <p style={styles.footerText}>
              This is a simulated Cardano transaction for demonstration purposes. In production, real transaction data would be fetched from the Cardano blockchain.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}


const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#0a0e27",
    color: "#e0e0e0",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
    animation: "slideIn 0.5s ease-out",
  },
  link: {
    color: "#00d9ff",
    textDecoration: "none",
    fontSize: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "8px 12px",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    backgroundColor: "rgba(0, 217, 255, 0.1)",
  },
  mainTitle: {
    fontSize: "36px",
    marginTop: "15px",
    marginBottom: "5px",
    background: "linear-gradient(135deg, #00d9ff, #00ff88)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "0",
  },
  statusBar: {
    backgroundColor: "#1a2f4d",
    border: "1px solid #00d9ff",
    borderRadius: "8px",
    padding: "15px 20px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    animation: "slideIn 0.6s ease-out 0.1s both",
  },
  statusContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    width: "100%",
  },
  statusIcon: {
    color: "#4caf50",
    fontSize: "18px",
  },
  statusText: {
    color: "#e0e0e0",
    fontSize: "14px",
  },
  confirmationBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    color: "#4caf50",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1f3a",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    animation: "fadeIn 0.5s ease-out",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid rgba(0, 217, 255, 0.2)",
  },
  sectionIcon: {
    fontSize: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#00d9ff",
  },
  hashBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  code: {
    backgroundColor: "#0a0e27",
    padding: "12px",
    borderRadius: "6px",
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#00ff88",
    flex: 1,
    overflow: "auto",
    border: "1px solid rgba(0, 255, 136, 0.2)",
    wordBreak: "break-all",
  },
  smallCode: {
    backgroundColor: "#0a0e27",
    padding: "8px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#00ff88",
    border: "1px solid rgba(0, 255, 136, 0.2)",
    wordBreak: "break-all",
    display: "block",
    marginTop: "8px",
  },
  copyBtn: {
    backgroundColor: "#00d9ff",
    color: "#0a0e27",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    transition: "all 0.3s ease",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  gridItem: {
    padding: "15px",
    backgroundColor: "#0a0e27",
    borderRadius: "6px",
    border: "1px solid rgba(100, 100, 150, 0.3)",
    transition: "all 0.3s ease",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "15px",
    color: "#00ff88",
    fontWeight: "bold",
    wordBreak: "break-word",
  },
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tableRow: {
    padding: "15px",
    backgroundColor: "#0a0e27",
    borderRadius: "6px",
    border: "1px solid rgba(100, 100, 150, 0.3)",
    display: "flex",
    gap: "15px",
    transition: "all 0.3s ease",
  },
  rowNumber: {
    minWidth: "40px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#00d9ff",
    display: "flex",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "5px",
    textTransform: "uppercase",
  },
  rowAmount: {
    color: "#ffc107",
    fontWeight: "bold",
    marginTop: "8px",
  },
  tokenBadge: {
    color: "#00d9ff",
    fontSize: "11px",
    marginTop: "5px",
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    padding: "3px 6px",
    borderRadius: "3px",
    width: "fit-content",
  },
  metadataBox: {
    backgroundColor: "#0a0e27",
    borderRadius: "6px",
    padding: "15px",
    overflow: "auto",
    maxHeight: "300px",
    border: "1px solid rgba(100, 100, 150, 0.3)",
  },
  json: {
    margin: 0,
    color: "#00ff88",
    fontSize: "12px",
    fontFamily: "monospace",
  },
  footer: {
    marginTop: "40px",
    padding: "20px",
    backgroundColor: "rgba(0, 217, 255, 0.05)",
    border: "1px solid rgba(0, 217, 255, 0.2)",
    borderRadius: "8px",
    textAlign: "center",
  },
  footerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  footerIcon: {
    fontSize: "18px",
  },
  footerText: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "20px",
  },
  spinner: {
    border: "4px solid rgba(0, 217, 255, 0.2)",
    borderTop: "4px solid #00d9ff",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
  loaderText: {
    fontSize: "16px",
    color: "#00d9ff",
    margin: 0,
  },
  dots: {
    display: "flex",
    gap: "8px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#00d9ff",
    animation: "pulse 1.4s infinite",
  },
  errorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  errorIcon: {
    fontSize: "28px",
  },
  errorTitle: {
    color: "#ff4444",
    margin: 0,
  },
  errorText: {
    color: "#ff8888",
    fontSize: "14px",
  },
  text: {
    color: "#e0e0e0",
  },
};
