import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckSquare, Calendar, Sparkles } from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#242424]">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            My Tasks
          </h1>
          <p className="text-sm text-[#8b947a] mt-1 font-sans">
            Central task view for all development items assigned to your profile
          </p>
        </div>
      </div>

      <Card level={2} className="border-[#242424] p-12 text-center flex flex-col items-center">
        <div className="p-4 bg-[#121414] border border-[#242424] rounded-full mb-4 text-[#A8FF00]">
          <CheckSquare className="w-10 h-10" />
        </div>
        <Badge variant="signal" className="mb-3">MILESTONE 3 CAPABILITY</Badge>
        <h3 className="font-display font-bold text-xl text-white">Task Management Active Soon</h3>
        <p className="text-sm text-[#8b947a] mt-2 max-w-md">
          Milestone 3 (Tasks & Team Collaboration) will introduce assigned tasks, priority tags (LOW, MEDIUM, HIGH), task status transitions, and personal deadline tracking.
        </p>
      </Card>
    </div>
  );
};
