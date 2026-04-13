import { useState, useEffect, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

// OBJEK IKON SVG INLINE (Tanpa Install Library)
const Icons = {
  Sanctuary: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Ledger: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
  ),
  Vault: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v1"/><path d="M12 14v1"/><path d="M9 12h1"/><path d="M14 12h1"/></svg>
  ),
  Council: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13 4 2 3-6-4-2-3 6Z"/><path d="m4 9 3 6 4-2-3-6-4 2Z"/><path d="M12 2v20"/><path d="M2 22h20"/></svg>
  ),
  Community: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )
};

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [avatar, setAvatar] = useState("") 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [verifStatus, setVerifStatus] = useState("")
  const [scentDetail, setScentDetail] = useState(null)
  const [mintSerial, setMintSerial] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeNote, setActiveNote] = useState(""); 
  
  const [ledger, setLedger] = useState([]);
  const [viewLedger, setViewLedger] = useState(false);

  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir. How can I assist you regarding our Valiant collection today?");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"      

  useEffect(() => {
    const savedLedger = localStorage.getItem('roxor_ledger');
    if (savedLedger) setLedger(JSON.parse(savedLedger));
  }, []);

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
            const detail = {
              name: "VALIANT",
              type: "Extrait de Parfum",
              vibes: "Fresh, Spicy, & Woody",
              batch: "BATCH: RXR-VLT-2026",
              description: "A powerful and noble composition. Valiant opens with the radiant freshness of Calabrian Bergamot and Pepper."
            };
            setVerifStatus("✅ AUTHENTIC PRODUCT VERIFIED"); 
            setScentDetail(detail);

            const newEntry = {
              id: Date.now(),
              date: new Date().toLocaleString(),
              item: "Valiant",
              serial: code,
              status: "AUTHENTIC"
            };
            const updatedLedger = [newEntry, ...ledger];
            setLedger(updatedLedger);
            localStorage.setItem('roxor_ledger', JSON.stringify(updatedLedger));

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
      const prompt = `You are NdoAI, a professional luxury assistant for ROXOR. Product: Valiant. Question: ${aiInput}`;
      const result = await model.generateContent(prompt);
      setAiResponse(result.response.text());
    } catch (err) {
      setAiResponse("I apologize, Sir. The system is currently busy.");
    } finally {
      setIsAiLoading(false);
      setAiInput("");
    }
  };

  const menuItemStyle = {
    background: 'none', border: 'none', textAlign: 'left', fontSize: '1.1rem',
    fontWeight: '900', color: '#000', cursor: 'pointer', padding: '15px 10px',
    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px',
    borderBottom: '1px solid #f0f0f0', width: '100%'
  };

  return (
    <div className="App">
      {/* MENU OVERLAY */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', zIndex: 10000 }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ width: '300px', height: '100%', background: '#fff', borderRight: '3px solid #000', padding: '40px 20px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'bold' }}>R</div>
              <h2 style={{ color: '#000', margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>ROXOR HUB</h2>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <button style={menuItemStyle} onClick={() => {setIsMenuOpen(false); setViewLedger(false);}}>{Icons.Sanctuary} Sanctuary</button>
              <button style={menuItemStyle} onClick={() => {setViewLedger(true); setIsMenuOpen(false);}}>{Icons.Ledger} My Ledger</button>
              <button style={menuItemStyle} onClick={() => alert("Digital Vault coming soon.")}>{Icons.Vault} Digital Vault</button>
              <button style={menuItemStyle} onClick={() => alert("Scent Council coming soon.")}>{Icons.Council} Scent Council</button>
              <button style={menuItemStyle} onClick={() => window.open('https://x.com/roxorcavalier', '_blank')}>{Icons.Community} Community</button>
            </nav>
            <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: 'auto', background: '#000', color: '#fff', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* LEDGER MODAL */}
      {viewLedger && (
        <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', maxHeight: '80vh', overflowY: 'auto', border: '4px solid #000' }}>
            <h3 style={{letterSpacing: '2px', fontWeight: '900'}}>MY LEDGER</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ledger.length === 0 ? <p>Ledger empty.</p> : ledger.map(log => (
                <div key={log.id} style={{ textAlign: 'left', padding: '12px', border: '2px solid #000', background: '#fff', boxShadow: '3px 3px 0px #000' }}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{fontWeight: '950'}}>{log.item}</span><span style={{fontSize: '0.65rem'}}>{log.date}</span></div>
                  <div style={{fontSize: '0.75rem'}}>SERIAL: {log.serial}</div>
                  <div style={{color: '#000', fontSize: '0.7rem', fontWeight: '900', marginTop: '5px'}}>● {log.status}</div>
                </div>
              ))}
            </div>
            <button className="roxor-btn" style={{marginTop: '20px'}} onClick={() => setViewLedger(false)}>CLOSE</button>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 20px 20px' }}>
        <h1 className="title" style={{ fontSize: '2.5rem', fontWeight: '950', textAlign: 'center' }}>ROXOR CAVALIER SCENT</h1>
      </header>

      {walletAddress ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <button onClick={() => setIsMenuOpen(true)} style={{ background: '#fff', border: '3px solid #000', borderRadius: '10px', padding: '8px 15px', fontSize: '22px', boxShadow: '4px 4px 0px #000' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 20px', borderRadius: '40px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
            <img src={avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #000' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '900' }}>{walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><button id="connectButton" onClick={connectWallet}>CONNECT WALLET</button></div>
      )}

      <main>
        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <input type="text" id="serialInput" placeholder="e.g., RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>VERIFY NOW</button>
            {verifStatus && <p style={{marginTop:'15px', fontWeight: 'bold'}}>{verifStatus}</p>}
          </div>
        </section>

        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>DIGITAL VAULT</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className={`nft-card-visual ${isMinting ? 'shimmer' : ''}`} style={{ background: '#000', border: '2px solid #333', borderRadius: '16px', width: '100%', maxWidth: '300px', overflow: 'hidden' }}>
                  <img src="/nft-valiant.png" alt="Roxor NFT" style={{ width: '100%' }} />
                  <div style={{ padding: '15px', color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#888' }}>RIALO NETWORK CERTIFIED</div>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{mintSerial || "VALIANT"}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Enter Serial" className="roxor-input" value={mintSerial} onChange={(e) => setMintSerial(e.target.value.toUpperCase())} />
                <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting}>MINT NFT CERTIFICATE</button>
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
      </main>

      <div className="ndoai-container">
        {showAI && (
          <div className="ai-chat-window">
            <div className="ai-header">NdoAI Assistant</div>
            <div className="ai-content"><p><strong>NdoAI:</strong> {isAiLoading ? "..." : aiResponse}</p></div>
            <div className="ai-footer"><input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleNdoAI()} /></div>
          </div>
        )}
        <button className="ai-toggle" onClick={() => setShowAI(!showAI)}>{showAI ? "X" : "🤖 NdoAI"}</button>
      </div>
    </div>
  );
}

export default App;