import { useState, useEffect } from 'react'
import './allProducts.css'
import product_sonicpro from '../../assets/product_sonicpro.png'
import product_vase from '../../assets/product_vase.png'
import product_keyboard from '../../assets/product_keyboard.png'
import product_watch from '../../assets/product_watch.png'
import product_skincare from '../../assets/product_skincare.png'
import product_backpack from '../../assets/product_backpack.png'
import { Link } from 'react-router-dom'

const staticProducts = [
  {
    id: 1001,
    badge: "NEW",
    image: `${product_sonicpro}`,
    name: "SonicPro Wireless...",
    rating: 4.8,
    description: "Premium noise-canceling headphones with 40-hour battery",
    price: 299.0,
  },
  {
    id: 1002,
    image: `${product_vase}`,
    name: "Nordic Ceramic Vase Set",
    rating: 4.9,
    description: "Hand-crafted artisan vases with a textured matte finish for modern...",
    price: 85.0,
  },
  {
    id: 1003,
    badge: "-20%",
    image: `${product_keyboard}`,
    name: "CyberType Mechanical...",
    rating: 4.7,
    description: "Compact 65% layout with hot-swappable switches and...",
    price: 144.0,
    oldPrice: 180.0,
  },
  {
    id: 1004,
    image: `${product_watch}`,
    name: "Horizon Smartwatch Gen 4",
    rating: 4.6,
    description: "Advanced health tracking and 7-day battery life in a slim, durable...",
    price: 249.0,
  },
  {
    id: 1005,
    image: `${product_skincare}`,
    name: "Essence Glow Skincare Set",
    rating: 5.0,
    description: "A curated 3-step routine for radiant skin, featuring our...",
    price: 120.0,
  },
  {
    id: 1006,
    image: `${product_backpack}`,
    name: "Urban Commuter Backpack",
    rating: 4.5,
    description: "Weather-resistant tech backpack with dedicated laptop sleeve and...",
    price: 155.0,
  },
];

const PRODUCTS_PER_PAGE = 6;
const TOTAL_PAGES = 8; // عدد الصفحات اللي شايفها في التصميم

export function AllProducts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState(staticProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // صفحة 1 = المنتجات الـ static، مفيش داعي للـ fetch
    if (currentPage === 1) {
      setProducts(staticProducts);
      return;
    }

    // من صفحة 2 وما فوق، هات من DummyJSON
    // بنطرح صفحة واحدة عشان صفحة 2 تجيب أول batch من الـ API (skip = 0)
    const skip = (currentPage - 2) * PRODUCTS_PER_PAGE;

    setLoading(true);
    fetch(`https://dummyjson.com/products?limit=${PRODUCTS_PER_PAGE}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        // بنحول شكل بيانات DummyJSON لنفس الشكل اللي الكارد بتاعنا مستنياه
        const mapped = data.products.map((p) => ({
          id: p.id,
          badge: p.discountPercentage > 10 ? `-${Math.round(p.discountPercentage)}%` : null,
          image: p.thumbnail,
          name: p.title,
          rating: p.rating,
          description: p.description,
          price: p.price,
        }));
        setProducts(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, [currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > TOTAL_PAGES) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="products-page">
        {/* Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h4>CATEGORY</h4>
            <label><input type="checkbox" /> Electronics</label>
            <label><input type="checkbox" defaultChecked /> Fashion</label>
            <label><input type="checkbox" /> Home & Living</label>
            <label><input type="checkbox" /> Beauty</label>
          </div>

          <div className="filter-group">
            <h4>PRICE RANGE</h4>
            <div className="price-range">
              <span>$0</span>
              <span>$1,000+</span>
            </div>
          </div>

          <div className="filter-group">
            <h4>RATING</h4>
            <div>★★★★☆ & Up</div>
          </div>

          <div className="filter-group">
            <h4>BRAND</h4>
            <select>
              <option>All Brands</option>
            </select>
          </div>

          <button className="clear-filters">Clear Filters</button>
        </aside>

        {/* Main content */}
        <main className="products-main">
          <div className="products-header">
            <h2>All Products</h2>
            <span className="results-count">
              Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
              {currentPage * PRODUCTS_PER_PAGE} of {TOTAL_PAGES * PRODUCTS_PER_PAGE} results
            </span>
            <div className="sort-by">
              <label>Sort by:</label>
              <select>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="products-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.id}`} style={{textDecoration:"none" , color:"#000"}}>
                  <div className="product-image">
                    {p.badge && (
                      <span className={`badge ${p.badge.includes("-") ? "discount" : "new"}`}>
                        {p.badge}
                      </span>
                    )}
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{p.name}</h3>
                      <span className="rating">★ {p.rating}</span>
                    </div>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-footer">
                      <div className="price">
                        {p.oldPrice && <span className="old-price">${p.oldPrice.toFixed(2)}</span>}
                        <span className="current-price">${p.price.toFixed(2)}</span>
                      </div>
                      <button className="add-btn">🛒 Add</button>
                    </div>
                  </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="pagination">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              ‹
            </button>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? "active" : ""}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === TOTAL_PAGES}>
              ›
            </button>
          </div>
        </main>
      </div>
    </>
  );
}