const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Taskora API',
      version: '1.0.0',
      description:
        'Taskora — production-grade REST API for task management with JWT authentication',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      parameters: {
        WorkspaceIdHeader: {
          name: 'X-Workspace-Id',
          in: 'header',
          required: false,
          description: "Target workspace id. Falls back to the user's default workspace if absent.",
          schema: { type: 'string' },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            defaultWorkspace: { type: 'string', nullable: true },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            owner: { type: 'string' },
            plan: { type: 'string', enum: ['free', 'pro', 'team', 'enterprise'] },
            personal: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkspaceMember: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            role: { type: 'string', enum: ['owner', 'admin', 'member', 'viewer'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            workspace: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            labels: { type: 'array', items: { type: 'string' } },
            assignedTo: { $ref: '#/components/schemas/User' },
            createdBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullname', 'email', 'password'],
                  properties: {
                    fullname: { type: 'string', minLength: 2, maxLength: 50 },
                    email: { type: 'string', format: 'email' },
                    password: {
                      type: 'string',
                      minLength: 8,
                      description: 'Must contain uppercase, number, and special character',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered. Tokens set as httpOnly cookies.' },
            400: { description: 'Email already exists' },
            422: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
              },
            },
            429: { description: 'Too many attempts' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful. Tokens set as httpOnly cookies.' },
            401: { description: 'Invalid credentials' },
            429: { description: 'Too many attempts' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token using refresh token cookie',
          responses: {
            200: { description: 'New tokens issued' },
            401: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Current user data' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and clear tokens',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Logged out' },
          },
        },
      },
      '/workspaces': {
        get: {
          tags: ['Workspaces'],
          summary: 'List workspaces the current user belongs to',
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: 'List of workspaces with the caller role in each',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      workspaces: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Workspace' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Not authenticated' },
          },
        },
        post: {
          tags: ['Workspaces'],
          summary: 'Create a new workspace (caller becomes owner)',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string', maxLength: 80 } },
                },
              },
            },
          },
          responses: {
            201: { description: 'Workspace created' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/workspaces/{id}': {
        get: {
          tags: ['Workspaces'],
          summary: 'Get a single workspace',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Workspace details' },
            404: { description: 'Not found or not a member' },
          },
        },
        patch: {
          tags: ['Workspaces'],
          summary: 'Update workspace (owner/admin only)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string', maxLength: 80 } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Workspace updated' },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
      },
      '/workspaces/{id}/members': {
        get: {
          tags: ['Workspaces'],
          summary: 'List members of a workspace',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Member list' },
            404: { description: 'Not a member of this workspace' },
          },
        },
      },
      '/tasks': {
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task (workspace-scoped)',
          security: [{ cookieAuth: [] }],
          parameters: [{ $ref: '#/components/parameters/WorkspaceIdHeader' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 2000 },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Task created' },
            401: { description: 'Not authenticated' },
            422: { description: 'Validation error' },
          },
        },
        get: {
          tags: ['Tasks'],
          summary: 'List tasks in the current workspace (paginated, filterable)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/WorkspaceIdHeader' },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
            {
              name: 'filter',
              in: 'query',
              schema: { type: 'string', enum: ['ALL', 'pending', 'in-progress', 'completed'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          ],
          responses: {
            200: { description: 'Paginated task list' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get a single task',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Task details' },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update a task',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 2000 },
                    status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Task updated' },
            403: { description: 'Forbidden' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task (admin only)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Task deleted' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Not found' },
          },
        },
      },
      '/users/all': {
        get: {
          tags: ['Users'],
          summary: 'Get all users (admin only)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'fullname', in: 'query', schema: { type: 'string' } },
            { name: 'email', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'User list' },
            401: { description: 'Not authenticated' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'User details' },
            401: { description: 'Not authenticated' },
            404: { description: 'Not found' },
          },
        },
      },
    },
  },
  apis: [], // We define everything inline above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
