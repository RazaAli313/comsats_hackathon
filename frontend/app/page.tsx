import ProductCard from "../components/ProductCard";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default async function HomePage() {
  let items: any[] = [];
  try {
    const res = await fetch(`${BASE}/api/products?limit=8`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      items = data.items || [];
    }
  } catch (e) {
    items = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto py-24 lg:py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Trusted by 10,000+ shoppers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Shop
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Mart
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Discover <span className="text-emerald-300 font-semibold">premium products</span> with 
              blockchain-verified authenticity and seamless shopping experience
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-12">
              <a 
                href="/products" 
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <span>Start Shopping</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>

              <a 
                href="/about" 
                className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <span className="flex items-center space-x-3">
                  <span>Learn More</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/10">
              {[
                { icon: "🔒", text: "Secure Payments" },
                { icon: "🚚", text: "Fast Delivery" },
                { icon: "✓", text: "Quality Verified" },
                { icon: "🔄", text: "Easy Returns" }
              ].map((item) => (
                <div key={item.text} className="flex items-center space-x-3 text-white/80">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white/60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
            {[
              { icon: "⭐", title: "Premium Quality", desc: "Curated Selection" },
              { icon: "⚡", title: "Fast Shipping", desc: "2-3 Days Delivery" },
              { icon: "🛡️", title: "Secure Checkout", desc: "256-bit Encryption" },
              { icon: "💬", title: "24/7 Support", desc: "Always Available" }
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="font-semibold text-gray-900">{feature.title}</div>
                <div className="text-sm text-gray-600">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Featured Products
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of premium products with exceptional quality and design
            </p>
          </div>

          {/* Products Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Available</h3>
                <p className="text-gray-600">
                  We're currently updating our product collection. Check back soon for amazing deals!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((p: any) => (
                  <div key={p.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* View All CTA */}
              <div className="text-center mt-16">
                <a 
                  href="/products" 
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>View All Products</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Transform Your Shopping Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ShopMart for quality, security, and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors duration-300"
            >
              Start Shopping Now
            </a>
            <a 
              href="/about" 
              className="px-8 py-4 bg-transparent border border-white text-white rounded-2xl font-bold hover:bg-white/10 transition-colors duration-300"
            >
              Learn Our Story
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}