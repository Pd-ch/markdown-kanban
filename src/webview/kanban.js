// Import CSS
import './kanban.css';

// Get VS Code API
const vscode = acquireVsCodeApi();

let currentBoard = null;
let isInitialized = false;

// Listen for messages from the extension
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'updateBoard':
      currentBoard = message.board;
      renderBoard(currentBoard);
      break;
    case 'reset':
      // 重新初始化
      initializeKanban();
      break;
  }
});

// Initialize when DOM is ready
function initializeKanban() {
  // 只保留"View as Markdown"按钮
  const viewMarkdownBtn = document.getElementById('view-markdown-btn');
  if (viewMarkdownBtn && !viewMarkdownBtn.hasAttribute('data-initialized')) {
    viewMarkdownBtn.setAttribute('data-initialized', 'true');
    viewMarkdownBtn.addEventListener('click', () => {
      vscode.postMessage({
        type: 'openAsMarkdown'
      });
    });
  }

  isInitialized = true;
  
  // Initial render if we have board data
  if (currentBoard) {
    renderBoard(currentBoard);
  }
}

// DOM utilities
function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Drag and drop state
let draggedCard = null;
let draggedLane = null;

// Render functions
function renderBoard(board) {
  const boardContainer = document.getElementById('kanban-board');
  boardContainer.innerHTML = '';

  if (!board || !board.children) {
    boardContainer.innerHTML = '<p>No lanes found. Click "Add Lane" to get started.</p>';
    return;
  }

  board.children.forEach(lane => {
    const laneElement = renderLane(lane);
    boardContainer.appendChild(laneElement);
  });
}

function renderLane(lane) {
  const laneDiv = createElement('div', 'kanban-lane');
  laneDiv.setAttribute('data-lane-id', lane.id);
  
  // Lane header
  const header = createElement('div', 'lane-header');
  const title = createElement('h3', 'lane-title', lane.data.title);
  
  header.appendChild(title);
  laneDiv.appendChild(header);

  // Lane body
  const body = createElement('div', 'lane-body');
  body.addEventListener('dragover', handleDragOver);
  body.addEventListener('drop', handleDrop);
  
  // Cards
  if (lane.children && lane.children.length > 0) {
    lane.children.forEach(card => {
      const cardElement = renderCard(card, 0); // Start at level 0
      body.appendChild(cardElement);
    });
  }

  laneDiv.appendChild(body);

  return laneDiv;
}

function renderCard(card, level = 0) {
  const cardDiv = createElement('div', 'kanban-card');
  cardDiv.setAttribute('data-card-id', card.id);
  cardDiv.draggable = true;
  
  // Add nesting class and style
  if (level > 0) {
    cardDiv.classList.add('nested-card', `level-${level}`);
  }
  
  // Checkbox
  const checkbox = createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = card.data.isComplete;
  checkbox.className = 'card-checkbox';
  
  // Title
  const title = createElement('span', 'card-title', card.data.title);
  if (card.data.isComplete) {
    title.style.textDecoration = 'line-through';
  }

  cardDiv.appendChild(checkbox);
  cardDiv.appendChild(title);

  // Event listeners
  checkbox.addEventListener('change', () => {
    vscode.postMessage({
      type: 'updateCard',
      cardId: card.id,
      title: card.data.title,
      isComplete: checkbox.checked
    });
  });

  // Drag and drop
  cardDiv.addEventListener('dragstart', (e) => {
    draggedCard = card;
    e.dataTransfer.effectAllowed = 'move';
  });

  cardDiv.addEventListener('dragend', () => {
    draggedCard = null;
  });

  // Create container for this card and its children
  const cardContainer = createElement('div', 'card-container');
  cardContainer.appendChild(cardDiv);

  // Render child cards
  if (card.children && card.children.length > 0) {
    card.children.forEach(childCard => {
      const childElement = renderCard(childCard, level + 1);
      cardContainer.appendChild(childElement);
    });
  }

  return cardContainer;
}

// Drag and drop handlers
function handleDragOver(e) {
  if (draggedCard) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
}

function handleDrop(e) {
  e.preventDefault();
  
  if (!draggedCard) return;

  const laneBody = e.currentTarget;
  const lane = laneBody.closest('.kanban-lane');
  const targetLaneId = lane.getAttribute('data-lane-id');

  // Find drop position
  const cards = Array.from(laneBody.children);
  const afterElement = getDragAfterElement(laneBody, e.clientY);
  const targetIndex = afterElement ? cards.indexOf(afterElement) : cards.length;

  vscode.postMessage({
    type: 'moveCard',
    cardId: draggedCard.id,
    targetLaneId: targetLaneId,
    targetIndex: targetIndex
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Initialize event listeners
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeKanban);
} else {
  initializeKanban();
}
