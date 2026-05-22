import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  validateName, validateRole, validateSalary,
  validateStreet, validateCity, validatePostcode,
} from '../utils/validators';
import '../styles/job-roles.css';
import '../styles/employees.css';

const EMPTY_FORM = {
  name: '', role: '', salary: '',
  address: { street: '', city: '', postcode: '' },
  jobRole: '',
};

const validate = (f) => {
  const e = {};
  const name = validateName(f.name, 'Full name');
  if (name) e.name = name;

  const role = validateRole(f.role);
  if (role) e.role = role;

  const salary = validateSalary(f.salary);
  if (salary) e.salary = salary;

  const street = validateStreet(f.address.street);
  if (street) e['address.street'] = street;

  const city = validateCity(f.address.city);
  if (city) e['address.city'] = city;

  const postcode = validatePostcode(f.address.postcode);
  if (postcode) e['address.postcode'] = postcode;

  return e;
};

const formatSalaryDisplay = (v) => {
  const n = Number(v);
  if (!v || isNaN(n)) return '';
  return `£${n.toLocaleString('en-GB')}`;
};

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [jobRoles, setJobRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/job-roles');
        setJobRoles(data.jobRoles || []);

        if (isEdit) {
          const { data: empData } = await api.get(`/employees/${id}`);
          const emp = empData.employee;
          setForm({
            name: emp.name,
            role: emp.role,
            salary: String(emp.salary),
            address: {
              street: emp.address.street,
              city: emp.address.city,
              postcode: emp.address.postcode,
            },
            jobRole: emp.jobRole?._id || '',
          });
        }
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Failed to load form data');
      } finally {
        setInitializing(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((f) => ({ ...f, address: { ...f.address, [field]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const next = validate(form);
    if (next[e.target.name]) {
      setErrors((errs) => ({ ...errs, [e.target.name]: next[e.target.name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const next = validate(form);
    if (Object.keys(next).length) { setErrors(next); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        salary: Number(form.salary),
        address: {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          postcode: form.address.postcode.trim().toUpperCase(),
        },
        jobRole: form.jobRole || null,
      };

      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
        navigate(`/employees/${id}`, { replace: true });
      } else {
        const { data } = await api.post('/employees', payload);
        navigate(`/employees/${data.employee._id}`, { replace: true });
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) setErrors(res.errors);
      else setSubmitError(res?.message || 'Failed to save employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return <div className="container page"><div className="page-loading">Loading…</div></div>;

  return (
    <div className="container page">
      <Link to={isEdit ? `/employees/${id}` : '/employees'} className="back-link">← Back</Link>

      <div className="form-card">
        <h1>{isEdit ? 'Edit employee' : 'Add a new employee'}</h1>
        <p className="page-sub">All fields except Job Role are required.</p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text" maxLength={100}
                value={form.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. Jane Smith"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                aria-invalid={!!errors.name} aria-describedby="name-error"
                autoComplete="name"
              />
              <span className="error-text" id="name-error" role="alert">{errors.name || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role / Job title</label>
              <input
                id="role" name="role" type="text" maxLength={100}
                value={form.role} onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. Software Engineer"
                className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                aria-invalid={!!errors.role} aria-describedby="role-error"
                autoComplete="organization-title"
              />
              <span className="error-text" id="role-error" role="alert">{errors.role || ''}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">
                Salary (£ per annum)
                {form.salary && !errors.salary && (
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>
                    {formatSalaryDisplay(form.salary)}
                  </span>
                )}
              </label>
              <input
                id="salary" name="salary" type="number" min="0" max="10000000" step="1"
                value={form.salary} onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. 45000"
                className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                aria-invalid={!!errors.salary} aria-describedby="salary-error"
              />
              <span className="error-text" id="salary-error" role="alert">{errors.salary || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="jobRole">Job Role <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <select
                id="jobRole" name="jobRole"
                value={form.jobRole} onChange={handleChange}
                className="form-control"
                aria-label="Select job role"
              >
                <option value="">— None —</option>
                {jobRoles.map((jr) => (
                  <option key={jr._id} value={jr._id}>{jr.name} ({jr.level})</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="address-fieldset">
            <legend>Address</legend>

            <div className="form-group">
              <label htmlFor="address.street">Street</label>
              <input
                id="address.street" name="address.street" type="text" maxLength={200}
                value={form.address.street} onChange={handleChange} onBlur={handleBlur}
                placeholder="e.g. 12 High Street"
                className={`form-control ${errors['address.street'] ? 'is-invalid' : ''}`}
                aria-invalid={!!errors['address.street']} aria-describedby="street-error"
                autoComplete="address-line1"
              />
              <span className="error-text" id="street-error" role="alert">{errors['address.street'] || ''}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  id="address.city" name="address.city" type="text" maxLength={100}
                  value={form.address.city} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g. Belfast"
                  className={`form-control ${errors['address.city'] ? 'is-invalid' : ''}`}
                  aria-invalid={!!errors['address.city']} aria-describedby="city-error"
                  autoComplete="address-level2"
                />
                <span className="error-text" id="city-error" role="alert">{errors['address.city'] || ''}</span>
              </div>

              <div className="form-group">
                <label htmlFor="address.postcode">Postcode</label>
                <input
                  id="address.postcode" name="address.postcode" type="text" maxLength={8}
                  value={form.address.postcode} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g. BT1 1AA"
                  className={`form-control ${errors['address.postcode'] ? 'is-invalid' : ''}`}
                  aria-invalid={!!errors['address.postcode']} aria-describedby="postcode-error"
                  autoComplete="postal-code"
                  style={{ textTransform: 'uppercase' }}
                />
                <span className="error-text" id="postcode-error" role="alert">{errors['address.postcode'] || ''}</span>
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <Link to={isEdit ? `/employees/${id}` : '/employees'} className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (isEdit ? 'Save changes' : 'Add employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
