/**
 * CSV Parser Utility
 * Handles CSV file parsing with proper encoding and escape character handling
 */

export interface ParsedCSVData {
  headers: string[];
  rows: string[][];
}

/**
 * Parse CSV file and return headers and rows
 * @param file CSV file to parse
 * @returns Promise with parsed headers and rows
 */
export const parseCSV = async (file: File): Promise<ParsedCSVData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        // Remove BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');

        // Split into lines
        const lines = cleanText.split(/\r?\n/).filter(line => line.trim());

        if (lines.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        // Parse CSV considering quoted values
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // End of field
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }

          // Push last field
          result.push(current.trim());
          return result;
        };

        // Parse headers (first line)
        const headers = parseCSVLine(lines[0]);

        // Parse data rows (remaining lines)
        const rows = lines.slice(1).map(line => parseCSVLine(line));

        resolve({ headers, rows });
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read file as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Normalize column name for matching
 * Converts to lowercase and removes spaces/special characters
 */
export const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Create column mapping between CSV headers and target fields
 * @param csvHeaders CSV column headers
 * @param targetFields Target field names
 * @returns Map of CSV column index to target field name
 */
export const createColumnMapping = (
  csvHeaders: string[],
  targetFields: string[]
): Map<number, string> => {
  const mapping = new Map<number, string>();

  // Normalize target fields for comparison
  const normalizedTargets = targetFields.map(field => ({
    original: field,
    normalized: normalizeColumnName(field)
  }));

  // Map each CSV header to target field
  csvHeaders.forEach((header, index) => {
    const normalizedHeader = normalizeColumnName(header);

    // Find matching target field
    const match = normalizedTargets.find(
      target => target.normalized === normalizedHeader
    );

    if (match) {
      mapping.set(index, match.original);
    }
  });

  return mapping;
};
