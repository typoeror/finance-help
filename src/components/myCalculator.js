import React, { useCallback, useState } from 'react'
import { NavLink, Switch, Route, useHistory } from 'react-router-dom'
import SimpleInterestCalculator from './simpleInterestCalculatorAdv'
import CompoundInterestCalculator from './compoundInterestCalculatorAdv'

function MyCalculator() {
  const [type, setType] = useState('')
  const history = useHistory()

  const handleCalculatorChange = useCallback((v) => {
    setType(v)
    history.push(`/${v}`)
  })

  return (
    <div className="calculator-container">
      <WebHeader />
      <Navigation type={type} onChange={handleCalculatorChange} />

      <div className="my-calculator">
        <Switch>
          <Route path="/si">
            <SimpleInterestCalculator setType={handleCalculatorChange} />
          </Route>
          <Route path="/ci">
            <CompoundInterestCalculator setType={handleCalculatorChange} />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default MyCalculator

function WebHeader() {
  return (
    <div>
      <h1 className="logo">Calci - Your Personal Calculator</h1>
    </div>
  )
}

function FindYourCalculator({ type, onChange }) {
  const options = [
    { value: '', label: 'Select calculator' },
    { value: 'si', label: 'Simple Interest' },
    { value: 'ci', label: 'Compound Interest' },
  ]

  return (
    <div className="">
      <span className="calculator-selector-label">Select a calculator</span>
      <select
        value={type}
        onChange={onChange}
        className="form-input calculator-selector"
      >
        {options.map((o) => (
          <option value={o.value} key={o.label}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Navigation({ type, onChange }) {
  return (
    <div className="nav nav-hor">
      <div className="calculator-selector-div">
        <FindYourCalculator
          type={type}
          onChange={(v) => onChange(v.target.value)}
        />
      </div>
      <NavigationMenu type={type} />
    </div>
  )
}

function NavigationMenu({ type }) {
  if (type == '') return null
  const navMenus = {
    si: [
      { link: '/', name: 'Home' },
      { link: '/how-to-use', name: 'How to use' },
      { link: '/faqs', name: 'FAQs' },
    ],
    ci: [
      { link: '/', name: 'Home' },
      { link: '/how-to-use', name: 'How to use' },
      { link: '/faqs', name: 'FAQs' },
    ],
  }
  return (
    <div className="calculator-selector-menu">
      <div className="nav-menu">
        <ul>
          {navMenus[type].map((m, i) => {
            return (
              <li key={i}>
                <NavLink
                  exact
                  to={`/${type}${m.link}`}
                  activeClassName="active-menu"
                >
                  {m.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
