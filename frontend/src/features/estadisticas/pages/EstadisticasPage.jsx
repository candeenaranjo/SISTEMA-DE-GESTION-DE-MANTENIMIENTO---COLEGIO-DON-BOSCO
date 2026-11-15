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

  if (!datos) return <p className="text-secondary">Cargando…</p>;

  const totalSectores = suma(datos.sectores, 'cantidad');
  const maxSector = Math.max(1, ...datos.sectores.map((s) => s.cantidad));
  const totalTareas = suma(datos.estadoTareas, 'valor');
  const maxTareasEmpleado = Math.max(1, ...datos.personal.map((p) => p.realizadas));
  const { dias, variacion } = datos.tiempoResolucion;

  return (
    <div className="estadisticas">
      <EncabezadoPagina
        icono={FaChartColumn}
        titulo="Estadísticas"
        subtitulo="Indicadores y métricas del sistema de mantenimiento"
        tono="secundario"
      >
        <select
          className="form-select"
          value={periodo}
          onChange={(e) => setPeriodo(Number(e.target.value))}
        >
          {PERIODOS.map((p) => (
            <option key={p.valor} value={p.valor}>{p.texto}</option>
          ))}
        </select>
      </EncabezadoPagina>

      {/* KPIs */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3 mb-4">
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
                <div className="kpi-variacion">
                  {k.variacion === null ? (
                    <small>Situación actual</small>
                  ) : (
                    <>
                      <Variacion valor={k.variacion} subeEsBueno={k.subeEsBueno} />
                      <small>vs. período anterior</small>
                    </>
                  )}
                </div>
              </TarjetaResumen>
            </div>
          );
        })}
      </div>

      <div className="row g-3 mb-3">
        {/* Sectores más afectados (tareas por sector) */}
        <div className="col-xl-4">
          <SeccionCard
            icono={FaLocationDot}
            titulo="Sectores más afectados"
            subtitulo="Espacios donde se reportaron más tareas."
          >
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
          </SeccionCard>
        </div>

        {/* Empleados con más tareas */}
        <div className="col-xl-4">
          <SeccionCard
            icono={FaUsers}
            titulo="Empleados con más tareas"
            subtitulo="Personal interno (Jefe y Ordenanza) con más tareas asignadas en el período."
          >
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
          </SeccionCard>
        </div>

        {/* Evolución de gastos (una sola serie: suma total por mes) */}
        <div className="col-xl-4">
          <SeccionCard
            icono={FaChartLine}
            titulo="Evolución de gastos"
            subtitulo="Gasto total mensual registrado en compras."
          >
            <GraficoLineas
              etiquetas={datos.evolucionGastos.meses}
              series={datos.evolucionGastos.series}
              colores={COLOR_GASTO}
              formato={moneda}
            />
          </SeccionCard>
        </div>

        {/* Estado actual de tareas */}
        <div className="col-xl-4">
          <SeccionCard
            icono={FaChartPie}
            titulo="Estado actual de tareas"
            subtitulo="Tareas creadas en el período, según su estado actual."
          >
            <div className="gastos">
              <Dona datos={datos.estadoTareas} total={totalTareas} etiqueta="Tareas" tamano={170} />
              <ul className="leyenda">
                {datos.estadoTareas.map((e) => (
                  <li key={e.clave}>
                    <span
                      className="leyenda-punto"
                      style={{ background: colorDeEstado(e.clave) }}
                    />
                    <span className="leyenda__nombre">{e.estado}</span>
                    <span>{e.valor}</span>
                    <span className="leyenda__pct">({porcentaje(e.valor, totalTareas)}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          </SeccionCard>
        </div>

        {/* Tiempo promedio de resolución */}
        <div className="col-xl-4">
          <SeccionCard
            icono={FaClock}
            titulo="Tiempo promedio de resolución"
            subtitulo="Desde la creación hasta la finalización de la tarea."
          >
            <div className="tiempo">
              <span className="tiempo__icono"><FaCalendarCheck /></span>
              <div>
                <strong>{dias.toLocaleString('es-AR')} días</strong>
                <Variacion valor={variacion} subeEsBueno={false} />
                <small className="d-block text-secondary">vs. período anterior</small>
              </div>
            </div>
            <p className="tiempo__nota">
              <FaLightbulb aria-hidden="true" />
              El tiempo de resolución{' '}
              {variacion === 0
                ? 'se mantuvo igual'
                : variacion < 0
                  ? `mejoró un ${Math.abs(variacion)}%`
                  : `empeoró un ${variacion}%`}{' '}
              en comparación con el período anterior.
            </p>
          </SeccionCard>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasPage;