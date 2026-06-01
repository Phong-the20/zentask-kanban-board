import { useAnalytics } from '../hooks/useAnalytics';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLUMN_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

interface Props {
  workspaceId: number;
}

export default function WorkspaceAnalytics({ workspaceId }: Props) {
  const { data, isLoading } = useAnalytics(workspaceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        Loading analytics...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {data.totalTasks === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm max-w-md">
            No tasks found in this workspace. Go back to your board and add some tasks to see your productivity metrics!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalTasks}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {data.completedPercentage}%
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">
                {data.activeMembers}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Tasks by Column
              </h3>
              <div className="w-full flex justify-center" style={{ height: 300 }}>
                <PieChart width={280} height={300}>
                  <Pie
                    data={data.taskColumnData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {data.taskColumnData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLUMN_COLORS[i % COLUMN_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                {data.taskColumnData.map((entry, i) => (
                  <span key={entry.name} className="text-xs flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: COLUMN_COLORS[i % COLUMN_COLORS.length] }}
                    />
                    {entry.name}: {entry.count}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Tasks by Priority
              </h3>
              <div className="w-full flex justify-center" style={{ height: 300 }}>
                <BarChart width={320} height={300} data={data.priorityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.priorityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PRIORITY_COLORS[entry.name] || '#6b7280'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
