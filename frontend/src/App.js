import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './api';

const Logo = () => (
  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Navbar = () => (
  <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-6">
        <Link to="/" className="flex items-center">
          <Logo />
          <span className="font-bold text-2xl">CryptoGitHub Insights</span>
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-200 transition-colors font-medium">Home</Link>
          <a href="https://github.com/Melody-Huang" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors font-medium">GitHub</a>
        </div>
      </div>
    </div>
  </nav>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const CryptoDashboard = ({ cryptoData }) => {
  if (!cryptoData || cryptoData.length === 0) {
    return <div>No data available</div>;
  }

  // Sort the data by total commits in descending order
  const sortedData = [...cryptoData].sort((a, b) => b.totalCommits - a.totalCommits);

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="font-semibold text-xl text-center text-gray-800">Top Cryptocurrencies Ranked by GitHub Commits</h2>
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
              {sortedData.map((crypto, index) => (
                <tr key={crypto.symbol} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="font-semibold text-xl text-center text-gray-800">Commit Activity Overview</h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData}>
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
};


const HomePage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/crypto-commits');
        // Ensure we're setting the correct data structure
        setCryptoData(response.data || []);

        // Handle lastUpdated separately if it exists in the response
        if (response.data && response.data.lastUpdated) {
          const parsedDate = new Date(response.data.lastUpdated);
          setLastUpdated(isValid(parsedDate) ? parsedDate : null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch cryptocurrency data. Please try again later. Error: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    if (!date || !isValid(date)) {
      return 'Unknown';
    }
    try {
      return format(date, "MM/dd/yyyy, hh:mm:ss a");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center font-medium text-lg">
        {error}
        <br />
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center items-center mb-4">
          <Logo />
          <h1 className="text-4xl font-bold text-gray-800 ml-2">CryptoGitHub Insights</h1>
        </div>
        <p className="text-gray-600 text-center text-lg">
          GitHub commit history of 8 cryptocurrencies based on most recent repos
        </p>
        {lastUpdated && (
          <p className="text-gray-500 text-center text-sm mt-2">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}
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
        const response = await api.get(`/api/crypto-details/${symbol}`);
        setCryptoData(response.data);
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
    return <div className="text-red-500 text-center font-medium text-lg">{error}</div>;
  }

  if (!cryptoData) {
    return <div className="text-red-500 text-center font-medium text-lg">Cryptocurrency not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center mb-2">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-800 ml-2">
              {cryptoData.name} ({cryptoData.symbol})
            </h1>
          </div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
            &larr; Back to Ranking
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Commit Activity</h2>
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

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Commit Details</h2>
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
        <main className="container mx-auto px-4 py-8 max-w-6xl">
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