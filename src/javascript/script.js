document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("taskModal");
    const closeModalButton = document.querySelector(".close");
    const saveTaskButton = document.querySelector('.save-task-btn');
    const addCardButtons = document.querySelectorAll('.add-card');
    const taskTitleInput = document.querySelector('.modal-content input[type="text"]');
    const taskDescriptionInput = document.querySelector('.modal-content textarea');
    const prioritySelect = document.querySelector('.modal-section select:nth-child(2)');
    const columnSelect = document.querySelector('.modal-section select:first-child');

    // Função para abrir o modal
    function openModal() {
        modal.style.display = "flex";
    }

    // Evento para abrir o modal ao clicar no botão de adicionar card
    addCardButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // Função para fechar o modal
    function closeModal() {
        modal.style.display = "none";
    }

    closeModalButton.addEventListener("click", closeModal);

    // Fecha o modal ao clicar fora do conteúdo
    window.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Fecha o modal ao pressionar a tecla "Esc"
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Função para limpar o modal
    function clearModal() {
        taskTitleInput.value = "";
        taskDescriptionInput.value = "";
        prioritySelect.selectedIndex = 0;
        columnSelect.selectedIndex = 0;
    }

    // Função para criar um novo card com o botão de excluir

function createCard(title, priority, columnId) {
    // Tradução da prioridade para português
    const priorityText = {
        low: "Baixa",
        medium: "Média",
        high: "Alta"
    }[priority] || priority;

    // Captura a data de criação no formato local
    const creationDate = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    // Cria o HTML do card com a data de criação e o ícone de relógio
    const newCard = document.createElement('div');
    newCard.classList.add('kanban-card');
    newCard.draggable = true;
    newCard.innerHTML = `
        <div class="badge ${priority}">
            <span>${priorityText} prioridade</span>
        </div>
        <p class="card-title">${title}</p>
        <div class="card-footer">
            <i class="fa-regular fa-clock"></i> <!-- Ícone de relógio -->
            <span class="creation-date">${creationDate}</span> <!-- Data de criação -->
        </div>
        <button class="delete-card">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    newCard.addEventListener('dragstart', e => {
        e.currentTarget.classList.add('dragging');
    });

    newCard.addEventListener('dragend', e => {
        e.currentTarget.classList.remove('dragging');
    });

    // Evento de clique para excluir o card
    newCard.querySelector('.delete-card').addEventListener('click', () => {
        newCard.remove();
    });

    const targetColumn = document.querySelector(`.kanban-column[data-id="${columnId}"] .kanban-cards`);
    targetColumn.appendChild(newCard);
}


    // Evento para salvar e adicionar uma nova tarefa
    saveTaskButton.addEventListener('click', () => {
        const taskTitle = taskTitleInput.value;
        const taskDescription = taskDescriptionInput.value;
        const priority = prioritySelect.options[prioritySelect.selectedIndex].value.toLowerCase();
        const columnId = columnSelect.options[columnSelect.selectedIndex].value;

        if (taskTitle && priority && columnId) {
            createCard(taskTitle, priority, columnId);
            closeModal();
            clearModal();
        }
    });

    document.querySelectorAll('.kanban-cards').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            e.currentTarget.classList.add('cards-hover');
        });

        column.addEventListener('dragleave', e => {
            e.currentTarget.classList.remove('cards-hover');
        });

        column.addEventListener('drop', e => {
            e.currentTarget.classList.remove('cards-hover');
            const dragCard = document.querySelector('.kanban-card.dragging');
            e.currentTarget.appendChild(dragCard);
        });
    });

    function saveState() {
        const kanbanData = Array.from(document.querySelectorAll('.kanban-column')).map(column => {
            const cards = Array.from(column.querySelectorAll('.kanban-card')).map(card => ({
                title: card.querySelector('.card-title').innerText,
                priority: card.querySelector('.badge').classList[1],
            }));
            return { id: column.getAttribute('data-id'), cards };
        });
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
    }

    function loadState() {
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        if (kanbanData) {
            kanbanData.forEach(columnData => {
                const column = document.querySelector(`.kanban-column[data-id="${columnData.id}"] .kanban-cards`);
                column.innerHTML = '';

                columnData.cards.forEach(cardData => {
                    createCard(cardData.title, cardData.priority, columnData.id);
                });
            });
        }
    }

    window.addEventListener('beforeunload', saveState);

    loadState();
});
