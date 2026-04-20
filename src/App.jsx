import { useState, useEffect, Suspense } from 'react'
import { ethers } from 'ethers'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './App.css'
import abiNFT from './abiNFT.json'
import Valiant3D from './Valiant3D'

// Icons (Tetap Sama)
const Icons = {
  Sanctuary: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Ledger: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>),
  Vault: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v1"/><path d="M12 14v1"/><path d="M9 12h1"/><path d="M14 12h1"/></svg>),
  Council: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13 4 2 3-6-4-2-3 6Z"/><path d="m4 9 3 6 4-2-3-6-4 2Z"/><path d="M12 2v20"/><path d="M2 22h20"/></svg>),
  SharkTank: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  Community: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  Sparkles: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>),
  Bell: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>)
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
  const [viewNotif, setViewNotif] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [userNfts, setUserNfts] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Welcome to ROXOR, Sir.");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nftAddress = "0x36e606395eAf55cECf98200613CA90Ce3919711c"       

  useEffect(() => {
    const savedLedger = localStorage.getItem('roxor_ledger');
    if (savedLedger) setLedger(JSON.parse(savedLedger));
    const savedNfts = localStorage.getItem('roxor_nfts');
    if (savedNfts) setUserNfts(JSON.parse(savedNfts));
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setAvatar(`https://effigy.im/a/${accounts[0]}.svg`);
      } catch (err) { console.error("Cancelled"); }
    } else { alert("Please install MetaMask!"); }
  }

  function disconnectWallet() {
    setWalletAddress("");
    setAvatar("");
    setShowDisconnect(false);
    setIsMenuOpen(false);
  }

  function checkProduct(serial) {
    if (!serial) return;
    setVerifStatus("🔍 Syncing with Rialo..."); 
    setScentDetail(null);
    const code = serial.toUpperCase();
    setTimeout(() => {
        if (code.includes("RXR-VLT")) {
            setScentDetail({
              name: "VALIANT",
              type: "Extrait de Parfum",
              vibes: "Fresh, Spicy, & Woody",
              batch: "BATCH: RXR-VLT-2026",
              description: "A powerful and noble composition. Valiant opens with the radiant freshness of Calabrian Bergamot and Pepper, followed by a woody trail that commands respect."
            });
            setVerifStatus("✅ AUTHENTIC PRODUCT VERIFIED"); 
            const newEntry = { id: Date.now(), date: new Date().toLocaleString(), item: "Valiant", serial: code, status: "AUTHENTIC" };
            const updatedLedger = [newEntry, ...ledger];
            setLedger(updatedLedger);
            localStorage.setItem('roxor_ledger', JSON.stringify(updatedLedger));
        } else {
            setVerifStatus("❌ INVALID CODE!");
        }
    }, 1200);
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
      
      const newNft = { id: Date.now(), name: "VALIANT", serial: mintSerial, image: "/vlt-nft.jpg" };
      const updatedNfts = [newNft, ...userNfts];
      setUserNfts(updatedNfts);
      localStorage.setItem('roxor_nfts', JSON.stringify(updatedNfts));
      
      setShowSuccess(true);
      setMintSerial("");
    } catch (err) { console.error(err); alert("Transaction failed."); } finally { setIsMinting(false); }
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
    setViewLedger(false); setViewVault(false); setViewCouncil(false); setViewNotif(false); setIsMenuOpen(false);
  };

  return (
    <>
      {!walletAddress ? (
        <div className="roxor-landing-container fade-in">
          <img src="/logo-roxor.png" alt="ROXOR" className="landing-logo" />
          <p className="landing-text">Luxury Blockchain Fragrance</p>
          <button className="connect-btn-landing" onClick={connectWallet}>
            CONNECT SECURE WALLET
          </button>
        </div>
      ) : (
        <div className="roxor-app-connected fade-in">
          
          <header className="roxor-luxury-header">
            <div className="header-inner">
              <div className="header-left">
                <img src="/logo-roxor.png" alt="ROXOR" className="header-logo-img" />
              </div>
              
              <div className="header-right">
                <div className="lang-selector">ENGLISH ▾</div>
                
                <button className="header-icon-btn" onClick={() => setViewNotif(true)}>
                  {Icons.Bell}
                  <span className="notif-badge"></span>
                </button>
                
                <div className="header-profile-pill" onClick={() => setShowDisconnect(!showDisconnect)}>
                  <img src={avatar} alt="Avatar" />
                  <span>{walletAddress.substring(0, 6)}...</span>
                  {showDisconnect && (
                    <div className="disconnect-popover" onClick={disconnectWallet}>DISCONNECT SESSION</div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="roxor-menu-float" onClick={() => setIsMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>

          <main className="roxor-main-stage">
            <div className="roxor-dashboard">
              <div className="roxor-grid">
                <div className="roxor-glass-card">
                  <h3>PRODUCT VERIFIER</h3>
                  <input 
                    type="text" 
                    id="serialInput" 
                    placeholder="ENTER SERIAL NUMBER" 
                    className="luxury-input" 
                  />
                  <button 
                    className="luxury-btn" 
                    onClick={() => checkProduct(document.getElementById('serialInput').value)}
                  >
                    VERIFY AUTHENTICITY
                  </button>
                  {verifStatus && <p className="status-msg">{verifStatus}</p>}
                  {scentDetail && (
                    <div className="scent-info-display fade-in">
                      <p className="scent-title">{scentDetail.name}</p>
                      <p className="scent-batch">{scentDetail.batch}</p>
                      <p className="scent-desc">{scentDetail.description}</p>
                    </div>
                  )}
                </div>

                <div className="roxor-glass-card">
                  <h3>DIGITAL CERTIFICATE</h3>
                  <input 
                    type="text" 
                    placeholder="RXR-VLT-XXX" 
                    className="luxury-input" 
                    value={mintSerial} 
                    onChange={(e) => setMintSerial(e.target.value.toUpperCase())} 
                  />
                  <button 
                    className="luxury-btn" 
                    onClick={mintSertifikat} 
                    disabled={isMinting}
                  >
                    {isMinting ? "PROCESSING..." : "MINT NFT CERTIFICATE"}
                  </button>
                </div>
              </div>

              <div className="roxor-3d-visual">
                 <Suspense fallback={null}><Valiant3D /></Suspense>
              </div>
            </div>
          </main>

          {/* SIDEBAR */}
          {isMenuOpen && (
            <div className="roxor-sidebar-overlay" onClick={() => setIsMenuOpen(false)}>
              <div className="roxor-sidebar" onClick={(e) => e.stopPropagation()}>
                <nav style={{marginTop: '20px'}}>
                  <button className="menu-item-luxury" onClick={() => {setIsMenuOpen(false); setViewLedger(false); setViewVault(false); setViewCouncil(false);}}>
                    {Icons.Sanctuary} Sanctuary
                  </button>
                  <button className="menu-item-luxury" onClick={() => {setViewLedger(true); setIsMenuOpen(false);}}>
                    {Icons.Ledger} My Ledger
                  </button>
                  <button className="menu-item-luxury" onClick={() => { setViewVault(true); setIsMenuOpen(false); }}>
                    {Icons.Vault} Digital Vault
                  </button>
                  <button className="menu-item-luxury" onClick={() => {setViewCouncil(true); setIsMenuOpen(false);}}>
                    {Icons.Council} Scent Council
                  </button>
                  <button className="menu-item-luxury" onClick={() => window.open('https://rialobs.vercel.app/', '_blank')}>
                    {Icons.SharkTank} Shark Tank
                  </button>
                </nav>
                <button onClick={() => setIsMenuOpen(false)} className="sidebar-close-btn">✕ CLOSE SESSION</button>
              </div>
            </div>
          )}

          {/* MODAL LEDGER */}
          {viewLedger && (
            <div className="roxor-modal-overlay" onClick={closeAndReturn}>
              <div className="roxor-glass-card modal-center" onClick={(e) => e.stopPropagation()}>
                <h3>MY LEDGER</h3>
                <div className="ledger-container">
                  {ledger.length > 0 ? ledger.map(item => (
                    <div key={item.id} className="ledger-entry">
                      <span>{item.date}</span>
                      <span className="ledger-serial">{item.serial}</span>
                      <span className="ledger-status">AUTHENTIC</span>
                    </div>
                  )) : <p className="empty-msg">No verification history found.</p>}
                </div>
                <button className="luxury-btn" onClick={closeAndReturn}>CLOSE</button>
              </div>
            </div>
          )}

          {/* MODAL VAULT */}
          {viewVault && (
            <div className="roxor-modal-overlay" onClick={closeAndReturn}>
              <div className="roxor-glass-card modal-center" onClick={(e) => e.stopPropagation()}>
                <h3>DIGITAL VAULT</h3>
                <div className="vault-grid">
                  {userNfts.length > 0 ? userNfts.map(nft => (
                    <div key={nft.id} className="vault-item-box">
                      <img src={nft.image} alt={nft.name} />
                      <p className="vault-serial">{nft.serial}</p>
                    </div>
                  )) : <p className="empty-msg">Your vault is currently empty.</p>}
                </div>
                <button className="luxury-btn" onClick={closeAndReturn}>CLOSE</button>
              </div>
            </div>
          )}

          {/* MODAL COUNCIL */}
          {viewCouncil && (
            <div className="roxor-modal-overlay" onClick={closeAndReturn}>
              <div className="roxor-glass-card modal-center" onClick={(e) => e.stopPropagation()}>
                <h3>SCENT COUNCIL</h3>
                <div className="council-list">
                  <div className="council-item">
                    <h4>VALIANT</h4>
                    <p>A noble blend of Calabrian Bergamot and Pepper. Strong, woodsy, and timeless.</p>
                  </div>
                  <div className="council-item">
                    <h4>OPIUM</h4>
                    <p>Dark Vanilla intertwined with Black Coffee. Mysterious, addictive, and deep.</p>
                  </div>
                  <div className="council-item">
                    <h4>VIGOR</h4>
                    <p>Fresh Sea Salt meets earthy Sage. Energetic, bold, and adventurous.</p>
                  </div>
                </div>
                <button className="luxury-btn" onClick={closeAndReturn}>CLOSE</button>
              </div>
            </div>
          )}

          {/* MODAL NOTIF */}
          {viewNotif && (
            <div className="roxor-modal-overlay" onClick={closeAndReturn}>
              <div className="roxor-glass-card modal-center" onClick={(e) => e.stopPropagation()}>
                <h3>NOTIFICATIONS</h3>
                <div className="notif-content">
                  <p className="empty-msg">Roxor news and updates will appear here. Stay tuned for the latest fragrance drops.</p>
                </div>
                <button className="luxury-btn" onClick={closeAndReturn}>CLOSE</button>
              </div>
            </div>
          )}

          {/* SUCCESS MODAL */}
          {showSuccess && (
            <div className="roxor-modal-overlay">
              <div className="roxor-glass-card modal-center">
                <h2>MINT SUCCESSFUL!</h2>
                <p className="success-subtext">You have successfully minted your NFT Certificate.</p>
                <img src={mintedImage} alt="NFT" className="success-nft-preview" />
                <button className="luxury-btn" onClick={() => setShowSuccess(false)}>DONE</button>
              </div>
            </div>
          )}

          {/* NDOAI FLOATING */}
          <div className="ndoai-fixed-wrap">
            {showAI && (
              <div className="ai-chat-window">
                <div className="ai-header">NdoAI Assistant</div>
                <div className="ai-content"><p><strong>NdoAI:</strong> {isAiLoading ? "..." : aiResponse}</p></div>
                <div className="ai-footer">
                  <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleNdoAI()} placeholder="Ask NdoAI..." />
                </div>
              </div>
            )}
            <button className="ai-toggle-fab" onClick={() => setShowAI(!showAI)}>
              {showAI ? "✕" : <>{Icons.Sparkles} <span>NDO AI</span></>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;