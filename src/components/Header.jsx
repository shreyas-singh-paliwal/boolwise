import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div>
        <h1>BoolWise</h1>
        <p className="subtitle">
        In Minimizer, enter a function as a truth table, minterms/maxterms, or an expression : get the minimized form and Basic Gates (AND/OR/NOT), NAND-only and NOR-only circuits, all verified against each other.
        </p>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Boolean Function Minimizer
          </NavLink>
          <NavLink to="/circuits" className={({ isActive }) => (isActive ? 'active' : '')}>
            Adders / Subtractors / Multiplier
          </NavLink>
        </nav>
      </div>
      <ThemeToggle />
    </header>
  );
}
