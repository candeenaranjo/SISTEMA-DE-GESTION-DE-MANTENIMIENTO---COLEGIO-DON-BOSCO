const ANCHO = 420;
const ALTO = 220;
const M = { arriba: 12, derecha: 16, abajo: 28, izquierda: 62 };

function GraficoLineas({ etiquetas, series, colores, formato = (n) => n }) {
  // Encontrar el valor máximo real
  const maximo = Math.max(1, ...series.flatMap((s) => s.valores));
  
  // Calcular un "paso" lindo automático (para que no sea siempre 100000)
  const crudo = maximo / 4;
  const potencia = Math.pow(10, Math.floor(Math.log10(crudo)));
  const paso = Math.ceil(crudo / potencia) * potencia;
  
  const tope = Math.ceil(maximo / paso) * paso || 1000;
  const marcas = Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);

  const anchoUtil = ANCHO - M.izquierda - M.derecha;
  const altoUtil = ALTO - M.arriba - M.abajo;
  const x = (i) => M.izquierda + (i * anchoUtil) / Math.max(1, etiquetas.length - 1);
  const y = (v) => M.arriba + (1 - v / tope) * altoUtil;

  return (
    <div className="grafico-lineas">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label="Evolución mensual de gastos">
        {marcas.map((m) => (
          <g key={m}>
            <line x1={M.izquierda} x2={ANCHO - M.derecha} y1={y(m)} y2={y(m)} className="grafico-lineas__grilla" />
            <text x={M.izquierda - 8} y={y(m) + 4} textAnchor="end" className="grafico-lineas__texto">
              {formato(m)}
            </text>
          </g>
        ))}
        {etiquetas.map((e, i) => (
          <text key={e} x={x(i)} y={ALTO - 8} textAnchor="middle" className="grafico-lineas__texto">
            {e}
          </text>
        ))}
        {series.map((s) => {
          const color = colores[s.clave];
          return (
            <g key={s.clave}>
              <polyline
                fill="none"
                strokeWidth="2.5"
                strokeLinejoin="round"
                style={{ stroke: color }}
                points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
              />
              {s.valores.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r="3.5" style={{ fill: color }} />
              ))}
            </g>
          );
        })}
      </svg>
      <ul className="grafico-lineas__leyenda">
        {series.map((s) => (
          <li key={s.clave}>
            <span className="leyenda-punto" style={{ background: colores[s.clave] }} />
            {s.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GraficoLineas;
