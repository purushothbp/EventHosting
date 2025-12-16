# Google Sign-In Setup Guide

This document walks you through the steps to configure Google Sign-In for your application. This involves creating an OAuth 2.0 Client ID in the Google Cloud Console.

## Prerequisites

- A Google Account.
- A project in the [Google Cloud Console](https://console.cloud.google.com/). If you don't have one, you'll need to create it first.

---

## Steps to Configure OAuth 2.0

### 1. Go to the Credentials Page

1.  Open the [Google Cloud Console](https://console.cloud.google.com/).
2.  From the project dropdown, select the project you want to use for your application.
3.  In the navigation menu (☰), go to **APIs & Services** > **Credentials**.

### 2. Configure the OAuth Consent Screen

Before you can create a Client ID, you need to configure the consent screen. This is what users will see when they are asked to grant permission to your application.

1.  Click on the **Configure Consent Screen** button.
2.  Choose the **User Type**:
    -   **Internal**: Only for users within your Google Workspace organization. Requires a Workspace subscription.
    -   **External**: For any user with a Google Account. This is the most common choice. Start in "Testing" mode, which limits you to 100 test users before your app is verified.
3.  Click **Create**.
4.  Fill out the required information:
    -   **App name**: The name of your application (e.g., "Nexus Events").
    -   **User support email**: Your email address for users to contact for support.
    -   **Developer contact information**: Your email address.
5.  Click **Save and Continue**.
6.  On the **Scopes** page, you can leave it blank for now. Basic sign-in (`email`, `profile`, `openid`) is added by default. Click **Save and Continue**.
7.  On the **Test users** page, add the Google Account emails of any users who will test the application before it is published. You can add your own email here. Click **Save and Continue**.
8.  Review the summary and click **Back to Dashboard**.

### 3. Create an OAuth 2.0 Client ID

Now you can create the credentials your application will use.

1.  On the **Credentials** page, click **+ Create Credentials** and select **OAuth client ID**.
2.  From the **Application type** dropdown, select **Web application**.
3.  Give it a **Name** (e.g., "Nexus Events Web Client").
4.  Under **Authorized JavaScript origins**, you must add the URLs from where your application will be making requests. For local development, this will be your local server's address.
    -   Click **+ Add URI**.
    -   Enter your development URL (e.g., `http://localhost:9002`).
5.  Under **Authorized redirect URIs**, you need to add the URL where Google will redirect users after they have authenticated. This must be an endpoint in your application that can handle the authentication code.
    -   Click **+ Add URI**.
    -   Enter the redirect URI. For local development, this could be something like `http://localhost:9002/api/auth/callback/google`. *Note: This backend endpoint needs to be implemented separately.*
6.  Click **Create**.

### 4. Get Your Client ID and Client Secret

A dialog will appear showing your **Client ID** and **Client Secret**.

-   **Client ID**: This is a public identifier for your application.
-   **Client Secret**: This is a confidential value that **must be kept secure**. Do not expose it in your frontend code.

Store these securely as environment variables in your `.env.local` file:

```
GOOGLE_CLIENT_ID=your-client-id-goes-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-goes-here
```

### 5. Provide Credentials to NextAuth

This project reads Google keys from a single `GOOGLE_OAUTH_CREDENTIALS` variable so that both local development and production deployments can share the same configuration. You can express the value in multiple formats and the backend will automatically pick the right pair based on the current environment (`APP_ENV`, `VERCEL_ENV`, `NODE_ENV`, etc.):

- Simple pipe: `GOOGLE_OAUTH_CREDENTIALS=clientId|clientSecret`
- JSON:

  ```json
  {
    "development": { "clientId": "xxx", "clientSecret": "yyy" },
    "production": { "clientId": "aaa", "clientSecret": "bbb" }
  }
  ```

- Multi-line `key=client|secret` pairs:

  ```
  GOOGLE_OAUTH_CREDENTIALS=development=devClient|devSecret
  production=prodClient|prodSecret
  ```

The app chooses the block that matches the active environment automatically, so you only have to set the variable once on Vercel.

### Next Steps

With these credentials, you will need to implement a backend service (e.g., using Next.js API routes) that can:
1.  Redirect the user to Google's authentication URL.
2.  Handle the callback from Google at your specified redirect URI.
3.  Exchange the authorization code (received from Google) for an access token and ID token.
4.  Verify the ID token to get the user's profile information.
5.  Create a session for the user in your application.

Libraries like `next-auth` can simplify this backend flow significantly.
