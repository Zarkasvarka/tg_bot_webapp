import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import DisciplinePage from './components/DisciplinePage/DisciplinePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discipline/:disciplineId" element={<DisciplinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
