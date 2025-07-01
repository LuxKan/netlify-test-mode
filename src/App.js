import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_notifications';

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Hardcoded wallet addresses
  const walletAddresses = [
    'ExnVLJszScgqxZa44UTdTNeaG9PjXVjNvx6xYNUDTDYb',
    '78y7pfJ4eJ9N6aL8h7dvUcfYk3Gw8hDe9G93QQHmiSiz',
    'FkXo6pwD4LzC2obupejhQdp3jHfABG2tXLyhXkXRCaA',
    
    '83NKMWJDHhULbD9s9baeSrFikdQMiRxfci6WgprhCeQE',
    'BHZWfsJvFvif7qAWzkRtfR4Cny4ugXuaHDNht5S13F4T',
    'EEx9rjSNWMSdCpfeNKB3jCMkYe3cHvF6YZkCudNNLzXd',
    'ChDvn2ckvmXE5CYQAGu5gh2UrK3q2QtzxpDBPajZhzBT',
    // Add your own wallet to test
    '2Tqhd8fsWTWfGEowFdvwYqHGQapgCmj6Hq92Z2zTf5cn',
  ];

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (e) {
        setNotifications([]);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    // Filter notifications from the last 1 hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    setRecentNotifications(
      notifications.filter(n => n.timestamp >= oneHourAgo)
    );
  }, [notifications]);

  useEffect(() => {
    const connection = new Connection('https://fragrant-maximum-snowflake.solana-mainnet.quiknode.pro/f99e0423a2334f9723ba030f4d1a8f237770fd8e', 'confirmed');
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
          console.log(msg);
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

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔔 Live Solana Wallet Notifications</h2>
      <h3>All Notifications (Newest First)</h3>
      <ul>
        {notifications.slice().reverse().map((n, idx) => (
          <li key={idx}>{n.msg} <span style={{color:'#888', fontSize:'0.8em'}}>({new Date(n.timestamp).toLocaleString()})</span></li>
        ))}
      </ul>
      <h3>Notifications from the Last 1 Hour</h3>
      <ul>
        {recentNotifications.slice().reverse().map((n, idx) => (
          <li key={idx}>{n.msg} <span style={{color:'#888', fontSize:'0.8em'}}>({new Date(n.timestamp).toLocaleString()})</span></li>
        ))}
      </ul>
    </div>
  );
};

export default App;
