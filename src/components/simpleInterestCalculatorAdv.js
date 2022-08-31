import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Joi from 'joi'
import {
  Input,
  Button,
  Table,
  TableNew,
  formatCurrency,
  unformattedCurrency,
  ordinalSuffixOf,
} from './helper'
import { HowToUse, Faqs, DisplayErrors } from './others'

class SimpleInterestCalculator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      p: 1000, // Principal amount
      r: 3, // Rate of interest
      t: { y: 1, m: 0, d: 0 }, // Investment tenure in years, months and days
      intPeriod: 'y', // Interest period
      errors: null,
      prevInputs: null,
    }
  }

  componentDidMount() {
    this.props.setType('si')
  }

  handleChange = (name, value) => {
    value = value.target.value
    if (name === 'p') {
      this.setState({ p: formatCurrency(value, '0,0') })
    } else if (name === 'r') this.setState({ r: value })
    else if (name === 'intPeriod') this.setState({ [name]: value })
  }

  handleTimeChange = (name, value) => {
    const timePeriod = this.state.t
    this.setState({ t: { ...timePeriod, [name]: value.target.value } })
  }

  handleClick = () => {
    const { r, t, intPeriod } = this.state
    const p = unformattedCurrency(this.state.p)
    // console.log(`P: ${p}, R: ${r}, T: ${t}`)

    // validate inputs
    const inputValidated = Joi.object({
      p: Joi.number().integer().min(1).label('Principal amount'),
      r: Joi.number().max(100).greater(0).label('Rate of interest'),
    }).validate({
      p,
      r,
    })
    if (inputValidated.error) {
      this.setState({ errors: inputValidated.error.message })
      return
    }

    let prevInputs = { p, r, t, intPeriod }
    this.setState({
      prevInputs: prevInputs,
      errors: null,
    })
  }

  render() {
    const { p, r, t, intPeriod } = this.state

    return (
      <>
        <Switch>
          <Route path="/si/how-to-use">
            <HowToUse type="si" />
          </Route>
          <Route path="/si/faqs">
            <Faqs type="si" />
          </Route>
          <Route path="/">
            <div className="sidebar-left">
              <h1>Simple Interest Calculator</h1>
              <div id="simple_interest_form" className="calculator-form">
                <form className="form" autoComplete="off">
                  <Input
                    name="p"
                    value={p}
                    onChange={this.handleChange}
                    label="Principal amount in (Rs.)"
                    type="0"
                    min="0"
                  />
                  <div className="display-flex align-items-center">
                    <Input
                      name="r"
                      value={r}
                      onChange={this.handleChange}
                      label="Rate of interest (%)"
                      type="1"
                      min="0"
                    />
                    <div className="input-prefix">
                      <select
                        name="intPeriod"
                        value={intPeriod}
                        className="form-input"
                        onChange={(v) => this.handleChange('intPeriod', v)}
                      >
                        <option value="m">Monthly</option>
                        <option value="y">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="display-flex align-items-center">
                    <Years value={t.y} onChange={this.handleTimeChange} />
                    <Months value={t.m} onChange={this.handleTimeChange} />
                    <Days value={t.d} onChange={this.handleTimeChange} />
                  </div>
                  <Button
                    label="Calculate Simple Interest"
                    onClick={this.handleClick}
                    type="success"
                  />
                </form>
                <DisplayErrors errors={this.state.errors} />
                <Result prevInputs={this.state.prevInputs} />
              </div>
            </div>
            <div className="sidebar-right">
              <CalculationRecord prevInputs={this.state.prevInputs} />
            </div>
          </Route>
        </Switch>
      </>
    )
  }
}

export default SimpleInterestCalculator

function CalculationRecord({ prevInputs }) {
  if (!prevInputs)
    return (
      <div className="bigText">
        Let's find out, How much interest you gain on your amount using simple
        interest.
      </div>
    )

  const { r, t, intPeriod } = prevInputs
  const p = unformattedCurrency(prevInputs.p)

  const ty = Number(t.y)
  const tm = Number(t.m)
  const td = Number(t.d)

  let records = []
  let totalInterest = 0

  if (isFinite(ty) && ty > 0) {
    const monthlyIteration = intPeriod === 'm' && ty <= 5
    const totalIteration = monthlyIteration ? ty * 12 : ty
    const yearValue = monthlyIteration ? 1 / 12 : 1
    const timeLabel = monthlyIteration ? 'Month' : 'Year'

    for (let i = 1; i <= totalIteration; i++) {
      let interest = calculateSI({ p, r, t: { y: yearValue }, intPeriod })
      totalInterest += interest
      let rowClassNames =
        monthlyIteration && i % 12 === 0 ? 'highlight-row' : null
      records.push({
        time: (
          <span>
            {i}
            {ordinalSuffixOf(i)}
            <span className="timeLabel">{timeLabel}</span>
          </span>
        ),
        interest: interest,
        totalInterest: totalInterest,
        amount: p + totalInterest,
        rowClassNames: rowClassNames,
      })
    }
  }
  if (isFinite(tm) && tm > 0) {
    for (let i = 1; i <= tm; i++) {
      let interest = calculateSI({ p, r, t: { m: 1 }, intPeriod })
      totalInterest += interest
      records.push({
        time: (
          <span>
            {i}
            {ordinalSuffixOf(i)}
            <span className="timeLabel">Month</span>
          </span>
        ),
        interest: interest,
        totalInterest: totalInterest,
        amount: p + totalInterest,
      })
    }
  }
  if (isFinite(td) && td > 0) {
    let interest = calculateSI({ p, r, t: { d: td }, intPeriod })
    totalInterest += interest
    records.push({
      time: (
        <span>
          {td}
          <span className="timeLabel">Days</span>
        </span>
      ),
      interest: interest,
      totalInterest: totalInterest,
      amount: p + totalInterest,
    })
  }

  return (
    <div className="calculation-records">
      <h1>Records</h1>
      <RecordTable intPeriod={intPeriod} records={records} />
    </div>
  )
}

function RecordTable({ intPeriod, records }) {
  console.log(records)
  records = records.map((r) => {
    return {
      ...r,
      interest: formatCurrency(r.interest),
      totalInterest: formatCurrency(r.totalInterest),
      amount: formatCurrency(r.amount),
    }
  })

  console.log(records)

  const thead = [
    { label: 'Time', key: 'time' },
    { label: 'Interest', key: 'interest' },
    { label: 'Total Interest', key: 'totalInterest' },
    { label: 'Balance', key: 'amount' },
  ]

  return <TableNew thead={thead} tbody={records} intPeriod={intPeriod} />
}

function calculateSI({ p, r, t, intPeriod }) {
  //   console.log(p, r, t, intPeriod)
  r = r / 100
  r = intPeriod === 'y' ? r : r * 12
  const ty = Number(t.y)
  const tm = Number(t.m)
  const td = Number(t.d)

  let totalTime = 0
  if (isFinite(ty) && ty > 0) {
    totalTime += ty
  }
  if (isFinite(tm) && tm > 0) {
    totalTime += tm / 12
  }
  if (isFinite(td) && td > 0) {
    totalTime += td / 365
  }

  //   console.log(p, r, totalTime)
  const result = p * r * totalTime
  //   console.log(result)
  return result
}

function Years({ value, onChange }) {
  const years = Array.from(Array(61), (_, i) => i)
  const options = years.map((y) => (
    <option value={y} key={y}>
      {y}
    </option>
  ))

  return (
    <div className="form-control mr-20">
      <label htmlFor="Years" className="form-label">
        Years
      </label>
      <select
        name="years"
        value={value}
        className="form-input form-select"
        onChange={(v) => onChange('y', v)}
      >
        {options}
      </select>
    </div>
  )
}

function Months({ value, onChange }) {
  const months = Array.from(Array(12), (_, i) => i)
  const options = months.map((m) => (
    <option value={m} key={m}>
      {m}
    </option>
  ))

  return (
    <div className="form-control mr-20">
      <label htmlFor="Months" className="form-label">
        Months
      </label>
      <select
        name="months"
        value={value}
        className="form-input form-select"
        onChange={(v) => onChange('m', v)}
      >
        {options}
      </select>
    </div>
  )
}

function Days({ value, onChange }) {
  const days = Array.from(Array(31), (_, i) => i)
  const options = days.map((d) => (
    <option value={d} key={d}>
      {d}
    </option>
  ))

  return (
    <div className="form-control">
      <label htmlFor="Days" className="form-label">
        Days
      </label>
      <select
        name="days"
        value={value}
        className="form-input form-select"
        onChange={(v) => onChange('d', v)}
      >
        {options}
      </select>
    </div>
  )
}

function Result({ prevInputs }) {
  if (!prevInputs) return null
  const { p, t } = prevInputs
  const ty = Number(t.y)
  const tm = Number(t.m)
  const td = Number(t.d)
  let totalTime = ''

  if (isFinite(ty) && ty > 0) {
    totalTime += `${ty} years `
  }
  if (isFinite(tm) && tm > 0) {
    totalTime += `${tm} month `
  }
  if (isFinite(td) && td > 0) {
    totalTime += `${td} days`
  }

  const result = calculateSI(prevInputs)

  return (
    <div className="border-top">
      <p className="prc-stmt">
        Amount Invested
        <span className="float-right">{formatCurrency(p)}</span>
      </p>
      <p className="int-stmt">
        Interest Gain
        <span className="float-right">{formatCurrency(result)}</span>
      </p>
      <p className="final-stmt">
        Final Amount
        <span className="float-right">
          {formatCurrency(result + unformattedCurrency(p))}
        </span>
      </p>
    </div>
  )
}
