import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Createproject from './page/project/Createproject';
import Projectlist from './page/project/Projectlist';
import Projectdetail from './page/project/Projectdetail';
import Eventlist from './page/project/Eventlist';
import Home from './page/Home';
import './App.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/createproject" element={<Createproject  />} />
          <Route path="/Projectlist" element={<Projectlist />} />
          <Route path="/Projectdetail/:id" element={<Projectdetail />} />
          <Route path="/Eventlist" element={<Eventlist />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
