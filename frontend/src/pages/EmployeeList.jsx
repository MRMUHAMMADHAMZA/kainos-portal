import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import '../styles/job-roles.css';
import '../styles/employees.css';

const formatSalary = (s) => `£${Number(s).toLocaleString('en-GB')} p.a.`;

const EmployeeList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  const fetchEmployees = (q = search) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');

    const params = q ? { search: q } : {};
    api.get('/employees', { params, signal: controller.signal })
      .then(({ data }) => { setEmployees(data.employees || []); setLoading(false); })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.message || 'Failed to load employees');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => fetchEmployees(value), 350);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="page-sub">All Kainos employees.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
            + Add Employee
          </button>
        )}
      </div>

      <div className="filter-bar emp-filter-bar">
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, role or employee number…"
          className="form-control"
          aria-label="Search employees"
        />
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {!loading && !error && (
        <p className="results-count">
          {employees.length === 0
            ? 'No employees found'
            : `${employees.length} employee${employees.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {loading ? (
        <div className="page-loading">Loading employees…</div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <h3>No employees found</h3>
          <p>{search
            ? 'Try a different search term.'
            : isAdmin ? 'Click "Add Employee" to create the first one.' : 'Check back later.'}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp #</th>
                <th>Name</th>
                <th>Role</th>
                <th>Job Role</th>
                <th>Salary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td data-label="Emp #">
                    <span className="emp-number">{emp.employeeNumber}</span>
                  </td>
                  <td data-label="Name">
                    <Link to={`/employees/${emp._id}`} className="emp-name-link">
                      {emp.name}
                    </Link>
                  </td>
                  <td data-label="Role">{emp.role}</td>
                  <td data-label="Job Role">
                    {emp.jobRole ? (
                      <Link to={`/job-roles/${emp.jobRole._id}`} className="btn-link">
                        {emp.jobRole.name}
                      </Link>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td data-label="Salary">{formatSalary(emp.salary)}</td>
                  <td data-label="Actions" className="text-right">
                    <Link to={`/employees/${emp._id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
