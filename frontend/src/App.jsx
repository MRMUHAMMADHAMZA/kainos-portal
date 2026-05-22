import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import JobRolesList from './pages/JobRolesList';
import JobRoleDetail from './pages/JobRoleDetail';
import JobRoleForm from './pages/JobRoleForm';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';
import RequireAuth from './utils/RequireAuth';

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/job-roles" element={
            <RequireAuth><JobRolesList /></RequireAuth>
          } />
          <Route path="/job-roles/new" element={
            <RequireAuth adminOnly><JobRoleForm /></RequireAuth>
          } />
          <Route path="/job-roles/:id" element={
            <RequireAuth><JobRoleDetail /></RequireAuth>
          } />
          <Route path="/job-roles/:id/edit" element={
            <RequireAuth adminOnly><JobRoleForm /></RequireAuth>
          } />


          <Route path="/employees" element={
            <RequireAuth adminOnly><EmployeeList /></RequireAuth>
          } />
          <Route path="/employees/new" element={
            <RequireAuth adminOnly><EmployeeForm /></RequireAuth>
          } />
          <Route path="/employees/:id" element={
            <RequireAuth adminOnly><EmployeeDetail /></RequireAuth>
          } />
          <Route path="/employees/:id/edit" element={
            <RequireAuth adminOnly><EmployeeForm /></RequireAuth>
          } />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;