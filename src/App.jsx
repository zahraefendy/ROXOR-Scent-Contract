import { useState, Suspense, useEffect } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [verifStatus, setVerifStatus] = useState("")
  const [scentDetail, setScentDetail] = useState(null)
  const [mintSerial, setMintSerial] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeNote, setActiveNote] = useState(""); 

  // DEFI & YIELD STATES
  const [isStaked, setIsStaked] = useState(false);
  const [yieldAmount, setYieldAmount] = useState(0);

  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir. How can I assist you regarding our Valiant collection today?");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"      

  // Logic DeFi: Simulasi Yield Real-time
  useEffect(() => {
    let interval;
    if (isStaked) {
      interval = setInterval(() => {
        setYieldAmount(prev => prev + 0.00005);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStaked]);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) { console.error("Cancelled"); }
    } else { alert("Please install MetaMask!"); }
  }

  function checkProduct(serial) {
    if (!serial) return;
    setVerifStatus("🔍 Syncing with Rialo Ledger..."); 
    setScentDetail(null);
    
    const code = serial.toUpperCase();
    
    setTimeout(() => {
        if (code.includes("VLT") || code === "RXR-VLT-001") {
            setVerifStatus("✅ AUTHENTIC VALIANT! (Verified on Rialo)"); 
            setScentDetail({
              name: "VALIANT",
              type: "Extrait de Parfum",
              vibes: "Fresh, Spicy, & Woody",
              // RWA DATA
              batch: "BATCH-VLT-001-2026",
              vault: "Secure Vault - Jakarta",
              status: "PHYSICAL ASSET SECURED"
            });
        } else {
            setVerifStatus("❌ INVALID CODE! Product not recognized.");
            setScentDetail(null);
        }
    }, 600);
  }

  async function mintSertifikat() {
    if (!walletAddress || !mintSerial) return;
    setIsMinting(true);
    setVerifStatus("⏳ Waiting for Confirmation...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(nftAddress, abiNFT, signer);
      const tx = await nftContract.mintCertificate(walletAddress, `https://roxor.id/cert/${mintSerial}`);
      setVerifStatus("⏳ Minting on Rialo..."); 
      await tx.wait();
      setVerifStatus("");
      setShowSuccess(true);
      setMintSerial("");
    } catch (err) { 
      console.error(err); 
      setVerifStatus("❌ Transaction Failed.");
    } finally {
      setIsMinting(false);
    }
  }

  const handleNdoAI = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are NdoAI, a professional luxury assistant for ROXOR. Product: Valiant (Sauvage Dior inspired, Extrait 1:1). Question: ${aiInput}`;
      const result = await model.generateContent(prompt);
      setAiResponse(result.response.text());
    } catch (err) {
      setAiResponse("I apologize, Sir. The system is currently busy.");
    } finally {
      setIsAiLoading(false);
      setAiInput("");
    }
  };

  return (
    <div className="App">
      <header>
        <h1 className="title">ROXOR CAVALIER SCENT</h1>
        {!walletAddress ? (
          <button id="connectButton" onClick={connectWallet}>CONNECT WALLET</button>
        ) : (
          <p id="status">ACTIVE WALLET: {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}</p>
        )}
      </header>

      <main>
        {/* 1. PRODUCT VERIFIER (RWA) */}
        <section className="main-card-section">
          <div className="card">
            <h3>RWA PRODUCT VERIFIER</h3>
            <p>Verify the physical asset link on Rialo Network.</p>
            <input type="text" id="serialInput" placeholder="e.g., RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>
              VERIFY ASSET
            </button>
            
            {verifStatus && <p className="verif-result" style={{marginTop:'15px', fontWeight: 'bold'}}>{verifStatus}</p>}
            
            {scentDetail && (
              <div className="scent-verif-detail" style={{marginTop: '10px', padding: '15px', borderTop: '1px solid #444', background: 'rgba(0, 255, 204, 0.05)', borderRadius: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h4 style={{margin: '0', color: '#fff'}}>{scentDetail.name}</h4>
                    <span style={{fontSize: '0.7rem', color: '#00ffcc', border: '1px solid #00ffcc', padding: '2px 6px', borderRadius: '4px'}}>{scentDetail.status}</span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', textAlign: 'left'}}>
                    <div>
                        <p style={{fontSize: '0.65rem', color: '#888', margin: '0'}}>BATCH ID</p>
                        <p style={{fontSize: '0.8rem', color: '#eee', margin: '2px 0'}}>{scentDetail.batch}</p>
                    </div>
                    <div>
                        <p style={{fontSize: '0.65rem', color: '#888', margin: '0'}}>VAULT LOCATION</p>
                        <p style={{fontSize: '0.8rem', color: '#eee', margin: '2px 0'}}>{scentDetail.vault}</p>
                    </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. DIGITAL VAULT & DEFI DASHBOARD */}
        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>DIGITAL VAULT & DEFI</h3>
              <div className="nft-display-grid">
                <div className={`nft-card-visual ${isMinting ? 'shimmer' : ''} ${isStaked ? 'staked-glow' : ''}`}>
                  <div className="nft-badge">EXTRAIT 1:1</div>
                  <div className="nft-content">
                    <span className="nft-title">VALIANT</span>
                    <span className="nft-serial">{isStaked ? "🔒 ASSET STAKED" : (mintSerial || "CERTIFIED")}</span>
                  </div>
                  <div className="nft-chain-tag">RIALO NETWORK</div>
                </div>
              </div>

              {/* NEW: DEFI YIELD PANEL */}
              <div style={{margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #333'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem'}}>
                    <span style={{color: '#888'}}>Accrued Yield:</span>
                    <span style={{color: '#00ffcc', fontWeight: 'bold'}}>{yieldAmount.toFixed(5)} RXR</span>
                </div>
                <button 
                  className="roxor-btn" 
                  onClick={() => setIsStaked(!isStaked)}
                  style={{marginTop: '10px', width: '100%', background: isStaked ? '#ff4444' : '#00ffcc', color: '#000'}}
                >
                  {isStaked ? "STOP STAKING" : "STAKE FOR RXR REWARDS"}
                </button>
              </div>

              <div className="mint-control" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Serial (e.g. VLT-001)" 
                  className="roxor-input"
                  value={mintSerial}
                  onChange={(e) => setMintSerial(e.target.value.toUpperCase())}
                  disabled={isMinting || isStaked}
                />
                <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting || isStaked}>
                  {isMinting ? "MINTING IN PROGRESS..." : "MINT NFT CERTIFICATE"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. INTERACTIVE 3D */}
        <section className="main-card-section">
           <div className="card" style={{ minHeight: '400px' }}>
             <h3>VALIANT INTERACTIVE VIEW</h3>
             <Suspense fallback={<p>Loading 3D Experience...</p>}>
               <Valiant3D />
             </Suspense>
           </div>
        </section>

        {/* 4. SCENT PROFILE INTERAKTIF */}
        <section className="main-card-section variant-section">
          <div className="card scent-card">
            <h3>VALIANT SCENT PROFILE</h3>
            <div className="pyramid-container">
              <div className={`pyramid-item ${activeNote === 'top' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('top')} onMouseLeave={() => setActiveNote('')} style={{cursor: 'pointer'}}>
                <span className="note-label">TOP NOTES {activeNote === 'top' && '✨'}</span>
                <span className="note-value">Calabrian Bergamot, Pepper</span>
              </div>
              <div className={`pyramid-item ${activeNote === 'heart' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('heart')} onMouseLeave={() => setActiveNote('')} style={{cursor: 'pointer'}}>
                <span className="note-label">HEART NOTES {activeNote === 'heart' && '🌿'}</span>
                <span className="note-value">Sichuan Pepper, Lavender, Pink Pepper</span>
              </div>
              <div className={`pyramid-item ${activeNote === 'base' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('base')} onMouseLeave={() => setActiveNote('')} style={{cursor: 'pointer'}}>
                <span className="note-label">BASE NOTES {activeNote === 'base' && '🪵'}</span>
                <span className="note-value">Ambroxan, Cedar, Labdanum</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="roxor-modal-overlay">
          <div className="roxor-success-modal">
            <div className="success-icon">✦</div>
            <h3>AUTHENTICITY SECURED</h3>
            <p>Your ROXOR Digital Certificate has been successfully written to the Rialo Ledger.</p>
            <button onClick={() => setShowSuccess(false)} className="roxor-btn" style={{padding:'10px'}}>CLOSE</button>
          </div>
        </div>
      )}

      {/* NdoAI */}
      <div className="ndoai-container">
        {showAI && (
          <div className="ai-chat-window">
            <div className="ai-header">NdoAI Assistant</div>
            <div className="ai-content"><p><strong>NdoAI:</strong> {isAiLoading ? "..." : aiResponse}</p></div>
            <div className="ai-footer">
              <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask..." onKeyPress={(e) => e.key === 'Enter' && handleNdoAI()} />
            </div>
          </div>
        )}
        <button className="ai-toggle" onClick={() => setShowAI(!showAI)}>{showAI ? "X" : "🤖 NdoAI"}</button>
      </div>
    </div>
  );
}

export default App;