// Google Gemini Integration for SQL Query Generation

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface SQLResponse {
  sqlQuery: string;
  explanation: string;
}

export async function generateSQLQuery(
  question: string, 
  schema: string
): Promise<SQLResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
  }

  const systemPrompt = `You are a world-class SQL expert with deep knowledge of all SQL dialects (PostgreSQL, MySQL, SQLite, BigQuery, Snowflake, MSSQL, etc.) and the ability to understand any database schema, no matter how complex.

The following is the SQL schema:
${schema}

I will ask questions in plain English and you have to give me the SQL queries.

General Instructions:
- Assume best practices for performance and readability.
- If multiple tables are involved, figure out their relationships via foreign keys or field similarity.
- Do not make up table or column names.
- Be dialect-agnostic unless otherwise specified.
- Return only the SQL code in markdown SQL block format — no extra explanation.

Additional Requirements:
- Always use proper JOIN syntax when connecting tables
- Include appropriate WHERE clauses for filtering
- Use meaningful aliases for tables when needed
- Format the SQL for readability with proper indentation
- Include comments in the SQL if the query is complex`;

  const prompt = `${systemPrompt}

User Question: ${question}

Please provide the SQL query in a markdown code block.`;

  try {
    console.log('🤖 Sending request to Gemini 2.0 Flash-Lite...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GeminiResponse = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ Received response from Gemini 2.0 Flash-Lite');

    // Parse the response to extract SQL and create explanation
    const { sqlQuery, explanation } = parseSQLResponse(content, question);

    return { sqlQuery, explanation };
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw error;
  }
}

function parseSQLResponse(content: string, originalQuestion: string): SQLResponse {
  // Extract SQL from markdown code blocks
  const sqlBlockRegex = /```(?:sql|SQL)?\s*([\s\S]*?)\s*```/;
  const sqlMatch = content.match(sqlBlockRegex);
  
  let sqlQuery = '';
  if (sqlMatch && sqlMatch[1]) {
    sqlQuery = sqlMatch[1].trim();
  } else {
    // If no code block found, try to extract SQL-looking content
    const lines = content.split('\n');
    const sqlLines = lines.filter(line => {
      const upperLine = line.trim().toUpperCase();
      return upperLine.startsWith('SELECT') || 
             upperLine.startsWith('INSERT') || 
             upperLine.startsWith('UPDATE') || 
             upperLine.startsWith('DELETE') ||
             upperLine.startsWith('WITH') ||
             upperLine.includes('FROM') ||
             upperLine.includes('WHERE') ||
             upperLine.includes('JOIN');
    });
    sqlQuery = sqlLines.join('\n').trim();
  }

  // Generate explanation
  const explanation = generateExplanation(sqlQuery, originalQuestion);

  return {
    sqlQuery: sqlQuery || 'No SQL query could be generated for this question.',
    explanation
  };
}

function generateExplanation(sqlQuery: string, question: string): string {
  if (!sqlQuery || sqlQuery.includes('No SQL query could be generated')) {
    return 'I was unable to generate a SQL query for this question. Please make sure your question relates to the data in your schema and try rephrasing it.';
  }

  const upperQuery = sqlQuery.toUpperCase();
  let explanation = `This SQL query answers your question: "${question}"\n\n`;

  // Basic query analysis
  if (upperQuery.includes('SELECT')) {
    explanation += 'The query retrieves data from your database ';
    
    if (upperQuery.includes('JOIN')) {
      explanation += 'by joining multiple tables together ';
    }
    
    if (upperQuery.includes('WHERE')) {
      explanation += 'with specific filtering conditions ';
    }
    
    if (upperQuery.includes('GROUP BY')) {
      explanation += 'and groups the results ';
    }
    
    if (upperQuery.includes('ORDER BY')) {
      explanation += 'sorted in a specific order ';
    }
    
    explanation += 'to give you the information you requested.';
  } else if (upperQuery.includes('INSERT')) {
    explanation += 'This query adds new data to your database.';
  } else if (upperQuery.includes('UPDATE')) {
    explanation += 'This query modifies existing data in your database.';
  } else if (upperQuery.includes('DELETE')) {
    explanation += 'This query removes data from your database.';
  }

  return explanation;
}

// Helper function to test Gemini connection
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`);
    return response.ok;
  } catch {
    return false;
  }
} 