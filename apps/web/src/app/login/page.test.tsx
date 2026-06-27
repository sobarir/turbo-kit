import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

// Reference test for a page/feature component. Shows the patterns agents need:
// - mock Next.js navigation (next/navigation) and app contexts (useAuth)
// - drive the form via userEvent
// - assert the happy path AND the error/loading states (not just happy path)

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const login = vi.fn();
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ login }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    push.mockClear();
    login.mockReset();
  });

  it('logs in and redirects to the dashboard on success', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(undefined);
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(login).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret123',
    });
    expect(push).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error message and does not redirect on failure', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    // Error state is shown to the user...
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    // ...and we did NOT navigate away.
    expect(push).not.toHaveBeenCalled();
  });
});
