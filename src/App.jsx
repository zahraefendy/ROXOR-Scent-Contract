import { useState, useEffect, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

// IKON SVG
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
  SharkTank: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
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
  const [ledger, setLedger] = useState([]);
  const [viewLedger, setViewLedger] = useState(false);
  const [viewVault, setViewVault] = useState(false);
  const [userNfts, setUserNfts] = useState([]); 
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir.");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"      

  useEffect(() => {
    const savedLedger = localStorage.getItem('roxor_ledger');
    if (savedLedger) setLedger(JSON.parse(savedLedger));
    if (walletAddress) {
      setUserNfts([{ id: 1, name: "VALIANT", serial: "RXR-VLT-001", type: "Extrait de Parfum", img: "/nft-valiant.png" }]);
    }
  }, [walletAddress]);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setAvatar(`https://effigy.im/a/${accounts[0]}.svg`);
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
            setScentDetail({
              name: "VALIANT",
              type: "Extrait de Parfum",
              vibes: "Fresh, Spicy, & Woody",
              batch: "BATCH: RXR-VLT-2026",
              description: "A powerful and noble composition. Valiant opens with the radiant freshness of Calabrian Bergamot and Pepper."
            });
            setVerifStatus("✅ AUTHENTIC PRODUCT VERIFIED"); 
            const newEntry = { id: Date.now(), date: new Date().toLocaleString(), item: "Valiant", serial: code, status: "AUTHENTIC" };
            setLedger([newEntry, ...ledger]);
            localStorage.setItem('roxor_ledger', JSON.stringify([newEntry, ...ledger]));
        } else {
            setVerifStatus("❌ INVALID CODE!");
        }
    }, 600);
  }

  async function mintSertifikat() {
    if (!walletAddress || !mintSerial) return;
    setIsMinting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(nftAddress, abiNFT, signer);
      const tx = await nftContract.mintCertificate(walletAddress, `https://roxor.id/cert/${mintSerial}`);
      await tx.wait();
      setShowSuccess(true);
      setUserNfts([...userNfts, { id: Date.now(), name: "VALIANT", serial: mintSerial, img: "/nft-valiant.png" }]);
      setMintSerial("");
    } catch (err) { console.error(err); } finally { setIsMinting(false); }
  }

  const handleNdoAI = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`You are NdoAI for ROXOR. Question: ${aiInput}`);
      setAiResponse(result.response.text());
    } catch (err) { setAiResponse("System busy."); } finally { setIsAiLoading(false); setAiInput(""); }
  };

  const menuItemStyle = { background: 'none', border: 'none', textAlign: 'left', fontSize: '1.1rem', fontWeight: '900', color: '#000', cursor: 'pointer', padding: '15px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f0f0f0', width: '100%' };

  return (
    <div className="App">
      {/* SIDEBAR */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', zIndex: 10000 }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ width: '300px', height: '100%', background: '#fff', borderRight: '3px solid #000', padding: '40px 20px' }} onClick={(e) => e.stopPropagation()}>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <button style={menuItemStyle} onClick={() => {setIsMenuOpen(false); setViewLedger(false); setViewVault(false);}}>{Icons.Sanctuary} Sanctuary</button>
              <button style={menuItemStyle} onClick={() => {setViewLedger(true); setIsMenuOpen(false);}}>{Icons.Ledger} My Ledger</button>
              <button style={menuItemStyle} onClick={() => { if(!walletAddress) return alert("Connect Wallet!"); setViewVault(true); setIsMenuOpen(false); }}>{Icons.Vault} Digital Vault</button>
              <button style={menuItemStyle} onClick={() => alert("Scent Council coming soon.")}>{Icons.Council} Scent Council</button>
              <button style={menuItemStyle} onClick={() => window.open('https://rialobs.vercel.app/', '_blank')}>{Icons.SharkTank} Shark Tank Rialo</button>
            </nav>
          </div>
        </div>
      )}

      {/* VAULT MODAL */}
      {viewVault && (
        <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
          <div className="card" style={{ maxWidth: '600px', border: '4px solid #000' }}>
            <h3>DIGITAL VAULT</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {userNfts.map(nft => (
                <div key={nft.id} style={{ background: '#000', borderRadius: '10px', color: '#fff', padding: '5px' }}>
                  <img src={nft.img} style={{ width: '100%' }} />
                  <div style={{fontSize: '0.6rem', padding: '5px'}}>{nft.serial}</div>
                </div>
              ))}
            </div>
            <button className="roxor-btn" onClick={() => setViewVault(false)}>CLOSE</button>
          </div>
        </div>
      )}

      {/* LEDGER MODAL */}
      {viewLedger && (
        <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
          <div className="card">
            <h3>MY LEDGER</h3>
            {ledger.map(log => <div key={log.id} style={{border: '2px solid #000', padding: '10px', marginBottom: '5px'}}>{log.item} - {log.serial}</div>)}
            <button className="roxor-btn" onClick={() => setViewLedger(false)}>CLOSE</button>
          </div>
        </div>
      )}

      <header style={{ padding: '40px' }}><h1 className="title">ROXOR CAVALIER SCENT</h1></header>

      {walletAddress ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setIsMenuOpen(true)} className="roxor-btn">☰</button>
          <div className="roxor-input" style={{width: 'auto'}}>{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</div>
        </div>
      ) : <button className="roxor-btn" onClick={connectWallet}>CONNECT WALLET</button>}

      <main>
        {/* VERIFIER & SCENT DETAIL (AMAN) */}
        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <input id="serialInput" placeholder="RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>VERIFY</button>
            {verifStatus && <p>{verifStatus}</p>}
            {scentDetail && (
              <div style={{textAlign: 'left', borderTop: '1px solid #000', marginTop: '10px'}}>
                <h4>{scentDetail.name}</h4><p>{scentDetail.vibes}</p><p>{scentDetail.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* MINT SECTION (AMAN) */}
        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>MINT CERTIFICATE</h3>
              <input placeholder="Serial" className="roxor-input" value={mintSerial} onChange={(e) => setMintSerial(e.target.value.toUpperCase())} />
              <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting}>MINT NFT</button>
            </div>
          </section>
        )}

        {/* 3D VIEW (AMAN) */}
        <section className="main-card-section">
          <div className="card" style={{height: '400px'}}>
            <Suspense fallback={<p>Loading 3D...</p>}><Valiant3D /></Suspense>
          </div>
        </section>
      </main>

      {/* NdoAI (AMAN) */}
      <div className="ndoai-container">
        {showAI && <div className="ai-chat-window">{aiResponse}</div>}
        <button className="ai-toggle" onClick={() => setShowAI(!showAI)}>🤖 NdoAI</button>
      </div>
    </div>
  );
}
export default App;