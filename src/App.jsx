import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar, Footer } from './components/shared.jsx'
import { AuthProvider } from './auth.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Detail from './pages/Detail.jsx'
import Person from './pages/Person.jsx'
import Graph from './pages/Graph.jsx'
import Dna from './pages/Dna.jsx'
import Login from './pages/Login.jsx'
import { ListsOverview, ListDetail } from './pages/Lists.jsx'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname, search])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suche" element={<Search />} />
          <Route path="/titel/:id" element={<Detail />} />
          <Route path="/person/:id" element={<Person />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/listen" element={<ListsOverview />} />
          <Route path="/listen/:id" element={<ListDetail />} />
          <Route path="/dna" element={<Dna />} />
          <Route path="/anmelden" element={<Login />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  )
}
