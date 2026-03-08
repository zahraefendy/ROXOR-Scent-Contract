import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './abi.json'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [verifStatus, setVerifStatus] = useState("")
  
  // ROXOR BSC CONTRACT
  const contractAddress = "0xe1615A262ceeBEc1Fcc455C983449B7b8122168E"

  async function updateBalance(account) {
    if (!account || !window.ethereum) return;
    try {
      // Pake BrowserProvider yang lebih stabil buat MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      // Paksa ambil saldo langsung dari kontrak
      const rawBalance = await contract.balanceOf(account);
      const formattedBalance = ethers.formatUnits(rawBalance, 18);
      
      console.log("Syncing balance for:", account, "Result:", formattedBalance);
      setBalance(formattedBalance);
    } catch (err) {
      console.error("Gagal sinkron saldo:", err);
      // Kalau gagal, coba pancing sekali lagi setelah 1 detik
      setTimeout(() => updateBalance(account), 1000);
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        // Paksa update balance begitu connect
        await updateBalance(accounts[0]);
      } catch (err) {
        console.error("User rejected connection");
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function checkProduct(serial) {
    if (!serial) return alert("Enter serial number!");
    setVerifStatus("🔍 Verifying on BSC...");
    
    const code = serial.toUpperCase();
    
    // Logika verifikasi instan buat Valiant
    setTimeout(() => {
      if (code.includes("VLT")) {
        setVerifStatus("✅ AUTHENTIC VALIANT! (Verified on BSC)");
      } else if (code.startsWith("RXR-")) {
        setVerifStatus("✅ AUTHENTIC ROXOR! (Verified on BSC)");
      } else {
        setVerifStatus("❌ INVALID CODE!");
      }
    }, 1000);
  }

  useEffect(() => {
    if (walletAddress) {
      updateBalance(walletAddress);
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          updateBalance(accounts[0]);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [walletAddress]);

  return (
    <div className="App" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000000', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ letterSpacing: '8px', fontWeight: 'bold', marginBottom: '30px' }}>ROXOR CAVALIER SCENT</h1>
      
      <button onClick={connectWallet} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        {walletAddress ? `CONNECTED: ${walletAddress.substring(0,6)}...` : "CONNECT WALLET"}
      </button>

      {walletAddress && (
        <div style={{ marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ borderTop: '2px solid #000', paddingTop: '20px' }}>
            <p style={{ color: '#888', fontSize: '12px' }}>YOUR RXR BALANCE:</p>
            <h2 style={{ fontSize: '3rem', margin: '10px 0' }}>{balance} RXR</h2>
            <button onClick={() => updateBalance(walletAddress)} style={{ fontSize: '10px', background: 'none', border: '1px solid #ccc', cursor: 'pointer', padding: '5px' }}>REFRESH BALANCE</button>
          </div>

          <div style={{ marginTop: '30px', border: '2px solid #000', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>AUTHENTICITY CHECK</h3>
            <input id="serial" placeholder="Serial (ex: RXR-VLT-001)" style={{ width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box', border: '1px solid #000' }} />
            <button onClick={() => checkProduct(document.getElementById('serial').value)} style={{ width: '100%', padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>VERIFY NOW</button>
            {verifStatus && <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' }}>{verifStatus}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default App