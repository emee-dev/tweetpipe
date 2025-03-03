import { useMutation } from "@tanstack/react-query";

type OcrResults = {
  app_name: string;
  focused: number;
  frame_id: number;
  ocr_engine: string;
  text: string;
  text_json: string;
  window_name: string;
};

const fetchOCRData = async ({
  pageIndex = 0,
  pageSize = 9,
  textFilter = "",
  appFilter = "",
}: {
  pageIndex: number;
  pageSize: number;
  textFilter?: string;
  appFilter?: string;
}) => {
  // Build Filter Clauses
  const filterClauses = [
    "text IS NOT NULL",
    "trim(text) != ''",
    textFilter
      ? `LOWER(text) LIKE '%${textFilter.toLowerCase().replace(/'/g, "''")}%'`
      : null,
    appFilter
      ? `LOWER(app_name) LIKE '%${appFilter
          .toLowerCase()
          .replace(/'/g, "''")}%'`
      : null,
  ]
    .filter(Boolean)
    .join(" AND ");

  // Fetch total count
  const countResponse = await fetch("http://localhost:3030/raw_sql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `SELECT COUNT(*) as total FROM ocr_text WHERE ${filterClauses}`,
    }),
  });

  if (!countResponse.ok) throw new Error("Failed to fetch count");

  const countResult = await countResponse.json();
  const totalRows = countResult[0].total;

  // Fetch paginated data
  const dataResponse = await fetch("http://localhost:3030/raw_sql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        SELECT frame_id, text, text_json, app_name, ocr_engine, window_name, focused
        FROM ocr_text
        WHERE ${filterClauses}
        ORDER BY frame_id DESC
        LIMIT ${pageSize}
        OFFSET ${pageIndex * pageSize}
      `,
    }),
  });

  if (!dataResponse.ok) throw new Error("Failed to fetch data");

  const data = await dataResponse.json();

  return { data, totalRows } as { data: OcrResults[]; totalRows: number };
};

export const latestOCR = fetchOCRData;

const useOCRData = (
  pageIndex: number,
  pageSize: number,
  textFilter?: string,
  appFilter?: string
) => {
  return useMutation({
    mutationKey: ["ocrData", pageIndex, pageSize, textFilter, appFilter],
    mutationFn: () =>
      fetchOCRData({ pageIndex, pageSize, textFilter, appFilter }),
  });
};

export default useOCRData;
