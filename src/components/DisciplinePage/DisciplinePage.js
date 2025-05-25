import { useParams } from 'react-router-dom';

function DisciplinePage() {
  const { disciplineId } = useParams();

  return (
    <div>
      <h1>Дисциплина: {disciplineId}</h1>
      {/* TODO: добавить отображение матчей, турниров и т.д. */}
    </div>
  );
}

export default DisciplinePage;