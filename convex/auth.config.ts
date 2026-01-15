/**
 * Convex Auth Configuration for Clerk Integration
 * 
 * This configures Convex to accept JWT tokens from Clerk for authentication.
 * 
 * Setup Steps:
 * 1. Get your Clerk Issuer URL from Clerk Dashboard -> API Keys
 *    (looks like: https://your-app.clerk.accounts.dev)
 * 2. In Convex Dashboard -> Settings -> Authentication:
 *    - Add "Clerk" as identity provider
 *    - Enter your Clerk Issuer URL
 * 3. In Clerk Dashboard -> JWT Templates:
 *    - Create a new template named "convex"
 *    - This allows Clerk to issue JWTs that Convex can verify
 */

export default {
  providers: [
    {
      // Clerk issuer domain from your publishable key
      domain: "https://stirred-terrier-81.clerk.accounts.dev",
      
      // This should match the JWT template name in Clerk
      applicationID: "convex",
    },
  ],
};
