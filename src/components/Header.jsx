import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div>
        <h1>BoolWise</h1>
        <p className="subtitle">
        In Minimizer, enter a function as a truth table, minterms/maxterms, or an expression to minimze and analyze the function and related circuits.
        </p>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Boolean Function Minimizer
          </NavLink>
          <NavLink to="/circuits" className={({ isActive }) => (isActive ? 'active' : '')}>
            Arithmetic Circuits
          </NavLink>
        </nav>
      </div>
      <ThemeToggle />
    </header>
  );
}
