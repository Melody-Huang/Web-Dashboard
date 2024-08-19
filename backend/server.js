// server.js
const express = require('express');
const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');
const cors = require('cors');

require('dotenv').config();

const app = express();
const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CACHE_EXPIRATION = 3600;

app.use(cors());

const cryptocurrencies = [
  { name: 'Bitcoin', symbol: 'BTC', repo: 'bitcoin/bitcoin' },
  { name: 'Ethereum', symbol: 'ETH', repo: 'ethereum/go-ethereum' },
  { name: 'BNB', symbol: 'BNB', repo: 'bnb-chain/bsc' },
  { name: 'XRP', symbol: 'XRP', repo: 'XRPLF/rippled' },
  { name: 'Toncoin', symbol: 'TON', repo: 'ton-blockchain/ton' },
  { name: 'Dogecoin', symbol: 'DOGE', repo: 'dogecoin/dogecoin' },
  { name: 'Cardano', symbol: 'ADA', repo: 'IntersectMBO/cardano-node' },
  { name: 'TRON', symbol: 'TRX', repo: 'tronprotocol/java-tron' },
  { name: 'Mina', symbol: 'MINA', repo: 'MinaProtocol/mina' },
  { name: 'SushiSwap', symbol: 'SUSHI', repo: 'sushiswap/sushiswap' },
];

app.get('/api/crypto-details/:symbol', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }
  const { symbol } = req.params;
  const cacheKey = `crypto-details:${symbol}:${startDate}:${endDate}`;

  const cachedData = await getAsync(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  try {
    const crypto = cryptocurrencies.find(c => c.symbol === symbol);
    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    let allCommits = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/commits`, {
        params: {
          since: startDate,
          until: endDate,
          per_page: 100,
          page: page
        },
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }
      });

      allCommits = allCommits.concat(response.data);
      hasNextPage = response.data.length === 100;
      page++;
    }

    const resultData = { ...crypto, totalCommits: allCommits.length, commits: allCommits };

    await setexAsync(cacheKey, CACHE_EXPIRATION, JSON.stringify(resultData));

    res.json(resultData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency details' });
  }
});


app.get('/api/crypto-commits', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const cacheKey = `crypto-commits:${startDate}:${endDate}`;

  try {
    // Try to get data from cache
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const results = await Promise.all(cryptocurrencies.map(async (crypto) => {
      try {
        let allCommits = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
          const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/commits`, {
            params: {
              since: startDate,
              until: endDate,
              per_page: 100,
              page: page
            },
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            }
          });

          allCommits = allCommits.concat(response.data);
          hasNextPage = response.data.length === 100;
          page++;
        }

        return { ...crypto, totalCommits: allCommits.length, commits: allCommits };
      } catch (error) {
        console.error(`Error fetching data for ${crypto.name}:`, error.response ? error.response.data : error.message);
        return { ...crypto, error: error.message };
      }
    }));

    const sortedResults = results.sort((a, b) => (b.totalCommits || 0) - (a.totalCommits || 0));

    await setexAsync(cacheKey, CACHE_EXPIRATION, JSON.stringify(sortedResults));

    res.json(sortedResults);
  } catch (error) {
    console.error('Error in /api/crypto-commits:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency data', details: error.message });
  }
});


app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));