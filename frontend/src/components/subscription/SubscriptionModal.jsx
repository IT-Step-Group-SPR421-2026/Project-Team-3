import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ethers } from "ethers";
import { gsap } from "gsap";
import { useSubscription } from "../../hooks/useSubscription";
import { useWallet } from "../../hooks/useSubscription";
import "./SubscriptionModal.css";

const CONTRACT_ADDRESS = "0x9fcD7A43f46a42d0a6F0672972b6Df7E34724537";
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "purchaseSubscription",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "subscriptionPrice",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function SubscriptionModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("info"); // info, connect, paying, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [price] = useState("0.005");

  const { registerSubscription } = useSubscription();
  const {
    connectWallet,
    account,
    isConnected,
    connectWallet: connect,
  } = useWallet();

  const modalRef = useRef(null);
  const paymentInitiatedRef = useRef(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      if (!account) {
        throw new Error("Wallet not connected");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      // Check balance
      const balance = await provider.getBalance(account);
      const valueInEth = ethers.parseEther(price);

      if (balance < valueInEth) {
        throw new Error(
          `Insufficient balance. Need ${price} ETH, have ${ethers.formatEther(balance)} ETH`,
        );
      }

      console.log("Sending payment:", {
        to: CONTRACT_ADDRESS,
        value: price,
        valueInWei: valueInEth.toString(),
        accountBalance: ethers.formatEther(balance),
      });

      // Send transaction with explicit parameters
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: contract.interface.encodeFunctionData("purchaseSubscription", []),
        value: valueInEth,
      });

      console.log("Transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Transaction failed - no receipt");
      }

      console.log("Transaction confirmed:", receipt.hash);

      // Register with backend
      const txHash = receipt.hash;
      setTxHash(txHash);

      await registerSubscription(account, txHash);

      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err.reason || err.message || "Payment failed";
      setError(errorMessage);
      console.error("Payment error:", err);
      // Reset payment initiated flag on error so user can retry
      paymentInitiatedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out" },
    );
  }, []);

  // Auto-trigger payment when wallet is connected
  useEffect(() => {
    if (step === "paying" && account && !paymentInitiatedRef.current) {
      paymentInitiatedRef.current = true;
      handlePayment();
    }
  }, [step, account]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await connect();
      setStep("paying");
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  return createPortal(
    <div className="subscription-overlay" onClick={handleClose}>
      <div
        className="subscription-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "info" && (
          <>
            <h2 className="subscription-title">Upgrade to Premium</h2>
            <div className="subscription-content">
              <div className="subscription-info-card">
                <h3>Premium Features</h3>
                <ul>
                  <li>
                    <span>Unlimited habits</span>
                  </li>
                  <li>
                    <span>Advanced analytics</span>
                  </li>
                  <li>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="subscription-price-card">
                <p className="subscription-price-label">One-time payment</p>
                <p className="subscription-price-value">{price} ETH</p>
                <p className="subscription-price-note">No recurring charges</p>
              </div>

              <div className="subscription-actions">
                <button
                  className="subscription-btn subscription-btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="subscription-btn subscription-btn-primary"
                  onClick={() => setStep("connect")}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </>
        )}

        {step === "connect" && (
          <>
            <h2 className="subscription-title">Connect Wallet</h2>
            <div className="subscription-wallet-section">
              <p className="subscription-section-text">
                Connect your MetaMask wallet to proceed with payment
              </p>

              {error && <div className="subscription-error">{error}</div>}

              <div className="subscription-actions">
                <button
                  className="subscription-btn subscription-btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="subscription-btn subscription-btn-primary"
                  onClick={handleConnect}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Connect MetaMask"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === "paying" && (
          <>
            <h2 className="subscription-title">Processing Payment</h2>
            <div className="subscription-paying-section">
              {error ? (
                <>
                  <div className="subscription-error">{error}</div>
                  <div className="subscription-actions">
                    <button
                      className="subscription-btn subscription-btn-secondary"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="subscription-btn subscription-btn-primary"
                      onClick={() => {
                        setError(null);
                        paymentInitiatedRef.current = false;
                        handlePayment();
                      }}
                      disabled={loading}
                    >
                      {loading ? "Retrying..." : "Retry Payment"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="subscription-spinner"></div>
                  <p className="subscription-section-text">
                    {txHash
                      ? "Confirming transaction..."
                      : "Check MetaMask to confirm payment..."}
                  </p>
                  {txHash && (
                    <p className="subscription-tx-hash">
                      TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <h2 className="subscription-title">Payment Successful</h2>
            <div className="subscription-success-section">
              <div className="subscription-success-icon">✓</div>
              <p className="subscription-section-text">
                You now have unlimited habits and premium features!
              </p>
              <p className="subscription-tx-hash">
                TX: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
