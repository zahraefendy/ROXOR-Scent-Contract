import { useState, Suspense } from 'react'
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

  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir. How can I assist you regarding our Valiant collection today?");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"      

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
    setVerifStatus("🔍 Syncing with Rialo..."); 
    setScentDetail(null);
    
    const code = serial.toUpperCase();
    
    setTimeout(() => {
        if (code.includes("VLT") || code === "RXR-VLT-001") {
            setVerifStatus("✅ AUTHENTIC PRODUCT VERIFIED"); 
            setScentDetail({
              name: "VALIANT",
              type: "Extrait de Parfum",
              vibes: "Fresh, Spicy, & Woody",
              description: "A powerful and noble composition. Valiant opens with the radiant freshness of Calabrian Bergamot and Pepper. Its heart reveals a sophisticated blend of Sichuan Pepper and Lavender, settling into a long-lasting, masculine trail of precious Ambroxan and Cedarwood."
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
      setVerifStatus("⏳ Minting on Rialo Network..."); 
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
        {/* 1. PRODUCT VERIFIER */}
        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <p>Check the authenticity of your ROXOR fragrance.</p>
            <input type="text" id="serialInput" placeholder="e.g., RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>
              VERIFY NOW
            </button>
            
            {verifStatus && <p className="verif-result" style={{marginTop:'15px', fontWeight: 'bold'}}>{verifStatus}</p>}
            
            {scentDetail && (
              <div className="scent-verif-detail" style={{marginTop: '15px', padding: '15px', borderTop: '1px solid #444', textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderRadius: '8px'}}>
                <h4 style={{margin: '0', color: '#00ffcc', letterSpacing: '1px'}}>{scentDetail.name}</h4>
                <p style={{fontSize: '0.75rem', fontStyle: 'italic', color: '#aaa', marginBottom: '10px'}}>{scentDetail.type} - {scentDetail.vibes}</p>
                <p style={{fontSize: '0.85rem', color: '#eee', lineHeight: '1.5', margin: '0'}}>
                  {scentDetail.description}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 2. DIGITAL VAULT */}
        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>DIGITAL VAULT</h3>
              <div className="nft-display-grid">
                <div className={`nft-card-visual ${isMinting ? 'shimmer' : ''}`}>
                  <div className="nft-badge">EXTRAIT 1:1</div>
                  <div className="nft-content">
                    <span className="nft-title">VALIANT</span>
                    <span className="nft-serial">{mintSerial || "CERTIFIED"}</span>
                  </div>
                  <div className="nft-chain-tag">RIALO NETWORK</div>
                </div>
              </div>
              <div className="mint-control" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Serial (e.g. VLT-001)" 
                  className="roxor-input"
                  value={mintSerial}
                  onChange={(e) => setMintSerial(e.target.value.toUpperCase())}
                  disabled={isMinting}
                />
                <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting}>
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
              <div className={`pyramid-item ${activeNote === 'top' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('top')} onMouseLeave={() => setActiveNote('')}>
                <span className="note-label">TOP NOTES {activeNote === 'top' && '✨'}</span>
                <span className="note-value">Calabrian Bergamot, Pepper</span>
              </div>
              <div className={`pyramid-item ${activeNote === 'heart' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('heart')} onMouseLeave={() => setActiveNote('')}>
                <span className="note-label">HEART NOTES {activeNote === 'heart' && '🌿'}</span>
                <span className="note-value">Lavender, Pink Pepper</span>
              </div>
              <div className={`pyramid-item ${activeNote === 'base' ? 'active-note' : ''}`} onMouseEnter={() => setActiveNote('base')} onMouseLeave={() => setActiveNote('')}>
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