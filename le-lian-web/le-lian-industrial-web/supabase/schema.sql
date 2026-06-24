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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

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
    coalesce(inv.role, new.raw_user_meta_data->>'role', 'employee'),
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

-- employee_job_descriptions：本人或 hr/admin 可讀，僅 hr/admin 可寫
drop policy if exists employee_job_descriptions_select on public.employee_job_descriptions;
create policy employee_job_descriptions_select on public.employee_job_descriptions for select to authenticated
  using (user_id = auth.uid() or public.is_hr_or_admin());
drop policy if exists employee_job_descriptions_write on public.employee_job_descriptions;
create policy employee_job_descriptions_write on public.employee_job_descriptions for all to authenticated
  using (public.is_hr_or_admin()) with check (public.is_hr_or_admin());

-- physical_records / routine_courses：全員可讀（既有儀表板邏輯），建立者或 hr/admin 可寫
drop policy if exists physical_records_select on public.physical_records;
create policy physical_records_select on public.physical_records for select to authenticated using (true);
drop policy if exists physical_records_write on public.physical_records;
create policy physical_records_write on public.physical_records for all to authenticated
  using (created_by = auth.uid() or public.is_hr_or_admin())
  with check (created_by = auth.uid() or public.is_hr_or_admin());

drop policy if exists physical_record_photos_select on public.physical_record_photos;
create policy physical_record_photos_select on public.physical_record_photos for select to authenticated using (true);
drop policy if exists physical_record_photos_write on public.physical_record_photos;
create policy physical_record_photos_write on public.physical_record_photos for all to authenticated
  using (
    exists (
      select 1 from public.physical_records r
      where r.id = record_id and (r.created_by = auth.uid() or public.is_hr_or_admin())
    )
  );

drop policy if exists routine_courses_select on public.routine_courses;
create policy routine_courses_select on public.routine_courses for select to authenticated using (true);
drop policy if exists routine_courses_insert on public.routine_courses;
create policy routine_courses_insert on public.routine_courses for insert to authenticated
  with check (submitted_by = auth.uid() or public.is_manager_or_above());
drop policy if exists routine_courses_update on public.routine_courses;
create policy routine_courses_update on public.routine_courses for update to authenticated
  using (submitted_by = auth.uid() or public.is_hr_or_admin());
drop policy if exists routine_courses_delete on public.routine_courses;
create policy routine_courses_delete on public.routine_courses for delete to authenticated
  using (public.is_admin());

drop policy if exists routine_course_photos_select on public.routine_course_photos;
create policy routine_course_photos_select on public.routine_course_photos for select to authenticated using (true);
drop policy if exists routine_course_photos_write on public.routine_course_photos;
create policy routine_course_photos_write on public.routine_course_photos for all to authenticated
  using (
    exists (
      select 1 from public.routine_courses c
      where c.id = routine_course_id and (c.submitted_by = auth.uid() or public.is_hr_or_admin())
    )
  );

-- course_designs / effectiveness_trackings / training_applications：全員可讀
-- （簽核欄位完整性由 trigger 把關，這裡只控制誰能新增/編輯整張表單）
drop policy if exists course_designs_select on public.course_designs;
create policy course_designs_select on public.course_designs for select to authenticated using (true);
drop policy if exists course_designs_insert on public.course_designs;
create policy course_designs_insert on public.course_designs for insert to authenticated with check (true);
drop policy if exists course_designs_update on public.course_designs;
create policy course_designs_update on public.course_designs for update to authenticated using (true);
drop policy if exists course_designs_delete on public.course_designs;
create policy course_designs_delete on public.course_designs for delete to authenticated
  using (public.is_admin());

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
create policy training_applications_delete on public.training_applications for delete to authenticated
  using (public.is_admin());

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
  using (public.is_admin());

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
  );
