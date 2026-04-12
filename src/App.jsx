import { useState, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [avatar, setAvatar] = useState("") 
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
        const address = accounts[0];
        setWalletAddress(address);
        setAvatar(`https://effigy.im/a/${address}.svg`);
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
              batch: "BATCH: RXR-VLT-2026",
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
      
      {/* WRAPPER HEADER UNTUK NAVIGASI */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        padding: '20px 0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        
        {/* PROFIL DI POJOK KIRI (Hanya muncul setelah konek) */}
        {walletAddress && (
          <div style={{ 
            position: 'absolute', 
            left: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            background: '#f5f5f5', 
            padding: '8px 15px', 
            borderRadius: '50px',
            border: '1px solid #000',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <img src={avatar} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #000' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#000', letterSpacing: '1px' }}>
              {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}

        {/* JUDUL TETEP DI TENGAH */}
        <h1 className="title" style={{ margin: 0, textAlign: 'center' }}>ROXOR CAVALIER SCENT</h1>
      </div>

      <header style={{ marginTop: '10px' }}>
        {!walletAddress && (
          <button id="connectButton" onClick={connectWallet}>CONNECT WALLET</button>
        )}
      </header>

      <main>
        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <p>Check the authenticity of your ROXOR fragrance.</p>
            <input type="text" id="serialInput" placeholder="e.g., RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>
              VERIFY NOW
            </button>
            {verifStatus && <p className="verif-result" style={{marginTop:'15px', fontWeight: 'bold', color: '#000'}}>{verifStatus}</p>}
            {scentDetail && (
              <div className="scent-verif-detail" style={{
                marginTop: '15px', padding: '20px', border: '2px solid #000', textAlign: 'left', background: '#fff', borderRadius: '12px', color: '#000'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                  <h4 style={{margin: '0', color: '#000', letterSpacing: '1px'}}>{scentDetail.name}</h4>
                  <span style={{fontSize: '0.6rem', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px'}}>{scentDetail.batch}</span>
                </div>
                <p style={{fontSize: '0.8rem', fontStyle: 'italic', color: '#333', margin: '10px 0'}}>{scentDetail.type} - {scentDetail.vibes}</p>
                <p style={{fontSize: '0.9rem', color: '#000', lineHeight: '1.5', margin: '0 0 20px 0'}}>{scentDetail.description}</p>
              </div>
            )}
          </div>
        </section>

        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>DIGITAL VAULT</h3>
              <div className="nft-display-grid" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className={`nft-card-visual ${isMinting ? 'shimmer' : ''}`} style={{ 
                  background: '#000', border: '2px solid #333', padding: '0', overflow: 'hidden', borderRadius: '16px', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  <img src="/nft-valiant.png" alt="Roxor NFT" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div style={{ padding: '15px', background: '#000', color: '#fff', textAlign: 'center', borderTop: '1px solid #222' }}>
                    <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '4px', letterSpacing: '1px' }}>RIALO NETWORK CERTIFIED</div>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>{mintSerial || "VALIANT"}</span>
                  </div>
                </div>
              </div>
              <div className="mint-control" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Enter Serial" className="roxor-input" value={mintSerial} onChange={(e) => setMintSerial(e.target.value.toUpperCase())} disabled={isMinting} style={{ color: '#000', borderColor: '#000', textAlign: 'center' }} />
                <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting} style={{ background: '#000', color: '#fff' }}>
                  {isMinting ? "MINTING IN PROGRESS..." : "MINT NFT CERTIFICATE"}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="main-card-section">
            <div className="card" style={{ minHeight: '400px' }}>
              <h3>VALIANT INTERACTIVE VIEW</h3>
              <Suspense fallback={<p>Loading 3D Experience...</p>}><Valiant3D /></Suspense>
            </div>
        </section>

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

      {/* LINK X Twitter */}
      <a 
        href="https://x.com/roxorcavalier" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          position: 'fixed', bottom: '80px', right: '20px', zIndex: '1000',
          background: '#000', color: '#fff', width: '50px', height: '50px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid #fff', textDecoration: 'none'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      </a>

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