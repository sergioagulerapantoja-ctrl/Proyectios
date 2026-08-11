"use client";

import { useMemo, useState } from "react";

type Operation = "Venta" | "Alquiler";
type View = "inicio" | "catalogo" | "detalle" | "carrito" | "acceso" | "cliente" | "vendedor" | "admin";
type Product = {
  id: number;
  name: string;
  category: string;
  style: "Casual" | "Formal";
  operation: Operation;
  price: number;
  city: string;
  size: string;
  color: string;
  condition: string;
  image: string;
  rating: number;
  reviews: number;
  material: string;
  seller: string;
  featured?: boolean;
};

const products: Product[] = [
  { id: 1, name: "Vestido Aura", category: "Vestidos", style: "Formal", operation: "Alquiler", price: 180, city: "Santa Cruz", size: "M", color: "Champán", condition: "Como nuevo", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviews: 28, material: "Satén italiano", seller: "Atelier Magnolia", featured: true },
  { id: 2, name: "Traje Noir", category: "Trajes", style: "Formal", operation: "Alquiler", price: 220, city: "La Paz", size: "L", color: "Negro", condition: "Excelente", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviews: 19, material: "Lana fría", seller: "Casa Sastre LP", featured: true },
  { id: 3, name: "Blusa Lino Suave", category: "Blusas", style: "Casual", operation: "Venta", price: 195, city: "Cochabamba", size: "S", color: "Marfil", condition: "Nuevo", image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviews: 14, material: "Lino y algodón", seller: "Luna Bohemia", featured: true },
  { id: 4, name: "Abrigo Camel", category: "Abrigos", style: "Formal", operation: "Venta", price: 680, city: "Sucre", size: "M", color: "Camel", condition: "Nuevo", image: "https://images.unsplash.com/photo-1548624149-f6c8905e7cde?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviews: 11, material: "Paño premium", seller: "Miska Estudio", featured: true },
  { id: 5, name: "Conjunto Terracota", category: "Conjuntos", style: "Casual", operation: "Venta", price: 340, city: "Tarija", size: "M", color: "Terracota", condition: "Nuevo", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85", rating: 4.6, reviews: 9, material: "Viscosa", seller: "Oliva Tarija" },
  { id: 6, name: "Vestido Ébano", category: "Vestidos", style: "Formal", operation: "Alquiler", price: 160, city: "Oruro", size: "S", color: "Negro", condition: "Excelente", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviews: 22, material: "Crepé", seller: "Noche de Gala" },
  { id: 7, name: "Camisa Oxford", category: "Camisas", style: "Casual", operation: "Venta", price: 210, city: "Potosí", size: "L", color: "Celeste", condition: "Nuevo", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85", rating: 4.5, reviews: 17, material: "Algodón Oxford", seller: "Altura Menswear" },
  { id: 8, name: "Tacones Siena", category: "Zapatos", style: "Formal", operation: "Alquiler", price: 90, city: "Beni", size: "38", color: "Arena", condition: "Como nuevo", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviews: 13, material: "Cuero vegano", seller: "Siena Closet" },
  { id: 9, name: "Chaqueta Urbana", category: "Chaquetas", style: "Casual", operation: "Venta", price: 390, city: "Pando", size: "M", color: "Oliva", condition: "Nuevo", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", rating: 4.6, reviews: 8, material: "Gabardina", seller: "Norte Concept" },
];

const cities = ["Santa Cruz", "La Paz", "Cochabamba", "Sucre", "Tarija", "Oruro", "Potosí", "Beni", "Pando"];
const categoryArt = [
  { name: "Casual", note: "Para todos los días", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85" },
  { name: "Formal", note: "Momentos memorables", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85" },
  { name: "En venta", note: "Hazla parte de tu clóset", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85" },
  { name: "En alquiler", note: "Estrena sin acumular", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85" },
];

const money = (value: number) => `Bs ${value.toLocaleString("es-BO")}`;

export default function RopaliaApp() {
  const [view, setView] = useState<View>("inicio");
  const [selected, setSelected] = useState<Product>(products[0]);
  const [cart, setCart] = useState<Product[]>([products[2], products[1]]);
  const [favorites, setFavorites] = useState<number[]>([4]);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openProduct = (product: Product) => { setSelected(product); navigate("detalle"); };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const addCart = (product: Product) => {
    if (!cart.some((item) => item.id === product.id)) setCart((items) => [...items, product]);
    notify(product.operation === "Venta" ? "Prenda agregada a tu carrito" : "Reserva agregada a tu carrito");
  };
  const toggleFavorite = (id: number) => {
    setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  return (
    <div className="app-shell">
      <Header view={view} cartCount={cart.length} search={search} setSearch={setSearch} navigate={navigate} />
      <main>
        {view === "inicio" && <Home navigate={navigate} openProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} />}
        {view === "catalogo" && <Catalog initialSearch={search} openProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} />}
        {view === "detalle" && <ProductDetail product={selected} addCart={addCart} favorites={favorites} toggleFavorite={toggleFavorite} openProduct={openProduct} />}
        {view === "carrito" && <Cart items={cart} setCart={setCart} notify={notify} navigate={navigate} />}
        {view === "acceso" && <Auth navigate={navigate} notify={notify} />}
        {view === "cliente" && <ClientDashboard openProduct={openProduct} />}
        {view === "vendedor" && <SellerDashboard notify={notify} />}
        {view === "admin" && <AdminDashboard />}
      </main>
      <Footer navigate={navigate} />
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Header({ view, cartCount, search, setSearch, navigate }: { view: View; cartCount: number; search: string; setSearch: (value: string) => void; navigate: (view: View) => void }) {
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); navigate("catalogo"); };
  return (
    <>
      <div className="top-note">Envíos a toda Bolivia · Alquila, disfruta y devuelve</div>
      <header className="site-header">
        <button className="logo-button" onClick={() => navigate("inicio")} aria-label="Ir al inicio"><img src="/ropalia-logo.svg" alt="Ropalia" /></button>
        <nav className="main-nav" aria-label="Navegación principal">
          <button className={view === "inicio" ? "active" : ""} onClick={() => navigate("inicio")}>Inicio</button>
          <button className={view === "catalogo" ? "active" : ""} onClick={() => navigate("catalogo")}>Comprar</button>
          <button onClick={() => navigate("catalogo")}>Alquilar</button>
          <button onClick={() => navigate("vendedor")}>Vender</button>
        </nav>
        <form className="header-search" onSubmit={submitSearch}>
          <span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar vestido, traje, talla..." aria-label="Buscar productos" />
        </form>
        <div className="header-actions">
          <button onClick={() => navigate("cliente")} aria-label="Favoritos">♡</button>
          <button className="cart-action" onClick={() => navigate("carrito")} aria-label="Carrito">♧<b>{cartCount}</b></button>
          <button className="account-action" onClick={() => navigate("acceso")}><span>◯</span><em>Mi cuenta</em></button>
        </div>
      </header>
      <div className="mobile-nav">
        <button onClick={() => navigate("inicio")}>Inicio</button><button onClick={() => navigate("catalogo")}>Explorar</button><button onClick={() => navigate("carrito")}>Carrito ({cartCount})</button><button onClick={() => navigate("acceso")}>Cuenta</button>
      </div>
    </>
  );
}

function Home({ navigate, openProduct, favorites, toggleFavorite }: { navigate: (view: View) => void; openProduct: (product: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void }) {
  return (
    <>
      <section className="hero section-pad">
        <div className="hero-copy">
          <span className="eyebrow">MODA CIRCULAR · BOLIVIA</span>
          <h1>Tu estilo,<br /><i>sin límites.</i></h1>
          <p>Compra piezas que amarás o alquila el look perfecto para ese momento especial. Moda más inteligente, cerca de ti.</p>
          <div className="hero-actions"><button className="btn dark" onClick={() => navigate("catalogo")}>Explorar prendas <span>→</span></button><button className="btn text" onClick={() => navigate("vendedor")}>Publicar una prenda</button></div>
          <div className="hero-trust"><span><b>2.500+</b> prendas</span><span><b>9 ciudades</b> conectadas</span><span><b>4.9/5</b> comunidad</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90" alt="Moda elegante en tonos neutros" /></div>
          <div className="floating-card top"><span className="dot"></span><div><b>Disponible hoy</b><small>En Santa Cruz</small></div></div>
          <div className="floating-card bottom"><b>Alquila desde</b><strong>Bs 80 <small>/ día</small></strong></div>
        </div>
      </section>

      <section className="intro-strip"><span>COMPRA</span><i>✦</i><span>ALQUILA</span><i>✦</i><span>VENDE</span><i>✦</i><span>RENUEVA TU ESTILO</span></section>

      <section className="section-pad discover">
        <div className="section-heading"><div><span className="eyebrow">ENCUENTRA TU LOOK</span><h2>Una prenda para<br /><i>cada momento</i></h2></div><button className="link-arrow" onClick={() => navigate("catalogo")}>Ver todo <span>→</span></button></div>
        <div className="category-grid">
          {categoryArt.map((item, index) => <button key={item.name} className={`category-card category-${index + 1}`} onClick={() => navigate("catalogo")}><img src={item.image} alt={item.name} /><span className="shade"></span><span className="category-copy"><small>{item.note}</small><b>{item.name}</b><em>→</em></span></button>)}
        </div>
      </section>

      <section className="featured-section section-pad">
        <div className="section-heading"><div><span className="eyebrow">SELECCIÓN ROPALIA</span><h2>Prendas que<br /><i>enamoran</i></h2></div><div className="tab-pills"><button className="selected">Destacados</button><button onClick={() => navigate("catalogo")}>Recién llegados</button><button onClick={() => navigate("catalogo")}>Más alquilados</button></div></div>
        <div className="product-grid">{products.filter((p) => p.featured).map((product) => <ProductCard key={product.id} product={product} openProduct={openProduct} favorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} />)}</div>
        <button className="btn outline center-btn" onClick={() => navigate("catalogo")}>Ver catálogo completo <span>→</span></button>
      </section>

      <section className="city-section section-pad">
        <div><span className="eyebrow light">CERCA DE TI</span><h2>La moda de Bolivia,<br /><i>en un solo lugar.</i></h2><p>Elige tu ciudad y descubre prendas disponibles cerca de ti. Menos distancia, más posibilidades.</p><div className="city-pills">{cities.map((city) => <button key={city} onClick={() => navigate("catalogo")}>{city}<span>↗</span></button>)}</div></div>
        <div className="bolivia-art"><div className="map-ring ring-a"></div><div className="map-ring ring-b"></div><div className="map-center"><b>9</b><span>ciudades</span><small>conectadas</small></div><span className="map-dot d1"></span><span className="map-dot d2"></span><span className="map-dot d3"></span><span className="map-dot d4"></span></div>
      </section>

      <section className="how-section section-pad"><div className="section-heading centered"><div><span className="eyebrow">ASÍ DE SIMPLE</span><h2>Tu próximo look en <i>3 pasos</i></h2></div></div><div className="steps"><div><span>01</span><b>Encuentra</b><p>Explora por estilo, ciudad, talla y ocasión.</p></div><i>→</i><div><span>02</span><b>Elige</b><p>Compra para siempre o alquila por los días que necesitas.</p></div><i>→</i><div><span>03</span><b>Disfruta</b><p>Recibe tu prenda, crea tu momento y luce increíble.</p></div></div></section>

      <section className="seller-cta section-pad"><div className="seller-photo"><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1100&q=85" alt="Clóset organizado" /></div><div className="seller-copy"><span className="eyebrow light">DALE UNA SEGUNDA VIDA</span><h2>Tu clóset puede<br /><i>trabajar por ti.</i></h2><p>Publica esas prendas especiales que ya no usas. Genera ingresos y ayuda a que la moda sea más sostenible.</p><button className="btn sand" onClick={() => navigate("vendedor")}>Quiero vender o alquilar <span>→</span></button><small>Publicar es gratis · Tú decides el precio</small></div></section>
    </>
  );
}

function ProductCard({ product, openProduct, favorite, toggleFavorite }: { product: Product; openProduct: (p: Product) => void; favorite: boolean; toggleFavorite: (id: number) => void }) {
  return <article className="product-card"><div className="product-image"><img src={product.image} alt={product.name} /><span className={`operation-badge ${product.operation === "Alquiler" ? "rent" : "sale"}`}>{product.operation}</span><button className={`heart ${favorite ? "liked" : ""}`} onClick={() => toggleFavorite(product.id)} aria-label="Guardar en favoritos">{favorite ? "♥" : "♡"}</button><button className="quick-view" onClick={() => openProduct(product)}>Vista rápida</button></div><div className="product-info"><div className="product-meta"><span>{product.category} · {product.city}</span><span>★ {product.rating}</span></div><h3>{product.name}</h3><div className="price-line"><b>{money(product.price)} {product.operation === "Alquiler" && <small>/ día</small>}</b><span>Talla {product.size}</span></div></div></article>;
}

function Catalog({ initialSearch, openProduct, favorites, toggleFavorite }: { initialSearch: string; openProduct: (p: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void }) {
  const [city, setCity] = useState("Todas");
  const [operation, setOperation] = useState("Todas");
  const [style, setStyle] = useState("Todos");
  const [sort, setSort] = useState("Recomendados");
  const filtered = useMemo(() => {
    let result = products.filter((p) => (!initialSearch || `${p.name} ${p.category}`.toLowerCase().includes(initialSearch.toLowerCase())) && (city === "Todas" || p.city === city) && (operation === "Todas" || p.operation === operation) && (style === "Todos" || p.style === style));
    if (sort === "Menor precio") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "Mayor precio") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [city, operation, style, sort, initialSearch]);
  return <div className="catalog-page section-pad"><div className="catalog-head"><span className="eyebrow">CATÁLOGO ROPALIA</span><h1>Encuentra algo <i>muy tú</i></h1><p>{filtered.length} prendas seleccionadas para comprar o alquilar en Bolivia.</p></div><div className="catalog-toolbar"><button className="filter-toggle">☷ Filtros</button><span>{filtered.length} resultados</span><label>Ordenar por <select value={sort} onChange={(e) => setSort(e.target.value)}><option>Recomendados</option><option>Menor precio</option><option>Mayor precio</option></select></label></div><div className="catalog-layout"><aside className="filters"><div className="filter-title"><b>Filtros</b><button onClick={() => { setCity("Todas"); setOperation("Todas"); setStyle("Todos"); }}>Limpiar</button></div><FilterSelect label="Ciudad" value={city} setValue={setCity} options={["Todas", ...cities]} /><FilterSelect label="Operación" value={operation} setValue={setOperation} options={["Todas", "Venta", "Alquiler"]} /><FilterSelect label="Estilo" value={style} setValue={setStyle} options={["Todos", "Casual", "Formal"]} /><div className="filter-block"><b>Rango de precio</b><div className="price-inputs"><input placeholder="Bs 0" /><span>—</span><input placeholder="Bs 800" /></div></div><div className="filter-block"><b>Talla</b><div className="size-buttons">{["XS", "S", "M", "L", "XL"].map((s) => <button key={s}>{s}</button>)}</div></div><div className="filter-block"><b>Disponibilidad</b><label className="check"><input type="checkbox" defaultChecked /> Disponible ahora</label></div></aside><div><div className="active-filters">{city !== "Todas" && <button onClick={() => setCity("Todas")}>{city} ×</button>}{operation !== "Todas" && <button onClick={() => setOperation("Todas")}>{operation} ×</button>}{style !== "Todos" && <button onClick={() => setStyle("Todos")}>{style} ×</button>}</div>{filtered.length ? <div className="product-grid catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} openProduct={openProduct} favorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} />)}</div> : <div className="empty-state"><span>◇</span><h3>No encontramos prendas con esos filtros</h3><p>Prueba con otra ciudad u operación.</p></div>}<div className="pagination"><button>←</button><button className="active">1</button><button>2</button><button>3</button><button>→</button></div></div></div></div>;
}

function FilterSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) { return <div className="filter-block"><b>{label}</b><select value={value} onChange={(e) => setValue(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></div>; }

function ProductDetail({ product, addCart, favorites, toggleFavorite, openProduct }: { product: Product; addCart: (p: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void; openProduct: (p: Product) => void }) {
  const [start, setStart] = useState("2026-08-15");
  const [end, setEnd] = useState("2026-08-17");
  const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
  const deposit = product.operation === "Alquiler" ? 300 : 0;
  return <div className="detail-page section-pad"><div className="breadcrumbs">Inicio / {product.category} / <b>{product.name}</b></div><div className="detail-grid"><div className="gallery"><div className="gallery-main"><img src={product.image} alt={product.name} /></div><div className="thumb-row"><button className="active"><img src={product.image} alt="Vista principal" /></button><button><img src={products[(product.id + 1) % products.length].image} alt="Vista alterna" /></button><button><img src={products[(product.id + 2) % products.length].image} alt="Detalle" /></button></div></div><div className="detail-copy"><div className="detail-topline"><span className={`operation-badge ${product.operation === "Alquiler" ? "rent" : "sale"}`}>{product.operation}</span><button className={`detail-heart ${favorites.includes(product.id) ? "liked" : ""}`} onClick={() => toggleFavorite(product.id)}>{favorites.includes(product.id) ? "♥ Guardado" : "♡ Guardar"}</button></div><span className="eyebrow">{product.category} · {product.style}</span><h1>{product.name}</h1><div className="rating"><b>★ {product.rating}</b><span>{product.reviews} opiniones</span><span>·</span><span className="available">● Disponible</span></div><div className="detail-price">{money(product.price)} {product.operation === "Alquiler" && <small>/ día</small>}</div><p className="description">Una pieza elegante y versátil, cuidadosamente seleccionada por Ropalia. Su caída favorecedora y acabado impecable la convierten en la elección ideal para una ocasión especial.</p><div className="spec-grid"><div><small>Talla</small><b>{product.size}</b></div><div><small>Color</small><b>{product.color}</b></div><div><small>Material</small><b>{product.material}</b></div><div><small>Estado</small><b>{product.condition}</b></div><div><small>Ciudad</small><b>{product.city}</b></div><div><small>Vendedor</small><b>{product.seller}</b></div></div>{product.operation === "Alquiler" && <div className="rental-box"><div className="rental-title"><div><b>Elige tus fechas</b><small>Disponible para reservar</small></div><span>▣</span></div><div className="date-row"><label>Desde<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Hasta<input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} /></label></div><div className="rental-calc"><span>{money(product.price)} × {days} días</span><b>{money(product.price * days)}</b></div><div className="rental-calc muted"><span>Depósito reembolsable</span><b>{money(deposit)}</b></div><div className="rental-total"><span>Total a pagar</span><b>{money(product.price * days + deposit)}</b></div></div>}<button className="btn dark detail-cta" onClick={() => addCart(product)}>{product.operation === "Venta" ? "Agregar al carrito" : "Reservar estas fechas"}<span>→</span></button><div className="protection"><span>♢</span><div><b>Compra protegida por Ropalia</b><small>Pago seguro y asistencia durante todo el proceso.</small></div></div></div></div><section className="related"><div className="section-heading"><div><span className="eyebrow">TAMBIÉN PODRÍA GUSTARTE</span><h2>Completa tu <i>look</i></h2></div></div><div className="product-grid">{products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} openProduct={openProduct} favorite={favorites.includes(p.id)} toggleFavorite={toggleFavorite} />)}</div></section></div>;
}

function Cart({ items, setCart, notify, navigate }: { items: Product[]; setCart: (items: Product[]) => void; notify: (message: string) => void; navigate: (view: View) => void }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.operation === "Alquiler" ? 3 : 1), 0);
  const deposits = items.filter((item) => item.operation === "Alquiler").length * 300;
  return <div className="cart-page section-pad"><div className="catalog-head compact"><span className="eyebrow">TU SELECCIÓN</span><h1>Carrito y <i>reservas</i></h1></div><div className="cart-layout"><div className="cart-items">{items.length ? items.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} /><div className="cart-item-info"><span className={`operation-badge ${item.operation === "Alquiler" ? "rent" : "sale"}`}>{item.operation}</span><h3>{item.name}</h3><p>{item.city} · Talla {item.size} · {item.color}</p>{item.operation === "Alquiler" && <div className="cart-dates">15 Ago 2026 → 17 Ago 2026 · 3 días</div>}<button onClick={() => setCart(items.filter((p) => p.id !== item.id))}>Eliminar</button></div><b className="cart-item-price">{money(item.price * (item.operation === "Alquiler" ? 3 : 1))}</b></article>) : <div className="empty-state"><span>◇</span><h3>Tu carrito está esperando un gran look</h3><button className="btn dark" onClick={() => navigate("catalogo")}>Explorar prendas</button></div>}</div><aside className="summary"><h3>Resumen</h3><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Depósitos reembolsables</span><b>{money(deposits)}</b></div><div><span>Envío</span><b className="green">Gratis</b></div><div className="summary-total"><span>Total</span><b>{money(subtotal + deposits)}</b></div><label className="coupon"><input placeholder="Código promocional" /><button>Aplicar</button></label><button className="btn dark" disabled={!items.length} onClick={() => notify("Pedido confirmado. Te enviamos los detalles por correo.")}>Confirmar pedido <span>→</span></button><p>▣ Pago seguro · Datos protegidos</p></aside></div></div>;
}

function Auth({ navigate, notify }: { navigate: (view: View) => void; notify: (message: string) => void }) {
  const [register, setRegister] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); notify(register ? "Cuenta creada correctamente" : "Bienvenida de nuevo, Camila"); navigate("cliente"); };
  return <div className="auth-page"><div className="auth-art"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85" alt="Perchero con ropa" /><div><img src="/ropalia-logo.svg" alt="Ropalia" /><h2>Moda que circula.<br />Estilo que permanece.</h2></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="eyebrow">{register ? "ÚNETE A ROPALIA" : "HOLA DE NUEVO"}</span><h1>{register ? "Crea tu cuenta" : "Bienvenida de vuelta"}</h1><p>{register ? "Compra, alquila o publica prendas en minutos." : "Ingresa para seguir descubriendo tu estilo."}</p>{register && <div className="split-fields"><label>Nombre<input required placeholder="Camila" /></label><label>Apellido<input required placeholder="Rojas" /></label></div>}<label>Correo electrónico<input type="email" required placeholder="tu@correo.com" /></label>{register && <div className="split-fields"><label>Teléfono<input required placeholder="700 00000" /></label><label>Ciudad<select><option>Santa Cruz</option>{cities.slice(1).map((city) => <option key={city}>{city}</option>)}</select></label></div>}<label>Contraseña<input type="password" required minLength={6} placeholder="Mínimo 6 caracteres" /></label>{!register && <button type="button" className="forgot">¿Olvidaste tu contraseña?</button>}<button className="btn dark auth-submit" type="submit">{register ? "Crear mi cuenta" : "Iniciar sesión"} <span>→</span></button><div className="auth-switch">{register ? "¿Ya tienes una cuenta?" : "¿Aún no eres parte?"} <button type="button" onClick={() => setRegister(!register)}>{register ? "Inicia sesión" : "Regístrate gratis"}</button></div><small>Al continuar aceptas nuestros Términos y Política de privacidad.</small></form><div className="demo-roles"><span>Vista demo:</span><button onClick={() => navigate("cliente")}>Cliente</button><button onClick={() => navigate("vendedor")}>Vendedor</button><button onClick={() => navigate("admin")}>Administrador</button></div></div></div>;
}

function ClientDashboard({ openProduct }: { openProduct: (p: Product) => void }) {
  return <DashboardShell role="Cliente" active="Resumen"><div className="dash-greeting"><div><span className="eyebrow">MI CUENTA</span><h1>Hola, Camila <i>♡</i></h1><p>Aquí tienes todo lo que está pasando con tus prendas.</p></div><button className="btn outline">Editar perfil</button></div><div className="stats-grid"><Stat label="Pedidos activos" value="2" note="1 llega mañana" /><Stat label="Alquileres" value="3" note="1 devolución pendiente" /><Stat label="Favoritos" value="12" note="3 bajaron de precio" /><Stat label="Reseñas" value="8" note="Gracias por compartir" /></div><section className="dash-section"><div className="dash-title"><h2>Reservas activas</h2><button>Ver historial →</button></div><div className="reservation-card"><img src={products[0].image} alt={products[0].name} /><div><span className="status confirmed">Confirmada</span><h3>Vestido Aura</h3><p>15–17 Ago · Santa Cruz · Reserva #RP-2048</p></div><div className="reservation-progress"><span className="done"></span><span className="done"></span><span></span><small>Confirmada</small><small>Entrega</small><small>Devolución</small></div><button className="btn outline" onClick={() => openProduct(products[0])}>Ver detalle</button></div></section><section className="dash-section"><div className="dash-title"><h2>Guardados para ti</h2><button>Ver favoritos →</button></div><div className="mini-products">{products.slice(3, 6).map((p) => <button key={p.id} onClick={() => openProduct(p)}><img src={p.image} alt={p.name} /><span><b>{p.name}</b><small>{money(p.price)}</small></span></button>)}</div></section></DashboardShell>;
}

function SellerDashboard({ notify }: { notify: (message: string) => void }) {
  return <DashboardShell role="Vendedor" active="Resumen"><div className="dash-greeting"><div><span className="eyebrow">PANEL DE VENDEDOR</span><h1>Tu clóset <i>crece</i></h1><p>Gestiona publicaciones, reservas e ingresos desde un solo lugar.</p></div><button className="btn dark" onClick={() => notify("Formulario de nueva prenda preparado")}>＋ Publicar prenda</button></div><div className="stats-grid"><Stat label="Ingresos este mes" value="Bs 2.840" note="↑ 18% vs. julio" /><Stat label="Prendas activas" value="24" note="3 pendientes de aprobación" /><Stat label="Reservas" value="7" note="2 requieren atención" /><Stat label="Valoración" value="4.9" note="42 opiniones" /></div><section className="dash-section"><div className="dash-title"><h2>Prendas publicadas</h2><button>Ver todas →</button></div><div className="data-table"><div className="table-row table-head"><span>Prenda</span><span>Operación</span><span>Estado</span><span>Precio</span><span></span></div>{products.slice(0, 4).map((p, i) => <div className="table-row" key={p.id}><span className="table-product"><img src={p.image} alt={p.name} /><b>{p.name}</b></span><span>{p.operation}</span><span className={`status ${i === 2 ? "pending" : "confirmed"}`}>{i === 2 ? "En revisión" : "Activa"}</span><span><b>{money(p.price)}</b></span><button>•••</button></div>)}</div></section><section className="dash-section"><div className="dash-title"><h2>Reservas por atender</h2></div><div className="alert-card"><span>!</span><div><b>2 entregas programadas para esta semana</b><p>Revisa los datos de entrega y confirma que las prendas estén listas.</p></div><button className="btn dark">Revisar reservas</button></div></section></DashboardShell>;
}

function AdminDashboard() {
  return <DashboardShell role="Administrador" active="General"><div className="dash-greeting"><div><span className="eyebrow">ADMINISTRACIÓN</span><h1>Ropalia en <i>tiempo real</i></h1><p>Visión general de la comunidad y las operaciones.</p></div><div className="admin-date">11 de agosto, 2026</div></div><div className="stats-grid"><Stat label="Usuarios" value="3.842" note="↑ 126 este mes" /><Stat label="Publicaciones" value="2.516" note="34 por revisar" /><Stat label="Transacciones" value="Bs 94.2K" note="↑ 12,4% este mes" /><Stat label="Reservas activas" value="187" note="6 con incidencia" /></div><div className="admin-grid"><section className="dash-section chart-card"><div className="dash-title"><h2>Actividad de la plataforma</h2><select><option>Últimos 6 meses</option></select></div><div className="bar-chart">{[42, 58, 51, 72, 67, 91].map((value, i) => <div key={i}><span style={{ height: `${value}%` }}></span><small>{["Mar", "Abr", "May", "Jun", "Jul", "Ago"][i]}</small></div>)}</div></section><section className="dash-section city-ranking"><div className="dash-title"><h2>Ciudades con más actividad</h2></div>{["Santa Cruz", "La Paz", "Cochabamba", "Sucre"].map((city, i) => <div key={city}><span><b>{i + 1}</b>{city}</span><strong>{[34, 28, 19, 11][i]}%</strong></div>)}</section></div><section className="dash-section"><div className="dash-title"><h2>Publicaciones pendientes</h2><button>Gestionar todas →</button></div><div className="data-table"><div className="table-row table-head"><span>Producto</span><span>Vendedor</span><span>Fecha</span><span>Precio</span><span>Acción</span></div>{products.slice(5, 8).map((p) => <div className="table-row" key={p.id}><span className="table-product"><img src={p.image} alt={p.name} /><b>{p.name}</b></span><span>{p.seller}</span><span>10 Ago 2026</span><span>{money(p.price)}</span><span className="review-actions"><button>✓</button><button>×</button></span></div>)}</div></section></DashboardShell>;
}

function DashboardShell({ role, active, children }: { role: string; active: string; children: React.ReactNode }) { const links = role === "Administrador" ? ["General", "Usuarios", "Productos", "Categorías", "Transacciones", "Reportes"] : role === "Vendedor" ? ["Resumen", "Mis prendas", "Pedidos", "Reservas", "Ingresos", "Disponibilidad"] : ["Resumen", "Compras", "Alquileres", "Favoritos", "Reseñas", "Mi perfil"]; return <div className="dashboard"><aside className="dash-sidebar"><img src="/ropalia-logo.svg" alt="Ropalia" /><div className="role-tag">{role}</div><nav>{links.map((link, i) => <button className={link === active ? "active" : ""} key={link}><span>{["⌂", "♧", "◇", "♡", "☆", "○"][i]}</span>{link}</button>)}</nav><div className="dash-user"><span>CR</span><div><b>Camila Rojas</b><small>camila@ropalia.bo</small></div></div></aside><div className="dash-content">{children}</div></div>; }
function Stat({ label, value, note }: { label: string; value: string; note: string }) { return <div className="stat-card"><span>{label}</span><b>{value}</b><small>{note}</small></div>; }

function Footer({ navigate }: { navigate: (view: View) => void }) { return <footer><div className="footer-main section-pad"><div className="footer-brand"><img src="/ropalia-logo.svg" alt="Ropalia" /><p>Moda que se adapta a ti.<br />Compra, alquila y dale nueva vida a cada prenda.</p><div className="socials"><button>ig</button><button>f</button><button>tk</button></div></div><div><b>Explora</b><button onClick={() => navigate("catalogo")}>Comprar</button><button onClick={() => navigate("catalogo")}>Alquilar</button><button onClick={() => navigate("catalogo")}>Novedades</button><button onClick={() => navigate("catalogo")}>Ciudades</button></div><div><b>Tu cuenta</b><button onClick={() => navigate("cliente")}>Mis pedidos</button><button onClick={() => navigate("cliente")}>Mis alquileres</button><button onClick={() => navigate("cliente")}>Favoritos</button><button onClick={() => navigate("vendedor")}>Publicar prenda</button></div><div><b>Ayuda</b><button>Cómo funciona</button><button>Pagos y envíos</button><button>Devoluciones</button><button>Contáctanos</button></div><div className="newsletter"><b>Un poco de estilo en tu correo</b><p>Novedades, inspiración y prendas que te encantarán.</p><label><input type="email" placeholder="tu@correo.com" /><button>→</button></label></div></div><div className="footer-bottom section-pad"><span>© 2026 Ropalia. Hecho con cariño en Bolivia.</span><span>Privacidad · Términos · Cookies</span><span>BOB · Español</span></div></footer>; }
