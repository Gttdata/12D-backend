# 12D-backend

Backend service for the 12 Dimensions platform. It is a Node.js/Express server with a MySQL database, scheduled jobs, push notifications (Firebase), file uploads, and Swagger API documentation.

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Web framework**: Express (`server.js`)
- **Database**: MySQL
  - `mysql2` pool (`Utilities/dbConfig.js`)
  - direct `mysql` single-connection helpers (`Utilities/globalModule.js`)
- **Auth & security**: `jsonwebtoken`, custom API key gate
- **Scheduling**: `node-schedule` (`Utilities/scheduler.js`)
- **Notifications**: Firebase Admin SDK (`Utilities/firebase.js`)
- **Validation & middleware**: `body-parser`, `cors`, `helmet` (listed), `express-validator` (used by services/routes)
- **Docs**: Swagger UI at `/api-docs` using `swagger.json`
- **Uploads**: `formidable` file handling, exposed at `/static`

## Project Structure

```
12D-backend/
├─ server.js                  # App entrypoint; Express setup, routes mount, scheduler, Swagger
├─ package.json               # Dependencies, scripts
├─ swagger.json               # OpenAPI definition served at /api-docs
├─ Routes/                    # Express routers grouped by domain
│  ├─ global.js               # Aggregator router; mounts all feature routers
│  ├─ Masters/ ...            # Master data routers
│  ├─ TrackBook/ ...          # TrackBook domain routers
│  ├─ Subscription/ ...       # Subscription domain routers
│  ├─ AnimationRewards/ ...   # Animation & rewards routers
│  ├─ Reports/ ...            # Reporting routers
│  └─ UserAccess/ ...         # AuthN/AuthZ and user management routers
├─ Services/                  # Route handlers (business logic), mirrors Routes
│  ├─ global.js               # Upload endpoints, auth gates
│  └─ <Domain>/...            # e.g., Masters, TrackBook, etc.
├─ Utilities/                 # Cross-cutting helpers
│  ├─ dbConfig.js             # mysql2 connection pool (env-driven)
│  ├─ globalModule.js         # MySQL helpers, notifications, date utils, SMS/Email/WA bridges
│  ├─ firebase.js             # Firebase Admin initialization and send utilities
│  ├─ scheduler.js            # node-schedule cron and job dispatching
│  └─ logger.js               # Remote log forwarding via GM API
├─ uploads/                   # Static files exposed at /static (see note below)
└─ README.md
```

## Application Boot Flow

1. `server.js` loads environment via `dotenv`, configures Express JSON/urlencoded parsers and CORS.
2. Serves static files from `./uploads` at route prefix `/static`.
3. Mounts Swagger UI at `/api-docs` using `swagger.json`.
4. Aggregates domain routes via `Routes/global.js` under `/`.
5. Starts scheduler with `require('./Utilities/scheduler').schedulerJob()`; runs every minute.
6. Listens on `HOST_NAME:PORT` and logs the MySQL database name.

Relevant snippets:
- `server.js` sets up middleware and routing, and listens:
  - `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));`
  - `app.use('/', require('./Routes/global'));`
  - `server.listen(port, hostname, ...)`

## Routing and Services Pattern

- `Routes/global.js` is the central place where all routers are mounted. Example mounts:
  - `router.use('/api/state', require('./Masters/state'))`
  - `router.post('/user/login', require('../Services/UserAccess/user').login)`
- Each router file under `Routes/<Domain>/` generally delegates to corresponding `Services/<Domain>/` modules for business logic.
- Upload endpoints are defined in `Services/global.js` and are wired directly in `Routes/global.js` via `router.post('/upload/...', globalService.<handler>)`.

### Adding a new API
1. Create a service function in `Services/<Domain>/<feature>.js`.
2. Create a route file in `Routes/<Domain>/<feature>.js` that defines the Express router and calls the service.
3. Mount it in `Routes/global.js` with a clear base path.

## Authentication & Authorization

- API-key gate: `Services/global.js -> checkAuth()` compares `req.headers['apikey']` with `process.env.APIKEY`.
- Token gate: `Services/global.js -> checkToken()` verifies `req.headers['token']` JWT with `process.env.SECRET`.
- These middlewares are currently commented in `Routes/global.js` but can be re-enabled:
  - `// .use('*', globalService.checkAuth)`
  - `// .use('/api', globalService.checkToken)`

## Database Access

There are two access patterns:

- `Utilities/dbConfig.js` uses `mysql2` with a pool:
  - Env-driven pool with `connectionLimit`, `multipleStatements`, `charset`, `timezone`.
  - Emits `connection` events for logging.

- `Utilities/globalModule.js` uses `mysql` with ephemeral connections:
  - `executeQuery(sql, supportKey, cb)` and `executeQueryData(sql, data, supportKey, cb)` open a connection per call, log the query, and close in `finally`.
  - Transaction helpers: `openConnection()`, `executeDML()`, `commitConnection()`, `rollbackConnection()` are used by scheduler to batch operations safely.

Environment variables used across these modules:
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `PORT`, `HOST_NAME`.

## Scheduler

- Defined in `Utilities/scheduler.js`.
- Started by `server.js` during boot: `schedulerJob()`.
- Cron: every minute (`" */1 * * * *"`).
- High-level flow:
  - Reads `view_scheduler_master` for due jobs based on `REPEAT_MODE` and `REPEAT_DATA`.
  - For each due record, dispatches by `NOTIFICATION_TYPE_ID` to one of several routines (e.g., member todos, period tracking reminders, task reminders, subscription expiry, challenge completion WhatsApp message).
  - Uses `Utilities/globalModule.js` DB helpers and Firebase notification utilities.

## Notifications

- Firebase Admin initialized in `Utilities/firebase.js` with a service key `Utilities/firebaseKey.json` (not committed; provide via deployment secrets/files).
- Exposed helpers:
  - `generateNotification(...)` for topic/device arrays/single device.
  - `generateAlarmNotification(...)` for alarm-style push (custom sound/channel, actions).
  - `generateNotificationArray(...)` for multi-topic/device flows.
- Persists notification history via `addNotificationHistory` which inserts into `notification_history` using `globalModule.executeQueryData`.

## External Messaging Bridges

- Email/SMS/WhatsApp helper methods in `Utilities/globalModule.js` call remote GM API endpoints (env-driven: `GM_API`, `GM_API_KEY`, `SUPPORT_KEY`, etc.).
- WhatsApp messages via `sendWAToolSMS` require `WA_TOOLS_*` envs.

## Logging

- `Utilities/logger.js` forwards logs to a remote GM API (`/device/addDbLog`, `/device/addAPILog`, `/device/addErrorLog`).
- Controlled via `process.env.GM_API` and includes `supportkey` and hard-coded API keys in headers.

## File Uploads and Static Files

- Upload handlers are in `Services/global.js` using `formidable`.
- Each handler writes to a specific subfolder under `../Uploads/<name>/` relative to `Services/global.js`.
- Static serving is configured in `server.js` as `app.use('/static', express.static('./uploads/'));`.

Important note:
- On case-sensitive filesystems (Linux), `Uploads` (capital U) vs `uploads` (lowercase) are different. Code writes to `Uploads`, but `server.js` serves `uploads`. On Windows this may work; on Linux, ensure the served static path matches where files are written. Recommended: standardize to `uploads/` consistently.

## Environment Variables

Create a `.env` in the project root with at least:

```
PORT=3000
HOST_NAME=127.0.0.1

# MySQL
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_db

# Security
APIKEY=your_api_key_for_checkAuth
SECRET=your_jwt_secret
APPLICATION_KEY=app_key
SUPPORT_KEY=support_key

# GM Platform (email/SMS/logging)
GM_API=https://your-gm-api/
GM_API_KEY=your_gm_api_key
EMAIL_SERVER_KEY=your_email_server_key
SMS_SERVER_KEY=your_sms_server_key
SMS_SERVER_KEY_OTP=your_sms_otp_key

# WhatsApp tooling
WA_TOOLS_PLATFORM_URL=https://wa-platform/endpoint
WA_TOOLS_PLATFORM_API_KEY=...
WA_TOOLS_CLIENT_API_KEY=...
WA_TOOLS_CLIENT_ID=...

# Firebase Admin SDK
# Place service account JSON at Utilities/firebaseKey.json (keep secret!)
```

## Running Locally

1. Install Node.js LTS (18+ recommended).
2. Install dependencies:
   - `npm install`
3. Create `.env` as above and ensure MySQL is reachable.
4. Provide `Utilities/firebaseKey.json` service account file (keep it out of VCS).
5. Start the server:
   - `node server.js`
6. Open Swagger docs at: `http://HOST_NAME:PORT/api-docs`
7. Static files (e.g., uploaded assets) are available at: `http://HOST_NAME:PORT/static/...`

## Common Conventions

- Prefer parameterized queries via `executeQueryData(sql, data, ...)` to avoid SQL injection; avoid string concatenation in SQL.
- For multi-step DB updates, use transaction helpers in `Utilities/globalModule.js`:
  - `openConnection()` -> multiple `executeDML()` calls -> `commitConnection()`/`rollbackConnection()`.
- Keep new routers small and delegate business logic to `Services/`.
- Add new upload types by following the existing pattern in `Services/global.js`.
- Expose new routers by mounting them in `Routes/global.js` under a clear base path (e.g., `/api/<domain>`).

## API Documentation

- The API is documented via `swagger.json` and served at `/api-docs`.
- Update `swagger.json` when adding routes to keep docs in sync. The project lists `swagger-autogen` and `swagger-jsdoc` if you later automate updates.

## High-Level Architecture

```mermaid
flowchart LR
  Client -->|HTTP| Express[Express app (server.js)]
  Express -->|mount| GlobalRoutes[Routes/global.js]
  GlobalRoutes -->|/api/...| Routers[Feature Routers]
  Routers --> Services[Services/<Domain>/*]
  Services --> DB[(MySQL)]
  Services --> Firebase[Firebase Admin]
  Services --> GM[GM API (Email/SMS/Logs)]
  Express -->|static| Uploads[./uploads]
  Cron[Scheduler (node-schedule)] --> Services
```

## Troubleshooting

- If uploads are not visible, ensure the path case matches between where files are written (`Services/global.js` -> `../Uploads/...`) and the static folder served (`./uploads`). Align them on disk or update the path.
- If Firebase fails, verify `Utilities/firebaseKey.json` presence and service account permissions.
- If DB connects but queries fail intermittently, prefer the pool in `dbConfig.js` or ensure connections in `globalModule.js` are closed (they are closed in `finally`).
- For 401/403 responses, check `APIKEY` and JWT `SECRET` and confirm that the auth middlewares are correctly mounted.

## Security Notes

- Do not commit `.env` or `Utilities/firebaseKey.json`.
- Consider rotating the hard-coded keys in `Utilities/logger.js` and moving them to environment variables.
- Validate and sanitize inputs. Leverage `express-validator` where applicable.

## License

ISC (see `package.json`).

