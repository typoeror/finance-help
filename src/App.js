import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import MyCalculator from './components/myCalculator'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <MyCalculator />
    </BrowserRouter>
  )
}

export default App
