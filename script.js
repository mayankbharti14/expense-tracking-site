// Data storage
let budget = 0;
let categories = [];
let expenses = [];

// DOM elements
const budgetForm = document.getElementById('budgetForm');
const budgetAmountInput = document.getElementById('budgetAmount');
const categoryForm = document.getElementById('categoryForm');
const categoryNameInput = document.getElementById('categoryName');
const categoryColorInput = document.getElementById('categoryColor');
const expenseForm = document.getElementById('expenseForm');
const expenseDescriptionInput = document.getElementById('expenseDescription');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategorySelect = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const filterCategorySelect = document.getElementById('filterCategory');
const clearAllBtn = document.getElementById('clearAllBtn');

// Summary elements
const totalBudgetEl = document.getElementById('totalBudget');
const totalExpensesEl = document.getElementById('totalExpenses');
const remainingBalanceEl = document.getElementById('remainingBalance');

// List containers
const categoriesContainer = document.getElementById('categoriesContainer');
const expensesList = document.getElementById('expensesList');

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToLocalStorage() {
    localStorage.setItem('expenseTracker', JSON.stringify({
        budget,
        categories,
        expenses
    }));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('expenseTracker');
    if (data) {
        const parsed = JSON.parse(data);
        budget = parsed.budget || 0;
        categories = parsed.categories || [];
        expenses = parsed.expenses || [];
    }
}

// Budget functions
function setBudget(amount) {
    budget = parseFloat(amount);
    updateSummary();
    saveToLocalStorage();
}

// Category functions
function addCategory(name, color) {
    const category = {
        id: generateId(),
        name: name.trim(),
        color: color
    };
    
    categories.push(category);
    updateCategorySelects();
    renderCategories();
    saveToLocalStorage();
    return category;
}

function deleteCategory(categoryId) {
    // Check if category is used in expenses
    const isUsed = expenses.some(expense => expense.categoryId === categoryId);
    
    if (isUsed) {
        if (!confirm('This category is used in some expenses. Deleting it will remove those expenses. Continue?')) {
            return;
        }
        // Remove expenses with this category
        expenses = expenses.filter(expense => expense.categoryId !== categoryId);
        renderExpenses();
    }
    
    categories = categories.filter(category => category.id !== categoryId);
    updateCategorySelects();
    renderCategories();
    updateSummary();
    saveToLocalStorage();
}

function getCategoryById(categoryId) {
    return categories.find(category => category.id === categoryId);
}

// Expense functions
function addExpense(description, amount, categoryId, date) {
    const expense = {
        id: generateId(),
        description: description.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    expenses.unshift(expense); // Add to beginning for recent first
    renderExpenses();
    updateSummary();
    saveToLocalStorage();
    return expense;
}

function deleteExpense(expenseId) {
    expenses = expenses.filter(expense => expense.id !== expenseId);
    renderExpenses();
    updateSummary();
    saveToLocalStorage();
}

// Render functions
function updateSummary() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget - totalExpenses;
    
    totalBudgetEl.textContent = formatCurrency(budget);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    remainingBalanceEl.textContent = formatCurrency(remaining);
    
    // Update remaining balance color
    if (remaining < 0) {
        remainingBalanceEl.style.color = '#ef4444';
    } else if (remaining < budget * 0.2) {
        remainingBalanceEl.style.color = '#f59e0b';
    } else {
        remainingBalanceEl.style.color = '#10b981';
    }
}

function updateCategorySelects() {
    // Update expense category select
    expenseCategorySelect.innerHTML = '<option value="">Select category</option>';
    
    // Update filter category select
    filterCategorySelect.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const expenseOption = document.createElement('option');
        expenseOption.value = category.id;
        expenseOption.textContent = category.name;
        expenseCategorySelect.appendChild(expenseOption);
        
        const filterOption = document.createElement('option');
        filterOption.value = category.id;
        filterOption.textContent = category.name;
        filterCategorySelect.appendChild(filterOption);
    });
}

function renderCategories() {
    if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="empty-state">No categories yet. Add your first category above.</p>';
        return;
    }
    
    categoriesContainer.innerHTML = categories.map(category => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <span class="category-name">${category.name}</span>
            </div>
            <div class="category-actions">
                <button class="btn btn-danger btn-small" onclick="deleteCategory('${category.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function renderExpenses() {
    const filterCategory = filterCategorySelect.value;
    const filteredExpenses = filterCategory 
        ? expenses.filter(expense => expense.categoryId === filterCategory)
        : expenses;
    
    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <h3>No expenses found</h3>
                <p>${filterCategory ? 'No expenses in this category' : 'Start tracking by adding your first expense above'}</p>
            </div>
        `;
        return;
    }
    
    expensesList.innerHTML = filteredExpenses.map(expense => {
        const category = getCategoryById(expense.categoryId);
        const categoryName = category ? category.name : 'Unknown';
        const categoryColor = category ? category.color : '#6b7280';
        
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-category-indicator" style="background-color: ${categoryColor}"></div>
                    <div class="expense-details">
                        <h4>${expense.description}</h4>
                        <div class="expense-meta">
                            <span>${categoryName}</span>
                            <span>${formatDate(expense.date)}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="expense-amount">-${formatCurrency(expense.amount)}</span>
                    <div class="expense-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteExpense('${expense.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Event listeners
budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = budgetAmountInput.value;
    
    if (amount && parseFloat(amount) > 0) {
        setBudget(amount);
        budgetAmountInput.value = '';
        
        // Show success feedback
        const button = budgetForm.querySelector('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10-10"/></svg> Budget Set!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }
});

categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = categoryNameInput.value;
    const color = categoryColorInput.value;
    
    if (name.trim()) {
        // Check for duplicate names
        const exists = categories.some(category => 
            category.name.toLowerCase() === name.trim().toLowerCase()
        );
        
        if (exists) {
            alert('A category with this name already exists!');
            return;
        }
        
        addCategory(name, color);
        categoryNameInput.value = '';
        categoryColorInput.value = '#3b82f6';
        
        // Show success feedback
        const button = categoryForm.querySelector('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10-10"/></svg> Added!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = expenseDescriptionInput.value;
    const amount = expenseAmountInput.value;
    const categoryId = expenseCategorySelect.value;
    const date = expenseDateInput.value;
    
    if (description.trim() && amount && parseFloat(amount) > 0 && categoryId && date) {
        addExpense(description, amount, categoryId, date);
        
        // Reset form
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
        expenseCategorySelect.value = '';
        expenseDateInput.value = '';
        
        // Show success feedback
        const button = expenseForm.querySelector('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5l10-10"/></svg> Added!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }
});

filterCategorySelect.addEventListener('change', renderExpenses);

clearAllBtn.addEventListener('click', () => {
    if (expenses.length === 0) return;
    
    if (confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
        expenses = [];
        renderExpenses();
        updateSummary();
        saveToLocalStorage();
    }
});

// Initialize app
function initializeApp() {
    loadFromLocalStorage();
    
    // Set today's date as default
    expenseDateInput.value = new Date().toISOString().split('T')[0];
    
    // Add some default categories if none exist
    if (categories.length === 0) {
        addCategory('Food & Dining', '#ef4444');
        addCategory('Transportation', '#3b82f6');
        addCategory('Entertainment', '#8b5cf6');
        addCategory('Shopping', '#f59e0b');
        addCategory('Bills & Utilities', '#10b981');
        addCategory('Healthcare', '#ec4899');
    }
    
    updateSummary();
    updateCategorySelects();
    renderCategories();
    renderExpenses();
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);