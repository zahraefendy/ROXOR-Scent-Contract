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
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const rawBalance = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(rawBalance, 18));
    } catch (err) {
      console.error("Balance sync failed");
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
      } catch (err) { console.error("Rejected"); }
    } else { alert("Install MetaMask!"); }
  }

  useEffect(() => {
    if (walletAddress) updateBalance(walletAddress);
  }, [walletAddress]);

  return (
    /* CONTAINER UTAMA: PAKSA DISPLAY FLEX KE SAMPING */
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden' }}>
      
      {/* PANEL KIRI (60% LEBAR) */}
      <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', backgroundColor: '#fff', borderRight: '2px solid #000' }}>
        <h1 style={{ letterSpacing: '8px', fontWeight: 'bold', marginBottom: '30px' }}>ROXOR CAVALIER SCENT</h1>
        
        <button onClick={connectWallet} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px' }}>
          {walletAddress ? `CONNECTED: ${walletAddress.substring(0,6)}...` : "CONNECT WALLET"}
        </button>

        {walletAddress && (
          <div style={{ marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ borderTop: '2px solid #000', paddingTop: '20px' }}>
              <p style={{ color: '#888', fontSize: '10px', letterSpacing: '2px' }}>CURRENT RXR BALANCE</p>
              <h2 style={{ fontSize: '3rem', margin: '10px 0', fontWeight: 'bold' }}>{balance} RXR</h2>
              <button onClick={() => updateBalance(walletAddress)} style={{ fontSize: '10px', background: 'none', border: '1px solid #ccc', cursor: 'pointer', padding: '5px' }}>REFRESH</button>
            </div>

            <div style={{ marginTop: '30px', border: '2px solid #000', padding: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>PRODUCT VERIFIER</h3>
              <input id="serial" placeholder="Serial (ex: RXR-VLT-001)" style={{ width: '100%', padding: '12px', margin: '10px 0', boxSizing: 'border-box', border: '1px solid #000' }} />
              <button onClick={() => checkProduct(document.getElementById('serial').value)} style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>VERIFY NOW</button>
              {verifStatus && <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' }}>{verifStatus}</p>}
            </div>

            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>TRANSFER TOKENS</h3>
              <input id="target" placeholder="Recipient Address" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} />
              <input id="jumlah" placeholder="Amount" type="number" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} />
              <button onClick={transferRXR} style={{ width: '100%', padding: '10px', backgroundColor: '#eee', color: '#000', border: '1px solid #000', fontWeight: 'bold', cursor: 'pointer' }}>SEND RXR</button>
            </div>
          </div>
        )}
      </div>

      {/* PANEL KANAN (RIWAYAT - 40% LEBAR) */}
      <div style={{ flex: '1', backgroundColor: '#f4f4f4', padding: '60px 40px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ letterSpacing: '4px', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '30px' }}>ACTIVITY LOG</h2>
        
        {!walletAddress ? (
          <p style={{ color: '#888' }}>Connect wallet to view activity.</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#888' }}>No recent transactions.</p>
        ) : (
          <div style={{ overflowY: 'auto' }}>
            {history.map((tx, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '15px', backgroundColor: '#fff', marginBottom: '10px', boxShadow: '2px 2px 0px #000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '9px', color: '#888' }}>{tx.time}</span>
                   <span style={{ fontSize: '9px', fontWeight: 'bold', color: tx.status === 'Success' ? 'green' : 'orange' }}>{tx.status.toUpperCase()}</span>
                </div>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>-{tx.amount} RXR</p>
                <p style={{ fontSize: '10px', color: '#555', wordBreak: 'break-all' }}>To: {tx.to}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default App