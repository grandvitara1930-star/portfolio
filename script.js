
// Mobile Navigation
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// Automatically update footer year
document.getElementById('year').textContent =
  new Date().getFullYear();


// Calculator
const calcDisplay = document.getElementById('calcDisplay');

let calcCurrent = '0';
let calcPrevious = null;
let calcOperator = null;
let calcFresh = false;

function updateCalc() {
  calcDisplay.textContent = calcCurrent;
}

function calculate(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? null : a / b;
  return b;
}

document.querySelector('.calc-keys').addEventListener('click', event => {
  const button = event.target.closest('button[data-calc]');
  if (!button) return;

  const key = button.dataset.calc;

  if (key === 'clear') {
    calcCurrent = '0';
    calcPrevious = null;
    calcOperator = null;
    calcFresh = false;

  } else if (key === 'sign') {
    if (calcCurrent !== '0') {
      calcCurrent = String(Number(calcCurrent) * -1);
    }

  } else if (key === 'percent') {
    calcCurrent = String(Number(calcCurrent) / 100);

  } else if (['+', '-', '*', '/'].includes(key)) {
    if (calcOperator && !calcFresh) {
      const result = calculate(
        Number(calcPrevious),
        Number(calcCurrent),
        calcOperator
      );

      if (result === null) {
        calcCurrent = 'Cannot divide by zero';
        calcPrevious = null;
        calcOperator = null;
        calcFresh = true;
        updateCalc();
        return;
      }

      calcCurrent = String(Number(result.toPrecision(10)));
    }

    calcPrevious = calcCurrent;
    calcOperator = key;
    calcFresh = true;

  } else if (key === '=') {
    if (calcOperator && calcPrevious !== null) {
      const result = calculate(
        Number(calcPrevious),
        Number(calcCurrent),
        calcOperator
      );

      calcCurrent = result === null
        ? 'Cannot divide by zero'
        : String(Number(result.toPrecision(10)));

      calcPrevious = null;
      calcOperator = null;
      calcFresh = true;
    }

  } else if (key === '.') {
    if (calcFresh) {
      calcCurrent = '0.';
      calcFresh = false;
    } else if (!calcCurrent.includes('.')) {
      calcCurrent += '.';
    }

  } else {
    if (
      calcFresh ||
      calcCurrent === '0' ||
      calcCurrent === 'Cannot divide by zero'
    ) {
      calcCurrent = key;
    } else if (calcCurrent.length < 14) {
      calcCurrent += key;
    }

    calcFresh = false;
  }

  updateCalc();
});


// Expense Tracker
// Expenses are saved in the browser's localStorage.
const EXPENSE_KEY = 'portfolio-expenses-v1';

const expenseForm = document.getElementById('expenseForm');
const expenseName = document.getElementById('expenseName');
const expenseAmount = document.getElementById('expenseAmount');
const expenseList = document.getElementById('expenseList');
const expenseTotal = document.getElementById('expenseTotal');

let expenses = [];

try {
  expenses = JSON.parse(
    localStorage.getItem(EXPENSE_KEY) || '[]'
  );

  if (!Array.isArray(expenses)) {
    expenses = [];
  }
} catch {
  expenses = [];
}

const rupees = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);

function saveExpenses() {
  try {
    localStorage.setItem(
      EXPENSE_KEY,
      JSON.stringify(expenses)
    );
  } catch {}
}

function renderExpenses() {
  expenseTotal.textContent = rupees(
    expenses.reduce((sum, item) => sum + item.amount, 0)
  );

  expenseList.replaceChildren();

  if (!expenses.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No expenses yet. Add one above.';
    expenseList.append(empty);
  }

  expenses.forEach(item => {
    const li = document.createElement('li');
    li.className = 'expense-item';

    const name = document.createElement('span');
    name.textContent = item.name;

    const amount = document.createElement('strong');
    amount.textContent = rupees(item.amount);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-expense';
    remove.textContent = '×';
    remove.setAttribute(
      'aria-label',
      'Delete ' + item.name
    );

    remove.addEventListener('click', () => {
      expenses = expenses.filter(
        expense => expense.id !== item.id
      );

      saveExpenses();
      renderExpenses();
    });

    li.append(name, amount, remove);
    expenseList.append(li);
  });
}

expenseForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = expenseName.value.trim();
  const amount = Number(expenseAmount.value);

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  expenses.unshift({
    id: (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random(),
    name,
    amount
  });

  saveExpenses();
  renderExpenses();
  expenseForm.reset();
  expenseName.focus();
});

document.getElementById('clearExpenses')
  .addEventListener('click', () => {
    if (
      expenses.length &&
      confirm('Delete all expenses?')
    ) {
      expenses = [];
      saveExpenses();
      renderExpenses();
    }
  });

renderExpenses();


// Tic-Tac-Toe Game
const cells = [
  ...document.querySelectorAll('[data-cell]')
];

const gameStatus = document.getElementById('gameStatus');

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;

let scores = {
  X: 0,
  O: 0,
  draw: 0
};

function renderGame() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.classList.remove('win');
    cell.disabled = gameOver || Boolean(board[i]);
  });
}

function resetRound() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;

  gameStatus.textContent = "X's turn";
  renderGame();
}

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (gameOver || board[index]) return;

    board[index] = currentPlayer;

    const line = winningLines.find(combo =>
      combo.every(i => board[i] === currentPlayer)
    );

    if (line) {
      gameOver = true;
      scores[currentPlayer]++;

      line.forEach(i => cells[i].classList.add('win'));

      gameStatus.textContent =
        currentPlayer + ' wins this round!';

    } else if (board.every(Boolean)) {
      gameOver = true;
      scores.draw++;

      gameStatus.textContent = "It's a draw!";

    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

      gameStatus.textContent =
        currentPlayer + "'s turn";
    }

    document.getElementById('xScore').textContent =
      scores.X;

    document.getElementById('oScore').textContent =
      scores.O;

    document.getElementById('drawScore').textContent =
      scores.draw;

    renderGame();

    // Keep the winning line highlighted.
    if (line) {
      line.forEach(i => cells[i].classList.add('win'));
    }
  });
});

document.getElementById('resetGame')
  .addEventListener('click', resetRound);

renderGame();


// Contact Form
// Opens the visitor's default email application.
document.getElementById('contactForm')
  .addEventListener('submit', event => {
    event.preventDefault();

    const name = document
      .getElementById('contactName')
      .value.trim();

    const email = document
      .getElementById('contactEmail')
      .value.trim();

    const message = document
      .getElementById('contactMessage')
      .value.trim();

    const subject = encodeURIComponent(
      'Portfolio enquiry from ' + name
    );

    const body = encodeURIComponent(
      'Name: ' + name +
      '\nEmail: ' + email +
      '\n\n' + message
    );

    window.location.href =
      'mailto:your-email@example.com?subject=' +
      subject + '&body=' + body;
  });

