// pages/inicio.js - SISTEMA DE FLETES - VERSIÓN SIMPLIFICADA PARA PERSONAS MAYORES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import InstallButton from '../components/InstallButton';

export default function Inicio() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (!token) {
          router.replace('/login');
          return;
        }

        if (usuarioData) {
          try {
            const parsedUsuario = JSON.parse(usuarioData);
            setUsuario(parsedUsuario);
          } catch (error) {
            console.error('Error parsing usuario data:', error);
            setUsuario({
              usuario: 'Transportista',
              id: 1
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.error('Error verificando autenticación');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-orange-800">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6">
      <Head>
        <title>SISTEMA DE FLETES | INICIO</title>
        <meta name="description" content="Panel principal del sistema de gestión de fletes" />
      </Head>
      
      {/* Header de bienvenida simplificado */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getGreeting()}, {usuario?.usuario}
              </h1>
              <p className="text-orange-100 flex items-center space-x-2">
                <span>¿Qué necesita hacer hoy?</span>
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="mb-3">
              <InstallButton />
            </div>
            <p className="text-orange-100 text-sm text-right">
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Menú principal simplificado - 4 botones grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* CAMIONES */}
        <Link href="/camiones" className="block">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-8 border-blue-500 min-h-[200px] flex flex-col justify-center items-center text-center cursor-pointer group">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">MIS CAMIONES</h2>
            <p className="text-gray-600 text-lg">Ver camiones, agregar gastos y mantenimientos</p>
          </div>
        </Link>

        {/* VIAJES */}
        <Link href="/viajes" className="block">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-8 border-green-500 min-h-[200px] flex flex-col justify-center items-center text-center cursor-pointer group">
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">MIS VIAJES</h2>
            <p className="text-gray-600 text-lg">Iniciar viajes, ver activos y finalizar</p>
          </div>
        </Link>

        {/* ✅ RUTAS - NUEVO */}
        <Link href="/rutas" className="block">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-8 border-indigo-500 min-h-[200px] flex flex-col justify-center items-center text-center cursor-pointer group">
            <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">MIS RUTAS</h2>
            <p className="text-gray-600 text-lg">Crear y gestionar rutas de viaje</p>
          </div>
        </Link>

        {/* DINERO (INGRESOS Y GASTOS) */}
        <Link href="/dinero" className="block">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-8 border-purple-500 min-h-[200px] flex flex-col justify-center items-center text-center cursor-pointer group">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">DINERO</h2>
            <p className="text-gray-600 text-lg">Registrar ingresos y gastos</p>
          </div>
        </Link>

        {/* REPORTES (ESTADÍSTICAS) */}
        <Link href="/reportes" className="block">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-8 border-indigo-500 min-h-[200px] flex flex-col justify-center items-center text-center cursor-pointer group">
            <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">REPORTES</h2>
            <p className="text-gray-600 text-lg">Ver estadísticas y análisis</p>
          </div>
        </Link>
      </div>

      {/* Información rápida */}
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Estado del Sistema</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>Usuario:</strong> {usuario?.usuario || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"/>
                <circle cx="7" cy="19" r="2"/>
                <circle cx="17" cy="19" r="2"/>
              </svg>
              <span><strong>Sistema:</strong> Fletes</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <span><strong>Modo:</strong> {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'PWA' : 'Web'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos para móvil */}
      <div className="mt-6 md:hidden max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/viajes/nuevo" className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center hover:from-green-600 hover:to-green-700 transition-colors shadow-lg">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <div className="text-sm font-medium">Nuevo Viaje</div>
          </Link>
          <Link href="/dinero/gasto" className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg text-center hover:from-red-600 hover:to-red-700 transition-colors shadow-lg">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <div className="text-sm font-medium">Agregar Gasto</div>
          </Link>
        </div>
      </div>
    </div>
  );
}