// Project Creation Wizard Steps
// Defines the multi-step form for creating a new project

export const WIZARD_STEPS = [
  {
    id: 'app-info',
    title: 'App Information',
    description: 'Tell us about your app',
    fields: [
      {
        name: 'appName',
        label: 'App Name',
        type: 'text',
        placeholder: 'Enter your app name',
        required: true,
        validation: (value) => value.trim().length > 0 || 'App name is required'
      },
      {
        name: 'appDescription',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Describe what your app does',
        required: false,
        maxLength: 500
      }
    ]
  },
  {
    id: 'template-selection',
    title: 'Choose Template',
    description: 'Select a starting point for your app',
    fields: [
      {
        name: 'templateType',
        label: 'Template Type',
        type: 'select',
        options: [
          { value: 'utility', label: 'Utility App' },
          { value: 'ecommerce', label: 'E-commerce App' },
          { value: 'blog', label: 'Blog/News App' },
          { value: 'saas', label: 'SaaS Dashboard' }
        ],
        required: true,
        defaultValue: 'utility'
      }
    ]
  },
  {
    id: 'theme-customization',
    title: 'Customize Theme',
    description: 'Choose colors and styling for your app',
    fields: [
      {
        name: 'theme',
        label: 'Color Theme',
        type: 'select',
        options: [
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
          { value: 'purple', label: 'Purple' },
          { value: 'red', label: 'Red' }
        ],
        required: true,
        defaultValue: 'blue'
      }
    ]
  },
  {
    id: 'feature-selection',
    title: 'Select Features',
    description: 'Choose which features to include in your app',
    fields: [
      {
        name: 'features',
        label: 'Features',
        type: 'checkbox-group',
        options: [
          { value: 'authentication', label: 'User Authentication' },
          { value: 'data-storage', label: 'Local Data Storage' },
          { value: 'api-integration', label: 'External API Integration' },
          { value: 'push-notifications', label: 'Push Notifications' },
          { value: 'offline-support', label: 'Offline Support' },
          { value: 'analytics', label: 'Analytics & Tracking' }
        ],
        required: false
      }
    ]
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your selections and create the project',
    fields: [] // This step is for review only
  }
];

export const TEMPLATE_DESCRIPTIONS = {
  utility: 'Perfect for simple tools, helpers, and utility apps. Includes dashboard and settings screens.',
  ecommerce: 'Ideal for shopping apps with product listings, cart, and checkout functionality.',
  blog: 'Great for content publishing platforms with articles, categories, and search.',
  saas: 'Best for business tools, dashboards, and software-as-a-service applications.'
};

export const FEATURE_DESCRIPTIONS = {
  authentication: 'Secure user login and account management',
  data_storage: 'Local data persistence using SQLite or similar',
  api_integration: 'Connect to external APIs and web services',
  push_notifications: 'Send push notifications to users',
  offline_support: 'App functionality available without internet',
  analytics: 'Track usage and user behavior analytics'
};
