import React, { useState, useEffect } from 'react';
import { Context } from '../../types/context';
import contextService from '../../services/contextService';
import './ContextList.scss';

interface ContextListProps {
  onSelectContext: (contextId: number) => void;
  selectedContextId: number | null;
}

const ContextList: React.FC<ContextListProps> = ({
  onSelectContext,
  selectedContextId,
}) => {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContextId, setEditingContextId] = useState<number | null>(null);
  const [newContext, setNewContext] = useState({
    context_name: '',
    description: '',
  });
  const [editContext, setEditContext] = useState({
    context_name: '',
    description: '',
  });

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await contextService.getContexts();
      if (response.success) {
        setContexts(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load contexts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setNewContext({ context_name: '', description: '' });
  };

  const handleSaveNew = async () => {
    if (!newContext.context_name.trim()) {
      alert('Context name is required');
      return;
    }

    try {
      await contextService.createContext(newContext);
      setIsAdding(false);
      setNewContext({ context_name: '', description: '' });
      loadContexts();
    } catch (err) {
      alert('Failed to create context');
      console.error(err);
    }
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewContext({ context_name: '', description: '' });
  };

  const handleEditClick = () => {
    setIsEditMode(!isEditMode);
    setEditingContextId(null);
  };

  const handleStartEdit = (context: Context) => {
    setEditingContextId(context.context_id);
    setEditContext({
      context_name: context.context_name,
      description: context.description,
    });
  };

  const handleSaveEdit = async (context: Context) => {
    if (!editContext.context_name.trim()) {
      alert('Context name is required');
      return;
    }

    try {
      const updateData = {
        context_name: editContext.context_name,
        description: editContext.description,
        updated_at: context.updated_at,
      };
      const response = await contextService.updateContext(context.context_id, updateData);

      // 성공 시 서버에서 반환한 최신 updated_at으로 로컬 state 업데이트
      if (response.success && response.data) {
        setContexts((prev) =>
          prev.map((ctx) =>
            ctx.context_id === context.context_id
              ? { ...ctx, ...editContext, updated_at: response.data.updated_at }
              : ctx
          )
        );
      }

      setEditingContextId(null);
      setIsEditMode(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update context';
      alert(errorMessage);
      console.error(err);
      // Refresh the list to get the latest data
      loadContexts();
    }
  };

  const handleCancelEdit = () => {
    setEditingContextId(null);
    setEditContext({ context_name: '', description: '' });
  };

  const handleDelete = async (contextId: number) => {
    if (!window.confirm('Are you sure you want to delete this context?')) {
      return;
    }

    try {
      await contextService.deleteContext(contextId);
      loadContexts();
      if (selectedContextId === contextId) {
        onSelectContext(0);
      }
    } catch (err) {
      alert('Failed to delete context');
      console.error(err);
    }
  };

  return (
    <div className="context-list-container">
      <div className="context-list-header">
        <h5>Contexts</h5>
        <div className="button-group">
          <button
            className="btn btn-sm btn-primary"
            onClick={handleAddClick}
            disabled={isAdding}
          >
            + Add
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleEditClick}
          >
            Edit
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center p-3">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="list-group">
        {isAdding && (
          <div className="list-group-item list-group-item-action context-form">
            <input
              type="text"
              className="form-control form-control-sm mb-2"
              placeholder="Context Name"
              value={newContext.context_name}
              onChange={(e) =>
                setNewContext({ ...newContext, context_name: e.target.value })
              }
            />
            <textarea
              className="form-control form-control-sm mb-2"
              placeholder="Description"
              rows={2}
              value={newContext.description}
              onChange={(e) =>
                setNewContext({ ...newContext, description: e.target.value })
              }
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-success"
                onClick={handleSaveNew}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCancelNew}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {contexts.map((context) => (
          <div
            key={context.context_id}
            className={`list-group-item list-group-item-action ${
              selectedContextId === context.context_id ? 'active' : ''
            }`}
            onClick={() => !isEditMode && onSelectContext(context.context_id)}
            style={{ cursor: isEditMode ? 'default' : 'pointer' }}
          >
            {editingContextId === context.context_id ? (
              <div className="context-form">
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Context Name"
                  value={editContext.context_name}
                  onChange={(e) =>
                    setEditContext({ ...editContext, context_name: e.target.value })
                  }
                />
                <textarea
                  className="form-control form-control-sm mb-2"
                  placeholder="Description"
                  rows={2}
                  value={editContext.description}
                  onChange={(e) =>
                    setEditContext({ ...editContext, description: e.target.value })
                  }
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleSaveEdit(context)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{context.context_name}</h6>
                  <small>
                    {new Date(context.created_at).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-1 small">{context.description}</p>
                {isEditMode && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(context);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(context.context_id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextList;
