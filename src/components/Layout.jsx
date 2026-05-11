import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Truck, ShoppingCart, ShoppingBag, History, Box, Search, Plus, X, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState({
    productos: [],
    clientes: [],
    proveedores: [],
    ventas: [],
    compras: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Catálogo', icon: Package, path: '/productos' },
    { name: 'Almacén / Stock', icon: Box, path: '/stock' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Proveedores', icon: Truck, path: '/proveedores' },
    { name: 'Ventas (Salida)', icon: ShoppingCart, path: '/ventas' },
    { name: 'Compras (Entrada)', icon: ShoppingBag, path: '/compras' },
    { name: 'Movimientos', icon: History, path: '/movimientos' },
  ];

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isCmdK) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    let isMounted = true;
    const fetchSearchData = async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);
        const [resProd, resCli, resProv, resVen, resCom] = await Promise.all([
          api.get('/producto'),
          api.get('/cliente'),
          api.get('/proveedor'),
          api.get('/venta'),
          api.get('/pedidocompra'),
        ]);
        if (!isMounted) return;
        setSearchData({
          productos: resProd.data.items || [],
          clientes: resCli.data.items || [],
          proveedores: resProv.data.items || [],
          ventas: resVen.data.items || [],
          compras: resCom.data.items || [],
        });
      } catch (error) {
        if (!isMounted) return;
        setSearchError('No se pudo cargar el buscador global.');
      } finally {
        if (isMounted) setSearchLoading(false);
      }
    };
    fetchSearchData();
    return () => {
      isMounted = false;
    };
  }, [searchOpen]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      return {
        productos: [],
        clientes: [],
        proveedores: [],
        ventas: [],
        compras: [],
      };
    }

    const includes = (value) => (value || '').toString().toLowerCase().includes(q);

    return {
      productos: searchData.productos.filter((p) =>
        includes(p.nombre) || includes(p.descripcion) || includes(p.categoria)
      ),
      clientes: searchData.clientes.filter((c) =>
        includes(c.nombre) || includes(c.contacto) || includes(c.direccion)
      ),
      proveedores: searchData.proveedores.filter((p) =>
        includes(p.nombre) || includes(p.contacto) || includes(p.direccion)
      ),
      ventas: searchData.ventas.filter((v) =>
        includes(v.id) || includes(v.cliente?.nombre)
      ),
      compras: searchData.compras.filter((c) =>
        includes(c.id) || includes(c.proveedor?.nombre)
      ),
    };
  }, [searchData, searchQuery]);

  const totalResults = Object.values(filteredResults).reduce((acc, list) => acc + list.length, 0);

  const handleQuickAction = (action) => {
    setQuickOpen(false);
    if (action === 'producto') navigate('/productos', { state: { openNew: 'producto' } });
    if (action === 'cliente') navigate('/clientes', { state: { openNew: 'cliente' } });
    if (action === 'proveedor') navigate('/proveedores', { state: { openNew: 'proveedor' } });
    if (action === 'venta') navigate('/ventas', { state: { openNew: 'venta' } });
    if (action === 'compra') navigate('/compras', { state: { openNew: 'compra' } });
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">INVENTARIO</h1>
          </div>
        </div>
        
        <nav className="flex-1 mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 mt-auto">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full border border-white"></div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-none">Admin</p>
              <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase tracking-widest">En línea</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-auto relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full lg:max-w-xl bg-white border border-gray-100 shadow-sm px-5 py-3.5 rounded-2xl flex items-center gap-3 text-left hover:shadow-lg hover:shadow-gray-100 transition-all"
            >
              <Search className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 font-semibold">Buscar productos, clientes, ventas...</span>
              <span className="ml-auto text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Ctrl + K</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setQuickOpen((prev) => !prev)}
                className="flex items-center justify-center bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl transition-all font-black shadow-xl shadow-gray-200 group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                NUEVO
              </button>
              {quickOpen && (
                <button
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setQuickOpen(false)}
                  aria-label="Cerrar menú rápido"
                />
              )}
              {quickOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-40">
                  <button onClick={() => handleQuickAction('producto')} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-700">
                    Nuevo Producto
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleQuickAction('cliente')} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-700">
                    Nuevo Cliente
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleQuickAction('proveedor')} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-700">
                    Nuevo Proveedor
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleQuickAction('venta')} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-700">
                    Nueva Venta
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleQuickAction('compra')} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between font-semibold text-gray-700">
                    Nueva Compra
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Outlet />
        </div>

        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-6"
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mt-12"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, categoría, cliente, proveedor..."
                  className="flex-1 text-gray-800 font-semibold focus:outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-auto">
                {searchLoading && (
                  <div className="px-8 py-10 text-center text-gray-400 font-semibold">
                    Preparando resultados...
                  </div>
                )}
                {searchError && (
                  <div className="px-8 py-10 text-center text-rose-500 font-semibold">
                    {searchError}
                  </div>
                )}
                {!searchLoading && !searchError && (
                  <div className="px-8 py-6 space-y-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                      {searchQuery.trim().length < 2 ? 'Escribe al menos 2 caracteres' : `${totalResults} resultados`}
                    </p>

                    {searchQuery.trim().length >= 2 && totalResults === 0 && (
                      <div className="text-gray-400 font-semibold text-center py-10">
                        No se encontraron resultados.
                      </div>
                    )}

                    {filteredResults.productos.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.25em] mb-3">Productos</p>
                        <div className="space-y-2">
                          {filteredResults.productos.slice(0, 5).map((item) => (
                            <button
                              key={`prod-${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/productos');
                              }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-indigo-50 transition-all"
                            >
                              <p className="font-bold text-gray-800">{item.nombre}</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.categoria} · ${item.precioVenta}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredResults.clientes.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.25em] mb-3">Clientes</p>
                        <div className="space-y-2">
                          {filteredResults.clientes.slice(0, 5).map((item) => (
                            <button
                              key={`cli-${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/clientes');
                              }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all"
                            >
                              <p className="font-bold text-gray-800">{item.nombre}</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.contacto}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredResults.proveedores.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.25em] mb-3">Proveedores</p>
                        <div className="space-y-2">
                          {filteredResults.proveedores.slice(0, 5).map((item) => (
                            <button
                              key={`prov-${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/proveedores');
                              }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-emerald-50 transition-all"
                            >
                              <p className="font-bold text-gray-800">{item.nombre}</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.contacto}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredResults.ventas.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.25em] mb-3">Ventas</p>
                        <div className="space-y-2">
                          {filteredResults.ventas.slice(0, 5).map((item) => (
                            <button
                              key={`venta-${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/ventas');
                              }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-rose-50 transition-all"
                            >
                              <p className="font-bold text-gray-800">Venta #{item.id}</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.cliente?.nombre || 'Cliente final'}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredResults.compras.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.25em] mb-3">Compras</p>
                        <div className="space-y-2">
                          {filteredResults.compras.slice(0, 5).map((item) => (
                            <button
                              key={`compra-${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate('/compras');
                              }}
                              className="w-full text-left px-4 py-3 rounded-2xl hover:bg-amber-50 transition-all"
                            >
                              <p className="font-bold text-gray-800">Pedido #{item.id}</p>
                              <p className="text-xs text-gray-400 font-semibold">{item.proveedor?.nombre || 'Proveedor'}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
