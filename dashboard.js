// dashboard.js - Sistema Completo de Agendamento

const userNameElement = document.getElementById('user-name');
const roomsList = document.getElementById('roomsList');
const scheduleView = document.getElementById('scheduleView');
const scheduleTitle = document.getElementById('scheduleTitle');
const timeList = document.getElementById('timeList');
const selectedDateInput = document.getElementById('selectedDate');
const myBookingsList = document.getElementById('myBookingsList');

let currentRoomId = null;

// Salva o nome do usuário logado
function checkAuth() {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    userNameElement.textContent = user.split('@')[0];
}

// Lista de salas
const salas = [
    { id: 'laboratorio1', nome: 'Laboratório 1' },
    { id: 'laboratorio2', nome: 'Laboratório 2' },
    { id: 'reuniaoA', nome: 'Sala de Reunião A' },
    { id: 'reuniaoB', nome: 'Sala de Reunião B' },
    { id: 'auditório', nome: 'Auditório Principal' }
];

// Carrega as salas na lista
function loadRooms() {
    roomsList.innerHTML = '';
    salas.forEach(sala => {
        const btn = document.createElement('button');
        btn.className = 'room-btn';
        btn.textContent = sala.nome;
        btn.onclick = () => openSchedule(sala.id, sala.nome);
        roomsList.appendChild(btn);
    });
}

// Abre a tela de agendamento para uma sala
function openSchedule(roomId, roomName) {
    currentRoomId = roomId;
    scheduleView.style.display = 'block';
    scheduleTitle.textContent = `Agendamento para: ${roomName}`;
    
    // Define data padrão como hoje
    const today = new Date().toISOString().split('T')[0];
    selectedDateInput.value = today;
    selectedDateInput.min = today; // Não permite datas passadas
    
    renderTimeSlots(roomId);
    updateBookingButtonState();
}

// Fecha a tela de agendamento
function hideSchedule() {
    scheduleView.style.display = 'none';
    currentRoomId = null;
    // Limpa seleção
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
    updateBookingButtonState();
}

// Renderiza os horários com status (livre/ocupado)
function renderTimeSlots(roomId) {
    const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    timeList.innerHTML = '';

    const selectedDate = selectedDateInput.value;
    if (!selectedDate) {
        updateBookingButtonState();
        return;
    }
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    times.forEach(time => {
        const isBooked = bookings.some(b => b.room === roomId && b.time === time && b.date === selectedDate);

        const btn = document.createElement('button');
        btn.className = `time-btn ${isBooked ? 'booked' : ''}`;
        btn.textContent = time;
        
        if (isBooked) {
            btn.disabled = true;
            btn.title = 'Este horário já está ocupado';
        } else {
            btn.onclick = () => selectTime(btn, time);
        }
        
        timeList.appendChild(btn);
    });
    
    updateBookingButtonState();
}

// Atualiza os horários quando a data muda
function updateTimeSlots() {
    if (currentRoomId) {
        renderTimeSlots(currentRoomId);
        // Limpa seleção anterior quando muda a data
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
        updateBookingButtonState();
    }
}

// Atualiza o estado do botão de agendamento
function updateBookingButtonState() {
    const bookButton = document.querySelector('.btn-book');
    const selectedBtn = document.querySelector('.time-btn.selected');
    
    if (bookButton) {
        if (selectedBtn) {
            bookButton.disabled = false;
            bookButton.style.opacity = '1';
            bookButton.style.cursor = 'pointer';
        } else {
            bookButton.disabled = true;
            bookButton.style.opacity = '0.5';
            bookButton.style.cursor = 'not-allowed';
        }
    }
}

// Seleciona um horário
function selectTime(button, time) {
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
    if (!button.classList.contains('booked') && !button.disabled) {
        button.classList.add('selected');
    }
    updateBookingButtonState();
}

// Agendar o horário selecionado
function bookAppointment() {
    const selectedBtn = document.querySelector('.time-btn.selected');
    if (!selectedBtn) {
        return;
    }

    const time = selectedBtn.textContent;
    const roomName = scheduleTitle.textContent.replace('Agendamento para: ', '').trim();
    const selectedDate = selectedDateInput.value;
    const currentUser = localStorage.getItem('loggedInUser');

    if (!selectedDate) {
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const exists = bookings.some(b => b.room === currentRoomId && b.time === time && b.date === selectedDate);

    if (exists) {
        return;
    }

    // Cria o agendamento
    const booking = {
        id: Date.now(), // ID único
        room: currentRoomId,
        roomName: roomName,
        time: time,
        date: selectedDate,
        user: currentUser,
        createdAt: new Date().toISOString()
    };

    // Adiciona ao localStorage
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    hideSchedule();
    loadMyBookings(); // Atualiza a lista de agendamentos
}

// Carrega os agendamentos do usuário atual
function loadMyBookings() {
    const currentUser = localStorage.getItem('loggedInUser');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Filtra agendamentos do usuário atual
    const userBookings = bookings.filter(b => b.user === currentUser);
    
    myBookingsList.innerHTML = '';
    
    if (userBookings.length === 0) {
        myBookingsList.innerHTML = '<p style="color: var(--gray-text); text-align: center;">Você ainda não tem agendamentos.</p>';
        return;
    }
    
    // Ordena por data e horário
    userBookings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    userBookings.forEach(booking => {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-item';
        
        const formattedDate = new Date(booking.date).toLocaleDateString('pt-BR');
        
        bookingDiv.innerHTML = `
            <div class="booking-info">
                <div class="booking-room">${booking.roomName}</div>
                <div class="booking-details">${formattedDate} às ${booking.time}</div>
            </div>
            <button class="cancel-btn" onclick="cancelBooking(${booking.id})">
                Cancelar
            </button>
        `;
        
        myBookingsList.appendChild(bookingDiv);
    });
}

// Cancela um agendamento
function cancelBooking(bookingId) {
    const currentUser = localStorage.getItem('loggedInUser');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Verifica se o agendamento pertence ao usuário atual
    const bookingToCancel = bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) {
        return;
    }
    
    if (bookingToCancel.user !== currentUser) {
        return;
    }
    
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    loadMyBookings();
    
    // Atualiza a tela de agendamento se estiver aberta
    if (currentRoomId) {
        renderTimeSlots(currentRoomId);
    }
}

// Logout
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadRooms();
    loadMyBookings();
});