# Google Cloud Setup Instructions for MasterDiaryAppOfficialV2

To make your app "Enterprise Ready" and accessible online, you need to set up the following Google Cloud services.

## 1. Database (Cloud SQL) - *Critical*
Replaces your local `database.sqlite` file so data persists safely in the cloud.

1.  Go to the **Google Cloud Console** > **SQL**.
2.  Click **"Create Instance"**.
3.  Choose **PostgreSQL**.
4.  **Instance ID:** `master-diary-db` (or similar).
5.  **Password:** Generate a strong password and **SAVE IT**.
6.  **Database Version:** PostgreSQL 15 (or latest).
7.  **Region:** Choose the one closest to you (e.g., `europe-west2` for London, `us-central1` for Iowa).
8.  Click **Create Instance**. (This takes 5-10 minutes).

### After Creation:
1.  Go to the **"Users"** tab on the left. Create a user (e.g., `app_user`) if you don't want to use the default `postgres` user.
2.  Go to the **"Databases"** tab. Create a new database named `master_diary_db`.
3.  Go to the **"Overview"** tab. Copy the **"Connection name"** (e.g., `project-id:region:instance-id`).

## 2. Storage (Cloud Storage) - *For Uploads*
1.  Go to **Cloud Storage** > **Buckets**.
2.  Click **Create Bucket**.
3.  Name: `master-diary-uploads-[your-project-id]`.
4.  Leave defaults (Standard storage, Uniform access control) and click **Create**.

## 3. Environment Variables
When you deploy your app (to Cloud Run), you will need to set these "Environment Variables" so the code knows how to connect:

*   `NODE_ENV`: `production`
*   `DB_HOST`: `/cloudsql/[YOUR_CONNECTION_NAME]` (e.g., `/cloudsql/my-project:us-central1:master-diary-db`)
*   `DB_USER`: `postgres` (or your new user)
*   `DB_PASSWORD`: `[YOUR_DB_PASSWORD]`
*   `DB_NAME`: `master_diary_db`
*   `DB_SOCKET_PATH`: `/cloudsql`

## 4. Google Maps & AI
Ensure your API Key is unrestricted or restricted to allow:
*   Maps JavaScript API
*   Places API
*   Vertex AI API
