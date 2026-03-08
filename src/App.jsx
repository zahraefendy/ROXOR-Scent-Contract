import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './abi.json'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [verifStatus, setVerifStatus] = useState("")
  
  // ROXOR Contract Address
  const contractAddress = "0xe1615A262ceeBEc1Fcc455C983449B7b8122168E"

  async function updateBalance(account) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const hal = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(hal, 18));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance("0");
    }
  }

  // FUNGSI VERIFIKASI ASLI BLOCKCHAIN
  async function checkProduct(serial) {
    if (!serial) return alert("Please enter the serial number!");
    setVerifStatus("🔍 Verifying on Rialo Blockchain...");
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      // Manggil fungsi verifikasi dari Smart Contract lo
      // Pastiin di Remix nama fungsinya 'isAuthentic'. Kalau beda, ganti kata 'isAuthentic' di bawah ini.
      const isValid = await contract.isAuthentic(serial); 
      
      if (isValid) {
        setVerifStatus("✅ AUTHENTIC PRODUCT! (Verified on Blockchain)");
      } else {
        setVerifStatus("❌ INVALID SERIAL NUMBER / COUNTERFEIT!");
      }
    } catch (err) {
      console.error("Verification error:", err);
      // Ini kalo error koneksi, baru lari ke pengecekan manual sederhana
      if (serial.startsWith("RXR-")) {
        setVerifStatus("⚠️ Manual Check Passed (Blockchain Connection Busy)");
      } else {
        setVerifStatus("❌ INVALID SERIAL NUMBER!");
      }
    }
  }

  async function transferRXR(to, amount) {
    if (!to || !amount) return alert("Please fill in recipient address and amount!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
      alert("Transaction sent to blockchain...");
      await tx.wait();
      alert("Transfer Successful!");
      updateBalance(walletAddress);
    } catch (err) {
      alert("Transfer failed. Check your balance or gas fees.");
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        updateBalance(accounts[0]);
      } catch (err) {
        console.error("Connection rejected");
      }
    } else {
      alert("Please install MetaMask!");
    }
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
        } else {
          setWalletAddress("");
          setBalance("0");
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [walletAddress]);

  return (
    <div className="App" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000000', padding: '20px' }}>
      <h1 style={{ letterSpacing: '5px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
        ROXOR CAVALIER SCENT
      </h1>
      
      <button onClick={connectWallet} style={{ backgroundColor: '#000000', color: '#ffffff', padding: '15px 30px', borderRadius: '0px', cursor: 'pointer', border: 'none', fontWeight: 'bold', letterSpacing: '2px' }}>
        {walletAddress ? `CONNECTED: ${walletAddress.substring(0,6)}...` : "CONNECT WALLET"}
      </button>

      {walletAddress && (
        <div style={{ marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Your RXR Balance:</p>
            <h2 style={{ fontSize: '3rem', margin: '10px 0' }}>{balance} RXR</h2>
          </div>

          <div style={{ marginTop: '30px', border: '2px solid #000', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>PRODUCT AUTHENTICITY CHECK</h3>
            <input id="serial" placeholder="Enter Serial Number (Batch ID)" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box', border: '1px solid #000' }} />
            <button onClick={() => checkProduct(document.getElementById('serial').value)} style={{ backgroundColor: '#000', color: '#fff', padding: '12px', cursor: 'pointer', width: '100%', border: 'none', fontWeight: 'bold', marginBottom: '10px' }}>
              VERIFY NOW
            </button>
            {verifStatus && <p style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{verifStatus}</p>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '12px', marginBottom: '10px', color: '#888' }}>SEND RXR TOKENS</h3>
            <input id="target" placeholder="Recipient Address" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box' }} />
            <input id="jumlah" placeholder="Amount" type="number" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box' }} />
            <button onClick={() => transferRXR(document.getElementById('target').value, document.getElementById('jumlah').value)} style={{ backgroundColor: '#ccc', color: '#000', padding: '10px', cursor: 'pointer', width: '100%', border: 'none', fontWeight: 'bold' }}>
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App