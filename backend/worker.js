// Cloudflare Worker for Crypto API

// Define your cryptocurrencies
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

  // Cache expiration time in seconds
  const CACHE_EXPIRATION = 3600;

  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })

  async function handleRequest(request) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path.startsWith('/api/crypto-details/')) {
      return handleCryptoDetails(request)
    } else if (path === '/api/crypto-commits') {
      return handleCryptoCommits(request)
    } else {
      return new Response('Not Found', { status: 404 })
    }
  }

  async function handleCryptoDetails(request) {
    const url = new URL(request.url)
    const symbol = url.pathname.split('/').pop()
    const { startDate, endDate } = Object.fromEntries(url.searchParams)

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const cacheKey = `crypto-details:${symbol}:${startDate}:${endDate}`

    // Try to get data from cache
    const cachedData = await CRYPTO_CACHE.get(cacheKey)
    if (cachedData) {
      return new Response(cachedData, {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const crypto = cryptocurrencies.find(c => c.symbol === symbol)
    if (!crypto) {
      return new Response(JSON.stringify({ error: 'Cryptocurrency not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      let allCommits = []
      let page = 1
      let hasNextPage = true

      while (hasNextPage) {
        const response = await fetch(`https://api.github.com/repos/${crypto.repo}/commits?since=${startDate}&until=${endDate}&per_page=100&page=${page}`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }
        })

        if (!response.ok) {
          throw new Error(`GitHub API responded with ${response.status}: ${await response.text()}`)
        }

        const commits = await response.json()
        allCommits = allCommits.concat(commits)
        hasNextPage = commits.length === 100
        page++
      }

      const resultData = { ...crypto, totalCommits: allCommits.length, commits: allCommits }

      // Cache the result
      await CRYPTO_CACHE.put(cacheKey, JSON.stringify(resultData), { expirationTtl: CACHE_EXPIRATION })

      return new Response(JSON.stringify(resultData), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch cryptocurrency details', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  async function handleCryptoCommits(request) {
    const url = new URL(request.url)
    const { startDate, endDate } = Object.fromEntries(url.searchParams)

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const cacheKey = `crypto-commits:${startDate}:${endDate}`

    // Try to get data from cache
    const cachedData = await CRYPTO_CACHE.get(cacheKey)
    if (cachedData) {
      return new Response(cachedData, {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const results = await Promise.all(cryptocurrencies.map(async (crypto) => {
        try {
          let allCommits = []
          let page = 1
          let hasNextPage = true

          while (hasNextPage) {
            const response = await fetch(`https://api.github.com/repos/${crypto.repo}/commits?since=${startDate}&until=${endDate}&per_page=100&page=${page}`, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              }
            })

            if (!response.ok) {
              throw new Error(`GitHub API responded with ${response.status}: ${await response.text()}`)
            }

            const commits = await response.json()
            allCommits = allCommits.concat(commits)
            hasNextPage = commits.length === 100
            page++
          }

          return { ...crypto, totalCommits: allCommits.length, commits: allCommits }
        } catch (error) {
          console.error(`Error fetching data for ${crypto.name}:`, error.message)
          return { ...crypto, error: error.message }
        }
      }))

      const sortedResults = results.sort((a, b) => (b.totalCommits || 0) - (a.totalCommits || 0))

      // Cache the result
      await CRYPTO_CACHE.put(cacheKey, JSON.stringify(sortedResults), { expirationTtl: CACHE_EXPIRATION })

      return new Response(JSON.stringify(sortedResults), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch cryptocurrency data', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }