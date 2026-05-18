import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../store/productSlice";
import ProductCard from "../components/common/ProductCard";
import EmptyState from "../components/common/EmptyState";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const BATTERY_TYPES = ["Li-ion", "Alkaline", "NiMH", "Lead-acid", "Lithium", "Khác"];
const SORT_OPTIONS = [
  { value: "-createdAt", label: "Mới nhất" },
  { value: "-sold", label: "Bán chạy" },
  { value: "price", label: "Giá thấp đến cao" },
  { value: "-price", label: "Giá cao đến thấp" },
  { value: "-discount", label: "Khuyến mãi nhiều" },
];

const SearchPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef(null);

  const { products, total, currentPage, listLoading, categories, hasMoreProducts } = useSelector(
    (state) => state.product
  );

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    batteryType: searchParams.get("batteryType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "-createdAt",
  });

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.batteryType) params.batteryType = filters.batteryType;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    return params;
  }, [filters]);

  const fetchPage = useCallback(
    (page, append = false) => {
      dispatch(fetchProducts({ ...queryParams, page, limit: 9, append }));
    },
    [dispatch, queryParams]
  );

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  useEffect(() => {
    setSearchParams(queryParams);
    fetchPage(1, false);
  }, [queryParams, setSearchParams, fetchPage]);

  useEffect(() => {
    if (!loadMoreRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || listLoading || !hasMoreProducts) return;
        fetchPage(currentPage + 1, true);
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [currentPage, fetchPage, hasMoreProducts, listLoading]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      batteryType: "",
      minPrice: "",
      maxPrice: "",
      sort: "-createdAt",
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Header />

      <section className="border-b border-[#d5dbe1] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-4xl font-bold text-[#191c1e]">Tìm kiếm sản phẩm</h1>
          <p className="mt-2 text-sm text-[#5a6168]">Lọc theo danh mục, giá, thương hiệu và loại pin.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-[#d5dbe1] bg-white p-5 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#191c1e]">Bộ lọc</h2>
            <button onClick={handleReset} className="text-xs font-semibold text-[#ba1a1a]">Đặt lại</button>
          </div>

          <input
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Tìm theo tên sản phẩm"
            className="mb-3 w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]"
          />

          <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)} className="mb-3 w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select value={filters.batteryType} onChange={(e) => handleFilterChange("batteryType", e.target.value)} className="mb-3 w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]">
            <option value="">Tất cả loại pin</option>
            {BATTERY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange("minPrice", e.target.value)} placeholder="Giá từ" className="w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]" />
            <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange("maxPrice", e.target.value)} placeholder="Giá đến" className="w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]" />
          </div>

          <select value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)} className="w-full rounded-lg border border-[#c6c6cd] px-3 py-2 text-sm outline-none focus:border-[#8dc63f]">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </aside>

        <main>
          <div className="mb-5 flex items-center justify-between border-b border-[#d5dbe1] pb-3">
            <p className="text-sm text-[#5a6168]">{`Tìm thấy ${total} sản phẩm`}</p>
          </div>

          {listLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-xl border border-[#d5dbe1] bg-white" />)}</div>
          ) : products.length === 0 ? (
            <EmptyState title="Không tìm thấy sản phẩm" message="Thử điều chỉnh bộ lọc để xem thêm kết quả." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>

              {listLoading && (
                <div className="mt-6 text-center text-sm text-[#5a6168]">Đang tải thêm sản phẩm...</div>
              )}

              {!hasMoreProducts && (
                <div className="mt-6 text-center text-sm font-medium text-[#5a6168]">Đã hiển thị tất cả sản phẩm phù hợp</div>
              )}

              <div ref={loadMoreRef} className="h-1 w-full" />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
