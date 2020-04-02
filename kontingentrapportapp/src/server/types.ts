export type ReportInfo = {
  url: string;
  name: string;
  id: string;
  date: string;
};
export type UploadedFile = {
  getBlob: () => GoogleAppsScript.Base.Blob;
};
export type CreateReportInputFormObject = {
  csv: UploadedFile;
  mobilepay: UploadedFile;
};

export type ReportPaymentInfo = (string | number)[][];

export type ReportColumnValue = {} | string | number | Date;
export type ReportRow = ReportColumnValue[];
export type Report = ReportRow[];

export type LastEmailActivity = { lastActivity: string; email: string };
