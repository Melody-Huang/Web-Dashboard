import { Router } from 'itty-router'

// Create a new router
const router = Router()

// Constants
const GITHUB_TOKEN = GITHUB_TOKEN // This should be set in your Cloudflare Worker environment variables
const CACHE_EXPIRATION = 3600

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
]

// Helper function to fetch commits from GitHub
async function fetchCommits(repo, startDate, endDate, page = 1) {
  const url = `https://api.github.com/repos/${repo}/commits?since=${startDate}&until=${endDate}&per_page=100&page=${page}`
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CloudflareWorker',
    },
  })
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`)
  }
  return response.json()
}

// Helper function to fetch all commits
async function fetchAllCommits(repo, startDate, endDate) {
  let allCommits = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const commits = await fetchCommits(repo, startDate, endDate, page)
    allCommits = allCommits.concat(commits)
    hasNextPage = commits.length === 100
    page++
  }

  return allCommits
}

// Add a route for fetching crypto details
router.get('/api/crypto-details/:symbol', async ({ params, query }) => {
  const { symbol } = params
  const { startDate, endDate } = query
  if (!startDate || !endDate) {
    return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const cacheKey = `crypto-details:${symbol}:${startDate}:${endDate}`

  // Try to get data from KV store
  const cachedData = await CRYPTO_CACHE.get(cacheKey)
  if (cachedData) {
    return new Response(cachedData, { headers: { 'Content-Type': 'application/json' } })
  }

  const crypto = cryptocurrencies.find(c => c.symbol === symbol)
  if (!crypto) {
    return new Response(JSON.stringify({ error: 'Cryptocurrency not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const allCommits = await fetchAllCommits(crypto.repo, startDate, endDate)
    const resultData = { ...crypto, totalCommits: allCommits.length, commits: allCommits }

    // Cache the result in KV store
    await CRYPTO_CACHE.put(cacheKey, JSON.stringify(resultData), { expirationTtl: CACHE_EXPIRATION })

    return new Response(JSON.stringify(resultData), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch cryptocurrency details', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})

// Add a route for fetching all crypto commits
router.get('/api/crypto-commits', async ({ query }) => {
  const { startDate, endDate } = query
  if (!startDate || !endDate) {
    return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const cacheKey = `crypto-commits:${startDate}:${endDate}`

  // Try to get data from KV store
  const cachedData = await CRYPTO_CACHE.get(cacheKey)
  if (cachedData) {
    return new Response(cachedData, { headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const results = await Promise.all(cryptocurrencies.map(async (crypto) => {
      try {
        const allCommits = await fetchAllCommits(crypto.repo, startDate, endDate)
        return { ...crypto, totalCommits: allCommits.length, commits: allCommits }
      } catch (error) {
        console.error(`Error fetching data for ${crypto.name}:`, error.message)
        return { ...crypto, error: error.message }
      }
    }))

    const sortedResults = results.sort((a, b) => (b.totalCommits || 0) - (a.totalCommits || 0))

    // Cache the result in KV store
    await CRYPTO_CACHE.put(cacheKey, JSON.stringify(sortedResults), { expirationTtl: CACHE_EXPIRATION })

    return new Response(JSON.stringify(sortedResults), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch cryptocurrency data', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})

// Handle CORS preflight requests
router.options('*', () => new Response(null, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
}))

// Attach CORS headers to all responses
function handleRequest(request) {
  return router.handle(request).then(response => {
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})