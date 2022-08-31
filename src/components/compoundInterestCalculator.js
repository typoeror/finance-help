import React, { Component, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import Joi from 'joi'
import Chart from 'react-apexcharts'
import {
  Input,
  Button,
  Table,
  formatCurrency,
  unformattedCurrency,
} from './helper'
import { HowToUse, Faqs, DisplayErrors } from './others'

class CompoundInterestCalculator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      p: 1000,
      r: 10,
      t: 20,
      period: '',
      installmentAmount: 0,
      result: null,
      errors: null,
    }
  }

  componentDidMount() {
    this.props.setType('ci')
  }

  handleChange = (name, value) => {
    console.log(name, value)
    value = value.target.value
    if (name === 'p') {
      this.setState({ p: formatCurrency(value, '0,0') })
    } else if (name === 'r') this.setState({ r: value })
    else if (name === 't') this.setState({ t: value })
    else if (name === 'period') this.setState({ period: value })
    else if (name === 'installmentAmount')
      this.setState({ installmentAmount: value })
  }

  handleClick = () => {
    const { r, t } = this.state
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

    let result = calculateCI(p, r, t)
    this.setState({ result: result })
  }

  render() {
    const { p, r, t, period, installmentAmount, result } = this.state
    return (
      <Switch>
        <Route path="/ci/how-to-use">
          <HowToUse type="ci" />
        </Route>
        <Route path="/ci/faqs">
          <Faqs type="ci" />
        </Route>
        <Route path="/">
          <div className="sidebar-left">
            <h1>Compound Interest Calculator</h1>
            <div id="compound_interest_form" className="calculator-form">
              <form className="form">
                <Input
                  name="p"
                  value={p}
                  onChange={this.handleChange}
                  label="Principal amount in (Rs.)"
                  type="0"
                  helpText="Amount you can invest today"
                />
                <Installment
                  period={period}
                  installmentAmount={installmentAmount}
                  onChange={this.handleChange}
                />
                <Input
                  name="r"
                  value={r}
                  onChange={this.handleChange}
                  label="Rate of interest (%)"
                  type="1"
                  min="0"
                  helpText="You expect the Annual Rate of Returns to be"
                />
                <Input
                  name="t"
                  value={t}
                  onChange={this.handleChange}
                  label="Time period (year)"
                  type="1"
                  min="0"
                  helpText="Number of years you want to invest for"
                />
                <Button
                  label="Calculate Compound Interest"
                  onClick={this.handleClick}
                  type="success"
                />
              </form>
              <DisplayErrors errors={this.state.errors} />
              {result && (
                <div className="border-top">
                  <p className="prc-stmt">
                    Amount Invested
                    <span className="float-right">{formatCurrency(p)}</span>
                  </p>
                  <p className="int-stmt">
                    Interest Gain
                    <span className="float-right">
                      {formatCurrency(result)}
                    </span>
                  </p>
                  <p className="final-stmt">
                    Final Amount
                    <span className="float-right">
                      {formatCurrency(result + unformattedCurrency(p))}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="sidebar-right">
            <CalculationRecord
              {...{ p, r, t, isCalculated: result ? true : false }}
            />
          </div>
        </Route>
      </Switch>
    )
  }
}

export default CompoundInterestCalculator

function CalculationRecord(props) {
  const [showChart, setShowChart] = useState(false)
  const { r, t, isCalculated } = props
  const p = unformattedCurrency(props.p)

  let records = [],
    prevPrincipal = p
  for (let i = 0; i < t; i++) {
    let interest = calculateCI(prevPrincipal, r, 1)
    console.log(typeof prevPrincipal, typeof interest)

    records.push({
      sno: i + 1,
      principal: prevPrincipal,
      rate: r,
      time: i + 1,
      interest: interest,
      amount: prevPrincipal + interest,
    })
    prevPrincipal += interest
  }

  console.log(records)

  const showChartBtn = showChart ? (
    <Button
      label="Show records"
      onClick={() => {
        setShowChart(false)
      }}
      type="plain"
    />
  ) : (
    <Button
      label="Show chart"
      onClick={() => {
        setShowChart(true)
      }}
      type="plain"
    />
  )

  return (
    <div className="calculation-records">
      <div className="header-end">
        <div>
          <h1>Records</h1>
        </div>
        <div>{showChartBtn}</div>
      </div>
      {!showChart && (
        <RecordTable records={records} isCalculated={isCalculated} />
      )}
      {showChart && <ViewChart records={records} isCalculated={isCalculated} />}
    </div>
  )
}

function RecordTable({ records, isCalculated }) {
  if (!isCalculated) return null
  let totalInterest = 0,
    totalAmount = records.at(-1).amount
  records = records.map((r, i) => {
    totalInterest += r.interest
    return {
      ...r,
      principal: formatCurrency(r.principal),
      interest: formatCurrency(r.interest),
      amount: formatCurrency(r.amount),
    }
  })

  const thead = [
    { label: 'Sno' },
    { label: 'Principal (₹)' },
    { label: 'Rate (%)' },
    { label: 'Time (Year)' },
    { label: 'Interest (₹)' },
    { label: 'Amount (₹)' },
  ]

  return (
    <>
      <Table thead={thead} tbody={records}>
        <tfoot>
          <tr className="highlight-row">
            <th colSpan="3"></th>
            <th className="td-numeric">Total - </th>
            <th className="td-numeric">{formatCurrency(totalInterest)}</th>
            <th className="td-numeric">{formatCurrency(totalAmount)}</th>
          </tr>
        </tfoot>
      </Table>
    </>
  )
}

function calculateCI(p, r, t) {
  const interest = p * Math.pow(1 + r / 100, t) - p
  return interest
}

function ViewChart({ records, isCalculated }) {
  if (!isCalculated) return null
  const interest = records.map((r) => {
    let inx = r.amount - records[0].principal
    return parseFloat(inx).toFixed(2)
  })
  const principal = records.map((r) => {
    let prx = records[0].principal
    return parseFloat(prx).toFixed(2)
  })
  const amount = records.map((r) => r.amount.toFixed(2))
  const labels = records.map((r) => 'Year:' + r.time)

  console.log(principal, interest, amount)

  const series = [
    {
      name: 'Interest',
      type: 'column',
      data: interest,
    },
    {
      name: 'Amount',
      type: 'area',
      data: amount,
    },
    {
      name: 'Principal',
      type: 'line',
      data: principal,
    },
  ]
  const options = {
    chart: {
      height: 350,
      type: 'line',
      stacked: false,
      toolbar: {
        show: false,
        tools: {
          zoom: false,
          zoomin: false,
          zoomout: false,
          selection: false,
        },
      },
    },
    stroke: {
      width: [0, 2, 5],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    fill: {
      opacity: [0.85, 0.25, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: 'vertical',
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100],
      },
    },
    labels: labels,
    markers: {
      size: 0,
    },
    xaxis: {
      type: 'text',
      title: {
        text: 'Years of growth',
      },
    },
    yaxis: {
      title: {
        text: 'Amount invested',
      },
      // min: 0,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '₹' + y
          }
          return y
        },
      },
    },
  }

  return (
    <div id="chart">
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  )
}

function Installment({ period, installmentAmount, onChange }) {
  const periods = [
    { label: 'Monthly', value: 'm' },
    { label: 'Yearly', value: 'y' },
    { label: 'One time', value: '' },
  ]
  return (
    <div className="form-control input-group">
      <div htmlFor="Installment" className="form-label">
        <span style={{ paddingRight: '10px' }}>
          <b>Installment</b>
        </span>
        {periods.map((p, i) => (
          <label key={i}>
            <input
              name="period"
              value={p.value}
              type="radio"
              checked={p.value === period ? 'checked' : ''}
              onChange={(v) => onChange('period', v)}
            />{' '}
            {p.label}
          </label>
        ))}
      </div>
      <Input
        name="installmentAmount"
        value={installmentAmount}
        onChange={onChange}
        label="Installment amount"
        type="1"
        min="0"
        helpText="Amount you want to invest regularly"
        disabled={period === ''}
      />
    </div>
  )
}
