import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helpers
function normalizeMsId(msId: string) {
  const trimmed = msId.trim();
  const localPart = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  return { trimmed, localPart };
}

// Types
type YearRow = { ms_id: string; academic_year: string; total_hours: number };

// Year summary
async function getYearSummary(msId: string, limit = 10, offset = 0) {
  const { trimmed, localPart } = normalizeMsId(msId);

  return prisma.$queryRaw<YearRow[]>`
    SELECT
      ms_id,
      academic_year,
      SUM(hours_added) AS total_hours
    FROM activity_hours_log
    WHERE
      LOWER(TRIM(ms_id)) IN (LOWER(TRIM(${trimmed})), LOWER(TRIM(${localPart})))
      AND effective_date IS NOT NULL
    GROUP BY ms_id, academic_year
    ORDER BY academic_year
    LIMIT ${limit} OFFSET ${offset};
  `;
}

// Six-month summary
async function getSixMonthSummary(msId: string, limit = 10, offset = 0) {
  const { trimmed, localPart } = normalizeMsId(msId);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return prisma.$queryRaw<YearRow[]>`
    SELECT
      ms_id,
      academic_year,
      SUM(hours_added) AS total_hours
    FROM activity_hours_log
    WHERE
      LOWER(TRIM(ms_id)) IN (LOWER(TRIM(${trimmed})), LOWER(TRIM(${localPart})))
      AND effective_date >= ${sixMonthsAgo}
    GROUP BY ms_id, academic_year
    ORDER BY academic_year
    LIMIT ${limit} OFFSET ${offset};
  `;
}

// Total hours
async function getTotalHours(msId: string) {
  const { trimmed, localPart } = normalizeMsId(msId);

  const result = await prisma.$queryRaw<{ total_hours: number }[]>`
    SELECT SUM(hours_added) AS total_hours
    FROM activity_hours_log
    WHERE
      LOWER(TRIM(ms_id)) IN (LOWER(TRIM(${trimmed})), LOWER(TRIM(${localPart})))
      AND effective_date IS NOT NULL;
  `;
  return result[0]?.total_hours || 0;
}

// Controller
export async function getHours(req: Request, res: Response) {
  try {
    const raw = req.params.msId || (req as any).user?.ms_id;
    const msId = decodeURIComponent(raw ?? '');

    const scope = (req.query.scope as 'year' | 'six-month' | 'all') || 'year';
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);

    if (!msId) return res.status(400).json({ message: 'msId is required' });

    if (scope === 'year') {
      const data = await getYearSummary(msId, limit, offset);
      return res.json({ scope, data });
    }
    if (scope === 'six-month') {
      const data = await getSixMonthSummary(msId, limit, offset);
      return res.json({ scope, data });
    }
    if (scope === 'all') {
      const total_hours = await getTotalHours(msId);
      return res.json({ scope, data: { total_hours } });
    }

    // fallback (ถ้า scope ไม่ตรง)
    const data = await getYearSummary(msId, limit, offset);
    return res.json({ scope: 'year', data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal error' });
  }
}
