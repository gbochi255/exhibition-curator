import { useState } from 'react'
import SearchComponent from './components/SearchComponent'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    
      <div>
      <h1>Exhibition Curator App</h1>
      <SearchComponent />
      <p>Welcome To this Great App</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
      </button>
      </div>
      )
}

export default App
