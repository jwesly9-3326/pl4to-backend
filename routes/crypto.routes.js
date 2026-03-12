// 🪙 Routes Crypto - Lecture solde par adresse publique
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// APIs blockchain gratuites
const BLOCKCHAIN_APIS = {
  bitcoin: {
    balance: (address) => `https://blockchair.com/bitcoin/dashboards/address/${address}`,
    // Fallback
    balanceFallback: (address) => `https://blockchain.info/rawaddr/${address}?limit=0`
  },
  ethereum: {
    balance: (address) => `https://api.blockchair.com/ethereum/dashboards/address/${address}`
  }
};

// Prix crypto en CAD via CoinGecko (gratuit, pas de clé)
const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * POST /api/crypto/balance
 * Récupère le solde d'une adresse publique crypto
 * Body: { address: string, blockchain: 'bitcoin' | 'ethereum' }
 */
router.post('/balance', authenticateToken, async (req, res) => {
  try {
    const { address, blockchain = 'bitcoin' } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Adresse publique requise'
      });
    }

    const cleanAddress = address.trim();

    // Validation basique du format d'adresse
    if (blockchain === 'bitcoin' && !/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(cleanAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'adresse Bitcoin invalide'
      });
    }

    if (blockchain === 'ethereum' && !/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'adresse Ethereum invalide'
      });
    }

    let balanceCrypto = 0;

    if (blockchain === 'bitcoin') {
      // Essayer blockchain.info d'abord (plus fiable, pas de rate limit agressif)
      try {
        const response = await fetch(BLOCKCHAIN_APIS.bitcoin.balanceFallback(cleanAddress));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        // blockchain.info retourne le solde final en satoshis
        balanceCrypto = (data.final_balance || 0) / 1e8; // satoshis → BTC
      } catch (fallbackErr) {
        // Fallback: Blockchair
        const response = await fetch(BLOCKCHAIN_APIS.bitcoin.balance(cleanAddress));
        if (!response.ok) throw new Error(`Blockchair HTTP ${response.status}`);
        const data = await response.json();
        const addrData = data.data?.[cleanAddress];
        balanceCrypto = (addrData?.address?.balance || 0) / 1e8;
      }
    } else if (blockchain === 'ethereum') {
      const response = await fetch(BLOCKCHAIN_APIS.ethereum.balance(cleanAddress));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const addrData = data.data?.[cleanAddress.toLowerCase()];
      balanceCrypto = (addrData?.address?.balance || 0) / 1e18; // wei → ETH
    }

    // Obtenir le prix en CAD
    const coinId = blockchain === 'bitcoin' ? 'bitcoin' : 'ethereum';
    const priceResponse = await fetch(
      `${COINGECKO_PRICE_URL}?ids=${coinId}&vs_currencies=cad`
    );

    let priceCAD = 0;
    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      priceCAD = priceData[coinId]?.cad || 0;
    }

    const balanceCAD = balanceCrypto * priceCAD;

    res.json({
      success: true,
      data: {
        address: cleanAddress,
        blockchain,
        balanceCrypto: parseFloat(balanceCrypto.toFixed(8)),
        symbol: blockchain === 'bitcoin' ? 'BTC' : 'ETH',
        priceCAD: parseFloat(priceCAD.toFixed(2)),
        balanceCAD: parseFloat(balanceCAD.toFixed(2)),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Crypto balance error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer le solde. Vérifiez l\'adresse et réessayez.'
    });
  }
});

/**
 * GET /api/crypto/price/:coinId
 * Récupère le prix actuel d'une crypto en CAD
 */
router.get('/price/:coinId', authenticateToken, async (req, res) => {
  try {
    const { coinId } = req.params;
    const allowed = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot'];

    if (!allowed.includes(coinId)) {
      return res.status(400).json({
        success: false,
        error: `Crypto non supportée. Supportées: ${allowed.join(', ')}`
      });
    }

    const response = await fetch(
      `${COINGECKO_PRICE_URL}?ids=${coinId}&vs_currencies=cad&include_24hr_change=true`
    );

    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);

    const data = await response.json();

    res.json({
      success: true,
      data: {
        coinId,
        priceCAD: data[coinId]?.cad || 0,
        change24h: data[coinId]?.cad_24h_change || 0,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Crypto price error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer le prix.'
    });
  }
});

module.exports = router;
