function ReporteMapper_desdeCliente_(payload) {
  payload = payload || {};
  const sinCorreoCorporativo = payload.sinCorreoCorporativo === true ||
    String(payload.sinCorreoCorporativo || '').trim().toLowerCase() === 'true' ||
    String(payload.sinCorreoCorporativo || '').trim() === '1';

  return {
    dni: Utils_normalizarDni_(payload.dni),
    nombreCompleto: String(payload.nombreCompleto || '').trim(),
    cargo: String(payload.cargo || '').trim(),
    movil: Utils_soloDigitos_(payload.movil),
    correoElectronico: Utils_normalizarCorreo_(payload.correoElectronico),
    sinCorreoCorporativo: sinCorreoCorporativo,
    proyectoSede: String(payload.proyectoSede || '').trim(),
    centroCosto: String(payload.centroCosto || '').trim(),
    cecoNumero: String(payload.cecoNumero || '').trim(),
    empresaDelGrupo: String(payload.empresaDelGrupo || '').trim(),
    activoSeleccionadoId: String(payload.activoSeleccionadoId || '').trim(),
    tipoEquipo: String(payload.tipoEquipo || '').trim(),
    activoAfectado: String(payload.activoAfectado || '').trim(),
    tipoProblema: String(payload.tipoProblema || '').trim(),
    prioridad: String(payload.prioridad || '').trim(),
    descripcion: String(payload.descripcion || '').trim(),
    anydeskId: String(payload.anydeskId || '').trim(),
    anydeskPassword: String(payload.anydeskPassword || '').trim()
  };
}
