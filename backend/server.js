const express = require('express');
const cors = require('cors');
const { performance } = require('perf_hooks'); // Importante para las métricas
const app = express();

app.use(cors());
app.use(express.json());

// [EL MISMO OBJETO 'catalog' QUE YA TIENES...]
const catalog = {
  id: "root",
  name: "Tienda Global S.A.",
  type: "category",
  children: [
    {
      id: "elec",
      name: "Electrónica",
      type: "category",
      children: [
        { 
          id: "comp", 
          name: "Computación", 
          type: "category", 
          children: [
            { id: "p1", name: "Laptop Pro 15\"", price: 1200, relevance: 95, stock: 10, type: "product" },
            { id: "p2", name: "Mouse Gamer RGB", price: 85, relevance: 82, stock: 150, type: "product" },
            { id: "p3", name: "Monitor UltraWide", price: 450, relevance: 90, stock: 20, type: "product" }
          ]
        },
        { 
          id: "cell", 
          name: "Smartphones", 
          type: "category", 
          children: [
            { id: "p4", name: "iPhone 15 Pro", price: 999, relevance: 98, stock: 50, type: "product" },
            { id: "p5", name: "Galaxy S24", price: 850, relevance: 88, stock: 70, type: "product" }
          ]
        }
      ]
    },
    { 
      id: "home", 
      name: "Departamento Hogar", 
      type: "category", 
      children: [
        { id: "p6", name: "Robot Aspirador", price: 300, relevance: 75, stock: 12, type: "product" },
        { id: "p7", name: "Sofá Modulo Gris", price: 1500, relevance: 85, stock: 8, type: "product" }
      ]
    }
  ]
};

const getProductsFromCategory = (node) => {
  if (node.type === "product") return [node];
  const products = [];
  for (const child of (node.children || [])) {
    products.push(...getProductsFromCategory(child));
  }
  return products;
};

const sortingStrategies = {
  relevance_desc: (a, b) => b.relevance - a.relevance,
  price_asc: (a, b) => a.price - b.price,
  name_alpha: (a, b) => a.name.localeCompare(b.name)
};

// --- ENDPOINTS ---

app.get('/api/categories', (req, res) => {
  const simpleTree = (node) => ({ id: node.id, name: node.name });
  res.json(catalog.children.map(simpleTree));
});

app.get('/api/products/:catId', (req, res) => {
  const startTime = performance.now(); // <--- INICIO DE LA MÉTRICA

  try {
    const { catId } = req.params;
    const { sort = 'relevance_desc', page = 1, limit = 2 } = req.query;
    
    const findNode = (parent) => {
      if (parent.id === catId) return parent;
      if (parent.children) {
        for (let child of parent.children) {
          let found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    const targetNode = findNode(catalog);
    let rawProducts = targetNode ? getProductsFromCategory(targetNode) : [];

    const sortedList = [...rawProducts].sort(sortingStrategies[sort] || sortingStrategies.relevance_desc);

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const pagedItems = sortedList.slice(startIndex, startIndex + parseInt(limit));

    const endTime = performance.now(); // <--- FIN DE LA MÉTRICA
    const executionTime = (endTime - startTime).toFixed(4); // Tiempo en milisegundos

    res.json({
      products: pPagedItems, // Error tipográfico corregido abajo
      products: pagedItems,
      totalItems: rawProducts.length,
      totalPages: Math.ceil(rawProducts.length / limit),
      responseTime: executionTime // <--- ENVIAMOS LA MÉTRICA AL FRONTEND
    });

  } catch (e) {
    res.status(500).json({ error: "Error procesando productos" });
  }
});

app.listen(5000, () => console.log('Backend corriendo en http://localhost:5000'));