import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function DisciplinePage() {
  const { disciplineId } = useParams();
  const [discipline, setDiscipline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/disciplines/${disciplineId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Дисциплина не найдена');
        }
        return res.json();
      })
      .then(data => {
        setDiscipline(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [disciplineId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      <h1>Дисциплина: {discipline.name}</h1>
      {/* Здесь можно добавить отображение турниров и матчей */}
    </div>
  );
}

export default DisciplinePage;