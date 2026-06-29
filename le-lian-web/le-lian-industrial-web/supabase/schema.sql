-- ============================================================================
-- 樂聯工業教育訓練系統 — Supabase 後端資料庫 Schema
-- ============================================================================
-- 使用方式：複製整份檔案內容，貼到 Supabase Dashboard → SQL Editor，按 Run。
-- 本檔案不需要資料庫密碼，只需要你登入 Supabase Dashboard 的帳號即可執行。
-- 可重複執行（多數物件使用 create or replace / if not exists）。
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. 共用 Helper Functions（角色判斷）
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. profiles（對應現有 User type，擴充自 auth.users）
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'employee' check (role in ('employee', 'manager', 'admin', 'hr', 'vp')),
  department text,
  manager_id uuid references public.profiles(id),
  avatar text,
  join_date date,
  status text not null default 'active' check (status in ('active', 'resigned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 員工自助填寫工號／職稱（TrainingDashboard.tsx 入職資料表單），additive 欄位，預設為 null 不影響既有資料
alter table public.profiles add column if not exists employee_id text;
alter table public.profiles add column if not exists title text;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- 角色判斷 helper functions（須在 profiles 資料表建立後才能定義 ——
-- language sql 函式在建立時就會檢查所參照的資料表是否存在，與 plpgsql 不同）
create or replace function public.current_role_name()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_hr_or_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'hr') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_manager_or_above()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'hr', 'manager', 'vp') from public.profiles where id = auth.uid()), false);
$$;

-- 管理員「新增使用者」時，當下還沒有對應的 auth.users 帳號（不能在前端用
-- service_role 直接建立登入帳號），所以先把指派的角色/部門暫存在這裡，
-- 等該員工之後自行以同一個 email 註冊時，由 handle_new_user() 自動套用並清除。
create table if not exists public.pending_invites (
  email text primary key,
  name text,
  department text,
  role text not null default 'employee' check (role in ('employee', 'manager', 'admin', 'hr', 'vp')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.pending_invites enable row level security;

drop policy if exists pending_invites_all on public.pending_invites;
create policy pending_invites_all on public.pending_invites for all
  using (is_hr_or_admin()) with check (is_hr_or_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  select * into inv from public.pending_invites where email = new.email;

  insert into public.profiles (id, name, email, role, department, avatar, join_date, status)
  values (
    new.id,
    coalesce(inv.name, new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(inv.role, 'employee'),
    coalesce(inv.department, new.raw_user_meta_data->>'department'),
    new.raw_user_meta_data->>'avatar',
    current_date,
    'active'
  );

  if inv.email is not null then
    delete from public.pending_invites where email = inv.email;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 3. 課程、測驗、選課、討論、問題回報、免費課程目錄
-- ============================================================================

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text,
  category text,
  instructor text,
  duration integer,
  mandatory boolean not null default false,
  thumbnail text,
  passing_score integer,
  status text not null default 'active' check (status in ('active', 'inactive')),
  video_id text,
  local_video boolean default false,
  local_presentation boolean default false,
  presentation_name text,
  video_transcript text,
  external_video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table if not exists public.quiz_questions (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  question text not null,
  options jsonb not null,
  answer_index integer not null
);

-- 測驗題目（含正解）只開放管理員／人資查詢；一般使用者透過下方 security definer
-- function 取得「不含正解」的題目，並透過 grade_quiz() 在後端評分，避免正解外洩到前端。
create or replace function public.get_quiz_questions(p_course_id text)
returns table(id text, course_id text, question text, options jsonb)
language sql stable security definer set search_path = public as $$
  select id, course_id, question, options from public.quiz_questions where course_id = p_course_id;
$$;

-- 測驗送出後，前端顯示「正確答案」用：僅回傳正解索引，不影響上方 get_quiz_questions
-- 在作答階段不外洩正解的安全性（此函式僅供繳卷後的檢討畫面使用）。
create or replace function public.get_quiz_answer_key(p_course_id text)
returns table(id text, answer_index integer)
language sql stable security definer set search_path = public as $$
  select id, answer_index from public.quiz_questions where course_id = p_course_id;
$$;

create or replace function public.grade_quiz(p_course_id text, p_answers jsonb)
returns numeric
language plpgsql security definer set search_path = public as $$
declare
  total int;
  correct int := 0;
  rec record;
  ans int;
begin
  select count(*) into total from public.quiz_questions where course_id = p_course_id;
  if total = 0 then
    return 0;
  end if;
  for rec in select id, answer_index from public.quiz_questions where course_id = p_course_id loop
    select (elem->>'answerIndex')::int into ans
      from jsonb_array_elements(p_answers) elem
      where elem->>'questionId' = rec.id
      limit 1;
    if ans is not null and ans = rec.answer_index then
      correct := correct + 1;
    end if;
  end loop;
  return round(100.0 * correct / total);
end;
$$;

create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_by_name text,
  assigned_at timestamptz not null default now(),
  due_date date,
  note text
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'pending_review', 'completed', 'rejected')),
  progress_percent integer not null default 0,
  watch_time_minutes integer not null default 0,
  enrolled_at timestamptz not null default now(),
  report_submitted boolean not null default false,
  survey_submitted boolean not null default false,
  quiz_submitted boolean not null default false,
  quiz_score integer,
  review_status text check (review_status in ('pending', 'approved', 'rejected')),
  certificate_issued boolean not null default false,
  manager_comment text,
  submitted_at timestamptz,
  completed_at timestamptz,
  report_content text,
  survey_data jsonb,
  video_watched boolean default false,
  manager_approved boolean default false,
  hr_approved boolean default false,
  manager_approved_at timestamptz,
  hr_approved_at timestamptz,
  manager_approved_by uuid references public.profiles(id),
  hr_approved_by uuid references public.profiles(id),
  unique (user_id, course_id)
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  course_name text,
  question_id text not null,
  question_text text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text,
  reason text not null,
  comment text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.free_courses (
  id uuid primary key default gen_random_uuid(),
  source text,
  source_color text,
  title text not null,
  category text,
  hours numeric,
  langs text[],
  is_new boolean default false,
  description text,
  url text,
  video_id text,
  added_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. 組織圖
-- ============================================================================

create table if not exists public.org_units (
  id text primary key,
  name text not null,
  parent_id text references public.org_units(id),
  member_count text
);

create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_unit_id text not null references public.org_units(id) on delete cascade,
  name text not null,
  title text not null,
  sort_order integer default 0
);

create table if not exists public.org_leadership (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  sort_order integer default 0
);

-- ============================================================================
-- 5. 職稱分類、職能框架、員工職務說明書
-- ============================================================================

create table if not exists public.job_title_categories (
  id text primary key,
  title text not null,
  category text not null check (category in ('高階主管', '管理職', '專業職', '技術/作業職', '其他'))
);

create table if not exists public.position_competency_frameworks (
  position_name text primary key,
  category text,
  level text,
  required_level integer,
  competencies jsonb
);

create table if not exists public.employee_job_descriptions (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null unique,
  user_id uuid references public.profiles(id),
  position_name text,
  department text,
  job_summary text,
  professional_skills text[],
  training_needs text[],
  competencies jsonb,
  standards jsonb,
  source_file_name text,
  uploaded_at timestamptz not null default now()
);

-- 職位專屬職能評分標準覆寫（員工上傳工作職能書後，依職位名稱建立的客製化標準；
-- 與 position_competency_frameworks 不同，後者為靜態 iCAP 框架，前者為使用者操作產生的覆寫資料）
create table if not exists public.position_competency_overrides (
  position_name text primary key,
  department text,
  job_summary text,
  competencies jsonb,
  standards jsonb,
  training_needs text[],
  source_file_name text,
  updated_at timestamptz not null default now()
);

-- 組織圖月份快照（HR/管理員可於組織圖頁面新增「當月組織圖」，不影響 orgChartData.ts 既有基準資料）
create table if not exists public.org_snapshots (
  id text primary key,
  month_label text not null,
  created_date text not null,
  created_by text,
  leadership jsonb not null default '[]',
  units jsonb not null default '[]'
);

-- 講師名冊 / 學員名冊
create table if not exists public.instructors (
  id text primary key,
  name text not null,
  type text not null check (type in ('內部', '外部')),
  title text,
  department text,
  specialty text,
  phone text,
  email text,
  certifications text,
  total_courses integer default 0
);

create table if not exists public.students (
  id text primary key,
  name text not null,
  birthday text,
  department text,
  title text,
  employee_id text,
  join_date text,
  email text
);

-- 公司公告（通知中心）
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  content text not null,
  category text,
  published_at text not null,
  published_by text,
  pinned boolean default false,
  important boolean default false,
  target_audience text not null default '全體員工' check (target_audience in ('全體員工', '主管以上', '特定部門')),
  target_dept text,
  require_confirmation boolean default false,
  expires_at text,
  edit_history jsonb not null default '[]',
  deleted_at text,
  deleted_by text
);

-- 公告已讀紀錄（員工自行確認已讀時新增一筆，與 announcements 分開以便個別授權）
create table if not exists public.announcement_reads (
  announcement_id text not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

-- 通知中心個人通知（截止提醒、審核結果等）
create table if not exists public.notif_center_notifications (
  id text primary key,
  type text not null check (type in ('deadline_reminder', 'review_result', 'new_course', 'system')),
  is_read boolean default false,
  title text not null,
  message text not null,
  time text,
  course text,
  urgent boolean default false
);

-- ============================================================================
-- 6. TTQS 訓練紀錄、例行課程與其附屬表單（課程設計、成效追蹤、申請異動、執行檢查）
-- ============================================================================

create table if not exists public.physical_records (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  training_type text check (training_type in ('內訓', '外訓')),
  date date,
  hours numeric,
  venue text,
  instructor text,
  department text,
  participants integer,
  ttqs_phase text check (ttqs_phase in ('Plan', 'Design', 'Do', 'Review', 'Action')),
  outcome text,
  evidence text,
  status text check (status in ('待審核', '已審核', '已存檔')),
  satisfaction_score numeric,
  quiz_avg_score numeric,
  quiz_pass_rate numeric,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.physical_record_photos (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.physical_records(id) on delete cascade,
  photo_url text not null,
  sort_order integer default 0
);

create table if not exists public.routine_courses (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  instructor text,
  date date,
  hours numeric,
  department text,
  participants text[],
  outline text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'completed')),
  submitted_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- submitted_by 為建立者顯示名稱（非帳號 id），避免要求每筆例行課程都對應到真實的 profiles 帳號；
-- 若此表已先以舊版 uuid 型別建立，以下兩行確保重新執行本腳本時欄位型別會被修正。
alter table public.routine_courses alter column submitted_by type text using submitted_by::text;
alter table public.routine_courses drop constraint if exists routine_courses_submitted_by_fkey;

drop trigger if exists set_routine_courses_updated_at on public.routine_courses;
create trigger set_routine_courses_updated_at before update on public.routine_courses
  for each row execute function public.set_updated_at();

create table if not exists public.routine_course_photos (
  id uuid primary key default gen_random_uuid(),
  routine_course_id uuid not null references public.routine_courses(id) on delete cascade,
  photo_url text not null,
  sort_order integer default 0
);

-- 課程大綱表（CourseDesign）：sign_off / designated_signers 共用鍵：
-- applicant / deptManager / hr / vp
create table if not exists public.course_designs (
  id uuid primary key default gen_random_uuid(),
  routine_course_id uuid not null unique references public.routine_courses(id) on delete cascade,
  category text check (category in ('新人', '專業', '管理', '工安', '其他')),
  target_audience text,
  need_sources text[],
  purpose text,
  competencies text[],
  syllabus jsonb,
  teaching_methods text[],
  expected_benefits jsonb,
  sign_off jsonb not null default '{}'::jsonb,
  designated_signers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.effectiveness_trackings (
  id uuid primary key default gen_random_uuid(),
  routine_course_id uuid not null unique references public.routine_courses(id) on delete cascade,
  tracking_date date,
  learning_outcome jsonb,
  manager_evaluation jsonb,
  kpi_before jsonb,
  kpi_after_30_days jsonb,
  judgment text check (judgment in ('成效顯著', '符合預期', '部分達成', '需再訓練')),
  suggestion text,
  filled_by text,
  created_at timestamptz not null default now()
);

-- 申請異動表（TrainingApplication）：sign_off / designated_signers 共用鍵：
-- approver / hrReview / deptManager / handler
create table if not exists public.training_applications (
  id uuid primary key default gen_random_uuid(),
  routine_course_id uuid not null unique references public.routine_courses(id) on delete cascade,
  department text,
  apply_date date,
  applicant_name text,
  applicant_title text,
  employee_id text,
  application_type text check (application_type in ('新增課程申請', '課程內容異動', '課程時數異動', '課程取消', '其他')),
  application_type_other text,
  course_category text check (course_category in ('新人訓練', '專業訓練', '管理訓練', '內部分享', '其他')),
  course_category_other text,
  host_unit text,
  class_mode text check (class_mode in ('實體課程', '線上課程')),
  change_reasons jsonb,
  expected_benefit text,
  costs jsonb,
  participants jsonb,
  sign_off jsonb not null default '{}'::jsonb,
  designated_signers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 執行檢查表（PreClassCheck）：sign_off 鍵 secretary / hrManager / handler；
-- designated_signers 僅 hrManager / handler（secretary 無指定簽核人綁定，沿用既有前端邏輯）
create table if not exists public.pre_class_checks (
  id uuid primary key default gen_random_uuid(),
  routine_course_id uuid not null unique references public.routine_courses(id) on delete cascade,
  pre_class jsonb not null default '{}'::jsonb,
  in_class jsonb not null default '{}'::jsonb,
  post_class jsonb not null default '{}'::jsonb,
  sign_off jsonb not null default '{}'::jsonb,
  designated_signers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_course_designs_updated_at on public.course_designs;
create trigger set_course_designs_updated_at before update on public.course_designs
  for each row execute function public.set_updated_at();
drop trigger if exists set_training_applications_updated_at on public.training_applications;
create trigger set_training_applications_updated_at before update on public.training_applications
  for each row execute function public.set_updated_at();
drop trigger if exists set_pre_class_checks_updated_at on public.pre_class_checks;
create trigger set_pre_class_checks_updated_at before update on public.pre_class_checks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 簽核欄位完整性保護：只有 designated_signers 中指定的人，才能改動 sign_off
-- 對應欄位的內容（管理員不受限）。套用在 course_designs / training_applications /
-- pre_class_checks 三張表（皆有 sign_off + designated_signers 兩個 jsonb 欄位）。
-- ----------------------------------------------------------------------------

create or replace function public.enforce_signoff_slot()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  k text;
  old_val jsonb;
  new_val jsonb;
  designated text;
begin
  if public.is_admin() then
    return new;
  end if;

  for k in
    select jsonb_object_keys(coalesce(new.sign_off, '{}'::jsonb))
    union
    select jsonb_object_keys(coalesce(old.sign_off, '{}'::jsonb))
  loop
    old_val := old.sign_off -> k;
    new_val := new.sign_off -> k;
    if old_val is distinct from new_val then
      designated := new.designated_signers ->> k;
      if designated is null or designated <> auth.uid()::text then
        raise exception '只有指定簽核人才能簽核此欄位（%）', k;
      end if;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists enforce_signoff_course_designs on public.course_designs;
create trigger enforce_signoff_course_designs before update on public.course_designs
  for each row execute function public.enforce_signoff_slot();
drop trigger if exists enforce_signoff_training_applications on public.training_applications;
create trigger enforce_signoff_training_applications before update on public.training_applications
  for each row execute function public.enforce_signoff_slot();
drop trigger if exists enforce_signoff_pre_class_checks on public.pre_class_checks;
create trigger enforce_signoff_pre_class_checks before update on public.pre_class_checks
  for each row execute function public.enforce_signoff_slot();

-- ----------------------------------------------------------------------------
-- 待簽核通知：當 designated_signers 出現尚未簽核的指定人時，自動建立通知
-- （避免重複通知同一人同一張表單同一欄位）
-- ----------------------------------------------------------------------------

create or replace function public.notify_pending_signoff()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  k text;
  signer_id uuid;
  entity_label text;
  already_notified boolean;
begin
  entity_label := tg_table_name;

  for k in select jsonb_object_keys(coalesce(new.designated_signers, '{}'::jsonb)) loop
    if new.sign_off -> k is null and new.designated_signers ->> k is not null then
      begin
        signer_id := (new.designated_signers ->> k)::uuid;
      exception when others then
        signer_id := null;
      end;

      if signer_id is not null then
        select exists (
          select 1 from public.notifications
          where user_id = signer_id
            and type = 'sign_pending'
            and message = entity_label || ':' || new.id::text || ':' || k
        ) into already_notified;

        if not already_notified then
          insert into public.notifications (user_id, type, message, read)
          values (signer_id, 'sign_pending', entity_label || ':' || new.id::text || ':' || k, false);
        end if;
      end if;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_signoff_course_designs on public.course_designs;
create trigger notify_signoff_course_designs after insert or update on public.course_designs
  for each row execute function public.notify_pending_signoff();
drop trigger if exists notify_signoff_training_applications on public.training_applications;
create trigger notify_signoff_training_applications after insert or update on public.training_applications
  for each row execute function public.notify_pending_signoff();
drop trigger if exists notify_signoff_pre_class_checks on public.pre_class_checks;
create trigger notify_signoff_pre_class_checks after insert or update on public.pre_class_checks
  for each row execute function public.notify_pending_signoff();

-- ============================================================================
-- 7. 費用訓練同意書（FeeAgreement）
-- ============================================================================
-- recipient_user_id 為新增欄位（原資料只有 employeeName/employeeId 文字快照），
-- 用於讓員工本人可以查看並簽署自己的同意書；不影響原有列印用的文字欄位。

create table if not exists public.fee_agreements (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references public.profiles(id),
  employee_name text not null,
  employee_id text,
  join_date date,
  department text,
  title text,
  grade text,
  service_years text,
  course_name text,
  training_type text check (training_type in ('外部訓練', '內部訓練')),
  institution text,
  start_date date,
  end_date date,
  location text,
  total_fee numeric,
  before_service_yrs integer,
  before_service_mons integer,
  added_service_yrs integer,
  added_service_mons integer,
  after_service_yrs integer,
  after_service_mons integer,
  sent_at timestamptz not null default now(),
  sent_by uuid references public.profiles(id),
  status text not null default 'pending_sign' check (status in ('pending_sign', 'signed', 'archived')),
  signed_at timestamptz,
  signature_image text,
  id_number text,
  address text,
  phone text
);

create or replace function public.enforce_fee_agreement_signature()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if old.signature_image is distinct from new.signature_image
     or old.signed_at is distinct from new.signed_at
     or old.status is distinct from new.status then
    if old.recipient_user_id is null or old.recipient_user_id <> auth.uid() then
      raise exception '只有受文員工本人才能簽署此同意書';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_fee_agreement_signature_trg on public.fee_agreements;
create trigger enforce_fee_agreement_signature_trg before update on public.fee_agreements
  for each row execute function public.enforce_fee_agreement_signature();

-- ============================================================================
-- 8. 通知與稽核紀錄
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  user_name text,
  action text not null,
  target text,
  details text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 8b. 職涯目標設定、年度訓練計畫差異分析與簽核、教育訓練 ROI 設定
-- ============================================================================

-- 職涯目標設定（CareerPlanning：員工提案 → 主管核准）
create table if not exists public.career_goals (
  id text primary key,
  employee_id uuid not null references public.profiles(id),
  employee_name text not null,
  target_position text not null,
  target_date text not null,
  motivation text not null default '',
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'revised')),
  manager_comment text not null default '',
  manager_id uuid references public.profiles(id),
  manager_name text,
  proposed_at text not null,
  reviewed_at text,
  created_at timestamptz not null default now()
);

-- 部門輪調適合度評估（CareerPlanning.tsx 部門輪調評估區塊）
create table if not exists public.rotation_assessments (
  id text primary key,
  employee_id uuid not null references public.profiles(id),
  employee_name text not null,
  target_dept text not null,
  answers jsonb not null default '{}'::jsonb,
  score int not null,
  recommendation text not null,
  level text not null check (level in ('excellent', 'good', 'warn', 'no')),
  courses jsonb not null default '[]'::jsonb,
  submitted_at text not null,
  sent_to_manager boolean not null default false,
  sent_at text,
  manager_comment text not null default '',
  created_at timestamptz not null default now()
);

-- 年度訓練計畫歷年成效查詢：各年度送審簽核狀態
create table if not exists public.annual_signoffs (
  year text primary key,
  hr_submitted_at text,
  vp_approved boolean not null default false,
  vp_approved_at text,
  vp_comment text not null default '',
  gm_approved boolean not null default false,
  gm_approved_at text,
  gm_comment text not null default ''
);

-- 年度訓練計畫制定（AnnualTrainingPlan.tsx 計畫制定頁籤）：各年度／部門的計畫提交狀態
create table if not exists public.plan_submissions (
  year text not null,
  department text not null,
  status text not null default '草稿' check (status in ('草稿', '提交', '核准')),
  submitted_at text,
  primary key (year, department)
);

-- CF-CM-HR-39 教育訓練計畫與實際差異分析表
create table if not exists public.variance_entries (
  id bigint primary key,
  year text not null,
  department text not null,
  category text not null,
  course_name text not null,
  planned_hours numeric not null default 0,
  actual_hours numeric not null default 0,
  planned_count integer not null default 0,
  actual_count integer not null default 0,
  planned_month text,
  actual_month text,
  attendance_rate numeric not null default 0,
  judgment text not null default '成效顯著',
  actual_date text,
  instructor text,
  variance_method boolean not null default false,
  variance_hours boolean not null default false,
  variance_count boolean not null default false,
  variance_not_held boolean not null default false,
  variance_other boolean not null default false,
  variance_other_note text not null default '',
  planned_cost numeric not null default 0,
  actual_cost numeric not null default 0,
  diff_reason text not null default '',
  improvement text not null default ''
);

-- 差異分析表簽核（沿用既有前端行為：單一全域表單，不分年度/部門）
create table if not exists public.variance_signoffs (
  id boolean primary key default true,
  gm_name text not null default '',
  gm_date text not null default '',
  admin_name text not null default '',
  admin_date text not null default '',
  applicant_unit text not null default '',
  constraint variance_signoffs_singleton check (id)
);

-- 教育訓練投資報酬率（VPDashboard ROI 計算器，單一全域設定）
create table if not exists public.training_roi_inputs (
  id boolean primary key default true,
  training_cost numeric not null default 50,
  quality_loss_reduction numeric not null default 120,
  safety_improvement_savings numeric not null default 30,
  efficiency_gains numeric not null default 40,
  constraint training_roi_inputs_singleton check (id)
);

-- 年度訓練計畫制定（AnnualTrainingPlan 第一個 tab：課程清單，全域單一份，不分年度/部門）
create table if not exists public.annual_plan_rows (
  id bigint primary key,
  name text not null default '',
  cat text not null default '',
  type text not null default '內部',
  target text not null default '',
  hours numeric not null default 0,
  month text not null default '1月',
  count integer not null default 0,
  note text not null default ''
);

-- 年度訓練計畫「課程執行追蹤」（TTQS執行追蹤 tab）
create table if not exists public.annual_plan_course_track (
  name text primary key,
  planned numeric not null default 0,
  actual numeric not null default 0,
  rate numeric not null default 0,
  participants integer not null default 0,
  status text not null default '未開始'
);

-- 成就獎勵中心：積分兌換項目（獎項管理 tab，全域單一份兌換目錄）
create table if not exists public.achievement_redeem_items (
  id text primary key,
  name text not null default '',
  icon text not null default '🎁',
  points integer not null default 0,
  stock integer not null default 0,
  desc text not null default ''
);

-- 成就獎勵中心：個人兌換紀錄
create table if not exists public.achievement_redeem_records (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_name text not null default '',
  item_icon text not null default '',
  points integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled')),
  redeemed_at text not null default ''
);

-- 成就獎勵中心：個人可兌換積分餘額
create table if not exists public.achievement_points (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available_points integer not null default 0
);

-- 系統管理／例行課程管理 tab：例行課程送簽人資審核工作流程
-- （與 PhysicalTraining.tsx 既有的 routine_courses 為不同功能、不同欄位結構，故另建資料表避免混用）
create table if not exists public.admin_routine_courses (
  id text primary key,
  course_name text not null default '',
  instructor text not null default '',
  date text not null default '',
  hours numeric not null default 0,
  department text not null default '',
  participants text[] not null default '{}',
  outline text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_hr', 'hr_approved', 'sign_in_sent', 'completed')),
  submitted_by text not null default '',
  submitted_at text not null default '',
  hr_comment text,
  signed_participants text[],
  survey_count integer
);

-- 系統管理／權限管理 tab：功能權限矩陣（全域單一份設定）
create table if not exists public.permission_matrix (
  id boolean primary key default true,
  matrix jsonb not null default '{}'::jsonb,
  constraint permission_matrix_singleton check (id)
);

-- 績效追蹤（PerformanceTracking.tsx）L3 行為應用追蹤：完訓後由員工填寫實際應用情形，
-- 經主管／部門最高主管簽核。attachments / managerApproval / deptHeadApproval 為巢狀結構，以 jsonb 儲存。
create table if not exists public.perf_l3_records (
  id text primary key,
  enrollment_id text not null default '',
  user_id text not null default '',
  course_id text not null default '',
  course_name text not null default '',
  user_name text not null default '',
  quarter text not null default '',
  application_content text not null default '',
  confirmed_at text,
  status text not null default 'not_due',
  kpi_note text not null default '',
  due_date text,
  attachments jsonb,
  submitted_at text,
  manager_approval jsonb,
  dept_head_approval jsonb
);

-- 績效追蹤 L4 課程成效評估計畫，entries 為每季實際數值清單，以 jsonb 儲存
create table if not exists public.perf_l4_campaigns (
  id text primary key,
  course_id text not null default '',
  course_name text not null default '',
  department text not null default '',
  kpi_type text not null default '',
  unit text not null default '',
  baseline_value numeric not null default 0,
  target_value numeric not null default 0,
  higher_is_better boolean not null default false,
  entries jsonb not null default '[]'::jsonb,
  created_by text not null default '',
  created_at text not null default ''
);

-- ============================================================================
-- 9. 啟用 RLS
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.course_assignments enable row level security;
alter table public.enrollments enable row level security;
alter table public.discussions enable row level security;
alter table public.question_reports enable row level security;
alter table public.free_courses enable row level security;
alter table public.org_units enable row level security;
alter table public.org_members enable row level security;
alter table public.org_leadership enable row level security;
alter table public.job_title_categories enable row level security;
alter table public.position_competency_frameworks enable row level security;
alter table public.employee_job_descriptions enable row level security;
alter table public.position_competency_overrides enable row level security;
alter table public.org_snapshots enable row level security;
alter table public.instructors enable row level security;
alter table public.students enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.notif_center_notifications enable row level security;
alter table public.physical_records enable row level security;
alter table public.physical_record_photos enable row level security;
alter table public.routine_courses enable row level security;
alter table public.routine_course_photos enable row level security;
alter table public.course_designs enable row level security;
alter table public.effectiveness_trackings enable row level security;
alter table public.training_applications enable row level security;
alter table public.pre_class_checks enable row level security;
alter table public.fee_agreements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.career_goals enable row level security;
alter table public.rotation_assessments enable row level security;
alter table public.annual_signoffs enable row level security;
alter table public.plan_submissions enable row level security;
alter table public.variance_entries enable row level security;
alter table public.variance_signoffs enable row level security;
alter table public.training_roi_inputs enable row level security;
alter table public.annual_plan_rows enable row level security;
alter table public.annual_plan_course_track enable row level security;
alter table public.achievement_redeem_items enable row level security;
alter table public.achievement_redeem_records enable row level security;
alter table public.achievement_points enable row level security;
alter table public.admin_routine_courses enable row level security;
alter table public.permission_matrix enable row level security;
alter table public.perf_l3_records enable row level security;
alter table public.perf_l4_campaigns enable row level security;

-- ============================================================================
-- 10. RLS 政策
-- ============================================================================

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles for insert to authenticated
  with check (public.is_admin());
drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles for delete to authenticated
  using (public.is_admin());

-- courses（未上架課程只有 hr/admin 可見）
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select to authenticated
  using (status = 'active' or public.is_hr_or_admin());
drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- quiz_questions（含正解，僅 hr/admin 可直接查詢；一般使用者走 get_quiz_questions）
drop policy if exists quiz_questions_select on public.quiz_questions;
create policy quiz_questions_select on public.quiz_questions for select to authenticated
  using (public.is_hr_or_admin());
drop policy if exists quiz_questions_write on public.quiz_questions;
create policy quiz_questions_write on public.quiz_questions for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- course_assignments
drop policy if exists course_assignments_select on public.course_assignments;
create policy course_assignments_select on public.course_assignments for select to authenticated
  using (user_id = auth.uid() or assigned_by = auth.uid() or public.is_manager_or_above());
drop policy if exists course_assignments_write on public.course_assignments;
create policy course_assignments_write on public.course_assignments for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- enrollments
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments for select to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above());
drop policy if exists enrollments_insert on public.enrollments;
create policy enrollments_insert on public.enrollments for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists enrollments_update on public.enrollments;
create policy enrollments_update on public.enrollments for update to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above());
drop policy if exists enrollments_delete on public.enrollments;
create policy enrollments_delete on public.enrollments for delete to authenticated
  using (public.is_admin());

-- discussions
drop policy if exists discussions_select on public.discussions;
create policy discussions_select on public.discussions for select to authenticated using (true);
drop policy if exists discussions_insert on public.discussions;
create policy discussions_insert on public.discussions for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists discussions_modify on public.discussions;
create policy discussions_modify on public.discussions for update to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists discussions_delete on public.discussions;
create policy discussions_delete on public.discussions for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- question_reports
drop policy if exists question_reports_select on public.question_reports;
create policy question_reports_select on public.question_reports for select to authenticated
  using (user_id = auth.uid() or public.is_hr_or_admin());
drop policy if exists question_reports_insert on public.question_reports;
create policy question_reports_insert on public.question_reports for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists question_reports_update on public.question_reports;
create policy question_reports_update on public.question_reports for update to authenticated
  using (public.is_hr_or_admin());

-- free_courses
drop policy if exists free_courses_select on public.free_courses;
create policy free_courses_select on public.free_courses for select to authenticated using (true);
drop policy if exists free_courses_insert on public.free_courses;
create policy free_courses_insert on public.free_courses for insert to authenticated
  with check (added_by = auth.uid() or public.is_admin());
drop policy if exists free_courses_modify on public.free_courses;
create policy free_courses_modify on public.free_courses for update to authenticated
  using (added_by = auth.uid() or public.is_admin());
drop policy if exists free_courses_delete on public.free_courses;
create policy free_courses_delete on public.free_courses for delete to authenticated
  using (added_by = auth.uid() or public.is_admin());

-- 組織圖、職稱、職能框架：全員可讀，僅 admin 可寫
drop policy if exists org_units_select on public.org_units;
create policy org_units_select on public.org_units for select to authenticated using (true);
drop policy if exists org_units_write on public.org_units;
create policy org_units_write on public.org_units for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists org_members_select on public.org_members;
create policy org_members_select on public.org_members for select to authenticated using (true);
drop policy if exists org_members_write on public.org_members;
create policy org_members_write on public.org_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists org_leadership_select on public.org_leadership;
create policy org_leadership_select on public.org_leadership for select to authenticated using (true);
drop policy if exists org_leadership_write on public.org_leadership;
create policy org_leadership_write on public.org_leadership for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists job_title_categories_select on public.job_title_categories;
create policy job_title_categories_select on public.job_title_categories for select to authenticated using (true);
drop policy if exists job_title_categories_write on public.job_title_categories;
create policy job_title_categories_write on public.job_title_categories for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

drop policy if exists position_competency_frameworks_select on public.position_competency_frameworks;
create policy position_competency_frameworks_select on public.position_competency_frameworks for select to authenticated using (true);
drop policy if exists position_competency_frameworks_write on public.position_competency_frameworks;
create policy position_competency_frameworks_write on public.position_competency_frameworks for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- employee_job_descriptions：本人或 manager/hr/admin 可讀；本人可上傳/更新自己的記錄，manager/hr/admin 可管理全部（含刪除他人記錄）
drop policy if exists employee_job_descriptions_select on public.employee_job_descriptions;
create policy employee_job_descriptions_select on public.employee_job_descriptions for select to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above());
drop policy if exists employee_job_descriptions_write on public.employee_job_descriptions;
create policy employee_job_descriptions_write on public.employee_job_descriptions for all to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above())
  with check (user_id = auth.uid() or public.is_manager_or_above());

-- position_competency_overrides：全員可讀；任何員工上傳工作職能書套用後皆可建立/更新/還原（無職位歸屬限制，與現行 UI 行為一致）
drop policy if exists position_competency_overrides_select on public.position_competency_overrides;
create policy position_competency_overrides_select on public.position_competency_overrides for select to authenticated using (true);
drop policy if exists position_competency_overrides_write on public.position_competency_overrides;
create policy position_competency_overrides_write on public.position_competency_overrides for all to authenticated
  using (true) with check (true);

-- org_snapshots：全員可讀，僅 hr/admin 可新增當月組織圖
drop policy if exists org_snapshots_select on public.org_snapshots;
create policy org_snapshots_select on public.org_snapshots for select to authenticated using (true);
drop policy if exists org_snapshots_write on public.org_snapshots;
create policy org_snapshots_write on public.org_snapshots for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- instructors / students（講師、學員名冊）：全員可讀，manager/hr/admin 可維護
drop policy if exists instructors_select on public.instructors;
create policy instructors_select on public.instructors for select to authenticated using (true);
drop policy if exists instructors_write on public.instructors;
create policy instructors_write on public.instructors for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

drop policy if exists students_select on public.students;
create policy students_select on public.students for select to authenticated using (true);
drop policy if exists students_write on public.students;
create policy students_write on public.students for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- announcements：全員可讀，manager/hr/admin 可建立/編輯/刪除/還原
drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements for select to authenticated using (true);
drop policy if exists announcements_write on public.announcements;
create policy announcements_write on public.announcements for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- announcement_reads：全員可讀（顯示已讀名單），僅本人可新增自己的已讀紀錄
drop policy if exists announcement_reads_select on public.announcement_reads;
create policy announcement_reads_select on public.announcement_reads for select to authenticated using (true);
drop policy if exists announcement_reads_insert on public.announcement_reads;
create policy announcement_reads_insert on public.announcement_reads for insert to authenticated
  with check (user_id = auth.uid());

-- notif_center_notifications：全員可讀，可標記已讀；僅 manager/hr/admin 可新增/刪除（系統性通知）
drop policy if exists notif_center_notifications_select on public.notif_center_notifications;
create policy notif_center_notifications_select on public.notif_center_notifications for select to authenticated using (true);
drop policy if exists notif_center_notifications_update on public.notif_center_notifications;
create policy notif_center_notifications_update on public.notif_center_notifications for update to authenticated using (true);
drop policy if exists notif_center_notifications_insert on public.notif_center_notifications;
create policy notif_center_notifications_insert on public.notif_center_notifications for insert to authenticated
  with check (public.is_manager_or_above());
drop policy if exists notif_center_notifications_delete on public.notif_center_notifications;
create policy notif_center_notifications_delete on public.notif_center_notifications for delete to authenticated
  using (public.is_manager_or_above());

-- physical_records / routine_courses：全員可讀（既有儀表板邏輯），manager/hr/admin 可寫
-- （此頁面路由本身僅限 manager/hr/admin 存取，UI 未再依「建立者本人」進一步限制；
--  routine_courses.submitted_by 為建立者顯示名稱文字快照，非帳號 id，故不能與 auth.uid() 比較）
drop policy if exists physical_records_select on public.physical_records;
create policy physical_records_select on public.physical_records for select to authenticated using (true);
drop policy if exists physical_records_write on public.physical_records;
create policy physical_records_write on public.physical_records for all to authenticated
  using (public.is_manager_or_above())
  with check (public.is_manager_or_above());

drop policy if exists physical_record_photos_select on public.physical_record_photos;
create policy physical_record_photos_select on public.physical_record_photos for select to authenticated using (true);
drop policy if exists physical_record_photos_write on public.physical_record_photos;
create policy physical_record_photos_write on public.physical_record_photos for all to authenticated
  using (public.is_manager_or_above());

drop policy if exists routine_courses_select on public.routine_courses;
create policy routine_courses_select on public.routine_courses for select to authenticated using (true);
drop policy if exists routine_courses_insert on public.routine_courses;
create policy routine_courses_insert on public.routine_courses for insert to authenticated
  with check (public.is_manager_or_above());
drop policy if exists routine_courses_update on public.routine_courses;
create policy routine_courses_update on public.routine_courses for update to authenticated
  using (public.is_manager_or_above());
drop policy if exists routine_courses_delete on public.routine_courses;
create policy routine_courses_delete on public.routine_courses for delete to authenticated
  using (public.is_manager_or_above());

drop policy if exists routine_course_photos_select on public.routine_course_photos;
create policy routine_course_photos_select on public.routine_course_photos for select to authenticated using (true);
drop policy if exists routine_course_photos_write on public.routine_course_photos;
create policy routine_course_photos_write on public.routine_course_photos for all to authenticated
  using (public.is_manager_or_above());

-- course_designs / effectiveness_trackings / training_applications：全員可讀
-- （簽核欄位完整性由 trigger 把關，這裡只控制誰能新增/編輯整張表單）
drop policy if exists course_designs_select on public.course_designs;
create policy course_designs_select on public.course_designs for select to authenticated using (true);
drop policy if exists course_designs_insert on public.course_designs;
create policy course_designs_insert on public.course_designs for insert to authenticated with check (true);
drop policy if exists course_designs_update on public.course_designs;
create policy course_designs_update on public.course_designs for update to authenticated using (true);
drop policy if exists course_designs_delete on public.course_designs;
create policy course_designs_delete on public.course_designs for delete to authenticated using (true);

drop policy if exists effectiveness_trackings_select on public.effectiveness_trackings;
create policy effectiveness_trackings_select on public.effectiveness_trackings for select to authenticated using (true);
drop policy if exists effectiveness_trackings_write on public.effectiveness_trackings;
create policy effectiveness_trackings_write on public.effectiveness_trackings for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

drop policy if exists training_applications_select on public.training_applications;
create policy training_applications_select on public.training_applications for select to authenticated using (true);
drop policy if exists training_applications_insert on public.training_applications;
create policy training_applications_insert on public.training_applications for insert to authenticated with check (true);
drop policy if exists training_applications_update on public.training_applications;
create policy training_applications_update on public.training_applications for update to authenticated using (true);
drop policy if exists training_applications_delete on public.training_applications;
create policy training_applications_delete on public.training_applications for delete to authenticated using (true);

-- pre_class_checks：依需求「執行檢查表只有人資跟管理員可以看到，主管不需要看到」
drop policy if exists pre_class_checks_select on public.pre_class_checks;
create policy pre_class_checks_select on public.pre_class_checks for select to authenticated
  using (public.is_hr_or_admin());
drop policy if exists pre_class_checks_insert on public.pre_class_checks;
create policy pre_class_checks_insert on public.pre_class_checks for insert to authenticated
  with check (public.is_hr_or_admin());
drop policy if exists pre_class_checks_update on public.pre_class_checks;
create policy pre_class_checks_update on public.pre_class_checks for update to authenticated
  using (public.is_hr_or_admin());
drop policy if exists pre_class_checks_delete on public.pre_class_checks;
create policy pre_class_checks_delete on public.pre_class_checks for delete to authenticated
  using (public.is_hr_or_admin());

-- fee_agreements：受文員工本人、寄送者、hr/admin 可讀；簽署完整性由 trigger 把關
drop policy if exists fee_agreements_select on public.fee_agreements;
create policy fee_agreements_select on public.fee_agreements for select to authenticated
  using (recipient_user_id = auth.uid() or sent_by = auth.uid() or public.is_hr_or_admin());
drop policy if exists fee_agreements_insert on public.fee_agreements;
create policy fee_agreements_insert on public.fee_agreements for insert to authenticated
  with check (public.is_manager_or_above());
drop policy if exists fee_agreements_update on public.fee_agreements;
create policy fee_agreements_update on public.fee_agreements for update to authenticated
  using (recipient_user_id = auth.uid() or sent_by = auth.uid() or public.is_manager_or_above());
drop policy if exists fee_agreements_delete on public.fee_agreements;
create policy fee_agreements_delete on public.fee_agreements for delete to authenticated
  using (public.is_admin());

-- notifications：僅本人可讀/標記已讀
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = auth.uid());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid());
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert to authenticated
  with check (public.is_manager_or_above() or user_id = auth.uid());
drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications for delete to authenticated
  using (user_id = auth.uid());

-- audit_logs：任何登入者可新增（記錄自己的操作），僅 hr/admin 可查詢
drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select to authenticated
  using (public.is_hr_or_admin());

-- career_goals：全員可讀（含主管審核列表）；員工僅可新增自己的提案；
-- 審核（核准/退回/需修改）僅 manager/admin 可更新
drop policy if exists career_goals_select on public.career_goals;
create policy career_goals_select on public.career_goals for select to authenticated using (true);
drop policy if exists career_goals_insert on public.career_goals;
create policy career_goals_insert on public.career_goals for insert to authenticated
  with check (employee_id = auth.uid());
drop policy if exists career_goals_update on public.career_goals;
create policy career_goals_update on public.career_goals for update to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- rotation_assessments：全員可讀（含主管查看評估結果）；員工僅可新增/更新自己的評估；
-- 主管/admin 亦可更新（用於填寫 manager_comment）
drop policy if exists rotation_assessments_select on public.rotation_assessments;
create policy rotation_assessments_select on public.rotation_assessments for select to authenticated using (true);
drop policy if exists rotation_assessments_insert on public.rotation_assessments;
create policy rotation_assessments_insert on public.rotation_assessments for insert to authenticated
  with check (employee_id = auth.uid());
drop policy if exists rotation_assessments_update on public.rotation_assessments;
create policy rotation_assessments_update on public.rotation_assessments for update to authenticated
  using (employee_id = auth.uid() or public.is_manager_or_above())
  with check (employee_id = auth.uid() or public.is_manager_or_above());

-- annual_signoffs：全員可讀，manager/hr/admin 可送審/核准
-- （/training/annual-plan 路由僅限 manager/admin/hr 進入）
drop policy if exists annual_signoffs_select on public.annual_signoffs;
create policy annual_signoffs_select on public.annual_signoffs for select to authenticated using (true);
drop policy if exists annual_signoffs_write on public.annual_signoffs;
create policy annual_signoffs_write on public.annual_signoffs for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- plan_submissions：全員可讀，manager/hr/admin 可提交（與前端 canManagePlan 一致）
drop policy if exists plan_submissions_select on public.plan_submissions;
create policy plan_submissions_select on public.plan_submissions for select to authenticated using (true);
drop policy if exists plan_submissions_write on public.plan_submissions;
create policy plan_submissions_write on public.plan_submissions for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- variance_entries / variance_signoffs：CF-CM-HR-39 差異分析表，全員可讀，
-- 新增/編輯/刪除僅 hr/admin 可操作（與前端 canManagePlan 一致）
drop policy if exists variance_entries_select on public.variance_entries;
create policy variance_entries_select on public.variance_entries for select to authenticated using (true);
drop policy if exists variance_entries_write on public.variance_entries;
create policy variance_entries_write on public.variance_entries for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

drop policy if exists variance_signoffs_select on public.variance_signoffs;
create policy variance_signoffs_select on public.variance_signoffs for select to authenticated using (true);
drop policy if exists variance_signoffs_write on public.variance_signoffs;
create policy variance_signoffs_write on public.variance_signoffs for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- training_roi_inputs：僅 vp/admin 可讀寫（與 VPDashboard 頁面權限一致）
drop policy if exists training_roi_inputs_select on public.training_roi_inputs;
create policy training_roi_inputs_select on public.training_roi_inputs for select to authenticated
  using (public.current_role_name() in ('vp', 'admin'));
drop policy if exists training_roi_inputs_write on public.training_roi_inputs;
create policy training_roi_inputs_write on public.training_roi_inputs for all to authenticated
  using (public.current_role_name() in ('vp', 'admin')) with check (public.current_role_name() in ('vp', 'admin'));

-- annual_plan_rows / annual_plan_course_track：年度訓練計畫課程清單與執行追蹤，
-- 全員可讀，新增/編輯/刪除僅 hr/admin 可操作（與前端 canManagePlan 一致）
drop policy if exists annual_plan_rows_select on public.annual_plan_rows;
create policy annual_plan_rows_select on public.annual_plan_rows for select to authenticated using (true);
drop policy if exists annual_plan_rows_write on public.annual_plan_rows;
create policy annual_plan_rows_write on public.annual_plan_rows for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

drop policy if exists annual_plan_course_track_select on public.annual_plan_course_track;
create policy annual_plan_course_track_select on public.annual_plan_course_track for select to authenticated using (true);
drop policy if exists annual_plan_course_track_write on public.annual_plan_course_track;
create policy annual_plan_course_track_write on public.annual_plan_course_track for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- achievement_redeem_items：全員可讀，獎項管理（admin/manager）可寫
drop policy if exists achievement_redeem_items_select on public.achievement_redeem_items;
create policy achievement_redeem_items_select on public.achievement_redeem_items for select to authenticated using (true);
drop policy if exists achievement_redeem_items_write on public.achievement_redeem_items;
create policy achievement_redeem_items_write on public.achievement_redeem_items for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- achievement_redeem_records：本人或主管以上可讀；本人建立兌換申請、本人或主管以上可取消/更新狀態
drop policy if exists achievement_redeem_records_select on public.achievement_redeem_records;
create policy achievement_redeem_records_select on public.achievement_redeem_records for select to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above());
drop policy if exists achievement_redeem_records_insert on public.achievement_redeem_records;
create policy achievement_redeem_records_insert on public.achievement_redeem_records for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists achievement_redeem_records_update on public.achievement_redeem_records;
create policy achievement_redeem_records_update on public.achievement_redeem_records for update to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above())
  with check (user_id = auth.uid() or public.is_manager_or_above());

-- achievement_points：每人僅能讀寫自己的積分餘額，主管以上可讀
drop policy if exists achievement_points_select on public.achievement_points;
create policy achievement_points_select on public.achievement_points for select to authenticated
  using (user_id = auth.uid() or public.is_manager_or_above());
drop policy if exists achievement_points_write on public.achievement_points;
create policy achievement_points_write on public.achievement_points for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- admin_routine_courses：與前端「例行課程管理」tab 一致，僅 admin 可操作
drop policy if exists admin_routine_courses_select on public.admin_routine_courses;
create policy admin_routine_courses_select on public.admin_routine_courses for select to authenticated using (public.is_admin());
drop policy if exists admin_routine_courses_write on public.admin_routine_courses;
create policy admin_routine_courses_write on public.admin_routine_courses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- permission_matrix：與前端「權限管理」tab 一致，僅 admin 可操作
drop policy if exists permission_matrix_select on public.permission_matrix;
create policy permission_matrix_select on public.permission_matrix for select to authenticated using (public.is_admin());
drop policy if exists permission_matrix_write on public.permission_matrix;
create policy permission_matrix_write on public.permission_matrix for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- perf_l3_records：本人或主管以上可讀；本人建立／本人或主管以上更新（簽核流程）
drop policy if exists perf_l3_records_select on public.perf_l3_records;
create policy perf_l3_records_select on public.perf_l3_records for select to authenticated
  using (user_id = auth.uid()::text or public.is_manager_or_above());
drop policy if exists perf_l3_records_insert on public.perf_l3_records;
create policy perf_l3_records_insert on public.perf_l3_records for insert to authenticated
  with check (user_id = auth.uid()::text or public.is_manager_or_above());
drop policy if exists perf_l3_records_update on public.perf_l3_records;
create policy perf_l3_records_update on public.perf_l3_records for update to authenticated
  using (user_id = auth.uid()::text or public.is_manager_or_above())
  with check (user_id = auth.uid()::text or public.is_manager_or_above());

-- perf_l4_campaigns：全員可讀，主管以上可建立／填寫每季數值
drop policy if exists perf_l4_campaigns_select on public.perf_l4_campaigns;
create policy perf_l4_campaigns_select on public.perf_l4_campaigns for select to authenticated using (true);
drop policy if exists perf_l4_campaigns_write on public.perf_l4_campaigns;
create policy perf_l4_campaigns_write on public.perf_l4_campaigns for all to authenticated
  using (public.is_manager_or_above()) with check (public.is_manager_or_above());

-- ============================================================================
-- 11. Storage buckets（影片、教材、簽名、訓練照片）
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('training-videos', 'training-videos', false),
  ('training-presentations', 'training-presentations', false),
  ('training-photos', 'training-photos', false),
  ('signatures', 'signatures', false)
on conflict (id) do nothing;

drop policy if exists training_files_select on storage.objects;
create policy training_files_select on storage.objects for select to authenticated
  using (bucket_id in ('training-videos', 'training-presentations', 'training-photos', 'signatures'));

drop policy if exists training_files_insert on storage.objects;
create policy training_files_insert on storage.objects for insert to authenticated
  with check (
    bucket_id in ('training-photos', 'signatures')
    or (bucket_id in ('training-videos', 'training-presentations') and public.is_hr_or_admin())
  );

drop policy if exists training_files_update on storage.objects;
create policy training_files_update on storage.objects for update to authenticated
  using (
    bucket_id in ('training-photos', 'signatures')
    or (bucket_id in ('training-videos', 'training-presentations') and public.is_hr_or_admin())
  );

drop policy if exists training_files_delete on storage.objects;
create policy training_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id in ('training-videos', 'training-presentations', 'training-photos', 'signatures')
    and (owner = auth.uid() or public.is_hr_or_admin())
  );

-- ============================================================================
-- 12. 示範種子資料（沿用原本前端 mock 內容，固定 id 以便重複執行本腳本時不會重複新增）
-- ============================================================================

insert into public.physical_records
  (id, course_name, training_type, date, hours, venue, instructor, department, participants, ttqs_phase, outcome, evidence, status)
values
  ('00000000-0000-4000-8000-000000000001', '防災研習--消防演練', '內訓', '2026-01-15', 2, '廠區集合廣場', '消防隊員 / 陳安全', '全體員工', 118, 'Do', '全體員工完成演練，緊急疏散時間縮短至3分鐘以內', '簽到表、現場照片、演練記錄表', '已審核'),
  ('00000000-0000-4000-8000-000000000002', '性別平等教育', '外訓', '2026-01-22', 3, '會議室A', '外部講師', '全體員工', 120, 'Do', '員工對性騷擾防治及申訴程序瞭解度提升', '簽到表、測驗成績單、滿意度調查表', '已審核'),
  ('00000000-0000-4000-8000-000000000003', '一般安全衛生教育訓練', '外訓', '2026-01-28', 6, '會議室B', '勞動部認可訓練機構', '全體員工', 120, 'Do', '達成法定6小時安衛訓練要求，測驗平均通過率92%', '簽到表、測驗成績單、結訓證書、機構訓練合格文件', '已審核')
on conflict (id) do nothing;

insert into public.routine_courses
  (id, course_name, instructor, date, hours, department, participants, outline, status, submitted_by)
values
  ('00000000-0000-4000-8000-000000000011', '新進員工職前訓練', '人資安全組', '2026-01-08', 8, '全體員工', array['王小明', '陳美玲'], '公司規定、安全衛生、基本作業流程介紹', 'completed', '人資安全組'),
  ('00000000-0000-4000-8000-000000000012', '品質管理基礎訓練', '品保課 張品管', '2026-02-10', 3, '品保課', array['陳小芳', '林志偉', '黃品質'], '品質管理基本概念、ISO 9001要求、不合格品處理', 'approved', '張品管')
on conflict (id) do nothing;

insert into public.job_title_categories (id, title, category) values
  ('jt1', '董事長', '高階主管'),
  ('jt2', '副董事長', '高階主管'),
  ('jt3', '總經理', '高階主管'),
  ('jt4', '執行副總', '高階主管'),
  ('jt5', '經理', '管理職'),
  ('jt6', '副理', '管理職'),
  ('jt7', '課長', '管理職'),
  ('jt8', '副課長', '管理職'),
  ('jt9', '組長', '管理職'),
  ('jt10', '副組長', '管理職'),
  ('jt11', '代理組長', '管理職'),
  ('jt12', '班長', '管理職'),
  ('jt13', '工程師', '專業職'),
  ('jt14', '專員', '專業職'),
  ('jt15', '助理專員', '專業職'),
  ('jt16', '秘書', '專業職'),
  ('jt17', '助理', '技術/作業職'),
  ('jt18', '技術員', '技術/作業職'),
  ('jt19', '堆高機員', '技術/作業職'),
  ('jt20', '作業員', '技術/作業職'),
  ('jt21', '司機', '技術/作業職'),
  ('jt22', '清潔員', '技術/作業職')
on conflict (id) do nothing;

insert into public.instructors (id, name, type, title, department, specialty, phone, email, certifications, total_courses) values
  ('ins1', '林志明', '內部', '安全衛生管理師', '管理部', '職業安全衛生、緊急應變', '分機 201', 'lin.zhiming@company.com', '甲種職業安全衛生業務主管', 12),
  ('ins2', '李大偉', '內部', '品保工程師', '品保課', 'ISO 9001、品質管制', '分機 305', 'li.dawei@company.com', 'ISO 9001 內部稽核員', 8),
  ('ins3', '陳美惠', '外部', '顧問講師', '外聘', '精實生產、IE工業工程', '0912-345-678', 'chen.mh@consulting.com', 'Lean Six Sigma Black Belt', 5),
  ('ins4', '王建志', '外部', '職業訓練師', '外聘', 'ERP系統、資訊管理', '0923-456-789', 'wang.jz@erp-training.com', '職業訓練師證照', 3)
on conflict (id) do nothing;

insert into public.students (id, name, birthday, department, title, employee_id, join_date, email) values
  ('stu1', '王小明', '1990-05-15', '組裝一線', '作業員', 'E001', '2020-03-01', 'wang.xm@company.com'),
  ('stu2', '陳美玲', '1988-11-20', '品保課', '品管員', 'E002', '2019-07-15', 'chen.ml@company.com'),
  ('stu3', '李大明', '1985-03-08', '品保課', '高級工程師', 'M001', '2018-01-10', 'li.dm@company.com'),
  ('stu4', '林志偉', '1992-07-22', '品保課', '工程師', 'E003', '2021-08-01', 'lin.zw@company.com'),
  ('stu5', '黃雅婷', '1991-12-30', '工程課', '技術員', 'E004', '2022-02-14', 'huang.yt@company.com'),
  ('stu6', '劉俊達', '1993-04-18', '生管課', '作業員', 'E005', '2022-09-01', 'liu.jd@company.com')
on conflict (id) do nothing;

insert into public.announcements (id, title, content, category, published_at, published_by, pinned, important, target_audience, target_dept, require_confirmation, edit_history) values
  ('ann1', '2026年度訓練計畫公告', '本年度教育訓練計畫已完成制定，請各部門主管配合督導同仁於規定期限前完成各項必修課程。年度訓練時數目標：每人至少 24 小時。詳細課程排程請參閱年度計劃頁面。', '訓練通知', '2026-01-02', 'Admin管理員', true, true, '全體員工', null, false, '[{"action":"建立","editedAt":"2026-01-02","editedBy":"Admin管理員","summary":"初始公告建立"}]'),
  ('ann2', '消防演練日期通知 (2026/01/15)', '本次全廠消防演練訂於 2026 年 1 月 15 日（三）下午 14:00 舉行，請全體員工屆時配合疏散至指定集合點。各部門主管請事先完成人員清點分組，疏散路線圖已張貼於各樓層。', '安全通知', '2026-01-08', 'Admin管理員', true, true, '全體員工', null, false, '[{"action":"建立","editedAt":"2026-01-08","editedBy":"Admin管理員","summary":"初始公告建立"}]'),
  ('ann3', 'ERP系統導入訓練班開放報名', '企業全流程 ERP 管理需求課程（上）（下）已開放報名，課程分為兩梯次於 3 月份舉行，每梯次限額 30 名。有意參加之同仁請於 2/28 前向人資部報名，額滿為止。', '課程公告', '2026-02-01', 'Admin管理員', false, false, '全體員工', null, false, '[{"action":"建立","editedAt":"2026-02-01","editedBy":"Admin管理員","summary":"初始公告建立"}]'),
  ('ann4', '年度績效考核制度更新說明', '2026 年起績效考核制度調整，訓練時數完成率納入個人年度考核項目，佔比 10%。年度訓練時數未達標者，考核等級上限為「符合預期」，敬請各同仁重視教育訓練參與。', '人事公告', '2026-01-15', 'Admin管理員', false, false, '全體員工', null, false, '[{"action":"建立","editedAt":"2026-01-15","editedBy":"Admin管理員","summary":"初始公告建立"}]'),
  ('ann5', '外語職場溝通課程開放申請補助', '「外語職場溝通（英語）」課程符合勞動力發展署補助資格，員工可申請最高 70% 訓練費用補助。有意報名者請攜帶在職證明向人資部辦理，申請截止日期為 2026/11/30。', '補助資訊', '2026-01-20', 'Admin管理員', false, false, '全體員工', null, false, '[{"action":"建立","editedAt":"2026-01-20","editedBy":"Admin管理員","summary":"初始公告建立"}]')
on conflict (id) do nothing;

insert into public.notif_center_notifications (id, type, is_read, title, message, time, course, urgent) values
  ('n1', 'deadline_reminder', false, '⚠️ 課程截止提醒', '「職業安全衛生法規研習」課程將於3天後(2026/06/01)截止，請盡速完成！', '10分鐘前', '職業安全衛生法規研習', true),
  ('n2', 'review_result', false, '✅ 審核通過通知', '您在「5S推行與現場管理」課程的心得報告已由李主管審核通過，完訓證書已發放！', '2小時前', '5S推行與現場管理', false),
  ('n3', 'new_course', false, '🆕 新課程上架', '「智慧製造導入實務」新課程已上架，此為您部門的必修課程，請於2026/07/31前完成。', '昨天', '智慧製造導入實務', false),
  ('n4', 'review_result', true, '❌ 審核退回通知', '您在「iCAP職能評估實務」課程的心得報告被退回，原因：內容過於簡短，請補充實務應用說明後重新提交。', '3天前', 'iCAP職能評估實務', false),
  ('n5', 'system', true, '📢 系統公告', '年度訓練計畫填報截止日期：2026年10月31日。請各部門主管於期限前完成次年度訓練計畫提報。', '1週前', null, false),
  ('n6', 'deadline_reminder', true, '⏰ 年度訓練時數提醒', '您今年度已完成18小時訓練，距離年度目標24小時尚差6小時，請加油！', '2週前', null, false)
on conflict (id) do nothing;

insert into public.org_snapshots (id, month_label, created_date, created_by, leadership, units) values
  ('snap-base', '2026年06月', '2026-04-29', '系統初始資料',
   '[{"name":"鄭訊仁","title":"董事長"},{"name":"鄭景文","title":"副董事長"},{"name":"鄭景文","title":"總經理（兼任）"},{"name":"陳佳倫","title":"執行副總"}]',
   '[{"id":"exec-office","name":"總經理室","parentId":null,"members":[{"name":"龔淑屏","title":"副理"},{"name":"黃士咸","title":"工程師"},{"name":"尹詩婷","title":"秘書"},{"name":"李庭慧","title":"秘書"}]},{"id":"qa-section","name":"品保課","parentId":null,"members":[{"name":"朱冠瑋","title":"課長"},{"name":"周清家","title":"專員"},{"name":"詹郁瑛","title":"助理"},{"name":"林依婷","title":"助理"}]},{"id":"facility-office","name":"廠務室","parentId":null,"members":[{"name":"曾夷璋","title":"工程師"},{"name":"陳家祥","title":"工程師"}]},{"id":"sales-dept","name":"營業部","parentId":null,"members":[{"name":"劉祐誠","title":"經理"}]},{"id":"sales-section","name":"業務課","parentId":"sales-dept","members":[{"name":"伍珈妏","title":"組長"},{"name":"鄭淑鐘","title":"助理專員"},{"name":"陳玉慧","title":"助理"}]},{"id":"rd-section","name":"研發課","parentId":"sales-dept","members":[{"name":"白惇維","title":"課長"},{"name":"王柳琦","title":"工程師"},{"name":"徐惠蘭","title":"助理"},{"name":"沙洋","title":"技術員"}]},{"id":"admin-dept","name":"管理部","parentId":null,"members":[{"name":"龔淑屏","title":"副理（兼任）"}]},{"id":"general-affairs-section","name":"總務課","parentId":"admin-dept","members":[]},{"id":"general-affairs-group","name":"庶務組","parentId":"general-affairs-section","members":[{"name":"張歆發","title":"專員"},{"name":"陳明軒","title":"專員"},{"name":"陳福郎","title":"助理專員"},{"name":"吳桂傳","title":"清潔員"}]},{"id":"hr-safety-group","name":"人資安全組","parentId":"general-affairs-section","members":[{"name":"蔡欣芸","title":"助理"},{"name":"吳彥儀","title":"助理"}]},{"id":"finance-dept","name":"財務部","parentId":null,"members":[{"name":"蔡佳玲","title":"副理"}]},{"id":"accounting","name":"會計","parentId":"finance-dept","members":[{"name":"孫素琴","title":"專員"},{"name":"王美婷","title":"專員"}]},{"id":"cashier","name":"出納","parentId":"finance-dept","members":[{"name":"陳盈如","title":"專員"}]},{"id":"facility-dept","name":"廠務部","parentId":null,"members":[{"name":"蔡政博","title":"經理"}]},{"id":"materials-section","name":"資材課","parentId":"facility-dept","members":[{"name":"王秀雯","title":"副課長"}]},{"id":"materials-mgmt-group","name":"物管組","parentId":"materials-section","members":[{"name":"石容萱","title":"組長"},{"name":"尤念萍","title":"班長"},{"name":"林德和","title":"堆高機員"},{"name":"羅文彥","title":"堆高機員"},{"name":"楊心恬","title":"助理"},{"name":"陳巧倫","title":"助理"}]},{"id":"production-control-group","name":"生管組","parentId":"materials-section","members":[{"name":"郭惠婷","title":"助理"}]},{"id":"purchasing-group","name":"採購組","parentId":"materials-section","members":[{"name":"陳惠萍","title":"組長"},{"name":"潘佩君","title":"班長（育嬰）"},{"name":"陳孟怡","title":"助理"},{"name":"尤宏菜","title":"助理"},{"name":"陳孟靖","title":"助理"}]},{"id":"warehouse-group","name":"成倉組","parentId":"materials-section","members":[{"name":"曾泓霖","title":"組長"},{"name":"戴禮璇","title":"助理"},{"name":"凍馬拉","title":"作業員"},{"name":"沙達","title":"作業員"},{"name":"張永盛","title":"司機"}]},{"id":"manufacturing-section","name":"製造課","parentId":"facility-dept","members":[{"name":"楊玉鳳","title":"副課長"},{"name":"鍾欣芳","title":"助理"}]},{"id":"press-group","name":"沖床組","parentId":"manufacturing-section","memberCount":"共6人","members":[{"name":"覃麗婷","title":"副組長"},{"name":"李昱鉉","title":"班長"}]},{"id":"processing-group","name":"加工組","parentId":"manufacturing-section","memberCount":"共27人","members":[{"name":"白惇維","title":"代理組長"},{"name":"沙空","title":"班長"},{"name":"張舒涵","title":"班長"},{"name":"阮祝玲","title":"班長"}]},{"id":"painting-group","name":"塗裝組","parentId":"manufacturing-section","memberCount":"共19人","members":[{"name":"郭惠燕","title":"組長"},{"name":"周安琪","title":"班長"},{"name":"威耐","title":"班長"}]},{"id":"group-1","name":"組一組","parentId":"manufacturing-section","memberCount":"共13人","members":[{"name":"陳怡珊","title":"副組長"}]},{"id":"group-2","name":"組二組","parentId":"manufacturing-section","memberCount":"共13人","members":[{"name":"吉宗達","title":"組長"},{"name":"紀佩欣","title":"副組長"}]},{"id":"group-3","name":"組三組","parentId":"manufacturing-section","memberCount":"共10人","members":[{"name":"蔡坤惠","title":"班長"}]}]')
on conflict (id) do nothing;

insert into public.annual_signoffs (year, hr_submitted_at, vp_approved, vp_approved_at, vp_comment, gm_approved, gm_approved_at, gm_comment) values
  ('2024', '2024-10-03', true, '2024-10-10', '同意，請持續關注實體訓練滿意度與測驗及格率。', true, '2024-10-17', '核准，整體成效良好，請依計畫持續執行。'),
  ('2025', '2025-10-06', true, '2025-10-13', '同意，線上課程完訓率與測驗及格率均達標。', true, '2025-10-21', '核准，請持續推動數位學習並追蹤後續成效。')
on conflict (year) do nothing;

insert into public.variance_signoffs (id) values (true) on conflict (id) do nothing;

insert into public.training_roi_inputs (id) values (true) on conflict (id) do nothing;

insert into public.annual_plan_rows (id, name, cat, type, target, hours, month, count, note) values
  (1, '防災研習--消防演練', '行政職能課程', '內部', '全體員工', 2, '1月', 120, '全員必修，每年定期辦理'),
  (2, '性別平等教育', '法令規範課程', '外部', '全體員工', 3, '1月', 120, '全員必修'),
  (3, '資訊安全教育(防毒防駭)', '法令規範課程', '內部', '全體員工', 3, '1月', 120, '全員必修'),
  (4, '一般安全衛生教育訓練', '法令規範課程', '外部', '全體員工', 6, '1月', 120, '法定必修 6 小時'),
  (5, '新進員工職前訓練', '行政職能課程', '內部', '新進員工', 4, '1月', 12, '每月新進報到時辦理'),
  (6, '勞動法令與人資管理實務', '法令規範課程', '外部', '主管/人資安全組', 6, '2月', 25, '人資安全組主辦'),
  (7, '危險物品與化學品管理', '法令規範課程', '外部', '廠務部/塗裝組', 6, '2月', 30, 'GHS/SDS 法規必修'),
  (8, '品質意識與客戶滿意', '核心提升課程', '內部', '全體員工', 4, '2月', 120, '全員品質意識強化'),
  (9, '文件管理與記錄控制', '核心提升課程', '內部', '全體員工', 3, '2月', 80, 'ISO 文件系統必修'),
  (10, '企業全流程認識ERP管理需求(上)', '核心提升課程', '外部', '全體員工', 6, '3月', 60, 'ERP 系統導入前置訓練'),
  (11, '企業全流程認識ERP管理需求(下)', '核心提升課程', '外部', '全體員工', 6, '3月', 60, 'ERP 系統導入前置訓練'),
  (12, '沖壓作業安全與品質管理', '專業領域課程', '內部', '沖床組', 7, '3月', 15, '沖床組必修'),
  (13, '焊接技術與安全操作', '專業領域課程', '內部', '組一組/組二組/組三組', 7, '3月', 20, '焊接人員必修'),
  (14, 'AI超能主管班：從溝通到帶人決策全方位', '核心提升課程', '外部', '主管級以上', 7, '4月', 20, '外部公開班'),
  (15, 'AI職場加速術：高效應用×智慧工作', '核心提升課程', '外部', '全體員工', 14, '4月', 60, '14 小時 2 天課程'),
  (16, 'ISO 9001/IATF 16949量測儀器校正管理實務', '專業領域課程', '外部', '品保課', 7, '4月', 10, '品保課必修'),
  (17, 'QCC品管圈實務培訓班', '核心提升課程', '外部', '品保課/製造課', 6, '4月', 20, '品管改善活動'),
  (18, '採購成本分析與價格管理', '核心提升課程', '外部', '管理部/業務課', 6, '5月', 15, '採購人員進修'),
  (19, '顧客應對與客訴處理技巧', '核心提升課程', '外部', '業務課/營業部', 6, '5月', 15, '業務人員必修'),
  (20, '塗裝品質管理與作業規範', '專業領域課程', '內部', '塗裝組', 7, '5月', 12, '塗裝組必修'),
  (21, '精密加工技術與品質提升', '專業領域課程', '內部', '加工組', 7, '5月', 10, '加工組技術提升'),
  (22, '生產線效率改善與精實生產', '核心提升課程', '外部', '製造課/廠務部', 6, '6月', 30, '精實生產推廣'),
  (23, '財務報表解讀與管理應用', '核心提升課程', '外部', '財務部/主管', 7, '6月', 15, '財務管理必修'),
  (24, '模具設計與製造實務', '專業領域課程', '外部', '研發課', 14, '7月', 8, '研發課專業培訓'),
  (25, '設備保養與預防維護(TPM)', '核心提升課程', '外部', '廠務部/廠務室', 6, '7月', 20, 'TPM 全員保全'),
  (26, 'Solid Edge 3D繪圖', '專業領域課程', '外部', '研發課', 32, '8月', 5, '32 小時 4 天課程'),
  (27, '成本控制與預算管理實務', '核心提升課程', '外部', '財務部/各部主管', 6, '8月', 20, '預算管理必修'),
  (28, 'IATF 16949內部稽核員訓練', '專業領域課程', '外部', '品保課', 7, '8月', 5, '稽核員認證'),
  (29, '倉儲管理與物料控制', '核心提升課程', '外部', '管理部/廠務室', 6, '8月', 15, '物料管理提升'),
  (30, '環境管理與節能減碳', '法令規範課程', '外部', '廠務部/全體', 6, '9月', 40, 'ISO 14001 相關'),
  (31, '供應鏈管理與供應商評鑑', '核心提升課程', '外部', '管理部/業務課', 7, '9月', 12, '供應商管理強化'),
  (32, '生產排程與物料需求計畫(MRP)', '專業領域課程', '外部', '製造課/管理部', 6, '9月', 12, 'MRP 系統導入'),
  (33, '統計分析與SPC管制圖應用', '專業領域課程', '外部', '品保課/製造課', 7, '10月', 15, '統計品管必修'),
  (34, '船務工作完全通', '核心提升課程', '外部', '業務課', 14, '10月', 8, '外貿業務必修 14H'),
  (35, '職業安全衛生管理系統(ISO 45001)', '專業領域課程', '外部', '人資安全組', 7, '10月', 5, 'ISO 45001 認證'),
  (36, '問題分析與解決(8D/A3方法論)', '核心提升課程', '外部', '全體員工', 6, '11月', 40, '問題解決方法論'),
  (37, '數位轉型與工業4.0應用', '核心提升課程', '外部', '全體員工', 6, '11月', 50, '數位化知識普及'),
  (38, '績效管理制度與面談技巧', '核心提升課程', '外部', '各部門主管', 6, '11月', 20, '主管管理技能'),
  (39, '新進主管培訓班', '核心提升課程', '外部', '新任主管', 7, '12月', 8, '新任主管必修'),
  (40, '領導力發展與高效團隊建立', '核心提升課程', '外部', '各部門主管', 7, '12月', 20, '領導力強化'),
  (41, '簡報設計與表達技巧', '核心提升課程', '外部', '全體員工', 6, '12月', 40, '表達技巧提升'),
  (42, '外語職場溝通（英語）', '核心提升課程', '外部', '業務課/研發課', 7, '12月', 15, '國際業務必修'),
  (43, '跨部門溝通與協作', '核心提升課程', '外部', '全體員工', 6, '12月', 50, '跨部門合作'),
  (44, '業務談判與銷售策略', '核心提升課程', '外部', '業務課/營業部', 7, '12月', 12, '業務技能提升'),
  (45, '辦公室安全衛生與工作環境改善', '法令規範課程', '內部', '辦公室人員', 3, '12月', 40, '辦公室職安必修'),
  (46, '專案管理基礎(PMP概念)', '核心提升課程', '外部', '工程師/主管', 7, '12月', 15, '專案管理能力')
on conflict (id) do nothing;

insert into public.annual_plan_course_track (name, planned, actual, rate, participants, status) values
  ('防災研習--消防演練', 2, 2, 100, 118, '已完成'),
  ('性別平等教育', 3, 3, 100, 120, '已完成'),
  ('資訊安全教育(防毒防駭)', 3, 3, 100, 115, '已完成'),
  ('一般安全衛生教育訓練', 6, 6, 100, 120, '已完成'),
  ('新進員工職前訓練', 4, 4, 100, 10, '已完成'),
  ('勞動法令與人資管理實務', 6, 6, 100, 24, '已完成'),
  ('危險物品與化學品管理', 6, 6, 100, 28, '已完成'),
  ('品質意識與客戶滿意', 4, 4, 100, 118, '已完成'),
  ('文件管理與記錄控制', 3, 3, 100, 78, '已完成'),
  ('企業全流程認識ERP管理需求(上)', 6, 6, 100, 58, '已完成'),
  ('企業全流程認識ERP管理需求(下)', 6, 5, 83, 55, '已完成'),
  ('沖壓作業安全與品質管理', 7, 7, 100, 14, '已完成'),
  ('焊接技術與安全操作', 7, 5, 71, 18, '已完成'),
  ('AI超能主管班：從溝通到帶人決策全方位', 7, 7, 100, 18, '已完成'),
  ('AI職場加速術：高效應用×智慧工作', 14, 14, 100, 55, '已完成'),
  ('ISO 9001/IATF 16949量測儀器校正管理實務', 7, 7, 100, 9, '已完成'),
  ('QCC品管圈實務培訓班', 6, 6, 100, 18, '已完成'),
  ('採購成本分析與價格管理', 6, 4, 67, 12, '進行中'),
  ('顧客應對與客訴處理技巧', 6, 3, 50, 10, '進行中'),
  ('塗裝品質管理與作業規範', 7, 7, 100, 11, '已完成'),
  ('精密加工技術與品質提升', 7, 6, 86, 9, '進行中'),
  ('生產線效率改善與精實生產', 6, 0, 0, 0, '未開始'),
  ('財務報表解讀與管理應用', 7, 0, 0, 0, '未開始'),
  ('模具設計與製造實務', 14, 0, 0, 0, '未開始'),
  ('設備保養與預防維護(TPM)', 6, 0, 0, 0, '未開始'),
  ('Solid Edge 3D繪圖', 32, 0, 0, 0, '未開始'),
  ('成本控制與預算管理實務', 6, 0, 0, 0, '未開始'),
  ('IATF 16949內部稽核員訓練', 7, 0, 0, 0, '未開始'),
  ('倉儲管理與物料控制', 6, 0, 0, 0, '未開始'),
  ('環境管理與節能減碳', 6, 0, 0, 0, '未開始'),
  ('供應鏈管理與供應商評鑑', 7, 0, 0, 0, '未開始'),
  ('生產排程與物料需求計畫(MRP)', 6, 0, 0, 0, '未開始'),
  ('統計分析與SPC管制圖應用', 7, 0, 0, 0, '未開始'),
  ('船務工作完全通', 14, 0, 0, 0, '未開始'),
  ('職業安全衛生管理系統(ISO 45001)', 7, 0, 0, 0, '未開始'),
  ('問題分析與解決(8D/A3方法論)', 6, 0, 0, 0, '未開始'),
  ('數位轉型與工業4.0應用', 6, 0, 0, 0, '未開始'),
  ('績效管理制度與面談技巧', 6, 0, 0, 0, '未開始'),
  ('新進主管培訓班', 7, 0, 0, 0, '未開始'),
  ('領導力發展與高效團隊建立', 7, 0, 0, 0, '未開始'),
  ('簡報設計與表達技巧', 6, 0, 0, 0, '未開始'),
  ('外語職場溝通（英語）', 7, 0, 0, 0, '未開始'),
  ('跨部門溝通與協作', 6, 0, 0, 0, '未開始'),
  ('業務談判與銷售策略', 7, 0, 0, 0, '未開始'),
  ('辦公室安全衛生與工作環境改善', 3, 0, 0, 0, '未開始'),
  ('專案管理基礎(PMP概念)', 7, 0, 0, 0, '未開始')
on conflict (name) do nothing;

insert into public.achievement_redeem_items (id, name, icon, points, stock, desc) values
  ('r1', '半天特休假', '🌴', 500, 10, '兌換半天特休假一次'),
  ('r2', '書籍禮品卡 NT$500', '📖', 300, 20, '可至合作書店使用'),
  ('r3', '下午茶券', '☕', 150, 50, '公司福委會下午茶一份'),
  ('r4', '外訓課程補助 NT$1000', '🎓', 800, 5, '補助參加外部訓練費用'),
  ('r5', '停車優先月票', '🚗', 200, 15, '公司停車場優先月票一個月'),
  ('r6', '彈性上下班一週', '⏱️', 600, 8, '一週彈性上下班(主管核准)')
on conflict (id) do nothing;

insert into public.admin_routine_courses (id, course_name, instructor, date, hours, department, participants, outline, status, submitted_by, submitted_at, hr_comment, signed_participants) values
  ('rc1', '新進人員安全教育訓練', '林志明', '2026-06-05', 3, '管理部', array['王小明','陳美玲','林志偉'], '公司安全規定、緊急疏散程序、個人防護裝備使用', 'hr_approved', '林志明', '2026-06-01', null, array['王小明','陳美玲']),
  ('rc2', '5S現場改善技法', '品保課李主管', '2026-06-10', 2, '品保課', array['李大明','黃雅婷'], '5S定義與推行方法、實際案例演練、改善成果追蹤', 'pending_hr', '李主管', '2026-06-03', null, null),
  ('rc3', '設備保養SOP講習', '工程課王工程師', '2026-06-15', 4, '工程課', array['王小華','劉俊達','蔡建志'], '設備保養週期說明、潤滑油更換規範、異常處理程序', 'draft', '王工程師', '2026-06-04', null, null)
on conflict (id) do nothing;

insert into public.perf_l3_records (id, enrollment_id, user_id, course_id, course_name, user_name, quarter, application_content, confirmed_at, status, kpi_note, due_date, attachments, submitted_at, manager_approval) values
  ('l3-1', 'enr1', 'u2', 'c1', '職業安全衛生法規研習', '王小明', '2026-Q2', '在工作中主動確認個人防護裝備的使用，並提醒同事注意安全規範', '2026-04-15', 'confirmed', '本季零工傷事故', '2026-04-15', '[]'::jsonb, '2026-04-14', '{"by":"李主管","at":"2026-04-15","decision":"approved"}'::jsonb),
  ('l3-2', 'enr2', 'u3', 'c2', '5S推行與現場管理', '陳美玲', '2026-Q2', '', null, 'pending', '', '2026-06-20', null, null, null),
  ('l3-3', 'enr3', 'u4', 'c3', 'ISO 9001 品質管理系統', '林志偉', '2026-Q1', '協助部門完成ISO內部稽核，運用課程學到的稽核技巧找出3個改善點', '2026-03-20', 'confirmed', '不合格品率降低 2%', '2026-03-20', '[]'::jsonb, '2026-03-18', '{"by":"李主管","at":"2026-03-20","decision":"approved"}'::jsonb),
  ('l3-4', 'enr4', 'u5', 'c4', '精實生產與浪費消除', '黃雅婷', '2026-Q2', '', null, 'overdue', '', '2026-05-01', null, null, null),
  ('l3-5', 'enr5', 'u2', 'c2', '5S推行與現場管理', '王小明', '2026-Q1', '帶領小組完成工作區域整理整頓，減少尋找工具時間約15分鐘/天', '2026-03-10', 'confirmed', '作業效率提升 8%', '2026-03-10', '[]'::jsonb, '2026-03-08', '{"by":"李主管","at":"2026-03-10","decision":"approved"}'::jsonb)
on conflict (id) do nothing;

insert into public.perf_l4_campaigns (id, course_id, course_name, department, kpi_type, unit, baseline_value, target_value, higher_is_better, entries, created_by, created_at) values
  ('l4-1', 'c1', '職業安全衛生法規研習', '管理部', '工安事故率', '件/月', 2, 0, false, '[{"quarter":"2026-Q1","actualValue":0,"reportedBy":"李主管","reportedAt":"2026-04-01"}]'::jsonb, '李主管', '2026-01-05'),
  ('l4-2', 'c3', 'ISO 9001 品質管理系統', '品保課', '不合格品率', '%', 3.2, 2.0, false, '[{"quarter":"2026-Q1","actualValue":1.8,"reportedBy":"品保主管","reportedAt":"2026-04-05"}]'::jsonb, '品保主管', '2026-01-05')
on conflict (id) do nothing;
