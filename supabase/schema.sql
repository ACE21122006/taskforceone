-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'gamer' CHECK (role IN ('gamer', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  tasks_completed INTEGER DEFAULT 0,
  success_rate NUMERIC(5, 2) DEFAULT 100.00,
  total_earnings NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  reward_tzs NUMERIC(12, 2) NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  instructions TEXT NOT NULL,
  requirements TEXT NOT NULL,
  submission_rules TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  est_completion_time TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  screenshot_url TEXT,
  video_url TEXT,
  coins_earned INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_feedback TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table (wallet logs)
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_tzs NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reward', 'withdrawal', 'adjustment')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payout Methods table
CREATE TABLE public.payout_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('mpesa', 'airtel_money', 'mixx_by_yas')),
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('task_approved', 'task_rejected', 'new_task', 'withdrawal_approved', 'withdrawal_rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Allow users to read their own, admins to read all)
CREATE POLICY "Allow users to read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow anyone to read published tasks" ON public.tasks
  FOR SELECT USING (status = 'published' OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow admins full control of tasks" ON public.tasks
  FOR ALL USING ((SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to manage own submissions" ON public.submissions
  FOR ALL USING (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to read own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow admins full control of transactions" ON public.transactions
  FOR ALL USING ((SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to manage own payout methods" ON public.payout_methods
  FOR ALL USING (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

-- Trigger to insert profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone_number, role, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Gamer_' || substring(new.id::text from 1 for 6)),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone_number', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'role', 'gamer'),
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Messages table (direct chat comms for coin deposits)
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('gamer', 'admin')),
  message TEXT NOT NULL,
  screenshot_url TEXT,
  coins_sent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies
CREATE POLICY "Allow users to read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');

CREATE POLICY "Allow users to insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin');
