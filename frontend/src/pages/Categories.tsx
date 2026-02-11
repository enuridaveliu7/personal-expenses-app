import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Category, TransactionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: TransactionType.EXPENSE,
    color: '#3b82f6',
  });
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color || '#3b82f6',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: TransactionType.EXPENSE,
        color: '#3b82f6',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: TransactionType.EXPENSE,
      color: '#3b82f6',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(
    (cat) => filterType === 'ALL' || cat.type === filterType
  );

  const incomeCategories = filteredCategories.filter((cat) => cat.type === TransactionType.INCOME);
  const expenseCategories = filteredCategories.filter(
    (cat) => cat.type === TransactionType.EXPENSE
  );

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your income and expense categories</p>

          {/* TOTAL COUNT */}
          <p className="text-sm text-gray-400 mt-1">
            {categories.length} total categories
          </p>
        </div>

        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilterType('ALL')}
        >
          All
        </Button>
        <Button
          variant={filterType === TransactionType.INCOME ? 'default' : 'outline'}
          onClick={() => setFilterType(TransactionType.INCOME)}
        >
          Income
        </Button>
        <Button
          variant={filterType === TransactionType.EXPENSE ? 'default' : 'outline'}
          onClick={() => setFilterType(TransactionType.EXPENSE)}
        >
          Expenses
        </Button>
      </div>

     
      <div className="bg-white p-6 rounded-xl shadow-sm">

        <div className="grid gap-6 md:grid-cols-2">

          {incomeCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-green-600">Income Categories</h2>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {expenseCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Expense Categories</h2>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No categories found. Create your first category to get started.
          </CardContent>
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TransactionType })
                    }
                    required
                  >
                    <option value={TransactionType.INCOME}>Income</option>
                    <option value={TransactionType.EXPENSE}>Expense</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Update' : 'Create'}
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

export default Categories;
