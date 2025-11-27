// DOM Elements
const loginPage = document.getElementById('loginPage');
const allowancePage = document.getElementById('allowancePage');
const dashboardPage = document.getElementById('dashboardPage');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');

const monthlyAllowanceInput = document.getElementById('monthlyAllowance');
const saveAllowanceBtn = document.getElementById('saveAllowanceBtn');

const displayAllowance = document.getElementById('displayAllowance');
const totalSpentEl = document.getElementById('totalSpent');
const remainingBalanceEl = document.getElementById('remainingBalance');

const expenseDate = document.getElementById('expenseDate');
const expenseDesc = document.getElementById('expenseDesc');
const expenseAmount = document.getElementById('expenseAmount');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const updateExpenseBtn = document.getElementById('updateExpenseBtn');

const expenseList = document.getElementById('expenseList');
const historyList = document.getElementById('historyList');

const logoutBtn = document.getElementById('logoutBtn');
const editAllowanceBtn = document.getElementById('editAllowanceBtn');
const resetExpensesBtn = document.getElementById('resetExpensesBtn');
const currencySelect = document.getElementById('currencySelect');

let currentUser = null;
let userData = null;
let editIndex = null;
let expenseChart = null;
let currencySymbol = '$';

// ----------------- Utility Functions -----------------

function saveUserData() {
  localStorage.setItem(currentUser, JSON.stringify(userData));
}

function loadUserData() {
  const data = localStorage.getItem(currentUser);
  if (data) userData = JSON.parse(data);
  else userData = { username: currentUser, email: '', password: '', allowance: 0, expenses: [], history: {}, currency: '$' };
  currencySymbol = userData.currency || '$';
  currencySelect.value = currencySymbol;
}

function showPage(page) {
  loginPage.classList.remove('active');
  allowancePage.classList.remove('active');
  dashboardPage.classList.remove('active');
  page.classList.add('active');
}

// ----------------- Login/Register -----------------

loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !email || !password) {
    alert('Enter username, email and password');
    return;
  }

  currentUser = username;

  if (!localStorage.getItem(currentUser)) {
    // New user registration
    localStorage.setItem(currentUser, JSON.stringify({
      username,
      email,
      password,
      allowance: 0,
      expenses: [],
      history: {},
      currency: '$'
    }));
  } else {
    // Existing user login
    const stored = JSON.parse(localStorage.getItem(currentUser));
    if (stored.password !== password) { alert('Incorrect password!'); return; }
    stored.email = email; // Update email if changed
    localStorage.setItem(currentUser, JSON.stringify(stored));
  }

  loadUserData();
  if (!userData.allowance || userData.allowance === 0) showPage(allowancePage);
  else showDashboard();
});

// ----------------- Allowance -----------------

saveAllowanceBtn.addEventListener('click', () => {
  const allowance = parseFloat(monthlyAllowanceInput.value);
  if (isNaN(allowance) || allowance <= 0) { alert('Enter valid allowance'); return; }
  userData.allowance = allowance;
  userData.expenses = [];
  saveUserData();
  showDashboard();
});

editAllowanceBtn.addEventListener('click', () => {
  const newAllowance = prompt("Enter new monthly allowance:", userData.allowance);
  const allowanceValue = parseFloat(newAllowance);
  if (!isNaN(allowanceValue) && allowanceValue > 0) {
    userData.allowance = allowanceValue;
    saveUserData();
    renderDashboard();
  } else { alert("Enter a valid allowance"); }
});

// ----------------- Logout -----------------

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  userData = null;
  usernameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
  showPage(loginPage);
});

// ----------------- Reset Expenses -----------------

resetExpensesBtn.addEventListener('click', () => {
  if (confirm("Reset all current month expenses?")) {
    const now = new Date();
    if (userData.expenses.length > 0) {
      const prevMonth = `${now.getFullYear()}-${now.getMonth()}`;
      userData.history[prevMonth] = { allowance: userData.allowance, expenses: userData.expenses };
    }
    userData.expenses = [];
    saveUserData();
    renderDashboard();
  }
});

// ----------------- Currency -----------------

currencySelect.addEventListener('change', () => {
  currencySymbol = currencySelect.value;
  userData.currency = currencySymbol;
  saveUserData();
  renderDashboard();
});

// ----------------- Expenses -----------------

addExpenseBtn.addEventListener('click', () => {
  const date = expenseDate.value;
  const desc = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  if (!date || !desc || isNaN(amount) || amount <= 0) { alert('Enter valid expense details'); return; }

  userData.expenses.push({ date, desc, amount });
  saveUserData();
  clearExpenseInputs();
  renderDashboard();
});

updateExpenseBtn.addEventListener('click', () => {
  if (editIndex === null) return;
  const date = expenseDate.value;
  const desc = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  if (!date || !desc || isNaN(amount) || amount <= 0) { alert('Enter valid expense details'); return; }

  userData.expenses[editIndex] = { date, desc, amount };
  editIndex = null;
  updateExpenseBtn.style.display = 'none';
  addExpenseBtn.style.display = 'block';
  clearExpenseInputs();
  saveUserData();
  renderDashboard();
});

function clearExpenseInputs() {
  expenseDate.value = '';
  expenseDesc.value = '';
  expenseAmount.value = '';
}

// ----------------- Render Dashboard -----------------

function renderDashboard() {
  displayAllowance.textContent = `${currencySymbol}${userData.allowance.toFixed(2)}`;
  let totalSpent = userData.expenses.reduce((sum, e) => sum + e.amount, 0);
  totalSpentEl.textContent = `${currencySymbol}${totalSpent.toFixed(2)}`;
  remainingBalanceEl.textContent = `${currencySymbol}${(userData.allowance - totalSpent).toFixed(2)}`;

  // Expenses List
  expenseList.innerHTML = '';
  userData.expenses.forEach((e, idx) => {
    const li = document.createElement('li');
    li.textContent = `${e.date}: ${e.desc} - ${currencySymbol}${e.amount.toFixed(2)}`;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('editBtn');
    editBtn.addEventListener('click', () => {
      expenseDate.value = e.date;
      expenseDesc.value = e.desc;
      expenseAmount.value = e.amount;
      editIndex = idx;
      addExpenseBtn.style.display = 'none';
      updateExpenseBtn.style.display = 'block';
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this expense?')) {
        userData.expenses.splice(idx, 1);
        saveUserData();
        renderDashboard();
      }
    });

    li.appendChild(editBtn);
    li.appendChild(delBtn);
    expenseList.appendChild(li);
  });

  renderChart();
  renderHistory();
}

// ----------------- Professional Daily Totals Chart -----------------

function renderChart() {
  // Aggregate expenses by date
  const dailyTotals = {};
  userData.expenses.forEach(e => {
    if (dailyTotals[e.date]) dailyTotals[e.date] += e.amount;
    else dailyTotals[e.date] = e.amount;
  });

  const labels = Object.keys(dailyTotals).sort();
  const data = labels.map(date => dailyTotals[date]);

  if (expenseChart) expenseChart.destroy();
  const ctx = document.getElementById('expenseChart').getContext('2d');

  // Colors based on daily total vs allowance
  const colors = data.map(amount => {
    if(amount < userData.allowance*0.25) return '#50e3c2'; // Green
    if(amount < userData.allowance*0.5) return '#f5a623';  // Orange
    return '#d0021b'; // Red
  });

  expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `Total Daily Expenses (${currencySymbol})`,
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${currencySymbol}${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#e0e0e0' }, grid: { color: '#3a4a6b' } },
        y: { ticks: { color: '#e0e0e0', beginAtZero: true }, grid: { color: '#3a4a6b' } }
      }
    }
  });
}

// ----------------- History -----------------

function renderHistory() {
  historyList.innerHTML = '';
  for (let month in userData.history) {
    const li = document.createElement('li');
    li.textContent = month;
    li.addEventListener('click', () => {
      const monthData = userData.history[month];
      const total = monthData.expenses.reduce((a,b)=>a+b.amount,0).toFixed(2);
      alert(`Allowance: ${currencySymbol}${monthData.allowance}\nTotal Expenses: ${currencySymbol}${total}`);
    });
    historyList.appendChild(li);
  }
}

// ----------------- Show Dashboard -----------------

function showDashboard() {
  showPage(dashboardPage);
  renderDashboard();
}
