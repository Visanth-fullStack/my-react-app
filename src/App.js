import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Spinner from './spinner/Spinner';

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [warningMessage, setWarningMessage] = useState('');
  const searchBoxRef = useRef(null);

  useEffect(() => {
      if (query) {
          fetchResults();
      } else {
          setResults([]);
          setTotalPages(1);
      }
  }, [query, currentPage, itemsPerPage]);

  const fetchResults = async () => {
      setLoading(true);
      try {
          const options = {
              method: 'GET',
              url: process.env.REACT_APP_API_URL,
              params: {
                  namePrefix: query,
                  countryIds: 'IN',
                  offset: (currentPage - 1) * itemsPerPage,
                  limit: itemsPerPage
              },
              headers: {
                  'x-rapidapi-host': process.env.REACT_APP_RAPIDAPI_HOST,
                  'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY
              }
          };

          const response = await axios.request(options);
          const data = response.data;
          setResults(data.data);
          setTotalPages(Math.ceil(data.metadata.totalCount / itemsPerPage));
      } catch (error) {
          console.error('Error fetching data:', error);
          setResults([]);
          setTotalPages(1);
      } finally {
          setLoading(false);
      }
  };

  const handleSearch = (event) => {
      event.preventDefault();
      setCurrentPage(1);
      setQuery(searchBoxRef.current.value);
  };

  const handleItemsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 10) {
        setWarningMessage('Items per page cannot exceed 10.');
    } else {
        setWarningMessage('');
        setItemsPerPage(value);
    }
};

  const handlePagination = (newPage) => {
      setCurrentPage(newPage);
  };

  useEffect(() => {
      const handleKeyDown = (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === '/') {
              event.preventDefault();
              searchBoxRef.current.focus();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, []);

  return (
      <div className="app">
          <form onSubmit={handleSearch}>
              <input
                  type="text"
                  id="search-box"
                  ref={searchBoxRef}
                  placeholder="Search places..."
                  disabled={loading}
              />
              <span className='clickkey'> Ctrl + /</span>
          </form>
          {loading && <Spinner/>}
          <table id="results-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Place Name</th>
                      <th>Country</th>
                  </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr>
                          <td colSpan="3">Loading...</td>
                      </tr>
                  ) : results.length === 0 ? (
                      <tr>
                          <td colSpan="3">{query ? 'No result found' : 'Start searching'}</td>
                      </tr>
                  ) : (
                      results.map((result, index) => (
                          <tr key={result.id}>
                              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td>{result.city}</td>
                              <td>
                                  <img
                                      src={`https://countryflagsapi.com/png/${result.countryCode}`}
                                      alt={result.country}
                                      style={{ width: '20px', marginRight: '10px' }}
                                  />
                                  {result.country}
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
          {results.length > 0 && (
              <div id="pagination">
                  <button onClick={() => handlePagination(currentPage - 1)} disabled={currentPage === 1}>
                      Previous
                  </button>
                  <span>{`Page ${currentPage} of ${totalPages}`}</span>
                  <button onClick={() => handlePagination(currentPage + 1)} disabled={currentPage === totalPages}>
                      Next
                  </button>
              </div>
          )}
          <div id="limit-input-container">
              <label htmlFor="limit-input">Items per page:</label>
              <input
                  type="number"
                  id="limit-input"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  min="1"
                  max="10"
              />
          </div>
          {warningMessage && <span className="warning-message">{warningMessage}</span>}
      </div>
  );
};


export default App;
