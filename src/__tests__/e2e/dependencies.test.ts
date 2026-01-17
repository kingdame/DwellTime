/**
 * Dependency Verification Tests
 * Ensures proper migration from Supabase to Convex+Clerk
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '../../..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Recursively get all TypeScript files
 */
function getAllTsFiles(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('__tests__')) {
      getAllTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

describe('Package Dependencies', () => {
  let packageJson: any;

  beforeAll(() => {
    const packagePath = path.join(ROOT_DIR, 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  });

  test('should have Clerk installed', () => {
    expect(packageJson.dependencies['@clerk/clerk-expo']).toBeDefined();
  });

  test('should have Convex installed', () => {
    expect(packageJson.dependencies['convex']).toBeDefined();
  });

  test('should have required Expo packages for Clerk', () => {
    expect(packageJson.dependencies['expo-secure-store']).toBeDefined();
    expect(packageJson.dependencies['expo-web-browser']).toBeDefined();
    expect(packageJson.dependencies['expo-auth-session']).toBeDefined();
  });

  test('Supabase should be removed (migration complete)', () => {
    // Migration completed Jan 16, 2026 - Supabase fully replaced by Convex+Clerk
    expect(packageJson.dependencies['@supabase/supabase-js']).toBeUndefined();
  });
});

describe('Auth Import Migration', () => {
  test('auth screens should import from Clerk, not Supabase', () => {
    const authFiles = [
      path.join(APP_DIR, 'auth/sign-in.tsx'),
      path.join(APP_DIR, 'auth/sign-up.tsx'),
      path.join(APP_DIR, 'auth/forgot-password.tsx'),
    ];

    for (const filePath of authFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Should use Clerk
      expect(content).toContain('@clerk/clerk-expo');
      
      // Should NOT import Supabase auth directly
      expect(content).not.toMatch(/from\s+['"].*supabase.*['"]/);
    }
  });

  test('root layout should use Clerk provider', () => {
    const layoutPath = path.join(APP_DIR, '_layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    
    expect(content).toContain('ClerkProvider');
    expect(content).toContain('ConvexProviderWithClerk');
  });
});

describe('Tab Screens', () => {
  const tabScreens = [
    'index.tsx',
    'facilities.tsx',
    'history.tsx',
    'invoices.tsx',
    'fleet.tsx',
    'profile.tsx',
  ];

  test.each(tabScreens)('%s should exist and be a valid component', (screen) => {
    const screenPath = path.join(APP_DIR, '(tabs)', screen);
    expect(fs.existsSync(screenPath)).toBe(true);
    
    const content = fs.readFileSync(screenPath, 'utf-8');
    expect(content).toMatch(/export\s+default\s+function/);
  });
});

describe('Fleet Management Routes', () => {
  const fleetRoutes = [
    'drivers.tsx',
    'invite.tsx',
    'events.tsx',
    'invoices.tsx',
    'settings.tsx',
    '_layout.tsx',
  ];

  test.each(fleetRoutes)('fleet/%s should exist', (route) => {
    const routePath = path.join(APP_DIR, 'fleet', route);
    expect(fs.existsSync(routePath)).toBe(true);
  });

  test('dynamic driver route should exist', () => {
    const driverPath = path.join(APP_DIR, 'fleet/driver/[id].tsx');
    expect(fs.existsSync(driverPath)).toBe(true);
  });
});

describe('Feature Module Structure', () => {
  const features = [
    'auth',
    'detention',
    'facilities',
    'fleet',
    'invoices',
    'recovery',
  ];

  test.each(features)('%s feature should have index.ts export', (feature) => {
    const indexPath = path.join(SRC_DIR, 'features', feature, 'index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);
  });
});

describe('Shared Libraries', () => {
  test('clerk.ts should export tokenCache', () => {
    const clerkPath = path.join(SRC_DIR, 'shared/lib/clerk.ts');
    expect(fs.existsSync(clerkPath)).toBe(true);
    
    const content = fs.readFileSync(clerkPath, 'utf-8');
    expect(content).toContain('export const tokenCache');
    expect(content).toContain('export const clerkPublishableKey');
  });

  test('convex.ts should export client configuration', () => {
    const convexPath = path.join(SRC_DIR, 'shared/lib/convex.ts');
    expect(fs.existsSync(convexPath)).toBe(true);
    
    const content = fs.readFileSync(convexPath, 'utf-8');
    expect(content).toContain('ConvexReactClient');
  });
});

describe('No Hardcoded Supabase Auth in New Code', () => {
  test('app directory should not have direct Supabase auth imports', () => {
    const appFiles = getAllTsFiles(APP_DIR);
    
    const supabaseAuthImports: string[] = [];
    
    for (const file of appFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for direct Supabase auth usage (not just the client)
      if (content.includes('supabase.auth.') || 
          content.includes('signInWithPassword') ||
          content.includes('signUp({')) {
        // Exclude if it's using Clerk instead
        if (!content.includes('@clerk/clerk-expo')) {
          supabaseAuthImports.push(file);
        }
      }
    }
    
    expect(supabaseAuthImports).toEqual([]);
  });
});
