import React from 'react'
import numeral from 'numeral'
const currency = '₹'

export function Input({
  name,
  value,
  onChange,
  label,
  type,
  min = null,
  max = null,
  helpText = '',
  disabled = false,
}) {
  const inputTypes = ['text', 'number', 'radio', 'checkbox']
  return (
    <div className="form-control">
      <label htmlFor={label} className="form-label">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={(v) => onChange(name, v)}
        className="form-input"
        type={inputTypes[type]}
        min={min}
        max={max}
        disabled={disabled}
      />
      {helpText !== '' ? <p className="form-helpText">{helpText}</p> : null}
    </div>
  )
}

export function Button({ label, onClick, type }) {
  let className = 'btn'
  if (type === 'success') className += ' btn-success'
  if (type === 'plain') className += ' btn-plain'

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  )
}

export function Table({ thead, tbody, ...props }) {
  return (
    <table className="table">
      <Thead thead={thead} />
      <Tbody tbody={tbody} {...props} />
      {props.children}
    </table>
  )
}

function Thead({ thead }) {
  return (
    <thead>
      <tr>
        {thead.map((col, i) => (
          <th className="td-numeric" key={i}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function Tbody({ tbody, ...props }) {
  return (
    <tbody>
      {tbody.map((r, i) => {
        return (
          <tr
            key={r.sno}
            className={
              props.intPeriod === 'm'
                ? r.sno % 12 === 0
                  ? 'highlight-row'
                  : ''
                : ''
            }
          >
            <td className="text-secondary">{r.sno}</td>
            <td>{r.principal}</td>
            <td>{r.rate}</td>
            <td>{r.time}</td>
            <td>{r.interest}</td>
            <td>{r.amount}</td>
          </tr>
        )
      })}
    </tbody>
  )
}

export function formatCurrency(amount, format = `0,0.00`) {
  return currency + numeral(amount).format(format)
}

export function unformattedCurrency(amount) {
  return numeral(amount).value()
}

export function TableNew({ thead, tbody, ...props }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {thead.map((col) => (
            <th className="td-numeric" key={col.key}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tbody.map((r, i) => {
          return (
            <tr key={i} className={r.rowClassNames}>
              {thead.map((col) => {
                return <td key={col.key}>{r[col.key]}</td>
              })}
            </tr>
          )
        })}
      </tbody>
      {props.children}
    </table>
  )
}

export function ordinalSuffixOf(i) {
  var j = i % 10,
    k = i % 100
  let superscript = 'th'
  if (j == 1 && k != 11) {
    superscript = 'st'
  } else if (j == 2 && k != 12) {
    superscript = 'nd'
  } else if (j == 3 && k != 13) {
    superscript = 'rd'
  }

  return <sup>{superscript}</sup>
}
