import { create } from "zustand";

interface State {
  loading: boolean;
}

interface Actions {
  actions: {
    setLoading: (bool: boolean) => void;
  };
}

const initialState = {
  loading: false,
  titleObj: { title: "", oldTitle: "" },
};

export const useCommonStore = create<State & Actions>((set, get) => ({
  ...initialState,
  actions: {
    setLoading: (bool) => set((state) => ({ loading: bool })),
  },
}));
