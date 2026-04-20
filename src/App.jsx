import { useState, useEffect, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

// Icons
const Icons = {
  Sanctuary: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Ledger: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>),
  Vault: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v1"/><path d="M12 14v1"/><path d="M9 12h1"/><path d="M14 12h1"/></svg>),
  Council: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13 4 2 3-6-4-2-3 6Z"/><path d="m4 9 3 6 4-2-3-6-4 2Z"/><path d="M12 2v20"/><path d="M2 22h20"/></svg>),
  SharkTank: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  Community: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Sparkles: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>),
  ArtPerfume: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4V2h6v2M12 4V2M10 4h4v3h-4zM7 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM12 11v4M10 13h4"/></svg>)
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
  const [mintedImage, setMintedImage] = useState("/vlt-nft.jpg");
  const [ledger, setLedger] = useState([]);
  const [viewLedger, setViewLedger] = useState(false);
  const [viewVault, setViewVault] = useState(false);
  const [viewCouncil, setViewCouncil] = useState(false); 
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
      setUserNfts([{ id: 1, name: "VALIANT", serial: "RXR-VLT-001", type: "Extrait de Parfum", image: "/vlt-nft.jpg" }]);
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
            const updatedLedger = [newEntry, ...ledger];
            setLedger(updatedLedger);
            localStorage.setItem('roxor_ledger', JSON.stringify(updatedLedger));
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
      const currentImage = mintSerial.includes("VLT") ? "/vlt-nft.jpg" : "/vlt-nft.jpg";
      setMintedImage(currentImage);
      const tx = await nftContract.mintCertificate(walletAddress, `https://roxor.id/cert/${mintSerial}`);
      await tx.wait();
      setShowSuccess(true);
      setUserNfts([...userNfts, { id: Date.now(), name: "VALIANT", serial: mintSerial, image: currentImage }]);
      setMintSerial("");
    } catch (err) { console.error(err); alert("Transaction failed or cancelled."); } finally { setIsMinting(false); }
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

  const closeAndReturn = () => {
    setViewLedger(false); setViewVault(false); setViewCouncil(false); setIsMenuOpen(true);
  };

  const menuItemStyle = { background: 'none', border: 'none', textAlign: 'left', fontSize: '1.1rem', fontWeight: '900', color: '#000', cursor: 'pointer', padding: '15px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f0f0f0', width: '100%', position: 'relative', zIndex: 2 };

  return (
    <div className="App">
      
      {showSuccess && (
        <div className="roxor-modal-overlay" style={{zIndex: 20000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)'}}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', border: '4px solid #fff', background: '#000', color: '#fff' }}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>✨</div>
            <h2 style={{fontWeight: '950', letterSpacing: '2px', color: '#fff'}}>MINT SUCCESSFUL!</h2>
            <p style={{fontSize: '0.9rem', opacity: 0.8, marginBottom: '20px'}}>Congratulations! Your NFT Certificate has been successfully minted.</p>
            <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
               <img src={mintedImage} alt="NFT Certificate" style={{ width: '100%', display: 'block' }} />
            </div>
            <button className="roxor-btn" style={{ background: '#fff', color: '#000', width: '100%' }} onClick={() => setShowSuccess(false)}>DONE</button>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(15px)', zIndex: 10000, display: 'flex' }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ width: '310px', height: '100%', background: '#fff', borderRight: '4px solid #000', padding: '40px 20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '30px 0 60px rgba(0,0,0,0.05)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* LOGO DI DALAM SIDEBAR */}
            <div style={{ marginBottom: '35px', position: 'relative', zIndex: 2 }}>
              <img src="/logo-roxor.png" alt="Roxor Hub" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
              <button style={menuItemStyle} onClick={() => {setIsMenuOpen(false); setViewLedger(false); setViewVault(false);}}>{Icons.Sanctuary} Sanctuary</button>
              <button style={menuItemStyle} onClick={() => {setViewLedger(true); setIsMenuOpen(false);}}>{Icons.Ledger} My Ledger</button>
              <button style={menuItemStyle} onClick={() => { if(!walletAddress) return alert("Connect Wallet!"); setViewVault(true); setIsMenuOpen(false); }}>{Icons.Vault} Digital Vault</button>
              <button style={menuItemStyle} onClick={() => {setViewCouncil(true); setIsMenuOpen(false);}}>{Icons.Council} Scent Council</button>
              <button style={menuItemStyle} onClick={() => window.open('https://rialobs.vercel.app/', '_blank')}>{Icons.SharkTank} Shark Tank Rialo</button>
              <button style={menuItemStyle} onClick={() => window.open('https://x.com/roxorcavalier', '_blank')}>{Icons.Community} Community</button>
            </nav>
            <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: 'auto', background: '#000', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', position: 'relative', zIndex: 2, letterSpacing: '2px' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* HEADER UTAMA DENGAN LOGO */}
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 20px 20px' }}>
        <img src="/logo-roxor.png" alt="ROXOR CAVALIER SCENT" style={{ width: '100%', maxWidth: '350px', height: 'auto' }} />
      </header>

      {walletAddress ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <button onClick={() => setIsMenuOpen(true)} style={{ background: '#fff', border: '3px solid #000', borderRadius: '10px', padding: '8px 15px', fontSize: '22px', boxShadow: '4px 4px 0px #000', cursor: 'pointer' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 20px', borderRadius: '40px', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
            <img src={avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #000' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '900' }}>{walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><button id="connectButton" onClick={connectWallet}>CONNECT WALLET</button></div>
      )}

      <main>
        {viewVault && (
          <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
            <div className="card" style={{ maxWidth: '600px', width: '95%', border: '4px solid #000' }}>
              <h3 style={{fontWeight: '900'}}>DIGITAL VAULT</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                {userNfts.map(nft => (
                  <div key={nft.id} style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '2px solid #000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '150px', background: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      <img src={nft.image || "/vlt-nft.jpg"} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '10px', fontSize: '0.75rem', textAlign: 'center' }}>
                      <b style={{letterSpacing: '1px'}}>{nft.name}</b><br/><span style={{opacity: 0.7}}>{nft.serial}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="roxor-btn" style={{marginTop: '20px'}} onClick={closeAndReturn}>CLOSE</button>
            </div>
          </div>
        )}

        {viewCouncil && (
          <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
            <div className="card" style={{ maxWidth: '450px', width: '95%', border: '4px solid #000', maxHeight: '85vh', overflowY: 'auto', padding: '40px 25px' }}>
              <h3 style={{fontWeight: '900', letterSpacing: '3px', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '10px'}}>SCENT COUNCIL</h3>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '35px' }}>
                <div>
                  <h2 style={{margin: '0', fontSize: '2.2rem', fontWeight: '950', color: '#000', letterSpacing: '-1px'}}>VALIANT</h2>
                  <p style={{fontSize: '0.85rem', color: '#000', lineHeight: '1.6', fontWeight: '400'}}>A powerful and noble composition. <br/><strong>Vibe:</strong> Sophisticated, Sharp, & Commanding.</p>
                </div>
              </div>
              <button className="roxor-btn" style={{marginTop: '40px', width: '100%'}} onClick={closeAndReturn}>BACK TO HUB</button>
            </div>
          </div>
        )}

        {viewLedger && (
          <div className="roxor-modal-overlay" style={{zIndex: 11000}}>
            <div className="card" style={{ maxWidth: '450px', border: '4px solid #000' }}>
              <h3 style={{fontWeight: '900'}}>MY LEDGER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ledger.length === 0 ? <p>No records.</p> : ledger.map(log => (
                  <div key={log.id} style={{ textAlign: 'left', padding: '12px', border: '2px solid #000', background: '#fff', boxShadow: '3px 3px 0px #000' }}>
                    <b>{log.item}</b><br/><small>{log.serial} - {log.date}</small>
                  </div>
                ))}
              </div>
              <button className="roxor-btn" style={{marginTop: '20px'}} onClick={closeAndReturn}>CLOSE</button>
            </div>
          </div>
        )}

        <section className="main-card-section">
          <div className="card">
            <h3>PRODUCT VERIFIER</h3>
            <input type="text" id="serialInput" placeholder="RXR-VLT-001" className="roxor-input" />
            <button className="roxor-btn" onClick={() => checkProduct(document.getElementById('serialInput').value)}>VERIFY NOW</button>
            {verifStatus && <p style={{marginTop:'15px', fontWeight: 'bold'}}>{verifStatus}</p>}
          </div>
        </section>

        {walletAddress && (
          <section className="main-card-section">
            <div className="card">
              <h3>MINT CERTIFICATE</h3>
              <input type="text" placeholder="Enter Serial" className="roxor-input" value={mintSerial} onChange={(e) => setMintSerial(e.target.value.toUpperCase())} />
              <button className="roxor-btn" onClick={mintSertifikat} disabled={isMinting}>
                {isMinting ? "MINTING..." : "MINT NFT"}
              </button>
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
            <div className="ai-footer"><input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleNdoAI()} placeholder="Ask NdoAI..." /></div>
          </div>
        )}
        <button className="ai-toggle" onClick={() => setShowAI(!showAI)}>
          {showAI ? "✕" : (<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.Sparkles}<span style={{fontWeight: '900'}}>NDO AI</span></div>)}
        </button>
      </div>
    </div>
  );
}

export default App;