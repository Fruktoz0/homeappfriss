import axios from 'axios';
import { API_URL } from '../constants/config';
import type {
    BudgetExpense,
    BudgetFixedExpense,
    BudgetMonth,
    BudgetWeek
} from '../types/budget';


// Fetch budget months for the logged-in user
export async function getBudgetMonths(token: string, monthIndex: number): Promise<{ currentMonth: BudgetMonth }> {
    const res = await axios.get(`${API_URL}/budget/months?month=${monthIndex}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//create or update a budget month
export async function createOrUpdateMonth(token: string, month: string, total_budget: number): Promise<BudgetMonth> {
    const res = await axios.post(
        `${API_URL}/budget/month`, { month, total_budget }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    }
    );
    return res.data.month;
}

//Get all budget weeks for a month
export async function getBudgetWeeks(token: string, monthId: number): Promise<BudgetWeek[]> {
    const res = await axios.get(`${API_URL}/budget/weeks/${monthId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Get all expenses for a specific budget month
export async function getBudgetExpenses(token: string, monthId: number): Promise<BudgetExpense[]> {
    const res = await axios.get(`${API_URL}/budget/expenses/${monthId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Create a new expense for a budget month
export async function createExpense(token: string, expense: Omit<BudgetExpense, 'id'>): Promise<BudgetExpense> {
    const res = await axios.post(`${API_URL}/budget/expenses`, expense, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Delete an expense by ID
export async function deleteExpense(token: string, id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/budget/expense/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Get all fixed expenses
export async function getFixedExpenses(token: string): Promise<BudgetFixedExpense[]> {
    const res = await axios.get(`${API_URL}/budget/fixed-expenses`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Create a new fixed expense
export async function createFixedExpense(token: string, fixedExpense: Omit<BudgetFixedExpense, 'id'>): Promise<BudgetFixedExpense> {
    const res = await axios.post(`${API_URL}/budget/fixed-expense`, fixedExpense, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    }
    );
    return res.data;
}

//Mark a fixed expense as paid
export async function markFixedExpensePaid(token: string, id: number): Promise<{ message: string }> {
    const res = await axios.put(
        `${API_URL}/budget/fixed-expense/${id}/paid`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    }
    );
    return res.data;
}

//Delete a fixed expense by ID
export async function deleteFixedExpense(token: string, id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/budget/fixed-expense/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Update budget month total budget
export async function updateBudgetMonth(token: string, monthId: number, total_budget: number) {
    const res = await axios.put(`${API_URL}/budget/month/${monthId}`, { total_budget }, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

//Coming soon: functions for updating expenses, fixed expenses, and budget weeks