import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { FaClipboardList } from "react-icons/fa6";
import EncabezadoPagina from "../../../shared/components/EncabezadoPagina";
import TablaTareas from "../components/TablaTareas";
import { obtenerTareas } from "../services/tareasService";

function MisAsignacionesPage() {
  const usuario = useOutletContext();
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificamos que el usuario exista antes de pedir los datos
    if (!usuario || !usuario.id) return;

    obtenerTareas()
      .then((res) => {
        setTareas(res);
      })
      .catch((e) => console.error("Error al traer tareas:", e))
      .finally(() => setCargando(false));
  }, [usuario]);

  return (
    <div>
      <EncabezadoPagina
        icono={FaClipboardList}
        titulo="Mis Asignaciones"
        subtitulo="Tareas de mantenimiento que te fueron asignadas"
      />

      <div className="mt-4">
        {cargando ? (
          <p className="text-secondary p-3">Cargando tus asignaciones...</p>
        ) : (
          <TablaTareas tareas={tareas} usuario={usuario} />
        )}
      </div>
    </div>
  );
}

export default MisAsignacionesPage;