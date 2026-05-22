import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import '../styles/job-roles.css';

const JobRolesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({ levels: [], capabilities: [] });
  const [filters, setFilters] = useState({ search: '', level: '', capability: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  const fetchRoles = (f = filters) => {
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');

    const params = {};
    if (f.search) params.search = f.search;
    if (f.level) params.level = f.level;
    if (f.capability) params.capability = f.capability;

    api.get('/job-roles', { params, signal: controller.signal })
      .then(({ data }) => { setRoles(data.jobRoles || []); setLoading(false); })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.message || 'Failed to load job roles');
        setLoading(false);
      });
  };

  useEffect(() => {
    api.get('/job-roles/meta')
      .then(({ data }) => setMeta({ levels: data.levels || [], capabilities: data.capabilities || [] }))
      .catch(() => {});
    fetchRoles();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);

    if (name === 'search') {
      // Debounce the search field to avoid an API call on every keystroke
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => fetchRoles(next), 350);
    } else {
      fetchRoles(next);
    }
  };

  const handleClear = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const cleared = { search: '', level: '', capability: '' };
    setFilters(cleared);
    fetchRoles(cleared);
  };

  const hasFilters = filters.search || filters.level || filters.capability;

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Job Roles</h1>
          <p className="page-sub">Browse all roles available at Kainos.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/job-roles/new')}>
            + Add Job Role
          </button>
        )}
      </div>

      <div className="filter-bar">
        <input
          type="search"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name or description…"
          className="form-control"
          aria-label="Search job roles"
        />
        <select
          name="level"
          value={filters.level}
          onChange={handleFilterChange}
          className="form-control"
          aria-label="Filter by level"
        >
          <option value="">All levels</option>
          {meta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          name="capability"
          value={filters.capability}
          onChange={handleFilterChange}
          className="form-control"
          aria-label="Filter by capability"
        >
          <option value="">All capabilities</option>
          {meta.capabilities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-outline" onClick={handleClear}>Clear</button>
        )}
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {!loading && !error && (
        <p className="results-count">
          {roles.length === 0
            ? 'No roles found'
            : `${roles.length} role${roles.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {loading ? (
        <div className="page-loading">Loading roles…</div>
      ) : roles.length === 0 ? (
        <div className="empty-state">
          <h3>No job roles found</h3>
          <p>
            {hasFilters
              ? 'Try adjusting your filters.'
              : isAdmin ? 'Click "Add Job Role" to create the first one.' : 'Check back later.'}
          </p>
        </div>
      ) : (
        <div className="role-grid">
          {roles.map((r) => (
            <article key={r._id} className="role-card">
              <div className="role-card-top">
                <span className="badge badge-level">{r.level}</span>
                <span className="badge badge-capability">{r.capability}</span>
              </div>
              <h3>
                <Link to={`/job-roles/${r._id}`}>{r.name}</Link>
              </h3>
              <p className="role-desc">
                {r.description.length > 160 ? r.description.slice(0, 160) + '…' : r.description}
              </p>
              <div className="role-card-actions">
                <Link to={`/job-roles/${r._id}`} className="btn-link">View details →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRolesList;
