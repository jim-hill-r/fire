import React, { useState } from "react"
import Plot from 'react-plotly.js';

type Series = {
  x:string[]
  y:number[]
}

type Cashflow = {
  amount:number
  startDate:Date
  endDate:Date
}
const updatePrinciple = (principle, incomes, expenses, rates, currentMonth) => {
  for(let income of incomes) {
    principle += (income.amount / 12)
  }
  for(let expense of expenses) {
    principle -= (expense.amount)
  }
  return principle
}

const updateCash = (savings, incomes, expenses) => {
  const xLabels = []
  const yValues = []
  let principle = savings
  let currentMonth = 0
  for(let year = 2022; year < 1984+100; year++) {
    for(let month = 1; month < 13; month++) {
      xLabels.push(`${year}-${month}`)
      yValues.push(principle)
      principle = updatePrinciple(principle,incomes,expenses,null,currentMonth)
      currentMonth++;
    }
  }
  return {x:xLabels,y:yValues}
}

export default function IndexPage() {

  const [ savings, setSavings ] = useState<number>(0)
  const [ retirement, setRetirement ] = useState<number>(0)
  const [ income, setIncome ] = useState<Cashflow>({
    amount:70000, // ~Median US Income
    startDate:new Date(Date.now()),
    endDate:new Date(2050)
  })
  const [ rent, setRent ] = useState<Cashflow>({
    amount:1100, // Median US Rent
    startDate:new Date(Date.now()),
    endDate:new Date(2050)
  })
  const [ cash, setCash ] = useState<Series>(updateCash(savings+retirement,[income],[rent]))

  const onIncomeAmountChange = (event) => {
    setIncome((income) => {
      return {
        ...income,
        amount: event.target.value
      }
    })
  }

  const onRentAmountChange = (event) => {
    setRent((rent) => {
      return {
        ...rent,
        amount: event.target.value
      }
    })
  }

  const refresh = () => {
    setCash(updateCash(savings+retirement,[income],[rent]))
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
        <label>Rent</label>
        <input type="number" value={rent.amount} onChange={onRentAmountChange}></input>
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