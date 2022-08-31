import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Joi from 'joi'
import {
  Input,
  Button,
  Table,
  formatCurrency,
  unformattedCurrency,
} from './helper'
import { HowToUse, Faqs, DisplayErrors } from './others'

class SimpleInterestCalculator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      p: 1000, // Principal amount
      r: 3, // Rate of interest
      t: 1, // Investment tenure
      intPeriod: 'y', // Interest period
      timePeriod: 'y', // Time period
      result: null,
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
    else if (name === 't') this.setState({ t: value })
    else if (name === 'intPeriod') this.setState({ [name]: value })
    else if (name === 'timePeriod') this.setState({ [name]: value })
  }

  handleClick = () => {
    const { r, t, intPeriod, timePeriod } = this.state
    const p = unformattedCurrency(this.state.p)
    console.log(`P: ${p}, R: ${r}, T: ${t}`)

    // validate inputs
    const inputValidated = Joi.object({
      p: Joi.number().integer().min(1).label('Principal amount'),
      r: Joi.number().max(100).greater(0).label('Rate of interest'),
      t: Joi.number().min(1).max(50).label('Time period'),
    }).validate({
      p,
      r,
      t,
    })
    if (inputValidated.error) {
      this.setState({ errors: inputValidated.error.message })
      return
    }

    let prevInputs = { p, r, t, intPeriod, timePeriod }
    let result = calculateSI(prevInputs)
    this.setState({
      result: result,
      prevInputs: prevInputs,
      errors: null,
    })
  }

  render() {
    const { p, r, t, intPeriod, timePeriod, result } = this.state
    let timePeriodMax
    switch (timePeriod) {
      case 'm':
        timePeriodMax = 720
        break
      case 'd':
        timePeriodMax = 365
        break
      default:
        timePeriodMax = 60
    }

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
                    <Input
                      name="t"
                      value={t}
                      onChange={this.handleChange}
                      label="Time period"
                      type="1"
                      min="1"
                      max={timePeriodMax}
                    />
                    <div className="input-prefix">
                      <select
                        name="timePeriod"
                        value={timePeriod}
                        className="form-input"
                        onChange={(v) => this.handleChange('timePeriod', v)}
                      >
                        <option value="y">Years</option>
                        <option value="m">Months</option>
                        <option value="d">Days</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    label="Calculate SI"
                    onClick={this.handleClick}
                    type="success"
                  />
                </form>
                <DisplayErrors errors={this.state.errors} />
                {result && (
                  <div className="border-top">
                    <p className="text-bold">
                      Calculated simple interest for {t} year using {r}% rate =
                      ₹{formatCurrency(result)}.
                    </p>
                    <p className="text-bold">
                      Final amount you received = (Principal + Interest) = ₹
                      {formatCurrency(result + unformattedCurrency(p))}.
                    </p>
                    <div>
                      <p>Simple interest calculated using</p>
                      <pre>SI = (Principal * Rate * Time) / 100</pre>
                      <p>
                        Principal = Initial amount invested <br />
                        Rate = Rate of interest in percentage <br />
                        Time = Time duration you invested in years
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sidebar-right">
              <CalculationRecord
                {...{
                  ...this.state.prevInputs,
                  isCalculated: result ? true : false,
                }}
              />
            </div>
          </Route>
        </Switch>
      </>
    )
  }
}

export default SimpleInterestCalculator

function CalculationRecord({
  r,
  t,
  intPeriod,
  timePeriod,
  isCalculated,
  ...props
}) {
  const p = unformattedCurrency(props.p)

  const totalIteration = intPeriod === 'y' ? t : t * 12

  let records = []
  for (let i = 0; i < totalIteration; i++) {
    let timeInterval = i + 1
    timeInterval /= intPeriod === 'y' ? 1 : 12

    let interest = calculateSI({ p, r, t: timeInterval, intPeriod, timePeriod })
    records.push({
      sno: i + 1,
      principal: p,
      rate: r,
      time: i + 1,
      interest: interest,
      amount: p + interest,
    })
  }

  return (
    <div className="calculation-records">
      <h1>Records</h1>
      <RecordTable
        intPeriod={intPeriod}
        records={records}
        isCalculated={isCalculated}
      />
    </div>
  )
}

function RecordTable({ intPeriod, records, isCalculated }) {
  if (!isCalculated) return null

  records = records.map((r, i) => {
    return {
      ...r,
      principal: formatCurrency(r.principal, '0,0'),
      interest: formatCurrency(r.interest),
      amount: formatCurrency(r.amount),
    }
  })

  const thead = [
    { label: 'Sno' },
    { label: 'Principal (₹)' },
    { label: 'Rate (%)' },
    { label: `Time (${intPeriod === 'y' ? 'Year' : 'Month'})` },
    { label: 'Interest (₹)' },
    { label: 'Amount (₹)' },
  ]

  return <Table thead={thead} tbody={records} intPeriod={intPeriod} />
}

function calculateSI({ p, r, t, intPeriod, timePeriod }) {
  r = r / 100
  r = intPeriod === 'y' ? r : r * 12

  switch (timePeriod) {
    case 'm':
      t /= 12
      break
    case 'd':
      t /= 365
    default:
      t = t
  }

  return p * r * t
}
