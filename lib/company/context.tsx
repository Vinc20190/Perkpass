'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import type { Company, CompanyMember, CompanyRole, Department } from '@/lib/types';

interface CompanyContextValue {
  company: Company | null;
  membership: CompanyMember | null;
  role: CompanyRole | null;
  departments: Department[];
  loading: boolean;
  isSuperAdmin: boolean;
  refreshCompany: () => Promise<void>;
  refreshDepartments: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [membership, setMembership] = useState<CompanyMember | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const refreshCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setMembership(null);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    // Check super_admins table (RLS allows user to read their own row if active)
    const { data: adminRow } = await supabase
      .from('super_admins')
      .select('id')
      .maybeSingle();
    setIsSuperAdmin(!!adminRow);

    const { data: member } = await supabase
      .from('company_members')
      .select('id, company_id, user_id, role, is_active, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (member) {
      setMembership(member as CompanyMember);
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', (member as CompanyMember).company_id)
        .maybeSingle();
      setCompany(comp as Company);
    } else {
      setMembership(null);
      setCompany(null);
    }
    setLoading(false);
  }, [user]);

  const refreshDepartments = useCallback(async () => {
    if (!company) {
      setDepartments([]);
      return;
    }
    const { data } = await supabase
      .from('departments')
      .select('id, company_id, name, head_user_id, created_at')
      .eq('company_id', company.id)
      .order('name');
    setDepartments((data as Department[]) ?? []);
  }, [company]);

  useEffect(() => {
    if (authLoading) return;
    refreshCompany();
  }, [authLoading, refreshCompany]);

  useEffect(() => {
    refreshDepartments();
  }, [refreshDepartments]);

  const role = membership?.role ?? null;

  return (
    <CompanyContext.Provider
      value={{ company, membership, role, departments, loading, isSuperAdmin, refreshCompany, refreshDepartments }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
