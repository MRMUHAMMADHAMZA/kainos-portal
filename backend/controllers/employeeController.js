const db = require('../utils/jsonDb');

const populateJobRole = (employee) => {
  if (!employee || !employee.jobRole) return employee;
  const jr = db.findById('jobRoles', employee.jobRole);
  return {
    ...employee,
    jobRole: jr ? { _id: jr._id, name: jr.name, level: jr.level, capability: jr.capability } : null,
  };
};

const generateEmployeeNumber = () => {
  const employees = db.findAll('employees');
  let max = 0;
  for (const emp of employees) {
    const n = parseInt((emp.employeeNumber || '').replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `EMP${String(max + 1).padStart(3, '0')}`;
};

// GET /api/employees
exports.getEmployees = (req, res) => {
  try {
    let employees = db.findAll('employees');

    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      employees = employees.filter((e) =>
        e.name.toLowerCase().includes(s) ||
        e.role.toLowerCase().includes(s) ||
        (e.employeeNumber || '').toLowerCase().includes(s)
      );
    }

    employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    employees = employees.map(populateJobRole);
    res.json({ success: true, employees });
  } catch (err) {
    console.error('List employees error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
};

// GET /api/employees/:id
exports.getEmployeeById = (req, res) => {
  try {
    const employee = db.findById('employees', req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, employee: populateJobRole(employee) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch employee' });
  }
};

// POST /api/employees
exports.createEmployee = (req, res) => {
  try {
    const { name, address, salary, role, jobRole } = req.body;
    const employeeNumber = generateEmployeeNumber();
    const employee = db.create('employees', {
      employeeNumber, name, address,
      salary: Number(salary), role,
      jobRole: jobRole || null,
    });
    res.status(201).json({ success: true, message: 'Employee created successfully', employee: populateJobRole(employee) });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
};

// PUT /api/employees/:id
exports.updateEmployee = (req, res) => {
  try {
    const { name, address, salary, role, jobRole } = req.body;
    const existing = db.findById('employees', req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Employee not found' });

    const employee = db.updateById('employees', req.params.id, {
      name, address, salary: Number(salary), role, jobRole: jobRole || null,
    });
    res.json({ success: true, message: 'Employee updated successfully', employee: populateJobRole(employee) });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
};

// DELETE /api/employees/:id
exports.deleteEmployee = (req, res) => {
  try {
    const employee = db.deleteById('employees', req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
};
