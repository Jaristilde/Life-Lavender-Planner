
import { supabase } from './supabaseClient';

export const dataService = {
  // Profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Year Data
  async getYearData(userId: string, year: number) {
    const { data, error } = await supabase
      .from('years')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllYears(userId: string) {
    const { data, error } = await supabase
      .from('years')
      .select('id, year, is_archived, created_at')
      .eq('user_id', userId)
      .order('year', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createYear(userId: string, year: number, initialData: any) {
    const { data, error } = await supabase
      .from('years')
      .insert({
        user_id: userId,
        year: year,
        financial_data: initialData.financial || {},
        wellness_data: initialData.wellness || {},
        workbook_data: initialData.workbook || {},
        monthly_resets: initialData.monthlyResets || {},
        daily_morning_resets: initialData.dailyMorningResets || {},
        goals: initialData.visionBoard?.goals || {},
        affirmations: initialData.affirmations || [],
        vision_board: initialData.visionBoard || {},
        simplify_challenge: initialData.simplifyChallenge || {},
        reflections: initialData.reflections || {},
        planner: initialData.plannerFocus || {},
        library: initialData.library || [],
        daily_todos: initialData.wellness?.dailyToDos || []
      })
      .select()
      .single();
    // Handle duplicate key (race condition: another call already created this year)
    if (error && error.code === '23505') {
      const { data: existing, error: fetchErr } = await supabase
        .from('years')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .single();
      if (fetchErr) throw fetchErr;
      return existing;
    }
    if (error) throw error;
    return data;
  },

  async updateYearField(yearId: string, field: string, value: any) {
    const { data, error } = await supabase
      .from('years')
      .update({ [field]: value })
      .eq('id', yearId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async archiveYear(yearId: string) {
    const { error } = await supabase
      .from('years')
      .update({ is_archived: true })
      .eq('id', yearId);
    if (error) throw error;
  },

  // File Storage
  async uploadFile(userId: string, file: File, path: string) {
    const filePath = `${userId}/${path}`;
    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    return data;
  },

  async getSignedUrl(userId: string, path: string) {
    const filePath = `${userId}/${path}`;
    const { data, error } = await supabase.storage
      .from('user-files')
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  },

  async deleteFile(userId: string, path: string) {
    const filePath = `${userId}/${path}`;
    const { error } = await supabase.storage
      .from('user-files')
      .remove([filePath]);
    if (error) throw error;
  }
};
