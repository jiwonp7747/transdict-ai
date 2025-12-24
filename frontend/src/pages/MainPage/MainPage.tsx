import React, { useState, useRef, useCallback } from 'react';
import ContextList from '../../components/ContextList/ContextList';
import DictionaryGrid from '../../components/DictionaryGrid/DictionaryGrid';
import './MainPage.scss';

const MainPage: React.FC = () => {
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
  const [leftWidth, setLeftWidth] = useState<number>(25); // percentage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectContext = (contextId: number) => {
    setSelectedContextId(contextId);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit between 15% and 50%
      if (newLeftWidth >= 15 && newLeftWidth <= 50) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="main-page">
      <header className="main-page-header">
        <h1 className="main-page-title">AI Dictionary Management</h1>
      </header>

      <main className="main-page-content">
        <div className="resizable-container" ref={containerRef}>
          {isCollapsed && (
            <button
              className="expand-button"
              onClick={handleToggleCollapse}
              title="Expand panel"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div
            className="left-panel"
            style={{
              width: isCollapsed ? '0px' : `${leftWidth}%`,
              display: isCollapsed ? 'none' : 'block',
            }}
          >
            <ContextList
              onSelectContext={handleSelectContext}
              selectedContextId={selectedContextId}
              onToggleCollapse={handleToggleCollapse}
              isCollapsed={isCollapsed}
            />
          </div>

          {!isCollapsed && (
            <div className="resizer" onMouseDown={handleMouseDown} />
          )}

          <div
            className="right-panel"
            style={{
              width: isCollapsed ? '100%' : `${100 - leftWidth}%`,
            }}
          >
            <DictionaryGrid contextId={selectedContextId} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
