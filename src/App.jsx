import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Ventas from './pages/Ventas';
import Clientes from './pages/Clientes';
import Movimientos from './pages/Movimientos';
import Stock from './pages/Stock';
import Compras from './pages/Compras';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="stock" element={<Stock />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="compras" element={<Compras />} />
          <Route path="movimientos" element={<Movimientos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
