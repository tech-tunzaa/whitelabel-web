export type BillingHistoryItem = {
  id: number;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
};

export const mockBillingHistory: BillingHistoryItem[] = [
  {
    id: 1,
    date: '2023-05-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 2,
    date: '2023-06-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 3,
    date: '2023-07-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 4,
    date: '2023-08-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 5,
    date: '2023-09-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 6,
    date: '2023-10-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 7,
    date: '2023-11-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 8,
    date: '2023-12-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 9,
    date: '2024-01-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  },
  {
    id: 10,
    date: '2024-02-01',
    description: 'Monthly subscription',
    amount: '$49.99',
    status: 'paid'
  }
];
