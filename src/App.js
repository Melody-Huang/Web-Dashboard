import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

const cryptocurrencies = [
  { name: 'Bitcoin', symbol: 'BTC', repo: 'bitcoin/bitcoin' },
  { name: 'Ethereum', symbol: 'ETH', repo: 'ethereum/go-ethereum' },
  { name: 'BNB', symbol: 'BNB', repo: 'bnb-chain/bsc' },
  { name: 'Solana', symbol: 'SOL', repo: 'solana-labs/solana' },
  { name: 'XRP', symbol: 'XRP', repo: 'XRPLF/rippled' },
  { name: 'Toncoin', symbol: 'TON', repo: 'ton-blockchain/ton' },
  { name: 'Dogecoin', symbol: 'DOGE', repo: 'dogecoin/dogecoin' },
  { name: 'Cardano', symbol: 'ADA', repo: 'input-output-hk/cardano-node' },
  { name: 'TRON', symbol: 'TRX', repo: 'tronprotocol/java-tron' },
  { name: 'Avalanche', symbol: 'AVAX', repo: 'ava-labs/avalanchego' },
];

// Navbar Component
const Navbar = () => (
  <nav className="bg-gray-900 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <div className="text-center flex-grow">
          <span className="font-bold text-xl">CryptoGitHub Commits Ranking</span>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  </nav>
);

// LoadingSpinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const CryptoDashboard = ({ cryptoData }) => (
  <div className="grid grid-cols-1 gap-6">
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="font-semibold text-xl text-gray-800">Top 10 Cryptocurrencies Ranked by GitHub Commits</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commits</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cryptoData.map((crypto, index) => (
              <tr key={crypto.symbol} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/crypto/${crypto.symbol}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                    {crypto.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crypto.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {crypto.totalCommits ? crypto.totalCommits.toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="font-semibold text-xl text-gray-800">Commit Activity Overview</h2>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cryptoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalCommits" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.all(cryptocurrencies.map(async (crypto) => {
          try {
            const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/commits`, {
              params: { per_page: 1 },
              headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            const linkHeader = response.headers['link'];
            const totalCommits = linkHeader
              ? parseInt(linkHeader.match(/page=(\d+)>; rel="last"/)[1])
              : response.data.length;
            return { ...crypto, totalCommits };
          } catch (error) {
            console.error(`Error fetching data for ${crypto.name}:`, error);
            return { ...crypto, totalCommits: null };
          }
        }));

        const sortedResults = results.sort((a, b) => (b.totalCommits || 0) - (a.totalCommits || 0));

        setCryptoData(sortedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">CryptoGitHub Commits Ranking</h1>
        <p className="text-gray-600">Explore and compare commit activity of top 10 cryptocurrencies on GitHub</p>
      </div>
      <CryptoDashboard cryptoData={cryptoData} />
    </div>
  );
};

const CryptoDetailPage = () => {
  const { symbol } = useParams();
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const crypto = cryptocurrencies.find(c => c.symbol === symbol);
        if (!crypto) throw new Error('Cryptocurrency not found');

        const periods = [
          { name: '1 Month', days: 30 },
          { name: '6 Months', days: 180 },
          { name: '1 Year', days: 365 }
        ];

        const commitData = await Promise.all(periods.map(async (period) => {
          try {
            const since = new Date(Date.now() - period.days * 24 * 60 * 60 * 1000).toISOString();
            const response = await axios.get(`https://api.github.com/repos/${crypto.repo}/commits`, {
              params: { since, per_page: 1 },
              headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            const linkHeader = response.headers['link'];
            const commits = linkHeader
              ? parseInt(linkHeader.match(/page=(\d+)>; rel="last"/)[1])
              : response.data.length;
            return { period: period.name, commits };
          } catch (error) {
            console.error(`Error fetching commit data for ${period.name}:`, error);
            return { period: period.name, commits: null };
          }
        }));

        setCryptoData({ ...crypto, commitData });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch cryptocurrency details. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!cryptoData) {
    return <div className="text-red-500 text-center">Cryptocurrency not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {cryptoData.name} ({cryptoData.symbol})
          </h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Ranking
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Commit Activity</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cryptoData.commitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="commits" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Commit Details</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Period</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commits</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cryptoData.commitData.map((data) => (
              <tr key={data.period} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.period}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {data.commits ? data.commits.toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/crypto/:symbol" element={<CryptoDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;