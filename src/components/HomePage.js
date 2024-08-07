import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CryptoDashboard from './CryptoDashboard';

const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Cryptocurrency Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Welcome to your cryptocurrency dashboard. Here you can view the latest
            information on various cryptocurrencies and their performance over the last 24 hours.
          </p>
        </CardContent>
      </Card>

      <CryptoDashboard />

      <Card className="mt-6">
        <CardContent>
          <p className="text-sm text-gray-500">
            Data is updated every 5 minutes. Last updated: {new Date().toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;