import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const formatDetails = (details) => {
  if (details == null) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch (error) {
    return String(details);
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toISOString();
};

const exportActivityLogs = async (logs = []) => {
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Activity Logs');

  // Define columns
  worksheet.columns = [
    { header: 'Action', key: 'action', width: 20 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'User', key: 'user', width: 25 },
    { header: 'User ID', key: 'userId', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Details', key: 'details', width: 40 },
  ];

  // Add rows
  safeLogs.forEach((log) => {
    worksheet.addRow({
      action: log?.action ?? '',
      type: log?.type ?? '',
      user: log?.user ?? '',
      userId: log?.userId ?? '',
      timestamp: formatTimestamp(log?.timestamp),
      details: formatDetails(log?.details),
    });
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Generate Excel file buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Save the file
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'activity-logs.xlsx');

  return workbook;
};

export default exportActivityLogs;
