import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Navbar Component
const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <div className="text-center flex-grow">
            <span className="font-bold text-xl">CryptoMetrics Dashboard</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-blue-500 transition-colors">About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// CryptoDashboard Component
const CryptoDashboard = ({ cryptoData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="font-semibold text-xl text-gray-800">Cryptocurrency Prices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cryptoData.map((crypto) => (
                <tr key={crypto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/crypto/${crypto.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                      {crypto.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crypto.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${crypto.price.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {crypto.change24h.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="font-semibold text-xl text-gray-800">Market Overview</h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cryptoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// HomePage Component
const HomePage = () => {
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Replace this with actual API call
      const data = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 45000, change24h: 5.67 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3000, change24h: 3.21 },
        { id: 'BNB', name: 'BNB', symbol: 'BNB', price: 1.5, change24h: -2.34 },
        { id: 'Solano', name: 'Solana', symbol: 'SOL', price: 0.3, change24h: 1.23 },
        { id: 'XRP', name: 'XRP', symbol: 'XRP', price: 0.3, change24h: 1.23 },
        { id: 'Toncoin', name: 'Toncoin', symbol: 'TON', price: 0.3, change24h: 1.23 },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.3, change24h: 1.23 },
        { id: 'Cardano', name: 'Cardano', symbol: 'ADA', price: 0.3, change24h: 1.23 },
        { id: 'TRON', name: 'TRON', symbol: 'TRX', price: 0.3, change24h: 1.23 },
        { id: 'Avalanche', name: 'Avalanche', symbol: 'AVAX', price: 20.59, change24h: 1.23, },
      ];
      setCryptoData(data);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to CryptoMetrics</h1>
        <p className="text-gray-600">Your real-time cryptocurrency tracking dashboard</p>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>Market Update:</strong> Bitcoin surges 5% as institutional investors increase holdings.
        </p>
      </div>
      <CryptoDashboard cryptoData={cryptoData} />
    </div>
  );
};


const CryptoDetailPage = () => {
  const { id } = useParams();
  const [cryptoData, setCryptoData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Simulated API call - replace with actual API call
      const data = {
        id: id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        symbol: id.toUpperCase(),
        price: 45000,
        change24h: 5.67,
        marketCap: 846000000000,
        volume24h: 28000000000,
        circulatingSupply: 18700000,
        historicalData: Array.from({length: 30}, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: 40000 + Math.random() * 10000
        }))
      };
      setCryptoData(data);
    };
    fetchData();
  }, [id]);

  if (!cryptoData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {cryptoData.name} ({cryptoData.symbol})
          </h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Price</h2>
            <p className="text-2xl font-bold text-gray-800">${cryptoData.price.toLocaleString()}</p>
            <span className={`text-sm ${cryptoData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cryptoData.change24h >= 0 ? '▲' : '▼'} {Math.abs(cryptoData.change24h).toFixed(2)}% (24h)
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Market Cap</h2>
            <p className="text-2xl font-bold text-gray-800">${(cryptoData.marketCap / 1e9).toFixed(2)}B</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">24h Volume</h2>
            <p className="text-2xl font-bold text-gray-800">${(cryptoData.volume24h / 1e9).toFixed(2)}B</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase">Circulating Supply</h2>
            <p className="text-2xl font-bold text-gray-800">{cryptoData.circulatingSupply.toLocaleString()} {cryptoData.symbol}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Price History (30 Days)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cryptoData.historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">About {cryptoData.name}</h2>
        <p className="text-gray-600">
          {cryptoData.name} is a decentralized digital currency that can be transferred on the peer-to-peer {cryptoData.name} network.
          {cryptoData.name} transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain.
        </p>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/crypto/:id" element={<CryptoDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;