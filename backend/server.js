const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// PATRON COMPOSITE: Estructura de catalogo (arbol JSON)
// ==========================================
const catalog = {
  id: "root",
  name: "Tienda Global",
  type: "category",
  children: [
    {
      id: "elec",
      name: "Electronica",
      type: "category",
      children: [
        {
          id: "comp",
          name: "Computacion",
          type: "category",
          children: [
            { id: "p1",  name: "Laptop Pro 15\"",      price: 1200, relevance: 95, stock: 10,  type: "product" },
            { id: "p2",  name: "Mouse Gamer RGB",       price: 85,   relevance: 82, stock: 150, type: "product" },
            { id: "p3",  name: "Monitor UltraWide 34\"", price: 450,  relevance: 90, stock: 20,  type: "product" },
            { id: "p4",  name: "Teclado Mecanico",       price: 120,  relevance: 88, stock: 75,  type: "product" },
            { id: "p5",  name: "PC Escritorio Gaming",   price: 1800, relevance: 97, stock: 5,   type: "product" },
            { id: "p6",  name: "Disco SSD 1TB",          price: 95,   relevance: 79, stock: 200, type: "product" },
            { id: "p7",  name: "Webcam Full HD",         price: 65,   relevance: 73, stock: 90,  type: "product" }
          ]
        },
        {
          id: "cell",
          name: "Smartphones",
          type: "category",
          children: [
            { id: "p8",  name: "iPhone 15 Pro",       price: 999, relevance: 98, stock: 50,  type: "product" },
            { id: "p9",  name: "Samsung Galaxy S24",  price: 850, relevance: 88, stock: 70,  type: "product" },
            { id: "p10", name: "Xiaomi Redmi Note 13", price: 250, relevance: 76, stock: 120, type: "product" },
            { id: "p11", name: "Motorola Edge 40",     price: 400, relevance: 71, stock: 45,  type: "product" },
            { id: "p12", name: "Google Pixel 8",       price: 699, relevance: 85, stock: 30,  type: "product" }
          ]
        },
        {
          id: "audio",
          name: "Audio y Video",
          type: "category",
          children: [
            { id: "p13", name: "Auriculares Bluetooth",    price: 55,   relevance: 80, stock: 130, type: "product" },
            { id: "p14", name: "Parlante Inteligente",      price: 45,   relevance: 77, stock: 95,  type: "product" },
            { id: "p15", name: "Barra de Sonido 5.1",       price: 320,  relevance: 84, stock: 25,  type: "product" },
            { id: "p16", name: "Micrófono de Estudio USB",  price: 150,  relevance: 72, stock: 60,  type: "product" }
          ]
        }
      ]
    },
    {
      id: "home",
      name: "Hogar",
      type: "category",
      children: [
        {
          id: "cocina",
          name: "Cocina",
          type: "category",
          children: [
            { id: "p17", name: "Robot Aspirador",       price: 300, relevance: 75, stock: 12,  type: "product" },
            { id: "p18", name: "Cafetera Automática",   price: 180, relevance: 82, stock: 40,  type: "product" },
            { id: "p19", name: "Licuadora de Alta Vel.", price: 90,  relevance: 68, stock: 55,  type: "product" },
            { id: "p20", name: "Set de Ollas Acero Inox.", price: 220, relevance: 74, stock: 30, type: "product" }
          ]
        },
        {
          id: "muebles",
          name: "Muebles",
          type: "category",
          children: [
            { id: "p21", name: "Sofá Modular Gris",      price: 1500, relevance: 85, stock: 8,  type: "product" },
            { id: "p22", name: "Escritorio Ergonómico",  price: 350,  relevance: 78, stock: 22, type: "product" },
            { id: "p23", name: "Silla Gamer Pro",        price: 280,  relevance: 91, stock: 18, type: "product" }
          ]
        }
      ]
    },
    {
      id: "deporte",
      name: "Deporte",
      type: "category",
      children: [
        { id: "p24", name: "Bicicleta Montaña 21 Vel.", price: 450,  relevance: 86, stock: 15, type: "product" },
        { id: "p25", name: "Mancuernas Ajustables 40kg", price: 190, relevance: 83, stock: 35, type: "product" },
        { id: "p26", name: "Corredora Electrica",        price: 1200, relevance: 89, stock: 7,  type: "product" },
        { id: "p27", name: "Balon Baloncesto NBA",       price: 45,   relevance: 70, stock: 110, type: "product" },
        { id: "p28", name: "Cuerda de Saltar Crossfit",  price: 25,   relevance: 65, stock: 200, type: "product" }
      ]
    }
  ]
};

// ==========================================
// Funciones auxiliares (Patron Composite)
// ==========================================
function findNodeById(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (let child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

function flattenProducts(node) {
  if (node.type === "product") return [node];
  let products = [];
  if (node.children) {
    for (let child of node.children) {
      products = products.concat(flattenProducts(child));
    }
  }
  return products;
}

function simplifyCategory(node) {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    children: (node.children || [])
      .filter(c => c.type === "category")
      .map(c => simplifyCategory(c))
  };
}

// ==========================================
// PATRON STRATEGY: Algoritmos de ordenamiento
// ==========================================
const strategies = {
  relevance_desc: (a, b) => b.relevance - a.relevance,
  price_asc:      (a, b) => a.price - b.price,
  price_desc:     (a, b) => b.price - a.price,
  name_alpha:     (a, b) => a.name.localeCompare(b.name, "es")
};

// ==========================================
// ENDPOINTS DE LA API
// ==========================================

// Estructura de categorias (arbol para el Sidebar)
app.get("/api/categories", (req, res) => {
  try {
    const tree = catalog.children.map(simplifyCategory);
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener categorias" });
  }
});

// Productos de una categoria (Composite + Strategy + Iterator)
app.get("/api/products/:catId", (req, res) => {
  try {
    const startTime = performance.now();

    const { catId } = req.params;
    const { sort = "relevance_desc", page = 1, limit = 4 } = req.query;

    // Buscar el nodo en el arbol
    const node = findNodeById(catalog, catId);
    if (!node) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }

    // Composite: extraer todos los productos de la rama
    let allProducts = flattenProducts(node);

    // Strategy: aplicar algoritmo de ordenamiento
    const strategyFn = strategies[sort] || strategies.relevance_desc;
    const sortedProducts = [...allProducts].sort(strategyFn);

    // Iterator: paginar los resultados
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const startIndex = (pageNum - 1) * limitNum;
    const pagedProducts = sortedProducts.slice(startIndex, startIndex + limitNum);

    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(4);

    res.json({
      products: pagedProducts,
      totalItems: allProducts.length,
      totalPages: Math.ceil(allProducts.length / limitNum),
      currentPage: pageNum,
      strategyApplied: sort,
      responseTime: responseTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar productos" });
  }
});

// Metrica general del catalogo (bonus para el informe)
app.get("/api/stats", (req, res) => {
  const totalProducts = flattenProducts(catalog).length;
  const totalCategories = (function countCat(n) {
    let c = 1;
    if (n.children) {
      for (let ch of n.children) {
        if (ch.type === "category") c += countCat(ch);
      }
    }
    return c;
  })(catalog);

  res.json({
    totalProducts: totalProducts,
    totalCategories: totalCategories,
    catalogStructure: simplifyCategory(catalog)
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  console.log(`Productos en catalogo: ${flattenProducts(catalog).length}`);
});