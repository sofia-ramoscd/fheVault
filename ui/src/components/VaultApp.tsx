import { useMemo, useState } from 'react';
import { Contract, ethers } from 'ethers';
import { formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/VaultApp.css';
import { Header } from './Header';

const ZERO_HASH = ethers.ZeroHash;
const MAX_UINT64 = 18446744073709551615n;
const SECONDS_PER_DAY = 86400n;

type LockInfo = {
  active: boolean;
  unlockTime: bigint;
  encryptedAmount: string;
  plainAmount: bigint;
};

function formatEth(value: bigint): string {
  const formatted = formatEther(value);
  const [whole, decimals = ''] = formatted.split('.');
  const trimmedDecimals = decimals.slice(0, 6).replace(/0+$/, '');
  return trimmedDecimals ? `${whole}.${trimmedDecimals}` : whole;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }

  return 'Unexpected error occurred';
}

export function VaultApp() {
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();

  const [stakeAmount, setStakeAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [lockAmount, setLockAmount] = useState('');
  const [lockDurationDays, setLockDurationDays] = useState('7');
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [decryptingBalance, setDecryptingBalance] = useState(false);
  const [decryptingLock, setDecryptingLock] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptedLockAmount, setDecryptedLockAmount] = useState<string | null>(null);

  const availableBalanceQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAvailableBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
    },
  });

  const lockInfoQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLockInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
    },
  });

  const canReleaseQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'canRelease',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
    },
  });

  const encryptedBalanceQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchOnWindowFocus: false,
    },
  });

  const availableBalance = (availableBalanceQuery.data as bigint | undefined) ?? 0n;

  const lockInfo = useMemo<LockInfo>(() => {
    const tuple = lockInfoQuery.data as readonly [boolean, bigint, string, bigint] | undefined;
    if (!tuple) {
      return { active: false, unlockTime: 0n, encryptedAmount: ZERO_HASH, plainAmount: 0n };
    }

    return {
      active: tuple[0],
      unlockTime: tuple[1],
      encryptedAmount: tuple[2],
      plainAmount: tuple[3],
    };
  }, [lockInfoQuery.data]);

  const canRelease = (canReleaseQuery.data as boolean | undefined) ?? false;
  const unlockDate = lockInfo.active ? new Date(Number(lockInfo.unlockTime) * 1000) : null;

  const refreshAll = async () => {
    await Promise.all([
      availableBalanceQuery.refetch(),
      lockInfoQuery.refetch(),
      canReleaseQuery.refetch(),
      encryptedBalanceQuery.refetch(),
    ]);
  };

  const ensureSigner = async () => {
    const signer = await signerPromise;
    if (!signer) {
      throw new Error('Connect your wallet to continue');
    }
    return signer;
  };

  const parseInputAmount = (value: string): bigint => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('Enter an amount in ETH');
    }

    const wei = ethers.parseEther(trimmed);
    if (wei <= 0n) {
      throw new Error('Amount must be positive');
    }

    if (wei > MAX_UINT64) {
      throw new Error('Amount exceeds uint64 range supported by the contract');
    }

    return wei;
  };

  const handleStake = async () => {
    try {
      const wei = parseInputAmount(stakeAmount);
      setPendingAction('stake');
      setStatusMessage('Submitting stake transaction...');
      const signer = await ensureSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.stake({ value: wei });
      await tx.wait();
      setStatusMessage('Stake confirmed');
      setStakeAmount('');
      setDecryptedBalance(null);
      await refreshAll();
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRedeem = async () => {
    try {
      const wei = parseInputAmount(redeemAmount);
      if (wei > availableBalance) {
        throw new Error('Amount exceeds available balance');
      }

      setPendingAction('redeem');
      setStatusMessage('Submitting redeem transaction...');
      const signer = await ensureSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.redeem(wei);
      await tx.wait();
      setStatusMessage('Redeem confirmed');
      setRedeemAmount('');
      setDecryptedBalance(null);
      await refreshAll();
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleLock = async () => {
    try {
      if (!instance) {
        throw new Error('Encryption service not ready yet');
      }
      if (!address) {
        throw new Error('Connect your wallet to lock fETH');
      }

      const wei = parseInputAmount(lockAmount);
      if (wei > availableBalance) {
        throw new Error('Amount exceeds available balance');
      }

      const days = Number(lockDurationDays);
      if (!Number.isFinite(days) || days <= 0) {
        throw new Error('Select a valid lock duration');
      }

      const durationSeconds = BigInt(days) * SECONDS_PER_DAY;

      setPendingAction('lock');
      setStatusMessage('Encrypting amount and submitting lock transaction...');

      const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buffer.add64(wei);
      const encryptedInput = await buffer.encrypt();

      const signer = await ensureSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.lock(wei, durationSeconds, encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();

      setStatusMessage('Lock confirmed');
      setLockAmount('');
      setDecryptedLockAmount(null);
      await refreshAll();
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRelease = async () => {
    try {
      if (!lockInfo.active) {
        throw new Error('No active lock to release');
      }
      if (!canRelease) {
        throw new Error('Lock is not matured yet');
      }

      setPendingAction('release');
      setStatusMessage('Submitting release transaction...');
      const signer = await ensureSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.releaseLock();
      await tx.wait();
      setStatusMessage('Lock released');
      setDecryptedLockAmount(null);
      await refreshAll();
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const requestDecryption = async (handles: string[]) => {
    if (!instance) {
      throw new Error('Encryption service not ready yet');
    }
    if (!address) {
      throw new Error('Connect your wallet to decrypt data');
    }

    const keypair = instance.generateKeypair();
    const startTimestamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '7';
    const contractAddresses = [CONTRACT_ADDRESS];

    const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);
    const signer = await ensureSigner();
    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message,
    );

    const handleContractPairs = handles.map((handle) => ({ handle, contractAddress: CONTRACT_ADDRESS }));

    return instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      address,
      startTimestamp,
      durationDays,
    );
  };

  const handleDecryptBalance = async () => {
    try {
      const encryptedValue = encryptedBalanceQuery.data as string | undefined;
      if (!encryptedValue || encryptedValue === ZERO_HASH) {
        setDecryptedBalance('0');
        return;
      }

      setDecryptingBalance(true);
      const result = await requestDecryption([encryptedValue]);
      const rawValue = result[encryptedValue] ?? '0';
      setDecryptedBalance(formatEth(BigInt(rawValue)));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setDecryptingBalance(false);
    }
  };

  const handleDecryptLock = async () => {
    try {
      if (!lockInfo.active) {
        throw new Error('No active lock to decrypt');
      }
      if (!lockInfo.encryptedAmount || lockInfo.encryptedAmount === ZERO_HASH) {
        setDecryptedLockAmount('0');
        return;
      }

      setDecryptingLock(true);
      const result = await requestDecryption([lockInfo.encryptedAmount]);
      const rawValue = result[lockInfo.encryptedAmount] ?? '0';
      setDecryptedLockAmount(formatEth(BigInt(rawValue)));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setDecryptingLock(false);
    }
  };

  return (
    <div className="vault-app">
      <Header/>
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Vault Overview</h2>
          {statusMessage && <span className="status-message">{statusMessage}</span>}
        </div>
        {(!isConnected || !address) && (
          <p className="helper-text">Connect your wallet to manage your encrypted fETH.</p>
        )}
        {isConnected && (
          <div className="overview-grid">
            <div className="overview-item">
              <span className="overview-label">Available Balance</span>
              <span className="overview-value">{formatEth(availableBalance)} ETH</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Locked Amount</span>
              <span className="overview-value">{formatEth(lockInfo.plainAmount)} ETH</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Lock Status</span>
              <span className="overview-badge" data-active={lockInfo.active} data-ready={canRelease}>
                {lockInfo.active ? (canRelease ? 'Ready to release' : 'In progress') : 'No active lock'}
              </span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Unlock Time</span>
              <span className="overview-value">
                {unlockDate ? unlockDate.toLocaleString() : '—'}
              </span>
            </div>
          </div>
        )}
        {zamaError && <p className="error-text">{zamaError}</p>}
        {isZamaLoading && <p className="helper-text">Initializing encryption service...</p>}
      </section>

      <section className="section-card">
        <h3 className="section-subtitle">Stake ETH</h3>
        <div className="form-row">
          <input
            type="number"
            min="0"
            step="0.0001"
            placeholder="Amount in ETH"
            value={stakeAmount}
            onChange={(event) => setStakeAmount(event.target.value)}
          />
          <button
            type="button"
            onClick={handleStake}
            disabled={!isConnected || pendingAction === 'stake'}
          >
            {pendingAction === 'stake' ? 'Staking...' : 'Stake'}
          </button>
        </div>
        <p className="helper-text">Staking mints encrypted fETH tied to your address.</p>
      </section>

      <section className="section-card">
        <h3 className="section-subtitle">Redeem ETH</h3>
        <div className="form-row">
          <input
            type="number"
            min="0"
            step="0.0001"
            placeholder="Amount in ETH"
            value={redeemAmount}
            onChange={(event) => setRedeemAmount(event.target.value)}
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={!isConnected || pendingAction === 'redeem'}
          >
            {pendingAction === 'redeem' ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
        <p className="helper-text">Redeeming burns available fETH and returns ETH to your wallet.</p>
      </section>

      <section className="section-card">
        <h3 className="section-subtitle">Lock fETH</h3>
        <div className="lock-grid">
          <div className="lock-inputs">
            <div className="form-row">
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Amount in ETH"
                value={lockAmount}
                onChange={(event) => setLockAmount(event.target.value)}
              />
              <select value={lockDurationDays} onChange={(event) => setLockDurationDays(event.target.value)}>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </select>
              <button
                type="button"
                onClick={handleLock}
                disabled={!isConnected || pendingAction === 'lock'}
              >
                {pendingAction === 'lock' ? 'Locking...' : 'Lock'}
              </button>
            </div>
            <p className="helper-text">
              Locked fETH cannot be redeemed until the chosen duration passes. The encrypted amount is stored using Zama FHE.
            </p>
          </div>
          <div className="lock-actions">
            <button
              type="button"
              className="secondary"
              onClick={handleRelease}
              disabled={!isConnected || pendingAction === 'release' || !lockInfo.active}
            >
              {pendingAction === 'release' ? 'Releasing...' : 'Release Lock'}
            </button>
            <span className="helper-text">
              {lockInfo.active ? (canRelease ? 'Lock can be released now.' : 'Lock is still in progress.') : 'No active lock.'}
            </span>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-subtitle">Decrypt balances with Zama</h3>
        <div className="decrypt-grid">
          <div className="decrypt-block">
            <div className="decrypt-row">
              <span className="decrypt-label">Total encrypted fETH</span>
              <button
                type="button"
                onClick={handleDecryptBalance}
                disabled={!isConnected || decryptingBalance}
              >
                {decryptingBalance ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
            <span className="decrypt-value">{decryptedBalance ?? '***'} ETH</span>
          </div>

          <div className="decrypt-block">
            <div className="decrypt-row">
              <span className="decrypt-label">Locked amount (encrypted)</span>
              <button
                type="button"
                onClick={handleDecryptLock}
                disabled={!isConnected || decryptingLock || !lockInfo.active}
              >
                {decryptingLock ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
            <span className="decrypt-value">{decryptedLockAmount ?? (lockInfo.active ? '***' : '0')} ETH</span>
          </div>
        </div>
        <p className="helper-text">
          Decryption requests stay private. Only your wallet can authorize access to encrypted balances using Zama FHE.
        </p>
      </section>
    </div>
  );
}
