(() => {
  const task = (action, owner, date, note = '') => ({ action, owner, date, note });
  const handoff = (material, sender, receiver, date, note = '') => ({ material, sender, receiver, date, note });
  const flows = [
    ['Conectados sin barreras · Web y videotutoriales', [
      ['Web y publicación original', [
        task('Elaborar la web', 'Álvaro', '09/12/2026', 'La subida de los videotutoriales figura un día antes. Confirmar el orden.'),
        handoff('videotutoriales originales', 'Elisa', 'Álvaro', '30/11/2026'),
        task('Publicar los videotutoriales originales', 'Álvaro', '08/12/2026'),
      ]],
      ['Otros idiomas', [
        handoff('vídeos para traducir', 'Elisa', 'Cristina W y Fátima', 'Por confirmar', 'La fila de idiomas indica 26/11/2026 y la de videotutoriales, 30/11/2026.'),
        handoff('vídeos en otros idiomas', 'Cristina W y Fátima', 'Álvaro', '22/12/2026'),
        task('Publicar los vídeos en otros idiomas', 'Álvaro', '10/01/2027'),
      ]],
    ]],
    ['Conectados sin barreras · Taller', [
      ['Taller en línea', [
        task('Preparar recursos y vídeos del taller con el alumnado', 'Elisa', 'Sin fecha indicada', 'Repartir tareas con Laura y Álvaro.'),
        handoff('materiales del taller en línea', 'Elisa', 'Álvaro', '09/12/2026'),
        task('Publicar el taller en línea', 'Álvaro', '16/12/2026'),
      ]],
      ['Taller presencial', [
        task('Coordinar con el Ayuntamiento la posibilidad de realizar el taller', 'Manuel', 'Sin fecha indicada'),
        task('Impartir el taller en un lugar público', 'Elisa', '16/12/2026', 'Fecha prevista en el Excel, sujeta a coordinación con el Ayuntamiento.'),
        handoff('resumen del taller presencial', 'Elisa', 'Álvaro', 'Por confirmar', 'El Excel recoge 21/12/2026 en la fila de la web y 22/12/2026 en la del taller.'),
        task('Publicar la experiencia del taller presencial', 'Álvaro', '10/01/2027'),
      ]],
    ]],
    ['Conectados sin barreras · Encuesta de exclusión digital', [
      ['Diseño y recogida', [
        task('Diseñar la encuesta', 'Cristina y Elisa', '24/11/2026'),
        task('Revisar el alcance de la encuesta y consultar con Manuel', 'Cristina y Elisa', '16/12/2026'),
        task('Recoger respuestas y hacer seguimiento', 'Cristina y Elisa', 'Año por confirmar', 'El Excel indica del 20/01/2026 al 05/02/2026.'),
      ]],
      ['Análisis y difusión', [
        handoff('resumen y análisis de resultados', 'Cristina y Elisa', 'Álvaro', 'Año por confirmar', 'El Excel indica 15/02/2026.'),
        task('Publicar el resumen y el análisis', 'Álvaro', 'Sin fecha indicada'),
      ]],
    ]],
    ['Innovación educativa y gestión del talento', [
      ['Web y recursos educativos', [
        task('Diseñar la web de Innovación', 'Yony', '15/12/2026', 'El cuadrante incluye también a Laura.'),
        handoff('primer recurso digital y primer material educativo', 'Álvaro', 'Yony', '15/12/2026'),
        task('Publicar el primer recurso y el primer material', 'Yony', '22/12/2026'),
        handoff('resto de recursos educativos', 'Álvaro', 'Yony', 'Año por confirmar', 'El Excel indica 15/03/2026. Objetivo previsto de al menos cinco recursos digitales y cinco materiales.'),
      ]],
      ['Metodologías ATECA', [
        task('Empezar a subir actividades ATECA al comenzar la PFE', 'Manuel', '01/03/2027'),
        handoff('metodologías innovadoras ATECA', 'Manuel', 'Yony', '15/03/2027'),
        task('Tener publicadas las metodologías innovadoras', 'Yony', '15/04/2027'),
      ]],
      ['Curso en línea de ATECA', [
        handoff('curso en línea de ATECA', 'Manuel', 'Yony', '26/02/2027'),
        task('Tener publicado el curso en línea', 'Yony', '12/03/2027'),
      ]],
      ['Digitalización de la enseñanza', [
        task('Empezar a subir las experiencias al comenzar la PFE', 'Manuel y Pilar', '01/03/2027'),
        handoff('experiencias de digitalización', 'Manuel y Pilar', 'Yony', '15/03/2027', 'La fila de la web anota a Manuel como remitente.'),
        task('Tener publicadas las experiencias', 'Yony', '15/04/2027'),
      ]],
      ['Concursos y talento', [
        task('Preparar al menos un concurso por docente', 'Manuel y Pilar', 'Sin fecha indicada'),
        handoff('artículos sobre concursos y gestión del talento', 'Manuel y Pilar', 'Yony', '15/02/2027'),
      ]],
    ]],
    ['Villanueva informa · Web, noticias y podcast', [
      ['Publicaciones', [
        task('Diseñar y ordenar la web', 'Manuel y Pilar', '26/11/2026'),
        task('Publicar la primera noticia', 'Manuel y Pilar', '26/11/2026'),
        task('Publicar el primer episodio del podcast', 'Manuel y Pilar', '16/12/2026'),
        task('Actualizar noticias y preparar nuevos episodios', 'Manuel y Pilar', 'Recurrente'),
      ]],
      ['Coordinación municipal', [
        task('Consultar gestiones para videotutoriales y posibilidades de entrevistas y difusión', 'Manuel', 'Sin fecha indicada'),
      ]],
    ]],
  ];

  const select = document.getElementById('tracking-teacher');
  const list = document.getElementById('tracking-flows');
  const count = document.getElementById('tracking-count');
  const people = value => value.split(' y ');
  const matches = (step, teacher) =>
    !teacher || [step.owner, step.sender, step.receiver].some(name => name && people(name).includes(teacher));

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value) element.textContent = value;
    return element;
  }

  function person(action, owner, date) {
    const block = node('div', 'tracking-person');
    block.append(node('strong', '', action), node('span', '', owner), node('span', 'tracking-date', date));
    return block;
  }

  function renderStep(step, teacher) {
    const block = node('div');
    if (!matches(step, teacher)) block.dataset.context = '';
    if (step.material) {
      const arrow = node('div', 'tracking-arrow');
      const icon = node('b', '', '↓');
      icon.setAttribute('aria-hidden', 'true');
      arrow.append(icon, node('span', '', 'Entrega prevista · ' + step.date));
      block.append(
        person('Envía ' + step.material, step.sender, step.date),
        arrow,
        person('Recibe ' + step.material + ' de ' + step.sender, step.receiver, step.date),
      );
    } else {
      block.classList.add('tracking-step');
      block.append(node('strong', '', step.action), node('span', '', step.owner), node('span', 'tracking-date', step.date));
    }
    if (step.note) block.append(node('p', 'tracking-note', step.note));
    return block;
  }

  const names = new Set();
  for (const [, branches] of flows) {
    for (const [, steps] of branches) {
      for (const step of steps) {
        for (const name of [step.owner, step.sender, step.receiver]) {
          if (name) people(name).forEach(person => names.add(person));
        }
      }
    }
  }
  [...names].sort((a, b) => a.localeCompare(b, 'es')).forEach(name => select.add(new Option(name, name)));

  function render() {
    const teacher = select.value;
    const cards = [];
    for (const [title, branches] of flows) {
      const relevant = branches.filter(([, steps]) => steps.some(step => matches(step, teacher)));
      if (!relevant.length) continue;
      const flow = node('article', 'tracking-flow');
      const grid = node('div', 'tracking-branches');
      for (const [label, steps] of relevant) {
        const branch = node('section', 'tracking-branch');
        branch.append(node('h3', '', label), ...steps.map(step => renderStep(step, teacher)));
        grid.append(branch);
      }
      flow.append(node('h2', '', title), grid);
      cards.push(flow);
    }
    list.replaceChildren(...cards);
    count.textContent = cards.length + ' bloques de seguimiento' +
      (teacher ? ' · Las tareas de contexto llevan borde discontinuo.' : '.');
  }

  select.addEventListener('change', render);
  render();
})();
