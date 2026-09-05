const STORAGE_KEY = 'gatherly-events';
const defaultEvents = [
  { id: 1, name: 'Autumn Creatives Meetup', category: 'Networking', date: '2024-10-24', time: '18:30', location: 'Granite Studio, London', guests: 45, status: 'confirmed' },
  { id: 2, name: 'Sunset Rooftop Dinner', category: 'Party', date: '2024-11-02', time: '19:00', location: 'Skyline Terrace, London', guests: 28, status: 'planning' },
  { id: 3, name: 'Year-End Celebration', category: 'Conference', date: '2024-11-14', time: '20:00', location: 'Harbor Hall, London', guests: 120, status: 'draft' },
  { id: 4, name: 'Brand Strategy Forum', category: 'Conference', date: '2024-10-18', time: '09:30', location: 'North Hall, Manchester', guests: 86, status: 'confirmed' },
  { id: 5, name: 'Product Launch Lab', category: 'Workshop', date: '2024-10-27', time: '14:00', location: 'Mosaic Room, Birmingham', guests: 62, status: 'planning' }
];

const state = {
  events: loadEvents(),
  filter: 'all',
  query: ''
};

const elements = {
  navEventCount: document.querySelector('#navEventCount'),
  statUpcoming: document.querySelector('#statUpcoming'),
  statDeltaUpcoming: document.querySelector('#statDeltaUpcoming'),
  statGuests: document.querySelector('#statGuests'),
  statDeltaGuests: document.querySelector('#statDeltaGuests'),
  statAttendance: document.querySelector('#statAttendance'),
  statDeltaAttendance: document.querySelector('#statDeltaAttendance'),
  eventsTableBody: document.querySelector('#eventsTableBody'),
  agendaList: document.querySelector('#agendaList'),
  vendorCount: document.querySelector('#vendorCount'),
  taskCount: document.querySelector('#taskCount'),
  searchInput: document.querySelector('#searchInput'),
  statusFilter: document.querySelector('#statusFilter'),
  eventModal: document.querySelector('#eventModal'),
  eventForm: document.querySelector('#eventForm'),
  eventId: document.querySelector('#eventId'),
  eventName: document.querySelector('#eventName'),
  eventCategory: document.querySelector('#eventCategory'),
  eventDate: document.querySelector('#eventDate'),
  eventTime: document.querySelector('#eventTime'),
  eventLocation: document.querySelector('#eventLocation'),
  eventGuests: document.querySelector('#eventGuests'),
  eventStatus: document.querySelector('#eventStatus'),
  toast: document.querySelector('#toast'),
  sidebar: document.querySelector('.sidebar')
};

function loadEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    return [...defaultEvents];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultEvents];
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    return [...defaultEvents];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

function getStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatTime(dateString, timeString) {
  const date = new Date(`${dateString}T${timeString}`);
  return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(date);
}

function badgeClass(status) {
  return {
    confirmed: 'status-confirmed',
    planning: 'status-planning',
    draft: 'status-draft'
  }[status] || 'status-planning';
}

function getFilteredEvents() {
  return state.events.filter((event) => {
    const matchesFilter = state.filter === 'all' || event.status === state.filter;
    const haystack = `${event.name} ${event.location} ${event.category}`.toLowerCase();
    const matchesSearch = !state.query || haystack.includes(state.query.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function renderMetrics() {
  const totalGuests = state.events.reduce((sum, event) => sum + Number(event.guests || 0), 0);
  const confirmedEvents = state.events.filter((event) => event.status === 'confirmed').length;
  const upcoming = state.events.filter((event) => new Date(`${event.date}T${event.time}`) >= new Date()).length;
  const attendance = state.events.length ? Math.round((confirmedEvents / state.events.length) * 100) : 0;

  elements.navEventCount.textContent = String(state.events.length);
  elements.statUpcoming.textContent = String(upcoming);
  elements.statDeltaUpcoming.textContent = `+${Math.max(1, Math.min(9, confirmedEvents))}`;
  elements.statGuests.textContent = totalGuests.toLocaleString();
  elements.statDeltaGuests.textContent = `${Math.max(8, Math.min(38, totalGuests / 40))}%`;
  elements.statAttendance.textContent = `${attendance}%`;
  elements.statDeltaAttendance.textContent = `+${Math.max(2, Math.min(12, attendance / 8))}%`;
  elements.vendorCount.textContent = String(Math.max(3, confirmedEvents + 2));
  elements.taskCount.textContent = String(Math.max(5, state.events.length * 2));
}

function renderTable() {
  const filtered = getFilteredEvents();

  if (!filtered.length) {
    elements.eventsTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">No events match your search.</div>
        </td>
      </tr>
    `;
    return;
  }

  elements.eventsTableBody.innerHTML = filtered
    .map((event) => `
      <tr>
        <td>
          <div class="event-name">
            <span class="event-badge ${event.category.toLowerCase() === 'networking' ? 'blue' : event.category.toLowerCase() === 'party' ? 'orange' : event.category.toLowerCase() === 'workshop' ? 'green' : 'purple'}"></span>
            <div>
              <div>${event.name}</div>
              <div class="event-meta">${event.category}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${formatDate(event.date)}</div>
          <div class="event-meta">${formatTime(event.date, event.time)}</div>
        </td>
        <td>${event.location}</td>
        <td>${event.guests}</td>
        <td><span class="status-chip ${badgeClass(event.status)}">${getStatusLabel(event.status)}</span></td>
        <td>
          <div class="action-group">
            <button class="row-action" type="button" data-action="edit" data-id="${event.id}">Edit</button>
            <button class="row-action danger" type="button" data-action="delete" data-id="${event.id}">Delete</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

function renderAgenda() {
  const nextEvents = [...state.events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  elements.agendaList.innerHTML = nextEvents
    .map((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).toUpperCase();
      const day = date.getDate();
      return `
        <div class="agenda-item">
          <div class="date-bubble">
            <strong>${day}</strong>
            <span>${month}</span>
          </div>
          <div class="agenda-details">
            <strong>${event.name}</strong>
            <small>${event.location}</small>
            <small>${formatTime(event.date, event.time)}</small>
          </div>
          <span class="agenda-dot"></span>
        </div>
      `;
    })
    .join('');
}

function render() {
  renderMetrics();
  renderTable();
  renderAgenda();
}

function openModal(event = null) {
  if (event) {
    elements.eventId.value = event.id;
    elements.eventName.value = event.name;
    elements.eventCategory.value = event.category;
    elements.eventDate.value = event.date;
    elements.eventTime.value = event.time;
    elements.eventLocation.value = event.location;
    elements.eventGuests.value = event.guests;
    elements.eventStatus.value = event.status;
    document.querySelector('#eventModalTitle').textContent = 'Edit event';
  } else {
    elements.eventForm.reset();
    elements.eventId.value = '';
    elements.eventGuests.value = 25;
    elements.eventStatus.value = 'planning';
    document.querySelector('#eventModalTitle').textContent = 'Create an event';
  }

  elements.eventModal.classList.remove('hidden');
  elements.eventModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  elements.eventModal.classList.add('hidden');
  elements.eventModal.setAttribute('aria-hidden', 'true');
  elements.eventForm.reset();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.setTimeout(() => elements.toast.classList.remove('show'), 2200);
}

function hydrateEventFromForm() {
  return {
    id: Number(elements.eventId.value) || Date.now(),
    name: elements.eventName.value.trim(),
    category: elements.eventCategory.value,
    date: elements.eventDate.value,
    time: elements.eventTime.value,
    location: elements.eventLocation.value.trim(),
    guests: Number(elements.eventGuests.value) || 0,
    status: elements.eventStatus.value
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const payload = hydrateEventFromForm();

  if (payload.id && state.events.some((item) => item.id === payload.id && item.id !== Number(elements.eventId.value))) {
    // no-op for duplicate id safety
  }

  const existingIndex = state.events.findIndex((item) => item.id === payload.id);

  if (existingIndex >= 0) {
    state.events[existingIndex] = payload;
    showToast('Event updated successfully.');
  } else {
    state.events.unshift(payload);
    showToast('New event created.');
  }

  saveEvents();
  render();
  closeModal();
}

function handleRowAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  const eventId = Number(id);
  const target = state.events.find((item) => item.id === eventId);

  if (!target) return;

  if (action === 'edit') {
    openModal(target);
    return;
  }

  if (action === 'delete') {
    state.events = state.events.filter((item) => item.id !== eventId);
    saveEvents();
    render();
    showToast('Event removed.');
  }
}

function bindEvents() {
  document.querySelector('#openModalBtn').addEventListener('click', () => openModal());
  document.querySelector('#quickAddBtn').addEventListener('click', () => openModal());
  document.querySelector('#closeModalBtn').addEventListener('click', closeModal);
  document.querySelector('#cancelModalBtn').addEventListener('click', closeModal);
  document.querySelector('#eventModal').addEventListener('click', (event) => {
    if (event.target === elements.eventModal) closeModal();
  });
  document.querySelector('#mobileMenu').addEventListener('click', () => {
    elements.sidebar.classList.toggle('open');
  });

  elements.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    renderTable();
  });

  elements.statusFilter.addEventListener('change', (event) => {
    state.filter = event.target.value;
    renderTable();
  });

  elements.eventForm.addEventListener('submit', handleFormSubmit);
  elements.eventsTableBody.addEventListener('click', handleRowAction);

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active'));
      item.classList.add('active');
      elements.sidebar.classList.remove('open');
    });
  });
}

bindEvents();
render();
