import { BrowserRouter as Router } from 'react-router-dom'
import { AppRouter } from '@/components/router/app-router'


// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''
function App() {


  return (
    <div>
      
          <Router basename={basename}>
            <AppRouter />
          </Router>
       
    </div>
  )
}

export default App

