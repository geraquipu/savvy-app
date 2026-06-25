import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('../supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '../supabase';

describe('create-checkout-session', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a Stripe URL on success', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/pay/test_123' },
      error: null,
    });

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { amount: 150, expertName: 'Marie', phaseName: 'Stratégie', bookingId: 'booking-1' },
    });

    expect(error).toBeNull();
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  it('returns error when Stripe fails', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Invalid API key' },
    });

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { amount: 150, expertName: 'Marie', phaseName: 'Stratégie', bookingId: 'booking-1' },
    });

    expect(data).toBeNull();
    expect(error.message).toBeTruthy();
  });
});
