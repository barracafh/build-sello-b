// Con un resultado en pantalla, el formulario se pliega en una barra para que
// el veredicto y «Qué hacer ahora» quepan sin bajar (LAB-69). El formulario
// sigue montado (oculto), así que al volver conserva el texto comprobado.
export const formularioPlegado = (respuesta: unknown) => respuesta !== null;
