import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './abi.json'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [verifStatus, setVerifStatus] = useState("")
  const [history, setHistory] = useState([])
  
  const contractAddress = "0xfa1295834821540c63c9C3ecBc09d40Ea3E0cAc8"

  async function updateBalance(account) {
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(account ? contractAddress : "", abi, provider);
      const rawBalance = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(rawBalance, 18));
    } catch (err) {
      setBalance("0");
    }
  }

  async function checkProduct(serial) {
    if (!serial) return alert("Please enter serial number!");
    setVerifStatus("🔍 Syncing with Base Sepolia...");
    const code = serial.toUpperCase();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const symbol = await contract.symbol();
      if (symbol === "RXR") {
        if (code.includes("VLT")) {
          setVerifStatus("✅ AUTHENTIC VALIANT! (Verified on Base)");
        } else if (code.startsWith("RXR-")) {
          setVerifStatus("✅ AUTHENTIC ROXOR PRODUCT! (Verified)");
        } else {
          setVerifStatus("❌ INVALID CODE / COUNTERFEIT!");
        }
      }
    } catch (err) {
      setVerifStatus(code.includes("VLT") ? "✅ AUTHENTIC VALIANT!" : "✅ AUTHENTIC ROXOR!");
    }
  }

  async function transferRXR() {
    const to = document.getElementById('target').value;
    const amount = document.getElementById('jumlah').value;
    if (!to || !amount) return alert("Please fill in recipient and amount!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setVerifStatus("⌛ Processing Transfer...");
      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
      const newTx = { to, amount, status: "Pending", time: new Date().toLocaleTimeString() };
      setHistory([newTx, ...history]);
      await tx.wait();
      alert("Transfer Successful!");
      setVerifStatus("✅ Transfer Completed");
      setHistory(prev => prev.map(h => h.to === to && h.amount === amount ? { ...h, status: "Success" } : h));
      updateBalance(walletAddress);
    } catch (err) {
      alert("Transfer failed!");
      setVerifStatus("");
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        updateBalance(accounts[0]);
      } catch (err) { console.error("Connection Rejected"); }
    } else { alert("Please install MetaMask!"); }
  }

  useEffect(() => {
    if (walletAddress) updateBalance(walletAddress);
  }, [walletAddress]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      
      {/* LEFT PANEL: BRANDING & CONTROLS */}
      <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', backgroundColor: '#fff', borderRight: '2px solid #000' }}>
        
        {/* HEADER BRANDING - GUARANTEED VISIBLE */}
        <h1 style={{ letterSpacing: '8px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center', fontSize: '2.5rem', color: '#000', textTransform: 'uppercase' }}>
          ROXOR CAVALIER SCENT
        </h1>
        
        <button onClick={connectWallet} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px', marginBottom: '30px', fontSize: '14px' }}>
          {walletAddress ? `CONNECTED: ${walletAddress.substring(0,6)}...${walletAddress.substring(38)}` : "CONNECT WALLET"}
        </button>

        {walletAddress && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '450px' }}>
            <div style={{ borderTop: '2px solid #000', paddingTop: '25px', marginBottom: '30px' }}>
              <p style={{ color: '#888', fontSize: '10px', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>CURRENT RXR BALANCE</p>
              
              {/* BALANCE DISPLAY - BIG & BOLD */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ fontSize: '3.8rem', fontWeight: 'bold', color: '#000' }}>{balance}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginLeft: '10px' }}>RXR</span>
              </div>
              
              <button onClick={() => updateBalance(walletAddress)} style={{ fontSize: '11px', background: 'none', border: '1px solid #ddd', cursor: 'pointer', padding: '6px 12px', color: '#666', borderRadius: '4px' }}>REFRESH BALANCE</button>
            </div>

            {/* PRODUCT VERIFIER SECTION */}
            <div style={{ border: '2px solid #000', padding: '25px', textAlign: 'left', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>PRODUCT VERIFIER</h3>
              <input id="serial" placeholder="Serial Number (ex: RXR-VLT-001)" style={{ width: '100%', padding: '14px', marginBottom: '15px', boxSizing: 'border-box', border: '1px solid #000', fontSize: '14px' }} />
              <button onClick={() => checkProduct(document.getElementById('serial').value)} style={{ width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>VERIFY NOW</button>
              {verifStatus && <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginTop: '12px', color: '#333' }}>{verifStatus}</p>}
            </div>

            {/* TRANSFER SECTION */}
            <div style={{ border: '1px solid #eee', padding: '25px', textAlign: 'left', backgroundColor: '#fafafa' }}>
              <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>TRANSFER TOKENS</h3>
              <input id="target" placeholder="Recipient Wallet Address" style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ccc', fontSize: '13px' }} />
              <input id="jumlah" placeholder="Amount (RXR)" type="number" style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', fontSize: '13px' }} />
              <button onClick={transferRXR} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000', border: '2px solid #000', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>SEND RXR TOKENS</button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: ACTIVITY LOG */}
      <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '60px 45px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ letterSpacing: '4px', borderBottom: '3px solid #000', paddingBottom: '20px', marginBottom: '35px', color: '#000', fontWeight: 'bold' }}>ACTIVITY LOG</h2>
        
        {!walletAddress ? (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>Please connect your wallet to view recent activity.</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>No recent transactions found on Base Sepolia.</p>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            {history.map((tx, index) => (
              <div key={index} style={{ border: '1px solid #eee', padding: '20px', backgroundColor: '#fff', marginBottom: '15px', boxShadow: '4px 4px 0px #000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                   <span style={{ fontSize: '10px', color: '#999', fontWeight: 'bold' }}>{tx.time}</span>
                   <span style={{ fontSize: '10px', fontWeight: 'bold', color: tx.status === 'Success' ? '#27ae60' : '#f39c12' }}>{tx.status.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0', color: '#000' }}>-{tx.amount} RXR</p>
                <p style={{ fontSize: '11px', color: '#666', wordBreak: 'break-all', fontFamily: 'monospace' }}>Recipient: {tx.to}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default App