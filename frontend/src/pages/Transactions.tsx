import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Transaction, Category, TransactionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, X, Download, Table, Grid } from 'lucide-react';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    title: '',
    type: '' as TransactionType | '',
    categoryId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  // Debounce the title filter (1 second delay)
  const debouncedTitle = useDebounce(filters.title, 1000);

  // Create debounced filters object (memoized to prevent infinite loops)
  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      title: debouncedTitle,
    }),
    [filters.type, filters.categoryId, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, debouncedTitle]
  );

  const [formData, setFormData] = useState({
    categoryId: '',
    type: TransactionType.EXPENSE,
    amount: '',
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, debouncedFilters.type, debouncedFilters.categoryId, debouncedFilters.startDate, debouncedFilters.endDate, debouncedFilters.minAmount, debouncedFilters.maxAmount, debouncedFilters.title]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount.toString(),
        title: transaction.title,
        description: transaction.description || '',
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        categoryId: '',
        type: TransactionType.EXPENSE,
        amount: '',
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      handleCloseModal();
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete transaction');
    }
  };

  const handleExport = async (format: 'csv' | 'txt') => {
    try {
      const params: any = {};
      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get(`/export/${format}`, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export transactions');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const filteredCategories = categories.filter(
    (cat) => !formData.type || cat.type === formData.type
  );

  if (loading && transactions.length === 0) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('txt')}>
            <Download className="h-4 w-4 mr-2" />
            Export TXT
          </Button>
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}>
            {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <Table className="h-4 w-4" />}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search by Title</Label>
              <Input
                placeholder="Search..."
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    title: '',
                    type: '',
                    categoryId: '',
                    startDate: '',
                    endDate: '',
                    minAmount: '',
                    maxAmount: '',
                  });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="p-4">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                      <td className="p-4">{transaction.title}</td>
                      <td className="p-4">{transaction.category?.name || 'N/A'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            transaction.type === TransactionType.INCOME
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-right font-bold ${
                          transaction.type === TransactionType.INCOME
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === TransactionType.INCOME ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{transaction.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">
                      {transaction.category?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transaction.type === TransactionType.INCOME
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span
                      className={`text-lg font-bold ${
                        transaction.type === TransactionType.INCOME
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground mt-2">{transaction.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {transactions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No transactions found. Create your first transaction to get started.
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.type}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          type: e.target.value as TransactionType,
                          categoryId: '',
                        });
                      }}
                      required
                    >
                      <option value={TransactionType.INCOME}>Income</option>
                      <option value={TransactionType.EXPENSE}>Expense</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <select
                      id="categoryId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTransaction ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Transactions;
