import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing middleware with higher limits for receipt images/PDFs
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * OCR Receipt & Invoice Scanner Endpoint
 * Uses gemini-3.8-flash to extract Malaysian tax relief data
 */
app.post('/api/ocr-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 payload.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        offlineMode: true,
      });
    }

    // Clean base64 string if it contains data prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');

    const prompt = `You are an expert Malaysian Tax Accountant and LHDN (Lembaga Hasil Dalam Negeri) compliance auditor.
Analyze this receipt/invoice and extract key financial data for Malaysian personal income tax (Borang BE).

The valid LHDN relief categories are:
- "rel_lifestyle": F8 Lifestyle (Books, printed materials, PC, laptop, tablet, smartphone, home broadband internet) [Max RM2,500]
- "rel_sports": F8b Sports equipment, gym memberships, sports facilities rental, coaching/registration fees [Max RM1,000]
- "rel_med_serious": F6 Medical expenses for serious diseases, full medical check-up (up to RM1,000), COVID/diagnostic tests, dental treatment (up to RM1,000), or fertility treatment [Max RM10,000]
- "rel_med_parent": F2 Medical care, dental, clinic, nursing carer for parents/grandparents [Max RM8,000]
- "rel_edu": F5 Education fees for self (Masters/PhD any field, or Diploma/Degree/Upskilling in technical/vocational/scientific/IT/law) [Max RM7,000]
- "rel_childcare": F10 Fees for registered childcare centre (TASKA) or kindergarten (TADIKA) for child <= 6 years [Max RM3,000]
- "rel_sspn": F11 Net deposit into National Education Savings Scheme (SSPN) [Max RM8,000]
- "rel_life_ins": F15a Life insurance premium or voluntary pension contribution [Max RM3,000]
- "rel_kwsp": F15b Voluntary EPF / KWSP contribution [Max RM4,000]
- "rel_prs": F16 Private Retirement Scheme (PRS) contribution or deferred annuity [Max RM3,000]
- "rel_med_ins": F17 Medical and education insurance policies [Max RM3,000 / RM4,000]
- "rel_perkeso": F18 SOCSO/PERKESO and EIS contributions [Max RM350]
- "rel_ev": F20 Electric Vehicle (EV) charging facilities, equipment, or subscription [Max RM2,500]
- "rel_equip": F3 Supporting equipment for disabled self/spouse/child/parent [Max RM6,000]
- "donation": B5 Approved charitable donations under Sec 44(6) ITA 1967
- "other": Business / personal general expense not eligible for standard individual relief

Return a strict JSON object with these exact keys:
{
  "merchant": "Merchant or Company name",
  "date": "YYYY-MM-DD or empty if not visible",
  "totalAmount": 0.00 (numeric number in MYR/RM),
  "taxReliefCategory": "one of the IDs listed above, e.g. rel_lifestyle",
  "categoryName": "Official LHDN description, e.g. F8. Gaya Hidup (Komputer, Buku, Telefon, Internet)",
  "description": "Short summary of purchased items/services",
  "items": ["list of items identified on receipt"],
  "confidenceScore": 95 (number from 0 to 100),
  "reasoning": "Brief explanation in English or BM why this matches the selected LHDN relief under ITA 1967"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Regex fallback if needed
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error during OCR receipt scan:', error);
    return res.status(500).json({
      error: error.message || 'Failed to scan receipt via Gemini API.',
    });
  }
});

/**
 * Multi-PDF & Document Borang BE / EA Form Extractor
 * Automatically extracts employment income, PCB, and relief values from tax documents
 */
app.post('/api/parse-tax-document', async (req, res) => {
  try {
    const { documentBase64, mimeType = 'application/pdf', fileName = '' } = req.body;

    if (!documentBase64) {
      return res.status(400).json({ error: 'Missing documentBase64 payload.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const cleanBase64 = documentBase64
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert Malaysian Tax Accountant and LHDN Tax Assessor.
Analyze this Borang BE (e-BE tax return summary) or EA Form (Borang C.P.8A / Penyata Gaji).
Extract all tax numbers into structured JSON for our Malaysian Tax Vault.

Document filename: ${fileName}

Identify:
1. "documentType": "BORANG_BE" | "EA_FORM" | "OTHER"
2. "assessmentYear": e.g. "2024" or "2025" (numeric string)
3. "taxpayerName": string or ""
4. "taxFileNo": string (e.g. SG/OG number) or ""
5. "employerName": string or ""
6. "statutoryIncome":
   - "emp": Statutory employment income (B1 in Borang BE, or Gross Employment in EA form) (number)
   - "rent": Statutory rental income (B2) (number)
   - "other": Other incomes/pensions/royalties (B3) (number)
   - "donations": Approved donations (B5) (number)
   - "pcb": Monthly Tax Deduction / Potongan Cukai Berjadual paid (B18 in Borang BE, or Box D in EA form) (number)
   - "zakat": Zakat paid (number)
7. "reliefs": Map of standard relief IDs to amounts claimed:
   - "rel_individual": 9000
   - "rel_med_parent": number
   - "rel_equip": number
   - "rel_disabled_self": number
   - "rel_edu": number
   - "rel_med_serious": number
   - "rel_lifestyle": number
   - "rel_sports": number
   - "rel_breastfeeding": number
   - "rel_childcare": number
   - "rel_sspn": number
   - "rel_spouse": number
   - "rel_disabled_spouse": number
   - "rel_child_under18": number
   - "rel_child_study": number
   - "rel_life_ins": number
   - "rel_kwsp": number
   - "rel_prs": number
   - "rel_med_ins": number
   - "rel_perkeso": number
   - "rel_ev": number
8. "summaryNotes": "Key findings or remarks from the document in 1-2 sentences."

Return strictly a valid JSON object matching the schema above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'application/pdf',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error parsing tax document:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse tax document via Gemini API.',
    });
  }
});

// AI Tax Assistant & Optimization Advisory endpoint
app.post('/api/tax-advisor', async (req, res) => {
  try {
    const { year, income, reliefs, profile } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const prompt = `You are a licensed Malaysian Chartered Tax Specialist (CTIM) providing personal tax optimization advice for Assessment Year YA ${year}.
The taxpayer has provided:
- Aggregate Gross Income: RM ${(income.emp + income.rent + income.other).toLocaleString()}
- Current Claimed Reliefs: ${JSON.stringify(reliefs)}
- PCB Paid: RM ${income.pcb}
- Taxpayer Profile: ${JSON.stringify(profile || {})}

Provide 3 to 4 actionable, legally sound Malaysian tax-saving tips under the Income Tax Act 1967 and the relevant Malaysian Budget for YA ${year}.
Calculate estimated tax savings in RM where possible (e.g. "Topping up SSPN by RM3,000 saves RM...").

Return JSON format:
{
  "recommendations": [
    {
      "title": "Action title",
      "category": "Relief name / code",
      "currentUtilized": 0,
      "maxCap": 0,
      "potentialExtraDeduction": 0,
      "estimatedTaxSaved": 0,
      "actionStep": "Specific step before 31 December"
    }
  ],
  "auditRiskScore": "LOW" | "MEDIUM" | "HIGH",
  "auditAdvice": "Guidance on receipts retention (7 years Section 82A) and compliance."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating tax advice:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate tax advice.' });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MyTax Vault Malaysia] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
