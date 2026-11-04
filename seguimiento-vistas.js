(() => {
  const page = document.getElementById('tracking-page');
  const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const entries = [];
  const modes = [['cronologia', 'Línea temporal'], ['meses', 'Agenda por meses'], ['actividades', 'Tarjetas por actividad'], ['lista', 'Lista']];

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function readTask(row, owner) {
    const time = row.querySelector('time');
    const action = row.querySelector('.tracking-text');
    const type = action.querySelector('.tracking-activity-type').textContent.replace(/:$/, '');
    const delivery = row.classList.contains('tracking-delivery');
    const label = action.cloneNode(true);
    label.querySelectorAll('.tracking-project-icon, .tracking-activity-type, details').forEach(node => node.remove());
    const taskText = label.textContent.trim();
    const sender = delivery ? taskText.split(' te envía ')[0] : owner;
    return { row, owner, sender, time, action, type, delivery, taskText };
  }

  function compactEntry(task, overview = false) {
    const time = task.time.cloneNode(true);
    const [, month, day] = time.dateTime.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    time.textContent = Number(day) + ' ' + months[Number(month) - 1];
    time.setAttribute('aria-label', task.time.textContent);
    const content = element('div', '', 'tracking-agenda-action');
    content.append(element('small', task.type.replace(/^(\d+\.\d+) /, '$1 · '), 'tracking-agenda-type'));
    const action = element('strong', '', 'tracking-agenda-task');
    for (const icon of task.action.querySelectorAll('.tracking-project-icon')) {
      action.append(icon.cloneNode(true));
    }
    action.append(overview && task.delivery
      ? task.taskText.replace(' te envía ', ' envía ') + ' a ' + task.owner
      : task.taskText);
    content.append(action);
    const help = task.action.querySelector('details');
    if (help) content.append(help.cloneNode(true));
    return [time, content];
  }

  function groupedView(tasks, mode, overview = false) {
    const groups = new Map();
    for (const task of tasks) {
      const key = mode === 'meses' ? task.time.dateTime.slice(0, 7) : task.type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    }
    const view = element('div', '', mode === 'meses' ? 'tracking-view-grid tracking-months' : 'tracking-view-grid');
    for (const [key, group] of groups) {
      const card = element('section', '', 'tracking-view-card');
      const title = mode === 'meses' ? monthFormat.format(new Date(key + '-01T00:00:00Z')).replace(' de ', ' · ') : key;
      const list = element('ul', '', 'tracking-view-list');
      for (const task of group) {
        const item = element('li', '', task.row.className);
        const [time, content] = compactEntry(task, overview);
        if (overview) content.prepend(element('span', task.sender, 'tracking-overview-owner'));
        item.append(time, content);
        list.append(item);
      }
      card.append(element('h3', title), list);
      view.append(card);
    }
    return view;
  }

  function linearView(tasks, mode, overview = false) {
    if (mode === 'cronologia') {
      const list = element('ol', '', 'tracking-view-list tracking-compact-timeline');
      for (const task of tasks) {
        const row = element('li', '', task.row.className);
        const [time, content] = compactEntry(task, overview);
        if (overview) content.prepend(element('span', task.sender, 'tracking-overview-owner'));
        row.append(time, content);
        list.append(row);
      }
      return list;
    }

    const table = element('table', '', 'tracking-person-list');
    const header = table.createTHead().insertRow();
    const columns = overview ? ['Fecha', 'Quién', 'Qué hacer'] : ['Fecha', 'Qué hacer'];
    for (const label of columns) {
      const cell = element('th', label);
      cell.scope = 'col';
      header.append(cell);
    }
    const body = table.createTBody();
    for (const task of tasks) {
      const row = body.insertRow();
      row.className = task.row.className;
      const [time, content] = compactEntry(task, overview);
      row.insertCell().append(time);
      if (overview) row.insertCell().textContent = task.sender;
      row.insertCell().append(content);
    }
    return table;
  }

  const cards = Array.from(page.querySelectorAll('.tracking-flow'), card => {
    const heading = card.querySelector('h2');
    const timeline = card.querySelector('.tracking-timeline');
    const tasks = Array.from(timeline.children, row => readTask(row, heading.textContent.trim()));
    entries.push(...tasks);
    return { card, heading, timeline, tasks };
  });

  const shared = new Map();
  for (const task of entries.filter(task => !task.delivery)) {
    const key = JSON.stringify([task.time.dateTime, task.type, task.taskText]);
    if (!shared.has(key)) shared.set(key, []);
    shared.get(key).push(task);
  }
  for (const group of shared.values()) {
    const owners = [...new Set(group.map(task => task.owner))];
    if (owners.length < 2) continue;
    for (const task of group) {
      const colleagues = owners.filter(owner => owner !== task.owner).join(' y ');
      const note = ' (con ' + colleagues + ')';
      task.taskText += note;
      task.action.insertBefore(document.createTextNode(note), task.action.querySelector('details'));
    }
  }

  const teachers = element('fieldset', '', 'tracking-teachers');
  teachers.append(element('legend', '¿De quién quieres ver las tareas?'));
  page.querySelector('.tracking-intro').append(teachers);

  function addTeacherChoice(card, name, avatarName) {
    const picker = element('input');
    picker.type = 'checkbox';
    picker.checked = false;
    picker.setAttribute('aria-controls', card.id);
    card.hidden = true;
    const choice = element('label');
    const avatar = element('img', '', 'tracking-teacher-avatar');
    avatar.src = 'assets/docentes/' + avatarName + '.svg';
    avatar.alt = '';
    avatar.width = 112;
    avatar.height = 122;
    choice.append(avatar, picker, element('span', name));
    teachers.append(choice);
    picker.addEventListener('change', () => { card.hidden = !picker.checked; });
    const portrait = avatar.cloneNode();
    portrait.className = 'tracking-card-avatar';
    return portrait;
  }

  for (const { card, heading, timeline, tasks } of cards) {
    card.id = heading.id + '-recuadro';
    const portrait = addTeacherChoice(card, heading.textContent, heading.id.replace(/-heading$/, ''));
    const select = element('select');
    select.setAttribute('aria-label', 'Vista de ' + heading.textContent);
    for (const [value, title] of modes) {
      select.add(new Option(title, value));
    }
    select.value = 'meses';
    const ownActions = element('input');
    ownActions.type = 'checkbox';
    const filter = element('label', '', 'tracking-own-actions');
    filter.append(ownActions, 'Solo mostrar acciones mías');
    const toggle = element('button', '−', 'tracking-fold');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Plegar ' + heading.textContent);
    toggle.setAttribute('aria-expanded', 'true');
    const actions = element('div', '', 'tracking-view-control');
    actions.append(select, toggle);
    const header = element('div', '', 'tracking-card-header');
    heading.before(header);
    heading.prepend(portrait);
    header.append(heading, filter, actions);
    const content = element('div');
    content.id = heading.id + '-contenido';
    toggle.setAttribute('aria-controls', content.id);
    const alternate = element('div');
    timeline.before(content);
    content.append(timeline, alternate);
    timeline.hidden = true;
    function renderCard() {
      const mode = select.value;
      const visible = tasks.filter(task => !ownActions.checked || !task.delivery);
      const view = mode === 'meses' || mode === 'actividades' ? groupedView(visible, mode) : linearView(visible, mode);
      alternate.replaceChildren(view);
    }
    select.addEventListener('change', renderCard);
    ownActions.addEventListener('change', renderCard);
    toggle.addEventListener('click', () => {
      content.hidden = !content.hidden;
      toggle.setAttribute('aria-expanded', String(!content.hidden));
      toggle.textContent = content.hidden ? '+' : '−';
      toggle.setAttribute('aria-label', (content.hidden ? 'Desplegar ' : 'Plegar ') + heading.textContent);
    });
    renderCard();
  }

  const overview = element('section', '', 'tracking-flow tracking-overview');
  overview.id = 'seguimiento-general';
  overview.setAttribute('aria-labelledby', 'tracking-overview-title');
  const title = element('h2', 'Fechas y destinatarios');
  title.id = 'tracking-overview-title';
  title.prepend(addTeacherChoice(overview, 'Alejandro', 'alejandro'));
  const select = element('select');
  select.setAttribute('aria-label', 'Vista de Fechas y destinatarios');
  for (const [value, label] of [['general', 'Tabla general'], ...modes]) {
    select.add(new Option(label, value));
  }
  const header = element('div', '', 'tracking-overview-header');
  const actions = element('div', '', 'tracking-view-control');
  actions.append(select);
  header.append(title, actions);
  const output = element('div');
  entries.sort((a, b) => a.time.dateTime.localeCompare(b.time.dateTime));
  function renderOverview() {
    const mode = select.value;
    const view = mode === 'meses' || mode === 'actividades' ? groupedView(entries, mode, true) : linearView(entries, mode, true);
    output.classList.toggle('tracking-table-scroll', mode === 'general' || mode === 'lista');
    output.replaceChildren(view);
  }
  select.addEventListener('change', renderOverview);
  renderOverview();
  overview.append(header, output);
  page.append(overview);
})();


