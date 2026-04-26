import { useState } from 'react';
import EditorPage from './pages/EditorPage';
import SimulationPage from './pages/SimulationPage';
import styles from './App.module.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('editor'); // 'editor' | 'population' | 'energy' | 'flow'

  const renderPage = () => {
    switch (currentPage) {
      case 'editor':
        return <EditorPage />;
      case 'population':
      case 'energy':
      case 'pyramid':
        return <SimulationPage mode={currentPage} />;
      default:
        return <EditorPage />;
    }
  };

  return (
    <div className={styles.app}>
      <nav className={styles.sidebar}>
        <button
          className={currentPage === 'editor' ? styles.active : ''}
          onClick={() => setCurrentPage('editor')}
          title="食物网配置"
        >
          🕸️
        </button>
        <button
          className={currentPage === 'population' ? styles.active : ''}
          onClick={() => setCurrentPage('population')}
          title="个体数"
        >
          📈
        </button>
        <button
          className={currentPage === 'energy' ? styles.active : ''}
          onClick={() => setCurrentPage('energy')}
          title="种群总储能"
        >
          ⚡
        </button>
        <button
          className={currentPage === 'pyramid' ? styles.active : ''}
          onClick={() => setCurrentPage('pyramid')}
          title="金字塔"
        >
          🔺
        </button>

      </nav>
      <main className={styles.main}>{renderPage()}</main>
    </div>
  );
}