import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchComponent from './components/SearchComponent';
import ExhibitionView from './components/ExhibitionView';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
   
    <div className='app-shell'>
      <nav className='top-nav'>
        <div className='nav-left'>
          <Link to='/' className='brand'>Exhibition Curator</Link>
        </div>
        <div className='nav-right'>
          <Link to='/search' className='nav-link'>Search</Link>
          <Link to='/exhibition' className='nav-link'>My Exhibition</Link>
        </div>
      </nav>
      <main className='app-main'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/search' element={<SearchComponent />} />
          <Route path='/exhibition' element={<ExhibitionView />} />
        </Routes>
      </main>
      <footer className='app-footer'>
        <small>© {new Date().getFullYear()} Exhibition Curator</small>
      </footer>
    </div>
    
      
      );
}

export default App
