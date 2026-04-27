import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

export const getSummary = (from, to) =>
  api.get('/dashboard/summary', { params: { from, to } }).then(res => res.data);

export const getRevenue = (range = 'month', start, end) =>
  api.get('/dashboard/revenue', { params: { range, start, end } }).then(res => res.data);

export const getSalesSummary = (start, end) =>
  api.get('/dashboard/sales-summary', { params: { start, end } }).then(res => res.data);

export const exportSalesSummary = async (format = 'csv', start, end) => {
  const res = await api.get('/dashboard/sales-summary/export', {
    params: { format, start, end },
    responseType: 'blob'
  });
  return res.data;
};

export const getCustomerAnalytics = (start, end, sortBy, direction) =>
  api.get('/dashboard/customers', { params: { start, end, sortBy, direction } }).then(res => res.data);

