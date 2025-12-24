import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {ColDef, ICellRendererParams} from 'ag-grid-community';
import { DictionaryEntry } from '../../types/context';
import contextService from '../../services/contextService';
import dictionaryService from '../../services/dictionaryService';
import AIGenerationModal from '../AIGenerationModal/AIGenerationModal';
import { parseCSV, normalizeColumnName } from '../../utils/csvParser';
import { CommonButton, ButtonPurpose, ButtonIcons, useSnackbar } from '../common';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './DictionaryGrid.scss';
import {AIGenerationResult} from "../AIGenerationModal/types";

interface DictionaryGridProps {
  contextId: number | null;
}

const DictionaryGrid: React.FC<DictionaryGridProps> = ({ contextId }) => {
  const [rowData, setRowData] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const gridRef = useRef<any>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const snackbar = useSnackbar();

  const columnDefs = useMemo<ColDef<DictionaryEntry>[]>(
    () => [
      {
        headerName: 'Term Key',
        field: 'term_key',
        sortable: true,
        filter: true,
        width: 150,
        editable: true,
      },
      {
        headerName: 'Korean',
        field: 'ko',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
      },
      {
        headerName: 'English',
        field: 'en',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
      },
      {
        headerName: 'Chinese',
        field: 'ch',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
      },
      {
        headerName: 'Vietnamese',
        field: 've',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
      },
      {
        headerName: 'Japanese',
        field: 'ja',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        filter: true,
        editable: true,
        flex: 1,
      },
      {
        headerName: 'Created At',
        field: 'created_at',
        sortable: true,
        filter: true,
        editable: false,
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        },
      },
      {
        headerName: 'Updated At',
        field: 'updated_at',
        sortable: true,
        filter: true,
        editable: false,
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        },
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 100,
        cellRenderer: (params: ICellRendererParams<DictionaryEntry>) => {
          return (
              <CommonButton
                  variant={ButtonPurpose.DELETE}
                  onClick={() => handleDeleteDict(params.data?.dict_id)}
              >
                Delete
              </CommonButton>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
    }),
    []
  );

  useEffect(() => {
    if (contextId !== null) {
      loadDictionaryEntries(contextId);
    } else {
      setRowData([]);
    }
  }, [contextId]);

  const handleDeleteDict = useCallback(async (id: number | undefined) => {
    if (!id) {
      snackbar.error('Invalid dictionary ID', { design: 'minimal' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await dictionaryService.deleteDict(id);

      if (response.success) {
        // 성공 시 로컬 state에서도 삭제
        setRowData((prev) => prev.filter((item) => item.dict_id !== id));
        snackbar.success('Dictionary entry deleted successfully', { design: 'minimal' });
      } else {
        snackbar.error(response.error || 'Failed to delete dictionary entry', { design: 'minimal' });
      }
    } catch (err) {
      snackbar.error('Failed to delete dictionary entry', { design: 'minimal' });
      console.error(err);
    }
  }, [snackbar]);

  const loadDictionaryEntries = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await contextService.getDictionaryByContext(id);
      if (response.success) {
        setRowData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load dictionary entries');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    if (!contextId) {
      snackbar.warning('Please select a context first', { design: 'minimal' });
      return;
    }

    const newRow: DictionaryEntry = {
      dict_id: 0, // Temporary ID
      term_key: '',
      description: '',
      context_id: contextId,
      ko: '',
      en: '',
      ch: '',
      ve: '',
      ja: '',
      created_at: '',
      updated_at: '',
      actions: "",
    };

    setRowData([newRow, ...rowData]);
  };


  const handleAIGenerateClick = () => {
    if (!contextId) {
      snackbar.warning('Please select a context first', { design: 'minimal' });
      return;
    }
    setShowAIModal(true);
  };

  const handleAIGenerationComplete = () => {
    // AI 생성 완료 후 그리드 새로고침
    if (contextId) {
      loadDictionaryEntries(contextId);
    }
  };

  // CSV Upload 버튼 클릭
  const handleCSVUploadClick = () => {
    if (!contextId) {
      snackbar.warning('Please select a context first', { design: 'minimal' });
      return;
    }
    csvFileInputRef.current?.click();
  };

  // CSV 파일을 DictionaryEntry 데이터로 변환
  const mapCSVToDictionaryData = (headers: string[], rows: string[][]): Partial<DictionaryEntry>[] => {
    // 컬럼명 매핑 테이블
    const columnMapping: { [key: string]: string } = {
      'term_key': 'term_key',
      'description': 'description',
      'korean': 'ko',
      'english': 'en',
      'chinese': 'ch',
      'vietnamese': 've',
      'japanese': 'ja',
    };

    // 헤더를 정규화하고 매핑
    const headerMap = new Map<number, string>();

    headers.forEach((header, index) => {
      const normalized = normalizeColumnName(header);
      const mappedField = columnMapping[normalized];
      if (mappedField) {
        headerMap.set(index, mappedField);
      }
    });

    // 각 row를 DictionaryEntry로 변환
    return rows.map((row, rowIndex) => {
      const entry: Partial<DictionaryEntry> = {
        dict_id: 0, // Temporary ID
        term_key: '',
        description: '',
        context_id: contextId!,
        ko: '',
        en: '',
        ch: '',
        ve: '',
        ja: '',
        actions: ''
      };

      // 필드 매핑
      headerMap.forEach((field, colIndex) => {
        const value = row[colIndex] || '';
        if (field in entry) {
          (entry as any)[field] = value;
        }
      });

      return entry;
    }).filter(entry => entry.term_key && entry.term_key.trim()); // term_key가 있는 행만 유지
  };

  // CSV 파일 업로드 핸들러
  const handleCSVFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    if (!file.name.endsWith('.csv')) {
      snackbar.error('Please select a CSV file', { design: 'minimal' });
      event.target.value = '';
      return;
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      snackbar.error('File size exceeds 5MB limit', { design: 'minimal' });
      event.target.value = '';
      return;
    }

    try {
      // CSV 파싱
      const { headers, rows } = await parseCSV(file);

      if (rows.length === 0) {
        snackbar.warning('CSV file has no data rows', { design: 'minimal' });
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

      // CSV 데이터를 DictionaryEntry 데이터로 변환
      const newEntries = mapCSVToDictionaryData(headers, rows.slice(0, 1000));

      if (newEntries.length === 0) {
        snackbar.error('No valid data found in CSV. Make sure it has "Term Key" column and at least one language column.', {
          design: 'minimal',
          duration: 5000
        });
        event.target.value = '';
        return;
      }

      // 사용자 확인
      if (!window.confirm(`Import ${newEntries.length} entries from CSV?`)) {
        event.target.value = '';
        return;
      }

      // DB에 저장
      const dictionaries = newEntries.map((entry) => ({
        term_key: entry.term_key || null,
        description: entry.description || null,
        context_id: contextId!,
        ko: entry.ko || null,
        en: entry.en || null,
        ch: entry.ch || null,
        ve: entry.ve || null,
        ja: entry.ja || null,
      }));

      const response = await dictionaryService.createDictList(dictionaries);

      if (response.success) {
        snackbar.success(`Successfully imported ${newEntries.length} entries!`, {
          design: 'minimal',
          duration: 4000
        });
        // 성공 후 그리드 새로고침
        loadDictionaryEntries(contextId!);
      } else {
        throw new Error(response.error || 'Failed to import CSV data');
      }
    } catch (error) {
      console.error('CSV upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      snackbar.error(`Failed to import CSV: ${errorMessage}`, {
        design: 'minimal',
        duration: 5000
      });
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const handleExportCSV = useCallback(() => {
    if (!rowData || rowData.length === 0) {
      snackbar.warning('No data to export', { design: 'minimal' });
      return;
    }

    // CSV 헤더 정의
    const headers = [
      'Term Key',
      'Korean',
      'English',
      'Chinese',
      'Vietnamese',
      'Japanese',
      'Description',
      'Created At',
      'Updated At'
    ];

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };

    // CSV escape 함수 (쉼표, 따옴표, 줄바꿈 처리)
    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 이스케이프
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // CSV 행 생성
    const csvRows = [
      headers.join(','), // 헤더 행
      ...rowData.map(entry => [
        escapeCSVValue(entry.term_key),
        escapeCSVValue(entry.ko),
        escapeCSVValue(entry.en),
        escapeCSVValue(entry.ch),
        escapeCSVValue(entry.ve),
        escapeCSVValue(entry.ja),
        escapeCSVValue(entry.description),
        escapeCSVValue(formatDate(entry.created_at)),
        escapeCSVValue(formatDate(entry.updated_at))
      ].join(','))
    ];

    // CSV 문자열 생성
    const csvContent = csvRows.join('\n');

    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.setAttribute('download', `dictionary_export_${timestamp}.csv`);

    // 다운로드 트리거
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 해제
    URL.revokeObjectURL(url);
  }, [rowData, snackbar]);

  const handleExportJSON = useCallback(() => {
    if (!rowData || rowData.length === 0) {
      snackbar.warning('No data to export', { design: 'minimal' });
      return;
    }

    // actions 필드 제외하고 깨끗한 데이터만 추출
    const cleanData = rowData.map(entry => ({
      dict_id: entry.dict_id,
      term_key: entry.term_key,
      description: entry.description,
      context_id: entry.context_id,
      ko: entry.ko,
      en: entry.en,
      ch: entry.ch,
      ve: entry.ve,
      ja: entry.ja,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }));

    // JSON 문자열 생성 (읽기 쉽게 들여쓰기 적용)
    const jsonContent = JSON.stringify(cleanData, null, 2);

    // Blob 생성
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.setAttribute('download', `dictionary_export_${timestamp}.json`);

    // 다운로드 트리거
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 해제
    URL.revokeObjectURL(url);
  }, [rowData, snackbar]);

  const handleCellValueChanged = useCallback(async (params: any) => {
    const updatedData = params.data;
    const dictId = updatedData.dict_id;

    // 새로 추가된 row (dict_id가 0인 경우)는 업데이트하지 않음
    if (!dictId || dictId === 0) {
      console.log('Skipping update for new row');
      return;
    }

    try {
      // 변경된 필드만 추출
      const updatePayload: any = {};
      const editableFields = ['term_key', 'ko', 'en', 'ch', 've', 'ja', 'description', 'context_id'];

      editableFields.forEach(field => {
        if (updatedData[field] !== undefined) {
          updatePayload[field] = updatedData[field];
        }
      });

      // updated_at을 현재 시간으로 추가
      updatePayload.updated_at = params.data.updated_at

      const response = await dictionaryService.updateDict(dictId, updatePayload);

      if (!response.success) {
        snackbar.error(response.error || 'Failed to update dictionary entry', { design: 'minimal' });
        // 실패 시 그리드 새로고침
        if (contextId) {
          loadDictionaryEntries(contextId);
        }
      } else {
        // 성공 시 서버에서 반환한 최신 updated_at으로 업데이트
        setRowData((prev) =>
          prev.map((row) =>
            row.dict_id === dictId
              ? { ...row, updated_at: response.data?.updated_at || row.updated_at }
              : row
          )
        );
      }
    } catch (err) {
      console.error('Failed to update dictionary entry:', err);
      snackbar.error('Failed to update dictionary entry', { design: 'minimal' });
      // 에러 시 그리드 새로고침
      if (contextId) {
        loadDictionaryEntries(contextId);
      }
    }
  }, [contextId, snackbar]);

  return (
    <div className="dictionary-grid-container">
      {/* Hidden CSV file input */}
      <input
        type="file"
        ref={csvFileInputRef}
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleCSVFileChange}
      />

      <div className="dictionary-grid-header">
        <h5>Dictionary Entries</h5>
        <div className="button-group">
          <CommonButton
            variant={ButtonPurpose.UPLOAD}
            icon={ButtonIcons.UPLOAD}
            onClick={handleCSVUploadClick}
            disabled={!contextId}
          >
            CSV Upload
          </CommonButton>
          <CommonButton
            variant={ButtonPurpose.UPLOAD}
            icon={ButtonIcons.AI}
            onClick={handleAIGenerateClick}
            disabled={!contextId}
          >
            AI Generate
          </CommonButton>
          <CommonButton
            variant={ButtonPurpose.EXPORT}
            icon={ButtonIcons.EXPORT}
            onClick={handleExportCSV}
            disabled={!contextId || !rowData || rowData.length === 0}
          >
            Export CSV
          </CommonButton>
          <CommonButton
            variant={ButtonPurpose.EXPORT}
            icon={ButtonIcons.EXPORT}
            onClick={handleExportJSON}
            disabled={!contextId || !rowData || rowData.length === 0}
          >
            Export JSON
          </CommonButton>
        </div>
      </div>

      {isLoading && <div className="text-center p-3">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!contextId && !isLoading && (
        <div className="text-center p-5 text-muted">
          Please select a context to view dictionary entries
        </div>
      )}

      {contextId && (
        <div className="ag-theme-alpine" style={{ height: 'calc(100% - 60px)', width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="single"
            onCellValueChanged={handleCellValueChanged}
          />
        </div>
      )}

      {/* AI Generation Modal */}
      {contextId && (
        <AIGenerationModal
          show={showAIModal}
          onHide={() => setShowAIModal(false)}
          contextId={contextId}
          onComplete={handleAIGenerationComplete}
        />
      )}
    </div>
  );
};

export default DictionaryGrid;
