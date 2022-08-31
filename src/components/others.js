import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export function HowToUse({ type }) {
  if (type === 'si') {
    const steps = [
      'First you have required 3 values as: Principal amount, Rate of interest (monthly/yearly) and Time period of investment.',
      "If you don't have any of above values then you cannot use simple interest calculator.",
      'Rate of interest should be in percentage. Like 20%, 5%...',
      'Time period of investment can be in years, months or in days.',
      'Enter input in respective fields and click on `Calculate Simple Interest` Button.',
      'Voila!, You got your interest gain for your principal amount for specific time using given rate of interest.',
      <Link to="/si">Calculate Simple Interest</Link>,
    ]

    return (
      <div className="how-to-container">
        <h1>How to use the Simple Interest Calculator</h1>
        <ol className="ol-num how-to-steps">
          {steps.map((s, i) => {
            return <li key={i}>{s}</li>
          })}
        </ol>
      </div>
    )
  } else if (type === 'ci') {
    const steps = [
      'First you have required 3 values as: Principal amount, Rate of interest (Per annum) and Time period of investment.',
      "If you don't have any of above values then you cannot use compound interest calculator.",
      'Rate of interest should be in percentage. Like 20%, 5%...',
      'Time period of investment should be in years. If you have month of time frame then year value will be = (6/12 = .5year).',
      'Enter input in respective fields and click on `Calculate Compound Interest` Button.',
      'Voila!, You got your interest value for your principal amount for specific time using given rate of interest.',
      <Link to="/ci">Calculate Simple Interest</Link>,
    ]
    return (
      <div className="how-to-container">
        <h1>How to use the Compound Interest Calculator</h1>
        <ol className="ol-num how-to-steps">
          {steps.map((s, i) => {
            return <li key={i}>{s}</li>
          })}
        </ol>
      </div>
    )
  }
}

const si_questions = [
  {
    question: 'What is simple interest?',
    answer: (
      <div>
        <p>
          Simple interest is based on the principal amount of a loan or the
          first deposit in a savings account. Simple interest doesn't compound,
          which means a creditor will only pay interest on the principal amount
          and a borrower would never have to pay more interest on the previously
          accumulated interest.
        </p>
        <p>
          Simple interest is a technique used to calculate the proportion of
          interest paid on a sum over a set time period at a set rate.
        </p>
      </div>
    ),
  },
  {
    question: 'What is the formula of simple interest?',
    answer: (
      <div>
        <p>Simple interest calculated using</p>
        <pre>SI = (Principal * Rate * Time) / 100</pre>
        <p>
          Principal = Initial amount invested <br />
          Rate = Rate of interest in percentage <br />
          Time = Time duration you invested in years
        </p>
      </div>
    ),
  },
]

const ci_questions = [
  {
    question: 'What is compound interest?',
    answer: (
      <div>
        <p>
          Compound interest is the addition of interest to the principal sum of
          a loan or deposit, or in other words, interest on interest. It is the
          result of reinvesting interest, rather than paying it out, so that
          interest in the next period is then earned on the principal sum plus
          previously accumulated interest.
        </p>
        <p>
          Since the interest-on-interest effect can generate positive returns
          based on the initial principal amount, it has sometimes been referred
          to as the snowball effect of compound interest.
        </p>
      </div>
    ),
  },
  {
    question: 'What is the formula of compound interest?',
    answer: (
      <div>
        <p>Compound interest calculated using</p>
        <pre>CI = Principal * (1 + Rate/100)^Time</pre>
        <p>
          Principal = Initial amount invested <br />
          Rate = Rate of interest in percentage <br />
          Time = Time duration you invested in years
        </p>
      </div>
    ),
  },
]

export function Faqs({ type }) {
  const [activeQues, setActiveQues] = useState(null)

  const handleClick = (i) => {
    setActiveQues((prev) => {
      return i === prev ? null : i
    })
  }

  let questions = type === 'ci' ? ci_questions : si_questions

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <ul className="faqs-list">
        {questions.map((ques, i) => {
          return (
            <li key={i}>
              <div className="ques">
                <div className="ques-title" onClick={() => handleClick(i)}>
                  {ques.question}
                </div>
                <div
                  className={`ques-answer ${
                    activeQues !== i ? 'display-none' : ''
                  }`}
                >
                  {ques.answer}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DisplayErrors({ errors }) {
  return (
    <div className="text-danger errors">
      <p>{errors}</p>
    </div>
  )
}
