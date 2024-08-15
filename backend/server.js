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
];

app.get('/api/crypto-commits', async (req, res) => {
  try {
    const cachedData = await getAsync('crypto_commits');
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
      return res.json({
        data: parsedData,
        lastUpdated: new Date(parsedData.lastUpdated || Date.now()).toISOString()
      });
    }

    const results = await Promise.all(cryptocurrencies.map(async (crypto) => {
      console.log(`https://api.github.com/repos/${crypto.repo}/activity`)

      const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/stats/participation`, {
        params: { per_page: 1 },
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }
      });

      console.log("response", response)

      // const linkHeader = response.headers['link'];
      // const totalCommits = linkHeader
      //   ? parseInt(linkHeader.match(/page=(\d+)>; rel="last"/)[1])
      //   : response.data.length;
      const totalCommits = response.data.all.reduce((sum, weeklyCommits) => sum + weeklyCommits, 0);

      return { ...crypto, totalCommits };
    }));

    const sortedResults = results.sort((a, b) => b.totalCommits - a.totalCommits);
    const dataToCache = {
      data: sortedResults,
      lastUpdated: new Date().toISOString()
    };

    await setexAsync('crypto_commits', 3600, JSON.stringify(sortedResults)); // Cache for 1 hour

    res.json(sortedResults);
  } catch (error) {
    console.error('Error fetching data:', error);
    // if (error.response) {
    //   // The request was made and the server responded with a status code
    //   // that falls out of the range of 2xx
      // console.error('Response data:', error.response.data);
    //   console.error('Response status:', error.response.status);
    //   console.error('Response headers:', error.response.headers);
    // } else if (error.request) {
    //   // The request was made but no response was received
    //   console.error('No response received:', error.request);
    // } else {
    //   // Something happened in setting up the request that triggered an Error
    //   console.error('Error setting up request:', error.message);
    // }
    res.status(500).json({ error: 'Failed to fetch cryptocurrency data', details: error.message, lastUpdated: new Date().toISOString() });
  }
});

app.get('/api/crypto-details/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { startDate, endDate } = req.query;
  try {
    const crypto = cryptocurrencies.find(c => c.symbol === symbol);
    if (!crypto) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/commits`, {
      params: {
        since: startDate,
        until: endDate,
        per_page: 100 // Adjust as needed
      },
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    const commitData = response.data.map(commit => ({
      date: commit.commit.author.date,
      message: commit.commit.message
    }));

    res.json({ ...crypto, commitData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency details' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));