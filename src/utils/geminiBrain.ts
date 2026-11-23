/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AI_EMPLOYEES } from '../data/aiEmployeesData';

export interface AiBrainResponse {
  employeeName: string;
  employeeRole: string;
  response: string;
  source: string;
  available: boolean;
  liveContext?: {
    usdInr: number | null;
    totalStockCases: number;
    recentOrderCount: number;
    liveDealsCount: number;
    pipelineRuns: number;
  };
}

export async function askAiBrain(prompt: string, employeeId?: string): Promise<AiBrainResponse> {
  const employee = AI_EMPLOYEES.find((e) => e.id === employeeId) || AI_EMPLOYEES[0];

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        employeeName: employee.name,
        employeeRole: employee.role,
        systemInstruction: `You are ${employee.name}, ${employee.role} at Radiant Spark Global.
${employee.systemPrompt}
Provide an accurate, grounded operational answer based only on real live metrics provided in context.`,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return {
        employeeName: data.employeeName || employee.name,
        employeeRole: data.employeeRole || employee.role,
        response: data.response || 'Response completed.',
        source: data.source || 'gemini-4-hydrogen',
        available: true,
        liveContext: data.liveContext,
      };
    }

    if (res.status === 503 && data) {
      const ctx = data.liveContext;
      const snapshot = ctx
        ? `Live backend context -> USD/INR: ${ctx.usdInr ?? 'N/A'} | Stock: ${ctx.totalStockCases?.toLocaleString() ?? 0} cases | Persisted orders: ${ctx.recentOrderCount ?? 0} | Live SparkDeals: ${ctx.liveDealsCount ?? 0} | Pipeline runs: ${ctx.pipelineRuns ?? 0}.`
        : '';
      return {
        employeeName: employee.name,
        employeeRole: employee.role,
        response: `${data.error || 'Gemini AI inference is not configured (GEMINI_API_KEY missing on server).'} ${snapshot}`.trim(),
        source: data.source || 'gemini-unconfigured',
        available: false,
        liveContext: ctx,
      };
    }
  } catch {
    // Network unreachable
  }

  return {
    employeeName: employee.name,
    employeeRole: employee.role,
    response: 'Unable to reach /api/gemini/generate. Please verify the backend Express server is running on port 3000.',
    source: 'network-error',
    available: false,
  };
}
