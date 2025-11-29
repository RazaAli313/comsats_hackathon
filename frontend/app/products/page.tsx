"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string }>>([
    { id: "all", name: "All Products", icon: "🛍️" },
  ]);

  useEffect(() => {
    let mounted = true;
    api.getCategories().then((r: any) => {
      if (!mounted) return;
      const cats = r.categories || [];
      const mapped = [{ id: 'all', name: 'All Products', icon: '🛍️' }, ...cats.map((c: string) => ({ id: c, name: c.charAt(0).toUpperCase() + c.slice(1) }))];
      setCategories(mapped);
    }).catch(() => {});
    return () => { mounted = false }
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    const timeout = setTimeout(() => {
      api.getProducts({ 
        q: q || undefined, 
        sort: sort || undefined,
        category: category !== "all" ? category : undefined,
        min_price: priceRange[0],
        max_price: priceRange[1]
      })
        .then((r: any) => mounted && setItems(r.items || []))
        .catch(() => {})
        .finally(() => mounted && setLoading(false));
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [q, sort, category, priceRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/80 text-black backdrop-blur-xl border-b border-gray-200"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              ShopMart
            </motion.h1>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border text-black border-gray-300 rounded-xl hover:border-emerald-500 transition-colors duration-200"
              >
                <span>Filters</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Your Next
            <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Favorite Product
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated collection of premium products with quality you can trust
          </p>
        </motion.div>

        {/* Horizontal Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="w-full lg:w-auto overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                      category === cat.id
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                {/* <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option> */}
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                    </label>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹0</span>
                        <span>₹10,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="flex items-end space-x-4">
                    <button
                      onClick={() => {
                        setPriceRange([0, 10000]);
                        setCategory('all');
                        setSort('newest');
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors duration-200"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {items.length} Products
            </h2>
            <p className="text-gray-600">Quality products, curated for you</p>
          </div>
          <div className="flex items-center space-x-2 text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-semibold">Secure Shopping</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white text-black rounded-2xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                <div className="bg-gray-200 rounded-lg h-4 mb-2"></div>
                <div className="bg-gray-200 rounded-lg h-4 w-2/3 mb-4"></div>
                <div className="bg-gray-200 rounded-lg h-6 w-1/2"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key="products-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
              {items.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No products found</h3>
              <p className="text-gray-600 text-lg mb-8">
                {q ? `No results for "${q}". Try different keywords.` : 'No products match your current filters.'}
              </p>
              {(q || category !== 'all' || priceRange[1] < 10000) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setQ('');
                    setCategory('all');
                    setPriceRange([0, 10000]);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}