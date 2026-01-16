/**
 * Convex Auth Configuration for Clerk Integration
 * 
 * Setup Steps:
 * 1. In Clerk Dashboard -> Configure -> JWT Templates -> New Template -> Select "Convex"
 * 2. Copy the Issuer URL from the template
 * 3. In Convex Dashboard -> Settings -> Environment Variables:
 *    - Add CLERK_JWT_ISSUER_DOMAIN with the Issuer URL
 * 
 * @see https://clerk.com/docs/integrations/databases/convex
 */

export default {
  providers: [
    {
      // Clerk JWT Issuer Domain
      // From Clerk Dashboard -> Configure -> JWT Templates -> Convex template
      domain: "https://stirred-terrier-81.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
