
# Mental Health Assistant Database Schema

## Tables

### users
Stores user profiles and authentication data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | No | None | Primary key, references auth.users |
| created_at | timestamptz | Yes | now() | Timestamp of creation |
| updated_at | timestamptz | Yes | now() | Timestamp of last update |
| name | text | Yes | None | User's name |
| date_of_birth | date | Yes | None | User's date of birth |
| emergency_contact | text | Yes | None | Emergency contact information |
| medical_history | jsonb | Yes | '{}' | Medical history data |

### assessments
Stores assessment results and diagnoses.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | None | References users.id |
| created_at | timestamptz | Yes | now() | Timestamp of creation |
| answers | jsonb | No | None | Assessment answers |
| scores | jsonb | No | None | Assessment scores |
| primary_condition | text | No | None | Primary diagnosed condition |
| secondary_conditions | text[] | Yes | '{}' | Secondary conditions |
| severity | text | No | None | Condition severity |
| recommendations | text[] | Yes | '{}' | Treatment recommendations |

### chat_sessions
Stores chat history and interactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | None | References users.id |
| created_at | timestamptz | Yes | now() | Timestamp of creation |
| updated_at | timestamptz | Yes | now() | Timestamp of last update |
| messages | jsonb[] | Yes | '{}' | Array of chat messages |

### treatment_plans
Stores personalized treatment plans.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | None | References users.id |
| assessment_id | uuid | No | None | References assessments.id |
| created_at | timestamptz | Yes | now() | Timestamp of creation |
| updated_at | timestamptz | Yes | now() | Timestamp of last update |
| start_date | timestamptz | Yes | now() | Treatment start date |
| duration | text | No | 'weekly' | Treatment duration |
| medications | jsonb[] | Yes | '{}' | Prescribed medications |
| exercises | jsonb[] | Yes | '{}' | Recommended exercises |
| activities | jsonb[] | Yes | '{}' | Recommended activities |
| goals | jsonb[] | Yes | '{}' | Treatment goals |
| progress_notes | jsonb[] | Yes | '{}' | Progress notes |

### treatment_schedule
Stores daily treatment schedules.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|----------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| treatment_plan_id | uuid | No | None | References treatment_plans.id |
| created_at | timestamptz | Yes | now() | Timestamp of creation |
| day_number | integer | No | None | Day number in schedule |
| day_date | date | Yes | None | Specific date for schedule |
| activities | jsonb[] | Yes | '{}' | Daily activities |
| therapies | jsonb[] | Yes | '{}' | Therapy sessions |
| medications | jsonb[] | Yes | '{}' | Daily medications |
| exercises | jsonb[] | Yes | '{}' | Daily exercises |
| completed | boolean | Yes | false | Completion status |
| notes | text | Yes | None | Additional notes |

## Row Level Security Policies

Each table has RLS enabled with policies that ensure users can only access their own data:
- SELECT policies restrict data access to the authenticated user
- INSERT policies ensure users can only create data for themselves
- UPDATE policies limit modifications to the user's own data
- DELETE policies (where applicable) restrict deletion to the user's own data

## Database Functions

### handle_new_user()
- Trigger function that automatically creates a user profile when a new auth user is created
- Runs after INSERT on auth.users
- Creates corresponding entry in public.users table

