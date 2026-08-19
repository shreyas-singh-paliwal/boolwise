import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

// The real verify badge always says "input combinations agree" — narrower than
// bare /Verified/i, which also matches unrelated prose ("...all verified against
// each other.") in the header subtitle and the circuit-library intro text.
const BADGE_TEXT = /input combinations agree/i;

describe('MinimizerPage', () => {
  it('renders and generates from the default truth table', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(screen.getByRole('heading', { name: /Boolean Function Minimizer/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Minimize & Build Circuits/i }));
    expect(await screen.findByText(BADGE_TEXT)).toBeTruthy();
  });

  it('generates from an expression and shows matching SOP', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('tab', { name: 'Expression' }));
    const input = screen.getByLabelText(/Boolean expression/i);
    await user.type(input, "A'B + AC' + BC");
    await user.click(screen.getByRole('button', { name: /Minimize & Build Circuits/i }));
    expect(await screen.findByText(BADGE_TEXT)).toBeTruthy();
    expect(screen.getByText(/F = B \+ AC'/)).toBeTruthy();
  }, 10000);

  it('shows an error on bad expression input, does not crash', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('tab', { name: 'Expression' }));
    await user.click(screen.getByRole('button', { name: /Minimize & Build Circuits/i }));
    expect(await screen.findByText(/Enter an expression/i)).toBeTruthy();
  });

  it('minterms + dont-cares mode works and verifies', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('tab', { name: 'Minterms / Maxterms' }));
    await user.selectOptions(screen.getByLabelText(/Number of variables/i), '4');
    await user.type(screen.getByLabelText(/Minterm indices/i), '1,3,5,7,9,11,13,15');
    await user.click(screen.getByRole('button', { name: /Minimize & Build Circuits/i }));
    expect(await screen.findByText(BADGE_TEXT)).toBeTruthy();
    expect(screen.getByText('F = D')).toBeTruthy();
  }, 10000);

  it('editable truth table cell cycles 0 -> 1 -> X -> 0', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const cells = document.querySelectorAll('td.outcell');
    const cell = cells[0];
    expect(cell.textContent).toBe('0');
    await user.click(cell);
    expect(document.querySelectorAll('td.outcell')[0].textContent).toBe('1');
    await user.click(document.querySelectorAll('td.outcell')[0]);
    expect(document.querySelectorAll('td.outcell')[0].textContent).toBe('X');
    await user.click(document.querySelectorAll('td.outcell')[0]);
    expect(document.querySelectorAll('td.outcell')[0].textContent).toBe('0');
  });
});

describe('CircuitLibraryPage', () => {
  it('renders half adder by default with Sum + Cout sections verified', async () => {
    renderAt('/circuits');
    expect(screen.getByRole('tab', { name: 'Half Adder' })).toBeTruthy();
    expect(await screen.findByText('Output: Sum')).toBeTruthy();
    expect(screen.getByText('Output: Cout')).toBeTruthy();
    const badges = screen.getAllByText(BADGE_TEXT);
    expect(badges.length).toBe(2); // one per output
  });

  it('switches to multiplier and shows 4 output sections', async () => {
    const user = userEvent.setup();
    renderAt('/circuits');
    await user.click(screen.getByRole('tab', { name: '2-bit × 2-bit Multiplier' }));
    expect(await screen.findByText('Output: P0')).toBeTruthy();
    expect(screen.getByText('Output: P1')).toBeTruthy();
    expect(screen.getByText('Output: P2')).toBeTruthy();
    expect(screen.getByText('Output: P3')).toBeTruthy();
    expect(screen.getAllByText(BADGE_TEXT).length).toBe(4);
  });

  it('switches to full subtractor and verifies both outputs', async () => {
    const user = userEvent.setup();
    renderAt('/circuits');
    await user.click(screen.getByRole('tab', { name: 'Full Subtractor' }));
    expect(await screen.findByText('Output: Diff')).toBeTruthy();
    expect(screen.getByText('Output: Bout')).toBeTruthy();
    const badges = screen.getAllByText(BADGE_TEXT);
    expect(badges.length).toBe(2);
  });

  it('combined truth table shows all output columns', async () => {
    renderAt('/circuits');
    await screen.findByText('Output: Sum');
    const headerRow = document.querySelector('table.tt thead tr');
    expect(headerRow.textContent).toBe('ABSumCout');
  });
});
