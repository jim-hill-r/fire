import React, { useState } from "react"
import Plot from 'react-plotly.js';

type Series = {
  x:string[]
  y:number[]
}

enum Period {
  MONTHLY,
  ANNUALLY
}

type Cashflow = {
  amount:number
  period: Period
  startDate:Date
  endDate:Date
}

type Rates = {
  inflation:number
  capital:number
}

type TaxBracket = {
  rate:number
  ceiling:number
}

type MarginalTax = {
  brackets: TaxBracket[]
}

const subtractTaxes = (income) => {
  return income * 0.7 //TODO: Add sophistication here. Make this an expense stream.
}

const calculateCashflow = (cashflows, date) => {
  let total = 0
  for(let cashflow of cashflows) {
    if (cashflow.startDate < date && cashflow.endDate > date) {
      if(cashflow.period === Period.MONTHLY) {
        total += cashflow.amount
      } else if (cashflow.period === Period.ANNUALLY) {
        total += cashflow.amount / 12
      }
    }
  }
  return total
}

const updatePrinciple = (principle, incomes, expenses, rates, date) => {
  const totalIncome = calculateCashflow(incomes, date)
  const afterTaxIncome = subtractTaxes(totalIncome)
  const totalExpense = calculateCashflow(expenses, date)
  return (principle * (1 + rates.capital / 12)) + afterTaxIncome - totalExpense
}

const updateCash = (savings, incomes, expenses, rates) => {
  const xLabels = []
  const yValues = []
  let principle = savings
  for(let year = 2022; year < 1984+100; year++) {
    for(let month = 1; month < 13; month++) {
      const date = new Date(year,month)
      xLabels.push(`${year}-${month}`)
      yValues.push(principle)
      principle = updatePrinciple(principle,incomes,expenses,rates,date)
    }
  }
  return {x:xLabels,y:yValues}
}

export default function IndexPage() {

  const [ savings, setSavings ] = useState<number>(0)
  const [ retirement, setRetirement ] = useState<number>(0)
  const [ income, setIncome ] = useState<Cashflow>({
    amount:70000, // ~Median US Income
    period: Period.ANNUALLY,
    startDate:new Date(Date.now()),
    endDate:new Date(2050,1)
  })
  const [ survival, setSurvival ] = useState<Cashflow>({
    amount:60000, // ~Median US Cost of Living
    period: Period.ANNUALLY,
    startDate:new Date(Date.now()),
    endDate:new Date(2200,1)
  })
  const [ rent, setRent ] = useState<Cashflow>({
    amount:1100, // Median US Rent
    period: Period.MONTHLY,
    startDate:new Date(Date.now()),
    endDate:new Date(2200,1)
  })
  const [ rates, setRates ] = useState<Rates>({
    inflation: 0.02,
    capital: 0.06
  })
  const [ retirementYear, setRetirementYear ] = useState<number>(2050)
  const [ cash, setCash ] = useState<Series>(updateCash(savings+retirement,[income],[survival, rent],rates))

  const onIncomeAmountChange = (event) => {
    setIncome((income) => {
      return {
        ...income,
        amount: parseInt(event.target.value)
      }
    })
  }

  const onIncomeRetirementDateChange = (event) => {
    setIncome((income) => {
      return {
        ...income,
        endDate: new Date(parseInt(event.target.value),1)
      }
    })
  }

  const onSurvivalAmountChange = (event) => {
    setSurvival((survival) => {
      return {
        ...survival,
        amount: parseInt(event.target.value)
      }
    })
  }

  const onRentAmountChange = (event) => {
    setRent((rent) => {
      return {
        ...rent,
        amount: parseInt(event.target.value)
      }
    })
  }

  const onInflationChange = (event) => {
    setRates((rates) => {
      return {
        ...rates,
        inflation: parseFloat(event.target.value)
      }
    })
  }

  const onCapitalChange = (event) => {
    setRates((rates) => {
      return {
        ...rates,
        capital: parseFloat(event.target.value)
      }
    })
  }

  const onRetirementYearChange = (event) => {
    setRetirementYear((rates) => {
      return parseInt(event.target.value)
    })
    onIncomeRetirementDateChange(event)
  }

  const refresh = () => {
    setCash(updateCash(savings+retirement,[income],[survival, rent],rates))
  }

  return (
    <>
      <div>
        FIRE
      </div>
      <button onClick={refresh}>Refresh</button>
      <div>
        <label>Savings (Total cash on hand)</label>
        <input type="number" value={savings} onChange={(event) => setSavings(parseInt(event.target.value))}></input>
      </div>
      <div>
        <label>Retirement (Untouchable until retirement age)</label>
        <input type="number" value={retirement} onChange={(event) => setRetirement(parseInt(event.target.value))}></input>
      </div>
      <div>
        <label>Annual Income</label>
        <input type="number" value={income.amount} onChange={onIncomeAmountChange}></input>
      </div>
      <div>
        <label>Annual Survival Expense</label>
        <input type="number" value={survival.amount} onChange={onSurvivalAmountChange}></input>
      </div>
      <div>
        <label>Rent</label>
        <input type="number" value={rent.amount} onChange={onRentAmountChange}></input>
      </div>
      <div>
        <label>Inflation Rate (APY)</label>
        <input type="number" value={rates.inflation} onChange={onInflationChange}></input>
      </div>
      <div>
        <label>Capital Gains Rate (APY)</label>
        <input type="number" value={rates.capital} onChange={onCapitalChange}></input>
      </div>
      <div>
        <label>Retirement Year</label>
        <input type="number" value={retirementYear} onChange={onRetirementYearChange}></input>
      </div>
      <Plot
        data={[
          {
            x: cash.x,
            y: cash.y,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'orange' },
          },
        ]}
        layout={{ width: 1400, height: 600, title: 'Cashflow' }}
      />
    </>
  )
}