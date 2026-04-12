import { useState, useEffect, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

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
  
  // Fitur Baru: My Ledger State
  const [ledger, setLedger] = useState([]);
  const [viewLedger, setViewLedger] = useState(false);

  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir. How can I assist you regarding our Valiant collection today?");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"      

  // Load Ledger dari LocalStorage pas awal buka
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

            // SIMPAN KE LEDGER
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

  // ... (Fungsi Minting & AI tetep sama) ...
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
      
      {/* --- DASHBOARD MENU OVERLAY --- */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', zIndex: 10000
        }} onClick={() => setIsMenuOpen(false)}>
          
          <div style={{
            width: '300px', height: '100%', background: '#fff', borderRight: '3px solid #000',
            padding: '40px 20px', display: 'flex', flexDirection: 'column',
            boxShadow: '15px 0 30px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'bold' }}>R</div>
              <h2 style={{ color: '#000', margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>ROXOR HUB</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <button style={menuItemStyle} onClick={() => {setIsMenuOpen(false); setViewLedger(false);}}>🏠 Sanctuary</button>
              
              {/* Trigger My Ledger */}
              <button style={menuItemStyle} onClick={() => {setViewLedger(true); setIsMenuOpen(false);}}>📊 My Ledger</button>
              
              <button style={menuItemStyle} onClick={() => alert("Digital Vault: Minted certificates view coming soon.")}>🖼️ Digital Vault</button>
              <button style={menuItemStyle} onClick={() => alert("Scent Council: Governance voting soon.")}>⚖️ Scent Council</button>
              <button style={menuItemStyle} onClick={() => window.open('https://x.com/roxorcavalier', '_blank')}>📱 Community</button>
            </nav>

            <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: 'auto', background: '#000', color: '#fff', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* --- MODAL MY LEDGER --- */}
      {viewLedger && (
        <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{letterSpacing: '2px'}}>MY LEDGER</h3>
            <p style={{fontSize: '0.8rem', color: '#666'}}>Record of your on-chain authentications</p>
            <hr border="1px solid #000" />
            
            {ledger.length === 0 ? (
              <p style={{padding: '20px', fontStyle: 'italic'}}>No records found. Verify a product to start your ledger.</p>
            ) : (
              ledger.map(log => (
                <div key={log.id} style={{ 
                  textAlign: 'left', padding: '15px 0', borderBottom: '1px solid #eee'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{log.item} #{log.serial}</span>
                    <span style={{fontSize: '0.7rem', color: '#888'}}>{log.date}</span>
                  </div>
                  <div style={{color: 'green', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '5px'}}>● {log.status}</div>
                </div>
              ))
            )}
            
            <button className="roxor-btn" style={{marginTop: '20px'}} onClick={() => setViewLedger(false)}>BACK TO SANCTUARY</button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 20px 20px' }}>
        <h1 className="title" style={{ fontSize: '2.5rem', fontWeight: '950', color: '#000', textTransform: 'uppercase', letterSpacing: '-1px' }}>
          ROXOR CAVALIER SCENT
        </h1>
      </header>

      {/* --- MENU & WALLET (Centered) --- */}
      {walletAddress && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <button onClick={() => setIsMenuOpen(true)} style={{ background: '#fff', border: '3px solid #000', borderRadius: '10px', padding: '8px 15px', fontSize: '22px', cursor: 'pointer', boxShadow: '4px 4px 0px #000' }}>
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 20px', borderRadius: '40px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
            <img src={avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #000' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#000' }}>{walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        </div>
      )}

      {!walletAddress && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <button id="connectButton" onClick={connectWallet} style={{ padding: '12px 24px', fontWeight: 'bold' }}>CONNECT WALLET</button>
        </div>
      )}

      <main>
        {/* ... (Main Content: Verifier, Vault, 3D tetep sama kodenya di bawah sini) ... */}
        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <p>Check the authenticity of your ROXOR fragrance.</p>
            <input type="text" id="serialInput" placeholder="e.g., RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>
              VERIFY NOW
            </button>
            {verifStatus && <p style={{marginTop:'15px', fontWeight: 'bold', color: '#000'}}>{verifStatus}</p>}
          </div>
        </section>

        {/* ... Masukin sisa seksi Vault, 3D, dan Scent Profile dari kode sebelumnya ... */}
        {/* (Gue ringkas biar nggak kepanjangan di chat, tapi tetep ada di App.jsx lu) */}
      </main>

      {/* MODAL SUCCESS & NdoAI (Tetep di sini) */}
    </div>
  );
}

export default App;