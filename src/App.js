import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import './App.css';

const LOCAL_STORAGE_KEY = 'solana_wallet_notifications';

const MAILBOX_SVG = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="48" height="28" rx="10" fill="#3B4261" />
    <rect x="8" y="20" width="24" height="28" rx="10" fill="#5B6EE1" />
    <rect x="28" y="44" width="8" height="12" rx="2" fill="#A47B62" />
    <rect x="44" y="28" width="8" height="8" rx="2" fill="#F47B6B" />
    <circle cx="16" cy="34" r="4" fill="#2D314D" />
  </svg>
);

const BELL_SVG = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
    <path d="M24 44c2.2 0 4-1.8 4-4h-8c0 2.2 1.8 4 4 4zm12-8V22c0-6.1-4.5-11.1-10.5-11.9V8a1.5 1.5 0 10-3 0v2.1C16.5 10.9 12 15.9 12 22v14l-2 2v2h32v-2l-2-2z" fill="#a18fff" />
  </svg>
);

const Spinner = () => (
  <div className="dashboard-spinner">
    <div className="dashboard-spinner-circle" />
  </div>
);

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  // Hardcoded wallet addresses
  const walletAddresses = [
    'ExnVLJszScgqxZa44UTdTNeaG9PjXVjNvx6xYNUDTDYb',
    '78y7pfJ4eJ9N6aL8h7dvUcfYk3Gw8hDe9G93QQHmiSiz',
    'FkXo6pwD4LzC2obupejhQdp3jHfABG2tXLyhXkXRCaA',
    '83NKMWJDHhULbD9s9baeSrFikdQMiRxfci6WgprhCeQE',
    'BHZWfsJvFvif7qAWzkRtfR4Cny4ugXuaHDNht5S13F4T',
    'EEx9rjSNWMSdCpfeNKB3jCMkYe3cHvF6YZkCudNNLzXd',
    'ChDvn2ckvmXE5CYQAGu5gh2UrK3q2QtzxpDBPajZhzBT',
    'GW466wmGyqmsz71ZbmLnWCiWM3Z4CuKVrAdSV5k177cV',
  ];

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setTotalNotifications(parsed.length);
      } catch (e) {
        setNotifications([]);
        setTotalNotifications(0);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    setTotalNotifications(notifications.length);
  }, [notifications]);

  const rpcUrl = 'https://late-cool-layer.solana-mainnet.quiknode.pro/fd58ed472bfd93ef23d6e7e9454385d53a9d7f18';

  useEffect(() => {
    const connection = new Connection(rpcUrl, 'confirmed');
    async function testConnection() {
      try {
        const slot = await connection.getSlot();
        const { blockhash } = await connection.getRecentBlockhash();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    }
    testConnection();

    const subscriptions = [];
    walletAddresses.forEach(address => {
      const publicKey = new PublicKey(address);
      const sub = connection.onLogs(
        publicKey,
        (log) => {
          const msg = `🔔 Tx on ${address.slice(0, 6)}...${address.slice(-4)} - Signature: ${log.signature}`;
          const notification = {
            msg,
            timestamp: Date.now(),
          };
          setNotifications(prev => [...prev, notification]);
        },
        'confirmed'
      );
      subscriptions.push(sub);
    });
    // Cleanup all subscriptions on unmount
    return () => {
      subscriptions.forEach(subId => {
        connection.removeOnLogsListener(subId);
      });
    };
  }, []);

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
    setTotalNotifications(0);
    localStorage.setItem(LOCAL_STORAGE_KEY, '[]');
  };

  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title-row">
            {BELL_SVG}
            <span className="dashboard-title">Solana Wallet Notifier</span>
          </div>
          {isConnected ? (
            <span className="dashboard-status connected">
              <span className="dashboard-status-dot" /> Connected
            </span>
          ) : (
            <span className="dashboard-status not-connected">
              <span className="dashboard-status-dot red" /> Not Connected
            </span>
          )}
        </div>
        <div className="dashboard-stats">
          <div className="dashboard-card">
            <div className="dashboard-card-value">{walletAddresses.length}</div>
            <div className="dashboard-card-label">Monitored Wallets</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-value">{totalNotifications}</div>
            <div className="dashboard-card-label">Total Notifications</div>
          </div>
        </div>
        <div className="dashboard-live">
          <button className="dashboard-clear-btn" onClick={clearNotifications}>Clear Notifications</button>
          <div className="dashboard-live-title">Live Notifications</div>
          {notifications.length === 0 ? (
            <div className="dashboard-waiting">
              <Spinner />
              <div className="dashboard-mailbox">{MAILBOX_SVG}</div>
              <div className="dashboard-waiting-title">Waiting for transactions...</div>
              <div className="dashboard-waiting-desc">Monitoring {walletAddresses.length} wallets for activity</div>
            </div>
          ) : (
            <ul className="dashboard-notifications-list">
              {notifications.slice().reverse().map((n, idx) => (
                <li key={idx} className="dashboard-notification-item">{n.msg} <span className="dashboard-notification-time">({new Date(n.timestamp).toLocaleString()})</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
