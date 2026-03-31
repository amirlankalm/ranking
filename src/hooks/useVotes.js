"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useVotes() {
  const { session } = useAuth();
  const [userVotes, setUserVotes] = useState(new Set());

  useEffect(() => {
    if (session?.user) {
      fetchUserVotes(session.user.id);
    } else {
      setUserVotes(new Set());
    }
  }, [session]);

  const fetchUserVotes = async (userId) => {
    const { data, error } = await supabase
      .from('votes')
      .select('student_id')
      .eq('user_id', userId);

    if (!error && data) {
      setUserVotes(new Set(data.map(v => v.student_id)));
    }
  };

  const hasVoted = (studentId) => userVotes.has(studentId);

  return { userVotes, hasVoted, fetchUserVotes, setUserVotes };
}
