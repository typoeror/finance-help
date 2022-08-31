import React, { Component, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import Joi from 'joi'
import Chart from 'react-apexcharts'
import {
  Input,
  Button,
  TableNew,
  formatCurrency,
  ordinalSuffixOf,
  unformattedCurrency,
} from './helper'
import { HowToUse, Faqs, DisplayErrors } from './others'

class CompoundInterestCalculator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      p: 1000,
      r: 10,
      t: { y: 1, m: 0 }, // Investment tenure
      compoundedInterval: 'y',
      intPeriod: 'y',
      prevInputs: null,
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
    // console.log(name, value)
    value = value.target.value
    if (name === 'p') {
      this.setState({ p: formatCurrency(value, '0,0') })
    } else if (name === 'r') this.setState({ r: value })
    else if (name === 'period') this.setState({ [name]: value })
    else if (name === 'installmentAmount') this.setState({ [name]: value })
    else if (name === 'compoundedInterval') this.setState({ [name]: value })
    else if (name === 'intPeriod') this.setState({ [name]: value })
  }

  handleTimeChange = (name, value) => {
    const timePeriod = this.state.t
    this.setState({ t: { ...timePeriod, [name]: value.target.value } })
  }

  handleClick = () => {
    const { r, t, compoundedInterval, intPeriod } = this.state
    const p = unformattedCurrency(this.state.p)
    console.log(`P: ${p}, R: ${r}, T: ${t}`)

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

    let prevInputs = { p, r, t, intPeriod, compoundedInterval }
    this.setState({ prevInputs: prevInputs })
  }

  render() {
    const {
      p,
      r,
      t,
      compoundedInterval,
      intPeriod,
      period,
      installmentAmount,
    } = this.state
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
                  <CompoundedMonthly
                    value={compoundedInterval}
                    onChange={this.handleChange}
                  />
                </div>
                <Button
                  label="Calculate Compound Interest"
                  onClick={this.handleClick}
                  type="success"
                />
              </form>
              <DisplayErrors errors={this.state.errors} />
              {/* <Result prevInputs={this.state.prevInputs} /> */}
            </div>
          </div>
          <div className="sidebar-right">
            <CalculationRecord prevInputs={this.state.prevInputs} />
          </div>
        </Route>
      </Switch>
    )
  }
}

export default CompoundInterestCalculator

function CalculationRecord({ prevInputs }) {
  const [showChart, setShowChart] = useState(false)
  if (!prevInputs) {
    return (
      <div className="bigText">
        Let's find out, How much interest you gain on your amount using simple
        interest.
      </div>
    )
  }

  const { r, t, intPeriod, compoundedInterval } = prevInputs
  const p = unformattedCurrency(prevInputs.p)

  const ty = Number(t.y)
  const tm = Number(t.m)

  let records = []
  let totalInterest = 0,
    prevPrincipal = p

  if (isFinite(ty) && ty > 0) {
    const monthlyIteration = false
    const totalIteration = monthlyIteration ? ty * 12 : ty
    const yearValue = monthlyIteration ? 1 / 12 : 1
    const timeLabel = monthlyIteration ? 'Month' : 'Year'

    for (let i = 1; i <= totalIteration; i++) {
      let interest = calculateCI({
        p: prevPrincipal,
        r,
        t: { y: yearValue },
        intPeriod,
        compoundedInterval,
      })

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

      prevPrincipal += interest
      // console.log(prevPrincipal)
    }
  }
  if (isFinite(tm) && tm > 0) {
    const timeLabel = 'Month'

    if (compoundedInterval === 'y') {
      let interest = calculateCI({
        p: prevPrincipal,
        r,
        t: { y: 1 },
        intPeriod,
        compoundedInterval,
      })

      interest /= 12

      for (let i = 1; i <= tm; i++) {
        totalInterest += interest
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
          rowClassNames: null,
        })
      }
    } else if (compoundedInterval === 'h') {
      let interest
      for (let i = 1; i <= tm; i++) {
        if ((i - 1) % 6 === 0) {
          interest = calculateCI({
            p: prevPrincipal,
            r,
            t: { y: 1 / 2 },
            intPeriod,
            compoundedInterval,
          })
          prevPrincipal += interest
          interest /= 6
        }

        totalInterest += interest
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
          rowClassNames: null,
        })
      }
    } else if (compoundedInterval === 'q') {
      let interest
      for (let i = 1; i <= tm; i++) {
        if ((i - 1) % 3 === 0) {
          interest = calculateCI({
            p: prevPrincipal,
            r,
            t: { y: 1 / 4 },
            intPeriod,
            compoundedInterval,
          })
          prevPrincipal += interest
          interest /= 3
        }

        totalInterest += interest
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
          rowClassNames: null,
        })
      }
    } else if (compoundedInterval === 'm') {
      let interest
      for (let i = 1; i <= tm; i++) {
        interest = calculateCI({
          p: prevPrincipal,
          r,
          t: { y: 1 / 12 },
          intPeriod,
          compoundedInterval,
        })

        totalInterest += interest
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
          rowClassNames: null,
        })

        prevPrincipal += interest
      }
    } else if (compoundedInterval === 'd') {
      let interest
      for (let i = 1; i <= tm; i++) {
        interest = calculateCI({
          p: prevPrincipal,
          r: r,
          t: { y: 1 / 12 },
          intPeriod,
          compoundedInterval,
        })

        totalInterest += interest
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
          rowClassNames: null,
        })

        prevPrincipal += interest
      }
    }
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

  const lastRow = records.at(-1)
  // console.log(lastRow)
  return (
    <>
      <ResultNew
        p={p}
        totalInterest={lastRow.totalInterest}
        totalAmount={lastRow.amount}
      />
      <div className="calculation-records">
        <div className="header-end">
          <div>
            <h1>Records</h1>
          </div>
          <div>{showChartBtn}</div>
        </div>
        {!showChart && <RecordTable records={records} />}
        {showChart && <ViewChart records={records} />}
      </div>
    </>
  )
}

function RecordTable({ records }) {
  if (Array.isArray(records) && !records.length) return null
  let totalInterest = 0,
    totalAmount = records.at(-1).amount
  records = records.map((r, i) => {
    totalInterest += r.interest
    return {
      ...r,
      interest: formatCurrency(r.interest),
      totalInterest: formatCurrency(r.totalInterest),
      amount: formatCurrency(r.amount),
    }
  })

  const thead = [
    { label: 'Time', key: 'time' },
    { label: 'Interest', key: 'interest' },
    { label: 'Total Interest', key: 'totalInterest' },
    { label: 'Balance', key: 'amount' },
  ]

  return (
    <>
      <TableNew thead={thead} tbody={records}>
        <tfoot>
          <tr className="highlight-row">
            <th colSpan=""></th>
            <th className="td-numeric">Total - </th>
            <th className="td-numeric">{formatCurrency(totalInterest)}</th>
            <th className="td-numeric">{formatCurrency(totalAmount)}</th>
          </tr>
        </tfoot>
      </TableNew>
    </>
  )
}

function calculateCI({ p, r, t, intPeriod, compoundedInterval }) {
  r = r / 100
  r = intPeriod === 'y' ? r : r * 12
  const ty = Number(t.y)
  const tm = Number(t.m)

  let totalInterest = 0,
    newP = p,
    n

  switch (compoundedInterval) {
    case 'h':
      n = 2
      break
    case 'q':
      n = 4
      break
    case 'm':
      n = 12
      break
    case 'd':
      n = 365
      break
    default:
      n = 1
      break
  }

  if (isFinite(ty) && ty > 0) {
    newP = p * (1 + r / n) ** (ty * n)
    totalInterest += newP - p
  }

  return totalInterest
}

function ViewChart({ records }) {
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

function CompoundedMonthly({ value, onChange }) {
  const compoundedOptions = [
    { label: 'Yearly (1/yr)', value: 'y' },
    { label: 'Half Yearly (2/yr)', value: 'h' },
    { label: 'Quarterly (4/yr)', value: 'q' },
    { label: 'Monthly (12/yr)', value: 'm' },
    { label: 'Daily (365/yr)', value: 'd' },
  ]
  const options = compoundedOptions.map((m) => (
    <option value={m.value} key={m.value}>
      {m.label}
    </option>
  ))

  return (
    <div className="form-control mr-20">
      <label htmlFor="Months" className="form-label">
        Compounded Interval
      </label>
      <select
        name="compoundedInterval"
        value={value}
        className="form-input form-select"
        onChange={(v) => onChange('compoundedInterval', v)}
      >
        {options}
      </select>
    </div>
  )
}

function ResultNew({ p, totalInterest, totalAmount }) {
  // return null
  return (
    <div className="result-card display-flex justify-content-between">
      <div className="prc-stmt prc-stmt-wrapper">
        Amount Invested
        <span className="d-block">{formatCurrency(p)}</span>
      </div>
      <div className="int-stmt int-stmt-wrapper">
        Interest Gain
        <span className="d-block">{formatCurrency(totalInterest)}</span>
      </div>
      <div className="final-stmt final-stmt-wrapper">
        Final Amount
        <span className="d-block">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}

function Result({ p, totalInterest, totalAmount }) {
  // if (!prevInputs) return null
  // const { p, t } = prevInputs
  // const ty = Number(t.y)
  // const tm = Number(t.m)
  // let totalTime = ''

  // if (isFinite(ty) && ty > 0) {
  //   totalTime += `${ty} years `
  // }
  // if (isFinite(tm) && tm > 0) {
  //   totalTime += `${tm} month `
  // }

  // const result = calculateCI(prevInputs)
  return (
    <div className="border-top">
      <p className="prc-stmt">
        Amount Invested
        <span className="float-right">{formatCurrency(p)}</span>
      </p>
      <p className="int-stmt">
        Interest Gain
        <span className="float-right">{formatCurrency(totalInterest)}</span>
      </p>
      <p className="final-stmt">
        Final Amount
        <span className="float-right">{formatCurrency(totalAmount)}</span>
      </p>
    </div>
  )
}
