const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { employeeValidator } = require('../middleware/validate');
const {
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
} = require('../controllers/employeeController');

router.get('/',    protect, adminOnly, getEmployees);
router.get('/:id', protect, adminOnly, getEmployeeById);
router.post('/',    protect, adminOnly, employeeValidator, createEmployee);
router.put('/:id',  protect, adminOnly, employeeValidator, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
