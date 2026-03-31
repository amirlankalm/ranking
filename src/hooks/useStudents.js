"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStudents(status = 'approved') {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
        // Simple strategy: refetch on any change to maintain accurate sorting
        fetchStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status]);

  const fetchStudents = async () => {
    let query = supabase.from('students').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('votes', { ascending: false })
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setStudents(data);
    } else if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return { students, loading, fetchStudents };
}
