import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import Topic from './components/Topic';
import Courtroom from './components/Courtroom';
import Win from './components/Win';
import Lose from './components/Lose';

function Router() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [pageData, setPageData] = useState({});

  const navigate = (page, data = {}) => {
    setPageData(data);
    setCurrentPage(page);
  };

  useEffect(() => {
    // Handle browser back/forward
    const handlePopState = () => {
      // Could implement history management here if needed
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  switch (currentPage) {
    case 'welcome':
      return <Welcome onNavigate={navigate} />;
    case 'topic':
      return <Topic onNavigate={navigate} data={pageData} />;
    case 'courtroom':
      return <Courtroom onNavigate={navigate} data={pageData} />;
    case 'win':
      return <Win onNavigate={navigate} data={pageData} />;
    case 'lose':
      return <Lose onNavigate={navigate} data={pageData} />;
    default:
      return <Welcome onNavigate={navigate} />;
  }
}

export default Router;
