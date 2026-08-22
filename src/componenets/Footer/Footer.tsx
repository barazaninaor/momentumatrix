import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-brand">MomentuMatrix</span>
          <span className="footer-copy">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="footer-right">
          <span className="footer-author">
            Created by <strong className="footer-name">Naor Barazani</strong>
          </span>
          <span className="footer-divider">|</span>
          <a href="mailto:barazaninaor@gmail.com" className="footer-email">
            barazaninaor@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};