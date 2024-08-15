import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { format, isValid, subMonths, parseISO } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './api';

const Navbar = () => (
  <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center py-6">
        <Link to="/" className="flex items-center">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/crypto/${crypto.symbol}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                      {crypto.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crypto.symbol}</td>
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
        setCryptoData(Array.isArray(response.data) ? response.data : []);

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
          <h1 className="text-4xl font-bold text-gray-800">CryptoGitHub Insights</h1>
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

        // Ensure commitData exists and is an array
        const commitData = Array.isArray(response.data.commitData) ? response.data.commitData : [];

        const processedData = processCommitData(commitData);
        setCryptoData({ ...response.data, processedCommitData: processedData });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch cryptocurrency details. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  const processCommitData = (commitData) => {
    const dailyCommits = {};

    commitData.forEach(commit => {
      if (!commit || typeof commit.date === 'undefined') {
        console.warn('Invalid commit data encountered:', commit);
        return;
      }

      let date;
      try {
        date = typeof commit.date === 'string' ? parseISO(commit.date) : new Date(commit.date);
        if (!isValid(date)) {
          console.warn(`Invalid date encountered: ${commit.date}`);
          return;
        }
        const dateStr = format(date, 'yyyy-MM-dd');
        dailyCommits[dateStr] = (dailyCommits[dateStr] || 0) + 1;
      } catch (error) {
        console.warn(`Error processing date: ${commit.date}`, error);
      }
    });

    const chartData = Object.keys(dailyCommits).map(date => ({
      date,
      commits: dailyCommits[date]
    }));

    return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 text-center font-medium text-lg">{error}</div>;
  if (!cryptoData) return <div className="text-red-500 text-center font-medium text-lg">Cryptocurrency not found</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {cryptoData.name} ({cryptoData.symbol})
          </h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
            &larr; Back to Ranking
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Commit Activity (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cryptoData.processedCommitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(dateStr) => {
                try {
                  const date = parseISO(dateStr);
                  return isValid(date) ? format(date, 'MMM dd') : '';
                } catch (error) {
                  console.warn(`Error formatting date: ${dateStr}`, error);
                  return '';
                }
              }}
              interval={30}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(dateStr) => {
                try {
                  const date = parseISO(dateStr);
                  return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid Date';
                } catch (error) {
                  console.warn(`Error formatting date: ${dateStr}`, error);
                  return 'Invalid Date';
                }
              }}
              formatter={(value) => [value, 'Commits']}
            />
            <Line type="monotone" dataKey="commits" stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Monthly Commit Summary</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commits</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(
              cryptoData.processedCommitData.reduce((acc, { date, commits }) => {
                try {
                  const parsedDate = parseISO(date);
                  if (isValid(parsedDate)) {
                    const month = format(parsedDate, 'MMM yyyy');
                    acc[month] = (acc[month] || 0) + commits;
                  }
                } catch (error) {
                  console.warn(`Error processing date: ${date}`, error);
                }
                return acc;
              }, {})
            ).map(([month, totalCommits]) => (
              <tr key={month} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {totalCommits.toLocaleString()}
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