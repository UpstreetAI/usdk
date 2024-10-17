import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Button from '../components/Button';

describe('Button', () => {
  afterEach(() => cleanup());

  it('renders', () => {
    render(<Button data-testid="btn" />);
    const button = screen.getByTestId('btn');

    expect(button).toBeInTheDocument();
  });

  it('fires an event on onClick', () => {
    const fn = jest.fn();
    render(<Button onClick={fn} data-testid="btn" />);

    const button = screen.getByTestId('btn');
    fireEvent.click(button);
    expect(fn).toHaveBeenCalled();
  });

  it('renders the correct classes', () => {
    const fn = jest.fn();
    render(<Button variant="primary" onClick={fn} data-testid="p-btn" />);

    const pBtn = screen.getByTestId('p-btn');
    expect(pBtn).toHaveClass('nickderaj-button');
  });
});
