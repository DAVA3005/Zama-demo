import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function decimals() view returns (uint8)'
];

const AMM_ABI = [
  'function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256)',
  'function swapExactInput(address tokenIn, uint256 amountIn) external returns (uint256)'
];

export default function App(){
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const [tokenAAddr, setTokenAAddr] = useState('');
  const [tokenBAddr, setTokenBAddr] = useState('');
  const [ammAddr, setAmmAddr] = useState('');

  const [amountIn, setAmountIn] = useState('');
  const [status, setStatus] = useState('idle');
  const [balanceA, setBalanceA] = useState('0');
  const [balanceB, setBalanceB] = useState('0');

  useEffect(()=>{
    if(window.ethereum) setProvider(new ethers.BrowserProvider(window.ethereum));
  },[]);

  async function connect(){
    if(!provider){ setStatus('No wallet'); return; }
    await provider.send('eth_requestAccounts', []);
    const s = await provider.getSigner();
    setSigner(s);
    const a = await s.getAddress();
    setAccount(a);
    setStatus('Wallet connected: ' + a);
  }

  async function refreshBalances(){
    if(!signer || !tokenAAddr || !tokenBAddr || !account) return;
    try{
      const a = new ethers.Contract(tokenAAddr, ERC20_ABI, signer);
      const b = new ethers.Contract(tokenBAddr, ERC20_ABI, signer);
      const decA = await a.decimals();
      const decB = await b.decimals();
      const balA = await a.balanceOf(account);
      const balB = await b.balanceOf(account);
      setBalanceA(ethers.formatUnits(balA, decA));
      setBalanceB(ethers.formatUnits(balB, decB));
    }catch(e){ console.error(e); }
  }

  async function ensureApprove(tokenAddr, spender, amount){
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const dec = await token.decimals();
    const amt = ethers.parseUnits(amount, dec);
    const allowance = await token.allowance(account, spender);
    if(allowance < amt){
      setStatus('Approving...');
      const tx = await token.approve(spender, amt);
      await tx.wait();
      setStatus('Approved');
    }
  }

  async function doSwap(){
    if(!signer || !ammAddr || !tokenAAddr) { setStatus('Set addresses and connect wallet'); return; }
    try{
      setStatus('Preparing swap');
      const amm = new ethers.Contract(ammAddr, AMM_ABI, signer);
      await ensureApprove(tokenAAddr, ammAddr, amountIn);
      const token = new ethers.Contract(tokenAAddr, ERC20_ABI, signer);
      const dec = await token.decimals();
      const amt = ethers.parseUnits(amountIn, dec);
      setStatus('Sending swap tx...');
      const tx = await amm.swapExactInput(tokenAAddr, amt);
      await tx.wait();
      setStatus('Swap executed');
      await refreshBalances();
    }catch(e){ setStatus('Swap error: ' + (e.message || e)); }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Swap dApp (SimpleAMM)</h1>
      <div className="mb-3">
        <button onClick={connect} className="p-2 border mr-2">Connect Wallet</button>
        <button onClick={refreshBalances} className="p-2 border">Refresh Balances</button>
      </div>

      <div className="mb-3">
        <label>Token A address:</label>
        <input value={tokenAAddr} onChange={(e)=>setTokenAAddr(e.target.value)} className="ml-2 p-1 border" />
      </div>
      <div className="mb-3">
        <label>Token B address:</label>
        <input value={tokenBAddr} onChange={(e)=>setTokenBAddr(e.target.value)} className="ml-2 p-1 border" />
      </div>
      <div className="mb-3">
        <label>AMM contract address:</label>
        <input value={ammAddr} onChange={(e)=>setAmmAddr(e.target.value)} className="ml-2 p-1 border" />
      </div>

      <div className="mb-3">
        <label>Amount in (Token A):</label>
        <input value={amountIn} onChange={(e)=>setAmountIn(e.target.value)} className="ml-2 p-1 border" />
        <button onClick={doSwap} className="ml-2 p-2 border">Swap</button>
      </div>

      <div className="mb-3">
        <div>Balance A: {balanceA}</div>
        <div>Balance B: {balanceB}</div>
      </div>

      <div className="mt-4 text-sm">Status: {status}</div>
    </div>
  );
}
