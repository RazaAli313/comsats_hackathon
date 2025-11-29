"use client";

import { motion } from "framer-motion";
import AddToCartButton from "./AddToCartButton";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const id = product.id ?? product._id ?? (product._id && String(product._id));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = product.image || (product.images && product.images.length ? product.images[0] : null) || product.image_url || product.images?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <div className="aspect-w-16 aspect-h-12 h-56 w-full">
          {imageUrl ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full"
                  />
                </div>
              )}
              <motion.img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Stock & Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <motion.span 
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
              product.stock > 0 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-red-500 text-white shadow-sm'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {product.stock > 0 ? `✓ ${product.stock} left` : 'Out of stock'}
          </motion.span>
          
          {product.isNew && (
            <motion.span 
              className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold shadow-sm"
              whileHover={{ scale: 1.05 }}
            >
              NEW
            </motion.span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:text-emerald-600 hover:bg-white transition-all duration-300 shadow-lg"
              title="Add to wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
            
            <motion.a
              href={`/product/${id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl font-semibold hover:text-emerald-600 hover:bg-white transition-all duration-300 shadow-lg"
            >
              Quick View
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex flex-col h-full">
          <div className="flex-1 mb-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <div className="font-bold text-2xl text-emerald-600">
                ₹{product.price}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {product.stock > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <AddToCartButton 
                    productId={id} 
                    price={product.price}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                </motion.div>
              )}
              
              <motion.a
                href={`/product/${id}`}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="View details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}