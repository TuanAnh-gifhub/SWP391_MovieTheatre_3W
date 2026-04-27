import { useState, useEffect } from 'react';
import * as api from '../api/dashboard';

export function useDashboard(range = 'month', start, end) {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.getSummary(start, end),
      api.getRevenue(range, start, end),
      api.getSalesSummary(start, end),
      api.getCustomerAnalytics(start, end)
    ])
      .then(([sum, rev, sales, cust]) => {
        if (!mounted) return;
        setSummary(sum);
        setRevenue(rev);
        setSalesSummary(sales);
        setCustomers(cust);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [range, start, end]);

  return { summary, revenue, salesSummary, customers, loading, error };
}

