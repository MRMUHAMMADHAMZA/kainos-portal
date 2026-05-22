import '../styles/footer.css';

const Footer = () => (
  <footer className="footer" role="contentinfo">
    <div className="footer-inner">
      <div className="footer-col">
        <h4>Kainos Portal</h4>
        <p>
          A single source of truth for Kainos job roles, employees, and recruitment.
          Built to make people's working lives a little easier.
        </p>
      </div>
      <div className="footer-col">
        <h4>Contact</h4>
        <ul>
          <li>Kainos Group plc</li>
          <li>4-6 Upper Crescent, Belfast BT7 1NT</li>
          <li><a href="mailto:info@kainos.com">info@kainos.com</a></li>
          <li>+44 (0)28 9057 1100</li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/login">Login</a></li>
          <li><a href="/register">Sign Up</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      &copy; {new Date().getFullYear()} Kainos. All rights reserved.
    </div>
  </footer>
);

export default Footer;