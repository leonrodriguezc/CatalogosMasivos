# 🚀 Navegando Mareas: Optimización de Arquitectura en Catálogos Masivos

Este proyecto es la solución para la **Actividad 6** del curso de **Arquitectura de Software** (Unidad 3), consistente en el diseño, modelado e implementación de una arquitectura optimizada para un sistema de e-commerce a gran escala.

El objetivo era resolver el problema de latencia y complejidad al navegar jerarquías profundas de productos y aplicar filtros de ordenamiento en tiempo real, utilizando patrones de diseño probados.

---

## 📐 Arquitectura & Patrones Utilizados

Para solucionar el problema de gestión de gran volumen de datos y navegación fluida, se aplicaron los siguientes patrones arquitectónicos:

*   **Composite:** Para modelar la estructura de árbol (Categorías/Subcategorías -> Productos). Permite tratar objetos individuales y grupos de la misma manera.
*   **Strategy:** Para implementar el algoritmo de ordenamiento dinámico del catálogo. Permite intercambiar estrategias (ej. por precio, relevancia) en tiempo de ejecución.
*   **Iterator:** Implementado mediante paginación en la API para asegurar que el navegador del cliente nunca recibiera datos que lo sobrepasaran o saturaran la memoria.
*   **REST API Architecture:** Desacoplamiento total entre el frontend (React) y el backend (Node.js) para garantizar escalabilidad.

---

## 🛠️ Tecnologías (Tech Stack)

| Capa | Tecnología |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Frontend** | React.js (Functional Components & Hooks) |
| **Modelo de Datos** | JSON in-memory (Tree structure) |
| **Estilos** | CSS (Flexbox & Grid) |

---

## 📂 Estructura del Proyecto

```text
U3-A6-Navegando-mareas-estrategias-de-navegacion/
├── backend/
│   ├── server.js       # Servidor principal y lógica de patrones (Strategy/Composite)
│   └── package.json    # Dependencias: express, cors, perf_hooks
├── frontend/
│   ├── src/
│   │   ├── App.js      # Componente principal con estado y métricas
│   │   └── index.css   # Estilos principales
│   └── package.json
└── README.md           # Este archivo
