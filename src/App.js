import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import DisciplinePage from './components/DisciplinePage/DisciplinePage';

function App() {

  const {tg} = useTelegram();

  useEffect(() => {
    tg.ready();
  }, [tg])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Параметр disciplineId будет передаваться в URL */}
        <Route path="/discipline/:disciplineId" element={<DisciplinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
