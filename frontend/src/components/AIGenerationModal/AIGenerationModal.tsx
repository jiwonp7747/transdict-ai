import React, { useState, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Modal, Button } from 'react-bootstrap';
import { AIGenerationInput, AIGenerationResult, LanguageType } from './types';
import dictionaryService from '../../services/dictionaryService';
import './AIGenerationModal.scss';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface AIGenerationModalProps {
  show: boolean;
  onHide: () => void;
  contextId: number;
  onComplete?: () => void;
}

// Shimmer 로딩 셀 렌더러
const ShimmerCellRenderer: React.FC<ICellRendererParams> = () => {
  return (
    <div className="ag-cell-loading">
      <div className="shimmer-cell-purple" />
    </div>
  );
};

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  show,
  onHide,
  contextId,
  onComplete,
}) => {
  const [inputData, setInputData] = useState<AIGenerationInput[]>([
    {
      id: '1',
      term_key: '',
      content: '',
      description: '',
      language: 'ko',
      actions: ''
    },
  ]);

  const [resultData, setResultData] = useState<AIGenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputGridRef = useRef<any>(null);
  const resultGridRef = useRef<any>(null);

  // 좌측 Input Grid 컬럼 정의
  const inputColumnDefs = useMemo<ColDef<AIGenerationInput>[]>(
    () => [
      {
        headerName: 'Term Key',
        field: 'term_key',
        editable: true,
        width: 150,
      },
      {
        headerName: 'Language',
        field: 'language',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['ko', 'en', 'ch', 've', 'ja'],
        },
        width: 120,
      },
      {
        headerName: 'Content',
        field: 'content',
        editable: true,
        flex: 1,
      },
      {
        headerName: 'Description',
        field: 'description',
        editable: true,
        flex: 1,
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 100,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return null;
          }
          return (
              <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleDeleteInput(params.data?.id || '')}
              >
                Delete
              </Button>
          );
        },
      },
    ],
    []
  );

  // 결과 행 삭제
  const handleDeleteInput = useCallback((id: string) => {
    setInputData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 결과 행 삭제
  const handleDeleteResult = useCallback((id: string) => {
    setResultData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 우측 Result Grid 컬럼 정의
  const resultColumnDefs = useMemo<ColDef<AIGenerationResult>[]>(
    () => [
      {
        headerName: 'Term Key',
        field: 'term_key',
        width: 150,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'Korean',
        field: 'ko',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'English',
        field: 'en',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'Chinese',
        field: 'ch',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'Vietnamese',
        field: 've',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'Japanese',
        field: 'ja',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return <ShimmerCellRenderer {...params} />;
          }
          return params.value || '';
        },
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 100,
        cellRenderer: (params: ICellRendererParams<AIGenerationResult>) => {
          if (params.data?.status === 'generating') {
            return null;
          }
          return (
              <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleDeleteInput(params.data?.id || '')}
              >
                Delete
              </Button>
          );
        },
      },
    ],
    [handleDeleteResult]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
    }),
    []
  );

  // 행 추가
  const handleAddRow = () => {
    const newRow: AIGenerationInput = {
      id: Date.now().toString(),
      term_key: '',
      content: '',
      description: '',
      language: 'ko',
      actions: ''
    };
    setInputData([...inputData, newRow]);
  };

  // AI Generate 실행 (실제 SSE API 연동)
  const handleGenerate = async () => {
    // 입력 검증
    const validInputs = inputData.filter(
      (item) => item.term_key.trim() && item.content.trim()
    );

    if (validInputs.length === 0) {
      alert('Please enter at least one term with content');
      return;
    }

    setIsGenerating(true);

    // 초기 상태: 모든 항목을 generating 상태로 설정
    const initialResults: AIGenerationResult[] = validInputs.map((input) => ({
      id: input.id,
      term_key: input.term_key,
      ko: '',
      en: '',
      ch: '',
      ve: '',
      ja: '',
      status: 'generating',
      actions: '',
    }));

    setResultData(initialResults);

    try {
      // 요청 데이터 준비
      const requestBody = validInputs.map((input) => ({
        context_id: contextId,
        term_key: input.term_key,
        content: input.content,
        language: input.language,
        description: input.description,
      }));

      console.log('=== AI Generation Request ===');
      console.log('Request URL:', 'http://localhost:8000/sse/ai');
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('Context ID:', contextId);
      console.log('Valid Inputs:', validInputs);

      // SSE API 요청
      const response = await fetch('http://localhost:8000/sse/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      // SSE 스트림 읽기
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('SSE stream finished');
          break;
        }

        // 버퍼에 새로운 데이터 추가
        buffer += decoder.decode(value, { stream: true });

        // 줄 단위로 분리
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 마지막 불완전한 줄은 버퍼에 유지

        // 각 줄 처리
        for (const line of lines) {
          // SSE 형식: "data: {...}"
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.status === 'progress') {
                // 진행률 표시
                console.log('Progress:', data.data?.percent + '%');
              } else if (data.status === 'result') {
                // 결과 업데이트
                const result = data.data.result;
                setResultData((prev) =>
                  prev.map((item) =>
                    item.term_key === result.term_key
                      ? {
                          id: item.id,
                          term_key: result.term_key,
                          ko: result.ko,
                          en: result.en,
                          ch: result.ch,
                          ve: result.ve,
                          ja: result.ja,
                          status: 'completed',
                          actions: '',
                        }
                      : item
                  )
                );
              } else if (data.status === 'done') {
                // 완료
                console.log('Generation completed successfully');
                break;
              } else if (data.status === 'error') {
                // 에러
                throw new Error(data.message || 'Generation failed');
              }
            } catch (parseError) {
              console.error('Failed to parse SSE message:', parseError, line);
            }
          }
        }
      }

      // 완료 후 처리
      onComplete?.();
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Generation failed: ${errorMessage}`);

      // 에러 발생시 모든 generating 상태를 error로 변경
      setResultData((prev) =>
        prev.map((item) =>
          item.status === 'generating' ? { ...item, status: 'error' } : item
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Create 실행 (결과를 DB에 저장)
  const handleCreate = async () => {
    // 완료된 결과만 필터링
    const completedResults = resultData.filter(
      (item) => item.status === 'completed'
    );

    if (completedResults.length === 0) {
      alert('No completed results to create');
      return;
    }

    // 사용자 확인
    if (
      !window.confirm(
        `Create ${completedResults.length} dictionary ${completedResults.length > 1 ? 'entries' : 'entry'}?`
      )
    ) {
      return;
    }

    try {
      // DictionaryBase 형식으로 변환
      const dictionaries = completedResults.map((result) => {
        // 원본 입력 데이터에서 description 찾기
        const inputItem = inputData.find(
          (input) => input.term_key === result.term_key
        );

        return {
          term_key: result.term_key || null,
          description: inputItem?.description || null,
          context_id: contextId,
          ko: result.ko || null,
          en: result.en || null,
          ch: result.ch || null,
          ve: result.ve || null,
          ja: result.ja || null,
        };
      });

      console.log('Creating dictionaries:', dictionaries);

      // API 호출
      const response = await dictionaryService.createDictList(dictionaries);

      if (response.success) {
        alert('Dictionary entries created successfully!');
        // 생성 완료 후 모달 초기화
        setInputData([
          {
            id: '1',
            term_key: '',
            content: '',
            description: '',
            language: 'ko',
            actions: ''
          },
        ]);
        setResultData([]);
        onComplete?.();
        onHide();
      } else {
        throw new Error(response.error || 'Failed to create dictionary entries');
      }
    } catch (error) {
      console.error('Create failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Create failed: ${errorMessage}`);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (isGenerating) {
      if (!window.confirm('Generation is in progress. Are you sure you want to close?')) {
        return;
      }
    }
    setInputData([
      {
        id: '1',
        term_key: '',
        content: '',
        description: '',
        language: 'ko',
        actions: ''
      },
    ]);
    setResultData([]);
    setIsGenerating(false);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="ai-generation-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <span>🤖</span>
          AI Dictionary Generation
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 좌측 Input Grid */}
        <div className="grid-section">
          <div className="grid-header">
            <h6>
              <span>📝</span>
              Input ({inputData.length})
            </h6>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={handleAddRow}
              disabled={isGenerating}
            >
              + Add Row
            </Button>
          </div>
          <div className="grid-content">
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                ref={inputGridRef}
                theme="legacy"
                rowData={inputData}
                columnDefs={inputColumnDefs}
                defaultColDef={defaultColDef}
                rowSelection="multiple"
                animateRows={true}
              />
            </div>
          </div>
        </div>

        {/* 우측 Result Grid */}
        <div className="grid-section">
          <div className="grid-header">
            <h6>
              <span>✨</span>
              Results {resultData.length > 0 && `(${resultData.length})`}
            </h6>
            {isGenerating && (
              <span className="badge bg-primary">Generating...</span>
            )}
          </div>
          <div className="grid-content">
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                ref={resultGridRef}
                theme="legacy"
                rowData={resultData}
                columnDefs={resultColumnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
              />
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="footer-info">
          {inputData.filter((i) => i.term_key.trim() && i.content.trim())
            .length > 0 && (
            <span>
              {inputData.filter((i) => i.term_key.trim() && i.content.trim()).length}{' '}
              items ready for generation
            </span>
          )}
          {resultData.filter((r) => r.status === 'completed').length > 0 && (
            <span className="ms-3 text-success">
              {resultData.filter((r) => r.status === 'completed').length}{' '}
              completed results
            </span>
          )}
        </div>
        <div className="footer-buttons">
          <Button variant="secondary" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCreate}
            disabled={
              isGenerating ||
              resultData.filter((r) => r.status === 'completed').length === 0
            }
          >
            ✅ Create
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Generating...
              </>
            ) : (
              <>🚀 Generate All</>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AIGenerationModal;
