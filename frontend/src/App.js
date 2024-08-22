import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { isValid, format, subYears } from 'date-fns';
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
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const CryptoDashboard = ({ cryptoData }) => {
  if (!cryptoData || cryptoData.length === 0) {
    return <div className="text-center text-gray-500 text-xl">No data available</div>;
  }

  const sortedData = [...cryptoData].sort((a, b) => b.totalCommits - a.totalCommits);

  return (
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
  );
};

const HomePage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/crypto-commits', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          timestamp: new Date().getTime()
        }
      });
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

  useEffect(() => {
    fetchData();
  });

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
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
          GitHub commit history of 10 popular cryptocurrencies based on most recent repos
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
        const endDate = new Date();
        const startDate = subYears(endDate, 1);
        const response = await api.get(`/api/crypto-details/${symbol}`, {
          params: {
            startDate: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
          }
        });

        if (!response.data || !response.data.commits) {
          throw new Error('Invalid data structure received from API');
        }
        const processedData = processCommitData(response.data.commits);
        setCryptoData({ ...response.data, processedCommitData: processedData });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch cryptocurrency details: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const processCommitData = (commitData) => {
    const endDate = new Date();
    const startDate = subYears(endDate, 1);
    const monthlyCommits = Array(12).fill(0);

    commitData.forEach(commit => {
      const commitDate = new Date(commit.commit.author.date);
      if (commitDate >= startDate && commitDate <= endDate) {
        const monthIndex = (commitDate.getMonth() - startDate.getMonth() + 12) % 12;
        monthlyCommits[monthIndex]++;
      }
    });

    return monthlyCommits.map((commits, index) => ({
      month: index,
      commits: commits
    }));
  };

  const monthNames = [
    'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan',
    'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'
  ];

  const CustomXAxisTick = ({ x, y, payload }) => {
    const year = payload.value < 5 ? '2023' : '2024';
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={10}>
          {`${monthNames[payload.value]} ${year}`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const year = label < 5 ? '2023' : '2024';
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-bold">{`${monthNames[label]} ${year}`}</p>
          <p>Commits: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );
  if (!cryptoData) return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <p className="font-bold">Warning</p>
      <p>Cryptocurrency not found</p>
    </div>
  );

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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Commit Activity (Aug 2023 - Jul 2024)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cryptoData.processedCommitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={<CustomXAxisTick />}
              type="number"
              domain={[0, 11]}
              tickCount={12}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Monthly Commit Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Commits</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cryptoData.processedCommitData.map(({ month, commits }) => (
                <tr key={month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {`${monthNames[month]} ${month < 5 ? '2023' : '2024'}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {commits.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating initial load time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/crypto/:symbol" element={<CryptoDetailPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 CryptoGitHub Insights. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;