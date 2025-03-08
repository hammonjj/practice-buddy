import React from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { PracticeSession } from '../../types';

interface SessionDetailsProps {
  session: PracticeSession;
  onClose: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function SessionDetails({ session, onClose, onToggleComplete }: SessionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-surface p-6 rounded-lg w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{session.title}</h2>
            <p className="text-white/60 text-sm">
              {format(new Date(session.date), 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/80">Duration</label>
            <p className="text-lg">{session.duration} minutes</p>
          </div>

          {session.notes && (
            <div>
              <label className="text-sm font-medium text-white/80">Notes</label>
              <p className="text-white/90 bg-background/50 rounded-lg p-3 mt-1">
                {session.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${session.completed ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                {session.completed ? (
                  <Check className="text-green-500" size={20} />
                ) : (
                  <X className="text-yellow-500" size={20} />
                )}
              </div>
              <span className="text-sm text-white/80">
                {session.completed ? 'Completed' : 'Not completed'}
              </span>
            </div>
            <Button
              variant={session.completed ? 'outline' : 'primary'}
              size="sm"
              onClick={() => onToggleComplete(session.id, !session.completed)}
            >
              {session.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}