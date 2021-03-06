import React, {useState, useEffect, useRef} from 'react';
import {useParams, Redirect} from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import {useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {Button} from 'react-bootstrap';
import moment from 'moment';

import {selectLoggedIn} from '../state/authSlice';
import {parseResponse} from '../utils/api';
import {ServerInfo} from '../shared/server-info';
import {Select} from '../shared/select';
import {AddServer} from './add-server';
import {RemoveServer} from './remove-server';
import {RefreshServer} from './refresh-server';
import {Loading} from '../shared/loading';

import './server-list.css';
import {AddServerRequestButton} from "../shared/add-server-request";

const formatTimeseries = (timeseries) => {
  return [
    {
      name: 'Players',
      data: timeseries.map((res) => ({
        x: new Date(res.t),
        y: res.o,
      })),
    },
  ];
};

export const ServerList = () => {
  const history = useHistory();
  const {page} = useParams();
  const authenticated = useSelector(selectLoggedIn);

  const intervalId = useRef(null);

  const [totalPages, setTotalPages] = useState(0);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [showRemoveServerModal, setShowRemoveServerModal] = useState(false);
  const [showRefreshServerModal, setShowRefreshServerModal] = useState(false);

  const fetchBatch = () => {
    fetch(`${process.env.REACT_APP_BACKEND}/timeseries/batch?page=${page - 1}&pageSize=6&lt=${moment().format()}&gt=${moment().subtract(1, 'hours').format()}`)
      .then(parseResponse)
      .then((response) => {
        setServers(
          response.servers.map((server) => ({
            ...server,
              timeseries: formatTimeseries(server.timeseries)
          }))
        );
        setTotalPages(response.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err === null || err === undefined) {
          setError('Unknown error occurred');
          setLoading(false)
        } else {
          setLoading(err.toString());
          setLoading(false);
        }
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchBatch();
    intervalId.current = setInterval(fetchBatch, 60 * 1000);
    return () => clearInterval(intervalId.current);
  }, [page]);

  const onSearch = (e) => {
    if (e === null || e === undefined || e === '') return;
    history.push(`/servers/${e.value}`);
  };

  const onPageChange = (page) => {
    if (page + 1 !== page) setLoading(true);
    history.push(`/server-list/${page + 1}`);
  };

  return (
    <>
      {authenticated && (
        <div
          style={{
            maxHeight: '40px',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '15px',
            marginBottom: '-10px',
          }}
        >
          <Button className="ml-2" onClick={() => setShowAddServerModal(true)}>
            Add Server
          </Button>
          <Button
            className="ml-3"
            onClick={() => setShowRemoveServerModal(true)}
          >
            Remove Server
          </Button>
          <Button
            className="ml-3"
            onClick={() => setShowRefreshServerModal(true)}
          >
            Refresh Server
          </Button>

          <AddServer
            show={showAddServerModal}
            setShow={() => setShowAddServerModal(!showAddServerModal)}
          />

          <RemoveServer
            show={showRemoveServerModal}
            setShow={() => setShowRemoveServerModal(!showRemoveServerModal)}
          />

          <RefreshServer
            show={showRefreshServerModal}
            setShow={() => setShowRefreshServerModal(!showRefreshServerModal)}
          />
        </div>
      )}

      <div
        id="top-bar"
        className="container d-flex justify-content-center mt-5"
      >
        <div className="pagination">
          <ReactPaginate
            forcePage={page - 1}
            pageCount={totalPages}
            onPageChange={(e) => onPageChange(e.selected)}
          />

          <Select
            width="300px"
            className="search-bar"
            placeholder="Search..."
            isSearchable
            onChange={onSearch}
          />
        </div>
      </div>

      {loading ? (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Loading type="cubes"/>
        </div>
      ) : (
        <>
          <div id="servers">
            {servers.map((server) => (
              <ServerInfo
                server={server}
                key={server.name}
                updateTimeseries={false}
              />
            ))}
          </div>
          <div className='w-100 text-center mb-3'>
          <AddServerRequestButton className='add-server-request-m'/>
          </div>
        </>
      )}
    </>
  );
};
