import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

const App = () => {
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    const connection = new Connection('https://fragrant-maximum-snowflake.solana-mainnet.quiknode.pro/f99e0423a2334f9723ba030f4d1a8f237770fd8e', 'confirmed');
    const subscriptions = [];

    walletAddresses.forEach(address => {
      const publicKey = new PublicKey(address);

      const sub = connection.onLogs(
        publicKey,
        (log) => {
          const msg = `🔔 Tx on ${address.slice(0, 6)}...${address.slice(-4)} - Signature: ${log.signature}`;
          console.log(msg);
          setNotifications(prev => [...prev, msg]);
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
      <ul>
        {notifications.slice().reverse().map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
