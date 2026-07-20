import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { ProductWithInventory } from '../lib/types';

const categories = ['All', 'Casual', 'Formal'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'High to Low' },
  { value: 'popular', label: 'Popular' },
];

export function SearchScreen() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`*, inventory:inventory(*)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setProducts(data as ProductWithInventory[]);
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.color?.toLowerCase().includes(searchLower) ||
          p.fabric?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    switch (sortBy) {
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => (a.is_featured ? -1 : 1));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, search, selectedCategory, sortBy]);

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId);
    if (result.success) {
      showToast('Added to cart!', 'success');
    } else {
      showToast(result.error || 'Failed to add', 'error');
    }
  };

  const activeFilters =
    selectedCategory !== 'All' ? 1 : 0 + (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Search" />

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shirts..."
            className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              activeFilters > 0
                ? 'bg-primary-50 border-primary-500 text-primary-600'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {activeFilters > 0 && (
              <span className="ml-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowSort(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white"
          >
            <span className="text-sm text-gray-600">
              {sortOptions.find((o) => o.value === sortBy)?.label}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSortBy('newest');
              }}
              className="text-sm text-link mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} products
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowFilters(false)}
            className="w-full mt-6"
          >
            Apply Filters
          </Button>
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal isOpen={showSort} onClose={() => setShowSort(false)} title="Sort By">
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setShowSort(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg ${
                sortBy === option.value
                  ? 'bg-primary-50 text-primary-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
