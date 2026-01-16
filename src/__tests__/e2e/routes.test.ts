/**
 * E2E Route Verification Tests
 * Verifies all app routes are properly configured before Supabase removal
 */

import * as fs from 'fs';
import * as path from 'path';

// Get all route files from the app directory
const APP_DIR = path.join(__dirname, '../../../app');

/**
 * Recursively get all route files
 */
function getRouteFiles(dir: string, routes: string[] = []): string[] {
  if (!fs.existsSync(dir)) return routes;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getRouteFiles(filePath, routes);
    } else if (file.endsWith('.tsx') && !file.startsWith('_')) {
      // Convert file path to route
      const relativePath = path.relative(APP_DIR, filePath);
      const route = '/' + relativePath
        .replace(/\\/g, '/')
        .replace('.tsx', '')
        .replace('/index', '')
        .replace('index', '');
      routes.push(route || '/');
    }
  }
  
  return routes;
}

/**
 * Get layout files
 */
function getLayoutFiles(dir: string, layouts: string[] = []): string[] {
  if (!fs.existsSync(dir)) return layouts;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getLayoutFiles(filePath, layouts);
    } else if (file === '_layout.tsx') {
      layouts.push(filePath);
    }
  }
  
  return layouts;
}

describe('Route Configuration', () => {
  const routes = getRouteFiles(APP_DIR);
  const layouts = getLayoutFiles(APP_DIR);

  test('should have all expected routes defined', () => {
    const expectedRoutes = [
      '/',                           // Root index
      '/auth/sign-in',               // Sign in
      '/auth/sign-up',               // Sign up
      '/auth/forgot-password',       // Forgot password
      '/(tabs)',                     // Tabs index (home)
      '/(tabs)/facilities',          // Facilities
      '/(tabs)/history',             // History
      '/(tabs)/invoices',            // Invoices
      '/(tabs)/fleet',               // Fleet
      '/(tabs)/profile',             // Profile
      '/fleet/drivers',              // Fleet drivers
      '/fleet/invite',               // Fleet invite
      '/fleet/events',               // Fleet events
      '/fleet/invoices',             // Fleet invoices
      '/fleet/settings',             // Fleet settings
      '/fleet/driver/[id]',          // Driver detail
      '/recovery',                   // Recovery
    ];

    console.log('Found routes:', routes);
    
    for (const expectedRoute of expectedRoutes) {
      const found = routes.some(r => 
        r === expectedRoute || 
        r.includes(expectedRoute.replace('[id]', ''))
      );
      expect(found).toBe(true);
    }
  });

  test('should have layout files for navigation groups', () => {
    const expectedLayoutDirs = [
      'app',           // Root layout
      '(tabs)',        // Tabs layout
      'auth',          // Auth layout
      'fleet',         // Fleet layout
      'recovery',      // Recovery layout
    ];

    console.log('Found layouts:', layouts.map(l => path.dirname(l)));
    
    for (const dir of expectedLayoutDirs) {
      const found = layouts.some(l => l.includes(dir));
      expect(found).toBe(true);
    }
  });

  test('route files should export default component', () => {
    for (const route of routes) {
      const filePath = path.join(
        APP_DIR,
        route === '/' ? 'index.tsx' : route + '.tsx'
      );
      
      // Skip dynamic routes
      if (route.includes('[')) continue;
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/export\s+default\s+function/);
      }
    }
  });
});

describe('Auth Routes', () => {
  const authDir = path.join(APP_DIR, 'auth');

  test('sign-in page should use Clerk hooks', () => {
    const signInPath = path.join(authDir, 'sign-in.tsx');
    expect(fs.existsSync(signInPath)).toBe(true);
    
    const content = fs.readFileSync(signInPath, 'utf-8');
    expect(content).toContain('@clerk/clerk-expo');
    expect(content).toContain('useSignIn');
    expect(content).toContain('useAuth');
  });

  test('sign-up page should use Clerk hooks', () => {
    const signUpPath = path.join(authDir, 'sign-up.tsx');
    expect(fs.existsSync(signUpPath)).toBe(true);
    
    const content = fs.readFileSync(signUpPath, 'utf-8');
    expect(content).toContain('@clerk/clerk-expo');
    expect(content).toContain('useSignUp');
    expect(content).toContain('prepareEmailAddressVerification');
  });

  test('forgot-password page should use Clerk hooks', () => {
    const forgotPath = path.join(authDir, 'forgot-password.tsx');
    expect(fs.existsSync(forgotPath)).toBe(true);
    
    const content = fs.readFileSync(forgotPath, 'utf-8');
    expect(content).toContain('@clerk/clerk-expo');
    expect(content).toContain('reset_password_email_code');
  });
});

describe('Protected Routes', () => {
  test('tabs layout should check authentication', () => {
    const tabsLayoutPath = path.join(APP_DIR, '(tabs)', '_layout.tsx');
    expect(fs.existsSync(tabsLayoutPath)).toBe(true);
    
    const content = fs.readFileSync(tabsLayoutPath, 'utf-8');
    expect(content).toContain('useAuth');
    expect(content).toContain('isSignedIn');
    expect(content).toContain('Redirect');
  });

  test('root index should handle auth redirect', () => {
    const indexPath = path.join(APP_DIR, 'index.tsx');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('useAuth');
  });
});

describe('Convex Integration', () => {
  const convexDir = path.join(__dirname, '../../../convex');

  test('should have schema defined', () => {
    const schemaPath = path.join(convexDir, 'schema.ts');
    expect(fs.existsSync(schemaPath)).toBe(true);
    
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toContain('defineSchema');
    expect(content).toContain('defineTable');
  });

  test('should have auth config for Clerk', () => {
    const authConfigPath = path.join(convexDir, 'auth.config.ts');
    expect(fs.existsSync(authConfigPath)).toBe(true);
    
    const content = fs.readFileSync(authConfigPath, 'utf-8');
    expect(content).toContain('providers');
    expect(content).toContain('clerk');
  });

  test('should have required Convex functions', () => {
    const expectedFiles = [
      'users.ts',
      'facilities.ts',
      'detentionEvents.ts',
      'invoices.ts',
      'fleets.ts',
      'fleetMembers.ts',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(convexDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});

describe('Environment Configuration', () => {
  test('should have required Clerk env vars pattern in code', () => {
    const clerkLibPath = path.join(__dirname, '../../shared/lib/clerk.ts');
    expect(fs.existsSync(clerkLibPath)).toBe(true);
    
    const content = fs.readFileSync(clerkLibPath, 'utf-8');
    expect(content).toContain('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    expect(content).toContain('tokenCache');
  });

  test('root layout should use ClerkProvider', () => {
    const layoutPath = path.join(APP_DIR, '_layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);
    
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('ClerkProvider');
    expect(content).toContain('ConvexProviderWithClerk');
  });
});
