
import { useEffect, useState } from 'react';
import {
  FaChartColumn, FaFileLines, FaCircleCheck, FaClock, FaHourglassHalf,
  FaCircleXmark, FaDollarSign, FaLocationDot, FaUsers, FaChartLine,
  FaChartPie, FaCalendarCheck, FaLightbulb,
} from 'react-icons/fa6';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import TarjetaResumen from '../../../shared/components/TarjetaResumen';
import SeccionCard from '../../../shared/components/SeccionCard';
import Dona from '../../../shared/components/Dona';
import { colorDeEstado } from '../../../shared/utils/colores';
import GraficoLineas from '../components/GraficoLineas';
import Variacion from '../components/Variacion';
import { obtenerEstadisticas } from '../services/estadisticasService';
import '../styles/estadisticas.css';

const KPI_CONFIG = {
  'total-requerimientos': { icono: FaFileLines, tono: 'en-proceso' },
  finalizadas: { icono: FaCircleCheck, tono: 'finalizada' },
  'en-proceso': { icono: FaClock, tono: 'pendiente' },
  demoradas: { icono: FaHourglassHalf, tono: 'con-tarea' },
  rechazadas: { icono: FaCircleXmark, tono: 'rechazada' },
  gastos: { icono: FaDollarSign, tono: 'finalizada' },
};

const COLOR_GASTO = { gastos: 'var(--estado-proceso-solid)' };

const PERIODOS = [
  { valor: 7, texto: 'Últimos 7 días' },
  { valor: 30, texto: 'Últimos 30 días' },
  { valor: 90, texto: 'Últimos 90 días' },
  { valor: 365, texto: 'Último año' },
];

const moneda = (n) => `$${n.toLocaleString('es-AR')}`;
const suma = (lista, campo) => lista.reduce((acc, item) => acc + item[campo], 0);
const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

function EstadisticasPage() {
  const [periodo, setPeriodo] = useState(30);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    setError('');
    obtenerEstadisticas(periodo)
      .then((d) => activo && setDatos(d))
      .catch((e) => activo && setError(e.message));
    return () => { activo = false; };
  }, [periodo]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        No pudimos cargar las estadísticas: {error}
      </div>
    );
  }

  if (!datos) return <p className="text-secondary p-4">Cargando estadísticas…</p>;

  // Cálculos seguros por si las listas vienen vacías
  const totalSectores = suma(datos.sectores, 'cantidad');
  const maxSector = Math.max(1, ...datos.sectores.map((s) => s.cantidad));
  const totalTareas = suma(datos.estadoTareas, 'valor');
  const maxTareasEmpleado = Math.max(1, ...datos.personal.map((p) => p.realizadas));
  const { dias, variacion } = datos.tiempoResolucion;

  return (
    <div className="estadisticas container-fluid">
      <EncabezadoPagina
        icono={FaChartColumn}
        titulo="Estadísticas"
        subtitulo="Indicadores y métricas del sistema de mantenimiento"
        tono="secundario"
      >
      </EncabezadoPagina>

      {/* FILA 1: KPIs (Ocupan todo el ancho disponible) */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-6 g-3 mb-4">
        {datos.kpis.map((k) => {
          const { icono, tono } = KPI_CONFIG[k.clave];
          return (
            <div className="col" key={k.clave}>
              <TarjetaResumen
                icono={icono}
                tono={tono}
                etiqueta={k.etiqueta}
                valor={k.formato === 'moneda' ? moneda(k.valor) : k.valor}
              >
                <div className="kpi-variacion mt-2">
                  {k.variacion === null ? (
                    <small className="text-muted">Situación actual</small>
                  ) : (
                    <div className="d-flex align-items-center gap-1">
                      <Variacion valor={k.variacion} subeEsBueno={k.subeEsBueno} />
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>vs. período ant.</small>
                    </div>
                  )}
                </div>
              </TarjetaResumen>
            </div>
          );
        })}
      </div>

      {/* FILA 2: Gráficos Principales (3 columnas) */}
      <div className="row g-4 mb-4">
        {/* Sectores */}
        <div className="col-lg-6 col-xl-4">
          <SeccionCard
            className="h-100"
            icono={FaLocationDot}
            titulo="Sectores más afectados"
            subtitulo="Espacios con más tareas reportadas."
          >
            {datos.sectores.length === 0 ? (
              <p className="text-muted text-center py-5">Sin datos en este período</p>
            ) : (
              <ul className="barras-sectores">
                {datos.sectores.map((s, i) => (
                  <li key={s.nombre}>
                    <span className="barras-sectores__nombre">{s.nombre}</span>
                    <div className="barras-sectores__pista">
                      <div
                        className="barras-sectores__barra"
                        style={{
                          width: `${(s.cantidad / maxSector) * 100}%`,
                          opacity: 1 - i * 0.1,
                        }}
                      />
                    </div>
                    <span className="barras-sectores__valor">
                      {s.cantidad} ({porcentaje(s.cantidad, totalSectores)}%)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SeccionCard>
        </div>

        {/* Empleados */}
        <div className="col-lg-6 col-xl-4">
          <SeccionCard
            className="h-100"
            icono={FaUsers}
            titulo="Empleados con más tareas"
            subtitulo="Personal interno con más tareas asignadas."
          >
            {datos.personal.length === 0 ? (
              <p className="text-muted text-center py-5">Sin datos en este período</p>
            ) : (
              <ul className="barras-sectores">
                {datos.personal.map((p, i) => (
                  <li key={p.nombre}>
                    <span className="barras-sectores__nombre">{p.nombre}</span>
                    <div className="barras-sectores__pista">
                      <div
                        className="barras-sectores__barra"
                        style={{
                          width: `${(p.realizadas / maxTareasEmpleado) * 100}%`,
                          opacity: 1 - i * 0.1,
                        }}
                      />
                    </div>
                    <span className="barras-sectores__valor">
                      {p.realizadas} ({p.tasa}% aprob.)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SeccionCard>
        </div>

        {/* Evolución de Gastos */}
        <div className="col-xl-4">
          <SeccionCard
            className="h-100"
            icono={FaChartLine}
            titulo="Evolución de gastos"
            subtitulo="Gasto total mensual registrado."
          >
            <div className="d-flex justify-content-center align-items-center h-100">
              <GraficoLineas
                etiquetas={datos.evolucionGastos.meses}
                series={datos.evolucionGastos.series}
                colores={COLOR_GASTO}
                formato={moneda}
              />
            </div>
          </SeccionCard>
        </div>
      </div>

      {/* FILA 3: Dona y Tiempo (2 columnas grandes) */}
      <div className="row g-4">
        {/* Estado de tareas */}
        <div className="col-lg-6">
          <SeccionCard
            className="h-100"
            icono={FaChartPie}
            titulo="Estado actual de tareas"
            subtitulo="Tareas creadas en el período."
          >
            {totalTareas === 0 ? (
              <p className="text-muted text-center py-5">Sin tareas en este período</p>
            ) : (
              <div className="gastos d-flex flex-column flex-md-row align-items-center gap-4">
                <Dona datos={datos.estadoTareas} total={totalTareas} etiqueta="Tareas" tamano={200} />
                <ul className="leyenda flex-grow-1 mb-0">
                  {datos.estadoTareas.map((e) => (
                    <li key={e.clave} className="mb-2">
                      <span className="leyenda-punto" style={{ background: colorDeEstado(e.clave) }} />
                      <span className="leyenda__nombre fw-medium">{e.estado}</span>
                      <span className="ms-auto badge bg-light text-dark border">{e.valor}</span>
                      <span className="leyenda__pct text-muted ms-2">({porcentaje(e.valor, totalTareas)}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SeccionCard>
        </div>

        {/* Tiempo de resolución */}
        <div className="col-lg-6">
          <SeccionCard
            className="h-100"
            icono={FaClock}
            titulo="Tiempo promedio de resolución"
            subtitulo="Desde la creación hasta la finalización."
          >
            <div className="d-flex flex-column justify-content-center h-100 p-3">
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="tiempo__icono bg-primary-subtle text-primary p-3 rounded-circle fs-3">
                  <FaCalendarCheck />
                </span>
                <div>
                  <h2 className="mb-0 fw-bold fs-1">{dias} <span className="fs-5 text-muted">días</span></h2>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <Variacion valor={variacion} subeEsBueno={false} />
                    <small className="text-secondary">vs. período anterior</small>
                  </div>
                </div>
              </div>
              <div className="alert alert-info border-0 d-flex gap-2 align-items-start m-0">
                <FaLightbulb className="mt-1 flex-shrink-0" />
                <small>
                  El tiempo de resolución{' '}
                  {variacion === 0
                    ? 'se mantuvo igual'
                    : variacion < 0
                      ? `mejoró un ${Math.abs(variacion)}%`
                      : `empeoró un ${variacion}%`}{' '}
                  en comparación con el período anterior.
                </small>
              </div>
            </div>
          </SeccionCard>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasPage;