import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Card, Row, Col, message, Badge, Typography,Spin } from 'antd';
import './LiveEvents.css';

const { Title, Text } = Typography;

const LiveEvents = () => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleFetchLiveEvents = async () => {
    setLoading(true);
    setError('');
    setLiveEvents([]);

    try {
      await axios.post('http://localhost:5000/update-live-events');
      const response = await axios.get('http://localhost:5000/live-events');
      setLiveEvents(response.data);
      message.success('Live events fetched successfully!');
    } catch (err) {
      setError('Failed to fetch live events. Please try again later.');
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChannel = async () => {
    setSearchError('');
    if (!searchChannel.trim()) {
      setSearchError('Please enter a channel URL.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/update-channel-events', {
        channelUrl: searchChannel,
      });
      const response = await axios.get('http://localhost:5000/channel-events', {
        params: { channelUrl: searchChannel },
      });
      setLiveEvents([response.data]);
      message.success('Channel events fetched successfully!');
    } catch (err) {
      setSearchError(
        err.response?.status === 404
          ? 'Channel not found.'
          : 'Failed to update or fetch channel events. Please try again.'
      );
      console.error('Error:', err.message);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const getVideoId = (liveStatus) => {
    const match = liveStatus.match(/watch\?v=([^)]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <Title level={2} className="dashboard-title">
          Live Events Dashboard
        </Title>

        {/* Search Bar */}
        <Row gutter={[16, 16]} className="search-bar">
          <Col flex="auto">
            <Input
              placeholder="Enter YouTube channel URL"
              value={searchChannel}
              onChange={(e) => setSearchChannel(e.target.value)}
            />
          </Col>
          
          <Col>
            <Button type="primary" onClick={handleSearchChannel}>
              Search Channel
            </Button>
          </Col>
        </Row>
        {searchError && <Text type="danger">{searchError}</Text>}
        <Spin spinning={loading} tip="Loading..."></Spin>

        {/* Fetch All Events Button */}
        <Button
          type="primary"
          loading={loading}
          onClick={handleFetchLiveEvents}
          style={{ marginTop: '16px' }}
        >
          {loading ? 'Fetching Events...' : 'Fetch Live Events'}
        </Button>
        <Spin spinning={loading} tip="Loading..."></Spin>
        {error && <Text type="danger" style={{ display: 'block', marginTop: '16px' }}>{error}</Text>}

        {/* Events Cards */}
        <Row gutter={[16, 16]} className="cards-container">
          {liveEvents.map((channel) => (
            <Col key={channel._id} xs={24} sm={12} md={8}>
              <Card
                title={channel.channel.replace('https://www.youtube.com/@', '@')}
                bordered={false}
                style={{ background: 'linear-gradient(to right, #e3f2fd, #bbdefb)', borderRadius: '8px' }}
              >
                {channel.availableEvents.map((event) => (
                  <Card
                    key={event._id}
                    style={{
                      marginBottom: '12px',
                      background: '#f3faff',
                      border: '1px solid #90caf9',
                      borderRadius: '8px',
                    }}
                  >
                    <Title level={5}>{event.event_title}</Title>
                    <p>
                      <Text strong>Status:</Text>{' '}
                      <Badge
                        color={
                          event.live_status.includes('Join now') ? 'green' : 'orange'
                        }
                        text={
                          event.live_status.includes('Join now')
                            ? 'Live Now'
                            : 'Scheduled'
                        }
                      />
                    </p>
                    <p>
                      <Text strong>Date:</Text> {formatDate(event.date)}
                    </p>
                    {event.live_status.includes('Join now') && (
                      <Button
                        type="link"
                        href={`https://www.youtube.com/watch?v=${getVideoId(event.live_status)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="red-gradient-button"
                      >
                        Watch Live
                      </Button>
                    )}
                  </Card>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default LiveEvents;