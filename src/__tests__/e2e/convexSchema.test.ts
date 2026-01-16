/**
 * Convex Schema Verification Tests
 * Ensures all database tables are properly configured before Supabase removal
 */

import * as fs from 'fs';
import * as path from 'path';

const CONVEX_DIR = path.join(__dirname, '../../../convex');

describe('Convex Schema Completeness', () => {
  let schemaContent: string;

  beforeAll(() => {
    const schemaPath = path.join(CONVEX_DIR, 'schema.ts');
    schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  });

  test('should define all required tables', () => {
    const requiredTables = [
      'users',
      'facilities',
      'detentionEvents',
      'invoices',
      'fleets',
      'fleetMembers',
      'fleetInvitations',
      'gpsLogs',
      'photos',
      'subscriptions',
      'facilityReviews',
      'emailContacts',
    ];

    for (const table of requiredTables) {
      expect(schemaContent).toContain(`${table}:`);
    }
  });

  test('users table should have required fields', () => {
    // Check for Clerk integration fields
    expect(schemaContent).toMatch(/clerkId.*v\.string/);
    expect(schemaContent).toMatch(/email.*v\.string/);
  });

  test('detentionEvents table should have required fields', () => {
    expect(schemaContent).toMatch(/userId.*v\.id.*users/);
    expect(schemaContent).toMatch(/facilityId.*v\.id.*facilities/);
    expect(schemaContent).toMatch(/status.*v\.union/);
  });

  test('invoices table should have required fields', () => {
    expect(schemaContent).toMatch(/userId.*v\.id.*users/);
    expect(schemaContent).toMatch(/detentionEventId.*v\.id.*detentionEvents/);
    expect(schemaContent).toMatch(/amount.*v\.number/);
  });

  test('fleets table should have required fields', () => {
    expect(schemaContent).toMatch(/name.*v\.string/);
    expect(schemaContent).toMatch(/ownerId.*v\.id.*users/);
  });

  test('fleetMembers table should have required fields', () => {
    expect(schemaContent).toMatch(/fleetId.*v\.id.*fleets/);
    expect(schemaContent).toMatch(/userId.*v\.id.*users/);
    expect(schemaContent).toMatch(/role.*v\.union/);
  });
});

describe('Convex Functions', () => {
  test('users functions should exist', () => {
    const usersPath = path.join(CONVEX_DIR, 'users.ts');
    expect(fs.existsSync(usersPath)).toBe(true);
    
    const content = fs.readFileSync(usersPath, 'utf-8');
    // Should have user creation/query functions
    expect(content).toContain('mutation');
    expect(content).toContain('query');
  });

  test('facilities functions should exist', () => {
    const facilitiesPath = path.join(CONVEX_DIR, 'facilities.ts');
    expect(fs.existsSync(facilitiesPath)).toBe(true);
    
    const content = fs.readFileSync(facilitiesPath, 'utf-8');
    expect(content).toContain('query');
  });

  test('detentionEvents functions should exist', () => {
    const eventsPath = path.join(CONVEX_DIR, 'detentionEvents.ts');
    expect(fs.existsSync(eventsPath)).toBe(true);
    
    const content = fs.readFileSync(eventsPath, 'utf-8');
    expect(content).toContain('mutation');
    expect(content).toContain('query');
  });

  test('invoices functions should exist', () => {
    const invoicesPath = path.join(CONVEX_DIR, 'invoices.ts');
    expect(fs.existsSync(invoicesPath)).toBe(true);
    
    const content = fs.readFileSync(invoicesPath, 'utf-8');
    expect(content).toContain('mutation');
    expect(content).toContain('query');
  });

  test('fleets functions should exist', () => {
    const fleetsPath = path.join(CONVEX_DIR, 'fleets.ts');
    expect(fs.existsSync(fleetsPath)).toBe(true);
    
    const content = fs.readFileSync(fleetsPath, 'utf-8');
    expect(content).toContain('mutation');
    expect(content).toContain('query');
  });

  test('fleetMembers functions should exist', () => {
    const membersPath = path.join(CONVEX_DIR, 'fleetMembers.ts');
    expect(fs.existsSync(membersPath)).toBe(true);
    
    const content = fs.readFileSync(membersPath, 'utf-8');
    expect(content).toContain('mutation');
    expect(content).toContain('query');
  });
});

describe('Convex Auth Configuration', () => {
  test('auth config should use Clerk provider', () => {
    const authConfigPath = path.join(CONVEX_DIR, 'auth.config.ts');
    expect(fs.existsSync(authConfigPath)).toBe(true);
    
    const content = fs.readFileSync(authConfigPath, 'utf-8');
    expect(content).toContain('providers');
    expect(content).toContain('domain');
    expect(content).toContain('clerk');
  });
});

describe('Feature Modules', () => {
  const SRC_DIR = path.join(__dirname, '../../');

  test('auth feature should export Clerk hooks', () => {
    const authIndexPath = path.join(SRC_DIR, 'features/auth/index.ts');
    expect(fs.existsSync(authIndexPath)).toBe(true);
    
    const content = fs.readFileSync(authIndexPath, 'utf-8');
    expect(content).toContain('useAuth');
    expect(content).toContain('useUser');
  });

  test('facilities feature should exist', () => {
    const facilitiesDir = path.join(SRC_DIR, 'features/facilities');
    expect(fs.existsSync(facilitiesDir)).toBe(true);
  });

  test('detention feature should exist', () => {
    const detentionDir = path.join(SRC_DIR, 'features/detention');
    expect(fs.existsSync(detentionDir)).toBe(true);
  });

  test('invoices feature should exist', () => {
    const invoicesDir = path.join(SRC_DIR, 'features/invoices');
    expect(fs.existsSync(invoicesDir)).toBe(true);
  });

  test('fleet feature should exist', () => {
    const fleetDir = path.join(SRC_DIR, 'features/fleet');
    expect(fs.existsSync(fleetDir)).toBe(true);
  });
});
