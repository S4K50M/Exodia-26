import { Routes, Route } from 'react-router-dom'

import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { TeamPage } from './pages/TeamPage'
import { MerchandisePage } from './pages/MerchandisePage'

import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/merchandise" element={<MerchandisePage />} />
      </Routes>
    </>
  )
}

export default App
