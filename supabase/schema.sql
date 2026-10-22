-- Lughati Play: schema awal Supabase
-- Semua pendaftaran publik menjadi siswa. Promosikan akun guru secara manual oleh admin tepercaya.
-- Jalankan seluruh file ini sekali dari Supabase SQL Editor.
-- RLS aktif pada seluruh tabel aplikasi.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama_panggilan text not null default 'Pengguna',
  peran text not null default 'siswa' check (peran in ('siswa', 'guru')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama_panggilan, peran)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nama_panggilan', ''), 'Pengguna'),
    'siswa'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  nama text not null check (char_length(nama) between 2 and 80),
  kode_kelas text not null unique,
  guru_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  siswa_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, siswa_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.profiles(id) on delete cascade,
  bab_id text not null,
  jenis_game text not null check (jenis_game in ('memory', 'tts', 'wordsearch')),
  skor integer not null default 0 check (skor between 0 and 100),
  waktu integer not null default 0 check (waktu between 0 and 86400),
  tanggal timestamptz not null default now()
);

create index if not exists idx_classes_guru on public.classes(guru_id);
create index if not exists idx_class_members_student on public.class_members(siswa_id);
create index if not exists idx_progress_student_date on public.progress(siswa_id, tanggal desc);

-- Security-definer helpers menghindari policy saling memanggil secara rekursif.
create or replace function public.is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.guru_id = auth.uid()
  );
$$;

create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
    where cm.class_id = p_class_id and cm.siswa_id = auth.uid()
  );
$$;

create or replace function public.join_class(p_kode_kelas text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_class_id uuid;
  v_role text;
begin
  if v_user_id is null then
    raise exception 'Silakan masuk terlebih dahulu.';
  end if;

  select peran into v_role
  from public.profiles
  where id = v_user_id;

  if v_role is distinct from 'siswa' then
    raise exception 'Hanya akun siswa yang dapat bergabung ke kelas.';
  end if;

  select id into v_class_id
  from public.classes
  where kode_kelas = upper(trim(p_kode_kelas));

  if v_class_id is null then
    raise exception 'Kode kelas tidak ditemukan.';
  end if;

  insert into public.class_members (class_id, siswa_id)
  values (v_class_id, v_user_id)
  on conflict (class_id, siswa_id) do nothing;

  return v_class_id;
end;
$$;

revoke all on function public.join_class(text) from public;
grant execute on function public.join_class(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.progress enable row level security;

drop policy if exists "profiles_select_self_or_teacher_students" on public.profiles;
create policy "profiles_select_self_or_teacher_students"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.class_members cm
    where cm.siswa_id = profiles.id
      and public.is_class_teacher(cm.class_id)
  )
);

drop policy if exists "classes_select_teacher_or_member" on public.classes;
create policy "classes_select_teacher_or_member"
on public.classes for select to authenticated
using (guru_id = auth.uid() or public.is_class_member(id));

drop policy if exists "classes_insert_teacher" on public.classes;
create policy "classes_insert_teacher"
on public.classes for insert to authenticated
with check (
  guru_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'guru')
);

drop policy if exists "classes_update_teacher" on public.classes;
create policy "classes_update_teacher"
on public.classes for update to authenticated
using (guru_id = auth.uid())
with check (guru_id = auth.uid());

drop policy if exists "classes_delete_teacher" on public.classes;
create policy "classes_delete_teacher"
on public.classes for delete to authenticated
using (guru_id = auth.uid());

drop policy if exists "class_members_select_student_or_teacher" on public.class_members;
create policy "class_members_select_student_or_teacher"
on public.class_members for select to authenticated
using (siswa_id = auth.uid() or public.is_class_teacher(class_id));

drop policy if exists "progress_insert_own_student" on public.progress;
create policy "progress_insert_own_student"
on public.progress for insert to authenticated
with check (
  siswa_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'siswa')
);

drop policy if exists "progress_select_student_or_teacher" on public.progress;
create policy "progress_select_student_or_teacher"
on public.progress for select to authenticated
using (
  siswa_id = auth.uid()
  or exists (
    select 1 from public.class_members cm
    where cm.siswa_id = progress.siswa_id
      and public.is_class_teacher(cm.class_id)
  )
);

-- Hak akses minimum untuk role aplikasi.
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.classes to authenticated;
grant select on public.class_members to authenticated;
grant select, insert on public.progress to authenticated;

-- Bucket materi: privat, hanya pengguna terautentikasi dapat membaca.
insert into storage.buckets (id, name, public)
values ('materi-pembelajaran', 'materi-pembelajaran', false)
on conflict (id) do nothing;

drop policy if exists "authenticated_read_learning_material" on storage.objects;
create policy "authenticated_read_learning_material"
on storage.objects for select to authenticated
using (bucket_id = 'materi-pembelajaran');

drop policy if exists "teacher_upload_learning_material" on storage.objects;
create policy "teacher_upload_learning_material"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'materi-pembelajaran'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'guru')
);

drop policy if exists "teacher_update_learning_material" on storage.objects;
create policy "teacher_update_learning_material"
on storage.objects for update to authenticated
using (
  bucket_id = 'materi-pembelajaran'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'guru')
)
with check (
  bucket_id = 'materi-pembelajaran'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'guru')
);

drop policy if exists "teacher_delete_learning_material" on storage.objects;
create policy "teacher_delete_learning_material"
on storage.objects for delete to authenticated
using (
  bucket_id = 'materi-pembelajaran'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.peran = 'guru')
);

