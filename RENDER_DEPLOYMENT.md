# Deploying InvestShield to Render

This guide provides step-by-step instructions for deploying the InvestShield application to Render.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com) if you don't have one)
- Your InvestShield repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Steps

### 1. Create a New Web Service on Render

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your repository by selecting the appropriate Git provider
4. Search for and select your InvestShield repository

### 2. Configure Your Web Service

- **Name**: investshield (or your preferred name)
- **Environment**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 3. Set Environment Variables

Add the following environment variables in the Render dashboard:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Deploy

Click "Create Web Service" to start the deployment process. Render will automatically build and deploy your application.

### 5. Access Your Deployed Application

Once the deployment is complete, you can access your application at the URL provided by Render (typically `https://your-service-name.onrender.com`).

## Using render.yaml for Infrastructure as Code (Blueprint)

InvestShield includes a `render.yaml` file that allows you to define your Render services as code. To use this approach:

1. Log in to your Render dashboard
2. Click on "New" and select "Blueprint"
3. Connect your repository by selecting the appropriate Git provider
4. Search for and select your InvestShield repository
5. Render will automatically detect the `render.yaml` file and configure your services
6. Review the configuration and click "Apply" to deploy

The `render.yaml` file is already configured with the correct settings for a static site deployment, including:
- Build command and publish directory
- Environment variables for Firebase configuration
- Route configuration for client-side routing
3. Connect your repository
4. Render will automatically detect the `render.yaml` file and create the defined services

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the build logs for errors. Common issues include missing dependencies or build script errors.

2. **Environment Variables**: Ensure all required environment variables are correctly set in the Render dashboard.

3. **Routing Issues**: If you encounter 404 errors for client-side routes, ensure that the `render.yaml` file includes the proper route configuration for single-page applications.

### Getting Help

If you encounter issues with your deployment, you can:

- Check the Render documentation at [render.com/docs](https://render.com/docs)
- Review the build logs in your Render dashboard
- Consult the React deployment documentation at [create-react-app.dev/docs/deployment](https://create-react-app.dev/docs/deployment)