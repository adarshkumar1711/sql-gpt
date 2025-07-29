// SQL Schema Validation Utility

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Common SQL keywords that should be present in a schema
const SQL_KEYWORDS = [
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN', 
  'REFERENCES', 'INDEX', 'CONSTRAINT', 'NOT', 'NULL', 'DEFAULT',
  'VARCHAR', 'CHAR', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'DATE', 'TIME',
  'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'BOOL', 'TEXT', 'BLOB', 'JSON'
];

// SQL data types
const SQL_DATA_TYPES = [
  'VARCHAR', 'CHAR', 'TEXT', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 
  'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'DATE', 
  'TIME', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'BOOL', 'BLOB', 'JSON',
  'UUID', 'SERIAL', 'AUTOINCREMENT'
];

export function validateSQLSchema(schema: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic checks
  if (!schema || schema.trim().length === 0) {
    errors.push('Schema cannot be empty');
    return { isValid: false, errors, warnings };
  }

  const upperSchema = schema.toUpperCase();
  const lines = schema.split('\n').filter(line => line.trim().length > 0);

  // Check if it looks like SQL
  const hasCreateTable = upperSchema.includes('CREATE TABLE');
  const hasAlterTable = upperSchema.includes('ALTER TABLE');
  const hasCreateIndex = upperSchema.includes('CREATE INDEX');
  const hasCreateView = upperSchema.includes('CREATE VIEW');
  
  if (!hasCreateTable && !hasAlterTable && !hasCreateIndex && !hasCreateView) {
    errors.push('Schema must contain at least one CREATE TABLE, ALTER TABLE, CREATE INDEX, or CREATE VIEW statement');
  }

  // Check for SQL keywords
  const foundKeywords = SQL_KEYWORDS.filter(keyword => upperSchema.includes(keyword));
  if (foundKeywords.length < 3) {
    errors.push('Schema does not appear to contain valid SQL syntax. Please check your schema.');
  }

  // Check for data types
  const foundDataTypes = SQL_DATA_TYPES.filter(type => upperSchema.includes(type));
  if (foundDataTypes.length === 0) {
    warnings.push('No recognizable data types found. Make sure your schema includes column definitions.');
  }

  // Check for basic SQL structure patterns
  const hasParentheses = schema.includes('(') && schema.includes(')');
  if (!hasParentheses) {
    errors.push('Schema should contain parentheses for column definitions');
  }

  // Check for obvious non-SQL content
  const suspiciousPatterns = [
    /^\s*[a-zA-Z]+\s+[a-zA-Z]+\s+[a-zA-Z]+\s*$/, // Just random words
    /^[^a-zA-Z]*$/, // Only special characters/numbers
    /^\s*hello\s+world\s*$/i, // Hello world
    /^\s*test\s*$/i, // Just "test"
    /^\s*lorem\s+ipsum/i, // Lorem ipsum
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(schema.trim())) {
      errors.push('This does not appear to be a valid SQL schema. Please provide actual SQL CREATE TABLE statements.');
      break;
    }
  }

  // Check for minimum complexity
  if (schema.trim().length < 50) {
    warnings.push('Schema seems quite short. Make sure you have included all necessary table definitions.');
  }

  // Look for table names (basic heuristic)
  const tableMatches = schema.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi);
  if (tableMatches && tableMatches.length === 0) {
    warnings.push('No table names detected. Ensure your CREATE TABLE statements are properly formatted.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getSampleSchema(): string {
  return `-- Sample Database Schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);`;
} 