export type StatusColor = 'Green' | 'Yellow' | 'Red';

export interface TestResult {
  value: number;
  unit: string | null;
  reference_range_used: string | null;
  status_color: StatusColor;
  uncertain: boolean;
  short_explanation: string;
  long_explanation: string;
  suggested_next_steps: string;
}

export interface LabAnalysisResponse {
  parsed_values?: Record<string, { value: number; unit: string | null; lab_range: string | null }>;
  tests: Record<string, TestResult>;
  overall_summary: string;
  safety_notice: string;
}

export interface AnalysisError {
  message: string;
}
