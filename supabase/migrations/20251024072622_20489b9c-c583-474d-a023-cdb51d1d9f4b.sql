-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('user', 'owner', 'finance', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR user_id = auth.uid()
  );

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update trigger to assign default 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Update invoice policies to use the new role system
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Update approval steps policies
DROP POLICY IF EXISTS "Users can view approval steps for accessible invoices" ON public.approval_steps;
CREATE POLICY "Users can view approval steps for accessible invoices"
  ON public.approval_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE id = invoice_id
      AND (
        created_by = auth.uid() OR 
        public.has_role(auth.uid(), 'owner') OR 
        public.has_role(auth.uid(), 'finance') OR
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Owners and finance can update approval steps" ON public.approval_steps;
CREATE POLICY "Owners and finance can update approval steps"
  ON public.approval_steps FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Update storage policies
DROP POLICY IF EXISTS "Users can view invoices they have access to" ON storage.objects;
CREATE POLICY "Users can view invoices they have access to"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      public.has_role(auth.uid(), 'owner') OR
      public.has_role(auth.uid(), 'finance') OR
      public.has_role(auth.uid(), 'admin')
    )
  );