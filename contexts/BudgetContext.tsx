import React, { createContext, useContext, useState } from "react";

interface BudgetContextType {
  budgetMonthId: number | null;
  setBudgetMonthId: (id: number | null) => void;
}

const BudgetContext = createContext<BudgetContextType>({
  budgetMonthId: null,
  setBudgetMonthId: () => {},
});



export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const [budgetMonthId, setBudgetMonthId] = useState<number | null>(null);

  return (
    <BudgetContext.Provider value={{ budgetMonthId, setBudgetMonthId }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
