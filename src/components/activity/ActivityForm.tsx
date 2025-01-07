import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ActivityFormProps {
  onPostSuccess?: () => Promise<void>;
}

export function ActivityForm({ onPostSuccess }: ActivityFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('User not logged in or session not found.');
      }

      const userId = session.user.id;

      const { error } = await supabase
        .from('activities')
        .insert({ content, user_id: userId });

      if (error) throw error;

      setContent('');
      if (onPostSuccess) {
        await onPostSuccess(); // onPostSuccess を呼び出す
      }
    } catch (error) {
      console.error('Error posting activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are you working on?"
          required
          className="flex-1"
        />
        <Button type="submit" icon={Send} disabled={isSubmitting}>
          Share
        </Button>
      </div>
    </form>
  );
}
