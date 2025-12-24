import React, { useState, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Modal, Button } from 'react-bootstrap';
import { AIGenerationInput, AIGenerationResult, LanguageType } from './types';
import dictionaryService from '../../services/dictionaryService';
import aiGenerationService, { AIGenerationRequestItem } from '../../services/aiGenerationService';
import { parseCSV, normalizeColumnName } from '../../utils/csvParser';
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
  const csvFileInputRef = useRef<HTMLInputElement>(null);

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

  // CSV Upload 버튼 클릭
  const handleCSVUploadClick = () => {
    csvFileInputRef.current?.click();
  };

  // CSV 파일을 Input Grid 데이터로 변환
  const mapCSVToInputData = (headers: string[], rows: string[][]): AIGenerationInput[] => {
    // 컬럼명 매핑 테이블 (CSV 헤더 → field 이름)
    const columnMapping: { [key: string]: string } = {
      'term_key': 'term_key',
      'description': 'description',
      'language': 'language',
      'content': 'content',
      // DictionaryGrid의 언어 컬럼들 → content로 매핑 (우선순위: ko > en > ch > ve > ja)
      'korean': 'ko',
      'english': 'en',
      'chinese': 'ch',
      'vietnamese': 've',
      'japanese': 'ja',
    };

    // 헤더를 정규화하고 매핑
    const headerMap = new Map<number, string>();
    const languageColumns = new Map<number, string>(); // 언어 컬럼 인덱스 저장

    headers.forEach((header, index) => {
      const normalized = normalizeColumnName(header);
      const mappedField = columnMapping[normalized];

      if (mappedField) {
        if (['ko', 'en', 'ch', 've', 'ja'].includes(mappedField)) {
          // 언어 컬럼은 별도로 저장
          languageColumns.set(index, mappedField);
        } else {
          headerMap.set(index, mappedField);
        }
      }
    });

    // 각 row를 AIGenerationInput으로 변환
    return rows.map((row, rowIndex) => {
      const inputRow: AIGenerationInput = {
        id: `${Date.now()}_${rowIndex}`,
        term_key: '',
        content: '',
        description: '',
        language: 'ko',
        actions: ''
      };

      // 기본 필드 매핑
      headerMap.forEach((field, colIndex) => {
        const value = row[colIndex] || '';
        if (field in inputRow) {
          (inputRow as any)[field] = value;
        }
      });

      // TODO 사용자 페이지 추가시 그때 기본 언어 반영
      // 언어 컬럼 중 첫 번째로 값이 있는 컬럼을 content로 사용
      // 우선순위: ko > en > ch > ve > ja
      const languagePriority: LanguageType[] = ['ko', 'en', 'ch', 've', 'ja'];

      for (const lang of languagePriority) {
        const colIndex = Array.from(languageColumns.entries()).find(
          ([_, mappedLang]) => mappedLang === lang
        )?.[0];

        if (colIndex !== undefined && row[colIndex]?.trim()) {
          inputRow.content = row[colIndex].trim();
          inputRow.language = lang;
          break;
        }
      }

      return inputRow;
    }).filter(row => row.term_key.trim()); // term_key가 있는 행만 유지
  };

  // CSV 파일 업로드 핸들러
  const handleCSVFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      event.target.value = ''; // Reset input
      return;
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit');
      event.target.value = '';
      return;
    }

    try {
      // CSV 파싱
      const { headers, rows } = await parseCSV(file);

      if (rows.length === 0) {
        alert('CSV file has no data rows');
        event.target.value = '';
        return;
      }

      // 행 개수 제한 (1000개)
      if (rows.length > 1000) {
        if (!window.confirm(`CSV has ${rows.length} rows. Only first 1000 rows will be imported. Continue?`)) {
          event.target.value = '';
          return;
        }
      }

      // CSV 데이터를 Input 데이터로 변환
      const newInputData = mapCSVToInputData(headers, rows.slice(0, 1000));

      if (newInputData.length === 0) {
        alert('No valid data found in CSV. Make sure it has "Term Key" column and at least one language column.');
        event.target.value = '';
        return;
      }

      // 기존 데이터에 추가할지 덮어쓸지 선택
      const shouldAppend = inputData.some(row => row.term_key.trim() || row.content.trim());

      if (shouldAppend) {
        if (window.confirm(`Found ${newInputData.length} valid rows. Append to existing data (${inputData.length} rows)?`)) {
          setInputData([...inputData, ...newInputData]);
        } else if (window.confirm('Replace existing data instead?')) {
          setInputData(newInputData);
        }
      } else {
        setInputData(newInputData);
      }

      alert(`Successfully imported ${newInputData.length} rows from CSV`);
    } catch (error) {
      console.error('CSV upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to import CSV: ${errorMessage}`);
    } finally {
      // Reset file input
      event.target.value = '';
    }
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
      const requestBody: AIGenerationRequestItem[] = validInputs.map((input) => ({
        context_id: contextId,
        term_key: input.term_key,
        content: input.content,
        language: input.language,
        description: input.description,
      }));

      // SSE API 요청 (서비스 사용)
      await aiGenerationService.generateWithSSE(requestBody, (event) => {
        if (event.status === 'progress') {
          // 진행률 표시
          console.log('Progress:', event.data.percent + '%');
        } else if (event.status === 'result') {
          // 결과 업데이트
          const result = event.data.result;
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
        } else if (event.status === 'done') {
          // 완료
          console.log('Generation completed successfully');
        }
      });

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
        {/* Hidden CSV file input */}
        <input
          type="file"
          ref={csvFileInputRef}
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleCSVFileChange}
        />

        {/* 좌측 Input Grid */}
        <div className="grid-section">
          <div className="grid-header">
            <h6>
              <span>📝</span>
              Input ({inputData.length})
            </h6>
            <div className="button-group">
              <Button
                size="sm"
                variant="outline-success"
                onClick={handleCSVUploadClick}
                disabled={isGenerating}
                className="me-2"
              >
                📤 CSV Upload
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={handleAddRow}
                disabled={isGenerating}
              >
                + Add Row
              </Button>
            </div>
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
