import type { Priority } from '../../types';

const colors: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

interface Props {
  priority: Priority;
}

export default function PriorityBadge({ priority }: Props) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full leading-none ${colors[priority]}`}
    >
      {priority}
    </span>
  );
}
