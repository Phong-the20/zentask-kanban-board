import { create } from 'zustand';

interface WorkspaceState {
  selectedWorkspaceId: number | null;
  selectedBoardId: number | null;
  setSelectedWorkspace: (id: number | null) => void;
  setSelectedBoard: (id: number | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  selectedWorkspaceId: null,
  selectedBoardId: null,
  setSelectedWorkspace: (id) => set({ selectedWorkspaceId: id, selectedBoardId: null }),
  setSelectedBoard: (id) => set({ selectedBoardId: id }),
}));
