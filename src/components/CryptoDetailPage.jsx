import React from 'react';
import { useParams } from 'react-router-dom';

const CryptoDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Crypto Detail Page</h1>
      <p>Details for crypto: {id}</p>
    </div>
  );
};

export default CryptoDetailPage;