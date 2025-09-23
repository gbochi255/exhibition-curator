import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SearchComponent from './components/SearchComponent';
import ExhibitionView from './components/ExhibitionView';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    
      <div className='container'>
        <nav>
          <Link to='/'>Home/Search</Link> | <Link  to='/exhibition'>View Exhibition</Link>
        </nav>
        <Routes>
          <Route path='/' element={<SearchComponent />} />
          <Route path='/exhibition' element={<ExhibitionView />} />
        </Routes>
      
      </div>
      )
}

export default App
