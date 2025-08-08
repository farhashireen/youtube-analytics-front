import React, { useState } from 'react';
import axios from 'axios';
import LikesTrendChart from './LikesTrendChart';
import VideoViewsChart from './VideoViewsChart';
import ChartsDashboard from './ChartsDashboard';
import CompetitorComparison from './CompetitorComparison';
import './App.css';

function App() {
  const [channelName, setChannelName] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchChannelData = async () => {
    if (!channelName) return;
    setLoading(true);
    setError('');
    setChannelData(null);
    setVideos([]);

    try {
      const res = await axios.get(`https://youtube-analytics-backend.onrender.com/channel?name=${channelName}`);
      setChannelData(res.data.channel);
      setVideos(res.data.videos);
    } catch (err) {
      setError('Channel not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#FF0000' }}>📊 YouTube Channel Analytics</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter channel name..."
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          style={{ padding: '10px', width: '60%', marginRight: '10px' }}
        />
        <button
          onClick={fetchChannelData}
          style={{ padding: '10px 20px', backgroundColor: '#FF0000', color: 'white', border: 'none', borderRadius: '6px' }}
        >
          Analyze
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {channelData && (
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2>{channelData.snippet.title}</h2>
          <p>{channelData.snippet.description}</p>
          <p>📅 Created on: {new Date(channelData.snippet.publishedAt).toLocaleDateString()}</p>
          <p>👥 Subscribers: {parseInt(channelData.statistics.subscriberCount).toLocaleString()}</p>
          <p>📺 Videos: {channelData.statistics.videoCount}</p>
          <p>👁️ Total Views: {parseInt(channelData.statistics.viewCount).toLocaleString()}</p>
        </div>
      )}

      {videos.length > 0 && <ChartsDashboard videos={videos} channelData={channelData} />}

      <CompetitorComparison />
    </div>
  );
}

export default App;
