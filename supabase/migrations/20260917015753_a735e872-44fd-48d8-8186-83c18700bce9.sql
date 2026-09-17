CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Produce',
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pantry_items_user_expiry_idx ON public.pantry_items (user_id, expiry_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pantry_items TO authenticated;
GRANT ALL ON public.pantry_items TO service_role;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pantry items" ON public.pantry_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Produce',
  note TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX shopping_list_user_idx ON public.shopping_list_items (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO authenticated;
GRANT ALL ON public.shopping_list_items TO service_role;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shopping list" ON public.shopping_list_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Produce',
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  wasted_on DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL DEFAULT 'expired',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX waste_log_user_date_idx ON public.waste_log (user_id, wasted_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waste_log TO authenticated;
GRANT ALL ON public.waste_log TO service_role;
ALTER TABLE public.waste_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own waste log" ON public.waste_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.alert_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_id UUID REFERENCES public.pantry_items ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'expiry_day',
  sent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id, alert_type, sent_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_log TO authenticated;
GRANT ALL ON public.alert_log TO service_role;
ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alert log" ON public.alert_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reminder_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  lead_days INTEGER NOT NULL DEFAULT 3,
  expiry_day_alerts BOOLEAN NOT NULL DEFAULT true,
  email_alerts BOOLEAN NOT NULL DEFAULT false,
  monthly_waste_goal NUMERIC(10,2) NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_settings TO authenticated;
GRANT ALL ON public.reminder_settings TO service_role;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reminder settings" ON public.reminder_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER pantry_items_updated_at BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.reminder_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();