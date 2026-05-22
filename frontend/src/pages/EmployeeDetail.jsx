import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import '../styles/job-roles.css';
import '../styles/employees.css';

const formatSalary = (s) => `£${Number(s).toLocaleString('en-GB')} p.a.`;

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmployee(data.employee);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${id}`);
      navigate('/employees', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="container page"><div className="page-loading">Loading…</div></div>;
  if (error) return (
    <div className="container page">
      <div className="alert alert-error" role="alert">{error}</div>
      <Link to="/employees" className="btn btn-outline">← Back to employees</Link>
    </div>
  );
  if (!employee) return null;

  return (
    <div className="container page">
      <Link to="/employees" className="back-link">← Back to employees</Link>

      <div className="detail-card">
        <div className="detail-top">
          <span className="badge badge-level">{employee.employeeNumber}</span>
          {employee.jobRole && (
            <span className="badge badge-capability">{employee.jobRole.name}</span>
          )}
        </div>

        <h1>{employee.name}</h1>

        <div className="emp-detail-grid">
          <div className="emp-detail-item">
            <h3>Role</h3>
            <p>{employee.role}</p>
          </div>

          <div className="emp-detail-item">
            <h3>Salary</h3>
            <p className="emp-salary">{formatSalary(employee.salary)}</p>
          </div>

          <div className="emp-detail-item">
            <h3>Address</h3>
            <address className="emp-address">
              <span>{employee.address.street}</span>
              <span>{employee.address.city}</span>
              <span>{employee.address.postcode.toUpperCase()}</span>
            </address>
          </div>

          {employee.jobRole && (
            <div className="emp-detail-item">
              <h3>Job Role</h3>
              <p>
                <Link to={`/job-roles/${employee.jobRole._id}`} className="btn-link">
                  {employee.jobRole.name}
                </Link>
                {' '}
                <span className="text-muted">({employee.jobRole.level} · {employee.jobRole.capability})</span>
              </p>
            </div>
          )}
        </div>

        <div className="detail-meta">
          <span>Added: {new Date(employee.createdAt).toLocaleDateString()}</span>
          {employee.updatedAt !== employee.createdAt && (
            <span> · Last updated: {new Date(employee.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {isAdmin && (
          <div className="detail-actions">
            <Link to={`/employees/${employee._id}/edit`} className="btn btn-primary">Edit</Link>
            <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal-card">
            <h2 id="confirm-title">Delete this employee?</h2>
            <p>
              This will permanently delete <strong>{employee.name}</strong> ({employee.employeeNumber}).
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
