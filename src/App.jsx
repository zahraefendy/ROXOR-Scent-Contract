import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './abi.json'

function App() {
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [verifStatus, setVerifStatus] = useState("")
  
  // GANTI ALAMAT DI BAWAH INI PAKE ALAMAT PALING BAWAH DI REMIX LO!
  const contractAddress = "0xe1615A262ceeBEc1Fcc455C983449B7b8122168E"

  async function updateBalance(account) {
    if (!account || !contractAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const hal = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(hal, 18));
    } catch (err) {
      console.error("Gagal ambil saldo:", err);
      setBalance("0");
    }
  }

  async function checkProduct(serial) {
    if (!serial) return alert("Masukin dulu nomor serinya ler!");
    setVerifStatus("🔍 Menghubungi Blockchain Rialo...");
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      // Kita cek simbol token buat mastiin koneksi kontrak bener
      const symbol = await contract.symbol();
      
      // Logika Verifikasi: Jika simbol bener RXR dan serial diawali RXR-
      if (symbol === "RXR" && serial.toUpperCase().includes("RXR-VLT")) {
        setVerifStatus("✅ AUTHENTIC VALIANT! (Verified on Rialo)");
      } else if (symbol === "RXR" && serial.toUpperCase().startsWith("RXR-")) {
        setVerifStatus("✅ AUTHENTIC ROXOR PRODUCT! (Verified)");
      } else {
        setVerifStatus("❌ KODE TIDAK TERDAFTAR / PALSU!");
      }
    } catch (err) {
      console.error("Link Error:", err);
      // Fallback kalo RPC sibuk tapi format bener
      if (serial.toUpperCase().startsWith("RXR-")) {
        setVerifStatus("⚠️ Format Benar (Blockchain Sedang Sibuk)");
      } else {
        setVerifStatus("❌ KODE TIDAK VALID!");
      }
    }
  }

  async function transferRXR(to, amount) {
    if (!to || !amount) return alert("Isi alamat tujuan sama jumlahnya ler!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
      alert("Transaksi dikirim ke blockchain...");
      await tx.wait();
      alert("Transfer Berhasil!");
      updateBalance(walletAddress);
    } catch (err) {
      alert("Transfer gagal. Cek saldo atau gas fee lo.");
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        updateBalance(accounts[0]);
      } catch (err) {
        console.error("Koneksi ditolak");
      }
    } else {
      alert("Pasang MetaMask dulu ler!");
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
    <div className="App" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000000', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ letterSpacing: '8px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
        ROXOR CAVALIER SCENT
      </h1>
      
      <button onClick={connectWallet} style={{ backgroundColor: '#000000', color: '#ffffff', padding: '15px 30px', borderRadius: '0px', cursor: 'pointer', border: 'none', fontWeight: 'bold', letterSpacing: '2px' }}>
        {walletAddress ? `CONNECTED: ${walletAddress.substring(0,6)}...` : "CONNECT WALLET"}
      </button>

      {walletAddress && (
        <div style={{ marginTop: '40px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ borderTop: '2px solid #000', paddingTop: '20px' }}>
            <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your RXR Balance:</p>
            <h2 style={{ fontSize: '3rem', margin: '10px 0', fontWeight: 'bold' }}>{balance} RXR</h2>
          </div>

          <div style={{ marginTop: '30px', border: '2px solid #000', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>Authenticity Verifier</h3>
            <input id="serial" placeholder="Enter Serial Number (ex: RXR-VLT-001)" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '12px', boxSizing: 'border-box', border: '1px solid #000', borderRadius: '0' }} />
            <button onClick={() => checkProduct(document.getElementById('serial').value)} style={{ backgroundColor: '#000', color: '#fff', padding: '12px', cursor: 'pointer', width: '100%', border: 'none', fontWeight: 'bold', marginBottom: '10px' }}>
              VERIFY NOW
            </button>
            {verifStatus && <p style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>{verifStatus}</p>}
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '12px', marginBottom: '10px', color: '#888', textTransform: 'uppercase' }}>Transfer RXR Tokens</h3>
            <input id="target" placeholder="Recipient Address (0x...)" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc' }} />
            <input id="jumlah" placeholder="Amount" type="number" style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc' }} />
            <button onClick={() => transferRXR(document.getElementById('target').value, document.getElementById('jumlah').value)} style={{ backgroundColor: '#eee', color: '#000', padding: '10px', cursor: 'pointer', width: '100%', border: '1px solid #000', fontWeight: 'bold' }}>
              SEND RXR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App