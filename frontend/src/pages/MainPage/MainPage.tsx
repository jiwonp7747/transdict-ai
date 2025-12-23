import React, { useState } from 'react';
import ContextList from '../../components/ContextList/ContextList';
import DictionaryGrid from '../../components/DictionaryGrid/DictionaryGrid';
import './MainPage.scss';

const MainPage: React.FC = () => {
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);

  const handleSelectContext = (contextId: number) => {
    setSelectedContextId(contextId);
  };

  return (
    <div className="main-page">
      <header className="main-page-header">
        <h1 className="main-page-title">AI Dictionary Management</h1>
      </header>

      <main className="main-page-content">
        <div className="container-fluid h-100">
          <div className="row h-100 g-3">
            <div className="col-3">
              <ContextList
                onSelectContext={handleSelectContext}
                selectedContextId={selectedContextId}
              />
            </div>
            <div className="col-9">
              <DictionaryGrid contextId={selectedContextId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
