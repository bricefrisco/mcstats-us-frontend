import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { parseResponse } from '../../utils';
import { Chart } from '../chart';

import './server.css';

const getTimespan = (timespan) => {
  if (timespan === '1h') return moment().subtract(1, 'hours').format();
  if (timespan === '1d') return moment().subtract(24, 'hours').format();
  if (timespan === '1w') return moment().subtract(1, 'week').format();
  if (timespan === '1m') return moment().subtract(1, 'months').format();
  if (timespan === '2m') return moment().subtract(2, 'months').format();
};

const formatTimeseries = (timeseries) => [
  {
    name: 'Players',
    data: timeseries.map((res) => ({
      x: new Date(res.date),
      y: res.playersOnline,
    })),
  },
];

const fetchTimeseries = (serverName, selectedTimespan) => {
  return fetch(
    `${
      process.env.REACT_APP_BACKEND
    }/timeseries?serverName=${serverName}&lt=${moment().format()}&gt=${getTimespan(
      selectedTimespan
    )}`
  )
    .then(parseResponse)
    .then(formatTimeseries);
};

export const ServerChart = ({
  serverName,
  selectedTimespan,
  height,
  width,
  className,
}) => {
  const [timeseries, setTimeseries] = useState([]);
  const [intervalPointer, setIntervalPointer] = useState();
  const [error, setError] = useState();

  const getTimeseries = () => {
    fetchTimeseries(serverName, selectedTimespan)
      .then(setTimeseries)
      .catch((err) => {
        if (err === null || err === undefined) {
          setError('Unknown error occurred');
        } else {
          setError(err.toString());
        }
      });
  };

  useEffect(() => {
    getTimeseries();
    setIntervalPointer(setInterval(getTimeseries, 60 * 1000));
    return () => clearInterval(intervalPointer);
  }, [serverName, selectedTimespan]);

  return (
    <div className={className}>
      {timeseries.length > 0 ? (
        <Chart data={timeseries} height={height} width={width} />
      ) : (
        <div style={{ width: `${width}px`, height: `${height}px` }} />
      )}
    </div>
  );
};

export const ServerInfo = ({ server }) => {
  const [selectedTimespan, setSelectedTimespan] = useState('1h');

  return (
    <div className="server">
      <div className="server-info">
        <div className="d-flex">
          <img
            src={server.image}
            alt={`${server.name} favicon`}
            style={{ width: '64px', height: '64px' }}
          />
          <div className="ml-2">
            <h3
              style={{ fontSize: '1.17em' }}
              className="mt-0 mb-0 server-name"
            >
              <Link to={`/servers/${server.name}`} className="link">
                {server.name}
              </Link>
            </h3>
            <h3 style={{ fontSize: '1.0em' }} className="mt-1 mb-1">
              {server.address}
            </h3>
            <span className="mt-1 mb-1" style={{ fontSize: '0.95em' }}>
              Players: {server.players}
            </span>
          </div>
        </div>

        <div className="timespan-selection-container">
          <span
            className={
              selectedTimespan === '1h'
                ? 'timespan-selection selected'
                : 'timespan-selection'
            }
            onClick={() => setSelectedTimespan('1h')}
          >
            1H
          </span>

          <span
            className={
              selectedTimespan === '1d'
                ? 'timespan-selection selected'
                : 'timespan-selection'
            }
            onClick={() => setSelectedTimespan('1d')}
          >
            1D
          </span>

          <span
            className={
              selectedTimespan === '1w'
                ? 'timespan-selection selected'
                : 'timespan-selection'
            }
            onClick={() => setSelectedTimespan('1w')}
          >
            1W
          </span>

          <span
            className={
              selectedTimespan === '1m'
                ? 'timespan-selection selected'
                : 'timespan-selection'
            }
            onClick={() => setSelectedTimespan('1m')}
          >
            1M
          </span>

          <span
            className={
              selectedTimespan === '2m'
                ? 'timespan-selection selected'
                : 'timespan-selection'
            }
            onClick={() => setSelectedTimespan('2m')}
          >
            2M
          </span>
        </div>
      </div>

      <ServerChart
        serverName={server.name}
        selectedTimespan={selectedTimespan}
        height={150}
        width={500}
      />
    </div>
  );
};