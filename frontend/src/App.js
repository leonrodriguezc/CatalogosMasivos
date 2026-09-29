import React, { useState, useEffect, useCallback } from "react";

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCat, setCurrentCat] = useState("");
  const [catName, setCatName] = useState("");
  const [sortStrategy, setSortStrategy] = useState("relevance_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // Cargar estructura de categorias (una vez)
  // ==========================================
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setError("No se pudo conectar con el backend"));
  }, []);

  // ==========================================
  // Buscar productos cuando cambia categoria, estrategia o pagina
  // ==========================================
  useEffect(() => {
    if (!currentCat) {
      setProducts([]);
      setTotalPages(1);
      setTotalItems(0);
      setResponseTime(0);
      return;
    }

    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `http://localhost:5000/api/products/${currentCat}?sort=${sortStrategy}&page=${currentPage}&limit=4`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setResponseTime(data.responseTime);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error al cargar productos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [currentCat, sortStrategy, currentPage]);

  // ==========================================
  // Handlers de navegacion
  // ==========================================
  const selectCategory = useCallback((id, name) => {
    setCurrentCat(id);
    setCatName(name);
    setCurrentPage(1);
    setSortStrategy("relevance_desc");
  }, []);

  const changeSort = (newSort) => {
    setSortStrategy(newSort);
    setCurrentPage(1);
  };

  const goHome = () => {
    setCurrentCat("");
    setCatName("");
    setCurrentPage(1);
    setProducts([]);
    setResponseTime(0);
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f5f5f5" }}>

      {/* ============ SIDEBAR ============ */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#1a1a2e",
          color: "#eee",
          padding: "20px 0",
          flexShrink: 0
        }}
      >
        <h2 style={{ textAlign: "center", color: "#ffcc00", fontSize: "1.3em", marginBottom: "25px", padding: "0 15px" }}>
          Tienda Global
        </h2>

        <div
          onClick={goHome}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
            backgroundColor: !currentCat ? "#16213e" : "transparent",
            color: !currentCat ? "#ffcc00" : "#ccc",
            fontWeight: "bold",
            borderBottom: "1px solid #333",
            marginBottom: "10px"
          }}
        >
          Inicio
        </div>

        {categories.map((cat) => (
          <div key={cat.id}>
            <div
              onClick={() => selectCategory(cat.id, cat.name)}
              style={{
                padding: "12px 20px",
                cursor: "pointer",
                backgroundColor: currentCat === cat.id ? "#0f3460" : "transparent",
                color: currentCat === cat.id ? "#ffcc00" : "#ccc",
                fontWeight: "600",
                fontSize: "1em"
              }}
            >
              {cat.name}
            </div>

            {/* Subcategorias (Composite anidado) */}
            {cat.children && cat.children.map((sub) => (
              <div
                key={sub.id}
                onClick={() => selectCategory(sub.id, sub.name)}
                style={{
                  padding: "8px 35px",
                  cursor: "pointer",
                  backgroundColor: currentCat === sub.id ? "#0f3460" : "transparent",
                  color: currentCat === sub.id ? "#ffcc00" : "#999",
                  fontSize: "0.9em"
                }}
              >
                {sub.name}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <main style={{ flex: 1, padding: "30px", maxWidth: "1200px" }}>

        {/* Header con metricas */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "15px"
          }}
        >
          <h1 style={{ margin: 0, color: "#333" }}>
            {catName || "Bienvenido"}
          </h1>

          {currentCat && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Panel de metricas (para el video) */}
              <div style={{
                backgroundColor: "#e8f5e9",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #81c784",
                fontSize: "0.85em",
                color: "#2e7d32",
                fontWeight: "bold"
              }}>
                Tiempo: {responseTime} ms | Items: {totalItems} | Pagina {currentPage}/{totalPages}
              </div>

              {/* Selector de estrategia (Strategy pattern) */}
              <select
                value={sortStrategy}
                onChange={(e) => changeSort(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "0.9em",
                  cursor: "pointer"
                }}
              >
                <option value="relevance_desc">Relevancia</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="name_alpha">Nombre (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* VISTAS */}
        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ef5350",
            color: "#c62828",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Vista de inicio (sin categoria seleccionada) */}
        {!currentCat && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#666" }}>Explora nuestro catalogo</h2>
            <p style={{ color: "#999", fontSize: "1.1em" }}>
              Selecciona una categoria en la barra lateral para ver los productos.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => selectCategory(cat.id, cat.name)}
                  style={{
                    width: "160px",
                    height: "100px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "1.1em",
                    fontWeight: "600",
                    color: "#0f3460",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid de productos */}
        {currentCat && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2em", color: "#999" }}>
                Cargando productos...
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                gap: "25px",
                marginBottom: "30px"
              }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      backgroundColor: "#fff",
                      padding: "20px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                  >
                    <div style={{
                      height: "120px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#bbb",
                      fontSize: "0.9em"
                    }}>
                      Imagen
                    </div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1em", color: "#333" }}>
                      {p.name}
                    </h3>
                    <p style={{
                      margin: "0 0 10px 0",
                      fontSize: "1.4em",
                      fontWeight: "bold",
                      color: "#0f3460"
                    }}>
                      ${p.price}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8em", color: "#888" }}>
                      <span>Relevancia: {p.relevance}</span>
                      <span>Stock: {p.stock}</span>
                    </div>
                  </div>
                ))}

                {products.length === 0 && !loading && (
                  <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#999" }}>
                    No hay productos en esta categoria.
                  </p>
                )}
              </div>
            )}

            {/* Paginacion (Iterator) */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={btnStyle(currentPage === 1)}
                >
                  Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      ...btnStyle(false),
                      backgroundColor: currentPage === i + 1 ? "#0f3460" : "#fff",
                      color: currentPage === i + 1 ? "#ffcc00" : "#333"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={btnStyle(currentPage === totalPages)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Estilo reutilizable para botones
function btnStyle(disabled) {
  return {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: disabled ? "#e0e0e0" : "#fff",
    color: disabled ? "#aaa" : "#333",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.9em",
    fontWeight: "500"
  };
}

export default App;