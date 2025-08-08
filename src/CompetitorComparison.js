import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CompetitorComparison = () => {
  const [input, setInput] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompetitors = async () => {
    const names = input.split(',').map(name => name.trim()).filter(Boolean);
    if (!names.length) return;

    setLoading(true);
    setData([]);

    const results = [];

    for (let name of names) {
      try {
        const res = await axios.get(`https://youtube-analytics-bcknd.onrender.com/channel`, {
          params: { name },
        });

        const videos = res.data.videos;
        const stats = res.data.channel.statistics;

        const avgViews =
          videos.length > 0
            ? videos.reduce((sum, vid) => sum + parseInt(vid.statistics.viewCount || 0), 0) /
              videos.length
            : 0;

        const avgEngagement =
          videos.length > 0
            ? videos.reduce((sum, vid) => {
                const likes = parseInt(vid.statistics.likeCount || 0);
                const comments = parseInt(vid.statistics.commentCount || 0);
                const views = parseInt(vid.statistics.viewCount || 0);
                return sum + (likes + comments) / (views || 1);
              }, 0) / videos.length
            : 0;

        results.push({
          name: res.data.channel.snippet.title,
          subscribers: parseInt(stats.subscriberCount),
          avgViews: Math.round(avgViews),
          engagementRate: +(avgEngagement * 100).toFixed(2),
        });
      } catch (err) {
        console.error(`Error fetching data for ${name}`, err.message);
      }
    }

    setData(results);
    setLoading(false);
  };

  const formatMillions = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num;
  };

  return (
    <div style={{ marginTop: '50px', textAlign: 'left' }}>
      <h2>📊 Competitor Comparison</h2>
      <p>Enter competitor channel names (comma-separated):</p>
      <input
        type="text"
        placeholder="e.g. MrBeast, Linus Tech Tips"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          padding: '10px',
          width: '80%',
          marginRight: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      <button
        onClick={fetchCompetitors}
        style={{
          padding: '10px 20px',
          backgroundColor: '#d40000',
          color: 'white',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Compare
      </button>

      {loading && <p>Loading...</p>}

      {data.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <defs>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#990000" />
            </linearGradient>
          </defs>

          <h3>Subscribers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" tickFormatter={formatMillions} />
              <Tooltip formatter={(value) => formatMillions(value)} />
              <Bar dataKey="subscribers" fill="url(#redGradient)" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Average Views per Video</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" tickFormatter={formatMillions} />
              <Tooltip formatter={(value) => formatMillions(value)} />
              <Bar dataKey="avgViews" fill="url(#redGradient)" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Average Engagement Rate (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip formatter={(value) => value + '%'} />
              <Bar dataKey="engagementRate" fill="url(#redGradient)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CompetitorComparison;
