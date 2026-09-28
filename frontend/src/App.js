import React, { useState, useEffect } from 'react';

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCat, setCurrentCat] = useState('');
  const [sortStrategy, setSortStrategy] = useState('relevance_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // NUEVO: Estado para la métrica de tiempo
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentCat) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${currentCat}?sort=${sortStrategy}&page=${currentPage}`);
        const data = await response.json();
        
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setResponseTime(data.responseTime); // <--- CAPTURAMOS LA MÉTRICA
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCat, sortStrategy, currentPage]);

  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif' }}>
      {/* SIDEBAR */}
      <div style={{ width: '240px', backgroundColor: '#1a1a1a', color: 'white', padding: '20px', minHeight: '100vh' }}>
        <h3>Categorías</h3>
        {categories.map(cat => (
          <div 
            key={cat.id} 
            onClick={() => { setCurrentCat(cat.id); setCurrentPage(1); }}
            style={{ 
              padding: '10px', cursor: 'pointer', 
              backgroundColor: currentCat === cat.id ? '#333' : 'transparent',
              color: currentCat === cat.id ? '#ffcc00' : 'white'
            }}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Catálogo</h2>
          
          {/* PANEL DE MÉTRICAS (PARA EL VIDEO) */}
          {currentCat && (
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px 20px', borderRadius: '8px', border: '1px solid #90caf9' }}>
              <span style={{ fontSize: '0.85em', color: '#1976d2', fontWeight: 'bold' }}>
                ⚡ Latencia de Procesamiento: {responseTime} ms
              </span>
            </div>
          )}
        </div>

        {currentCat && (
          <div style={{ marginBottom: '20px' }}>
            <label>Ordenar por: </label>
            <select onChange={(e) => { setSortStrategy(e.target.value); setCurrentPage(1); }} value={sortStrategy}>
              <option value="relevance_desc">Relevancia</option>
              <option value="price_asc">Precio: Más bajo</option>
              <option value="name_alpha">Nombre (A-Z)</option>
            </select>
          </div>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map(p => (
              <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px' }}>
                <h4>{p.name}</h4>
                <p><b>${p.price}</b></p>
                <p style={{ fontSize: '0.8em', color: '#666' }}>Relevancia: {p.relevance}</p>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;