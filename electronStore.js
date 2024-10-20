import Store from "electron-store";

const electronStore = new Store({
  defaults: {
    data: {
      dailyLog: [],
      focuses: [
        {
          name: "Sleep",
          id: "focus_0",
          icon: "bed",
          dailyGoal: 1000 * 60 * 30,
          selectedSince: null,
          sessions: [],
        },
        {
          name: "Other",
          id: "focus_1",
          icon: "file",
          dailyGoal: 0,
          selectedSince: null,
          sessions: [],
        },
      ],
      currentFocus: "focus_1",
      nextFocusNum: 2,
    },
  },
});

export default electronStore;
