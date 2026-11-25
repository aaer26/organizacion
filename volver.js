const volver = document.getElementById('volver');
const portada = new URL('./', location.href);

if (document.referrer && history.length > 1) {
  const origen = new URL(document.referrer);
  const esPortada = origen.origin === portada.origin &&
    [portada.pathname, portada.pathname + 'index.html'].includes(origen.pathname);

  if (esPortada) {
    volver.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.back();
    });
  }
}
