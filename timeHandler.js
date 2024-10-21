// this module contains the functions responsible for logging time

import electronStore from "./electronStore.js";

const focuses = electronStore.get("data.focuses");
let needsSave = false;
for (const focus of focuses)
  for (const session of focus.sessions)
    if (session.isOngoing) {
      session.isOngoing = false;
      needsSave = true;
    }
if (needsSave) electronStore.set("data.focuses", focuses);

// maybe, for simplicity, this can just always run. and the function simply ignores it if there's no ongoing session.
// after all, the idea is to (ideally) always have a session running, so the edge case probably isn't worth it.
setInterval(saveTime, 1000 * 60 * 3);

function getSessionStartStamp() {
  const { focuses, currentFocus: currentFocusId } = electronStore.get("data");
  if (!currentFocusId) throw new Error("No current focus");
  const currentFocus = focuses.find((focus) => focus.id === currentFocusId);

  const mostRecentSession =
    currentFocus.sessions[currentFocus.sessions.length - 1];

  if (!mostRecentSession?.isOngoing) return null;

  return mostRecentSession.start;
}

// TODO: make this run periodically (5 min?)
// quitting app should also cause save first
// note that the other functions should already save. this is simply for "intermediate" saves to prevent data loss.
function saveTime() {
  console.log(`saving time, ${new Date().toLocaleTimeString()}`);

  // TODO: consider adding function for getting current focus
  const { focuses, currentFocus: currentFocusId } = electronStore.get("data");
  if (!currentFocusId) throw new Error("No current focus");
  const currentFocus = focuses.find((focus) => focus.id === currentFocusId);

  const mostRecentSession =
    currentFocus.sessions[currentFocus.sessions.length - 1];

  // let session;
  // if (mostRecentSession && mostRecentSession.isOngoing) {
  //   session = mostRecentSession;
  //   session.end = Date.now();
  // } else {
  //   session = {
  //     start: Date.now(),
  //     end: Date.now(),
  //     isOngoing: true,
  //   };
  //   currentFocus.sessions.push(session);
  // }

  // if (!mostRecentSession || !mostRecentSession.isOngoing)
  //   throw new Error("Session is not ongoing");

  // mostRecentSession.end = Date.now();

  // electronStore.set("data.focuses", focuses);

  if (mostRecentSession?.isOngoing) {
    mostRecentSession.end = Date.now();
    electronStore.set("data.focuses", focuses);
  }
}

function startTime() {
  console.log(`starting time, ${new Date().toLocaleTimeString()}`);

  const { focuses, currentFocus: currentFocusId } = electronStore.get("data");
  if (!currentFocusId) throw new Error("No current focus");
  const currentFocus = focuses.find((focus) => focus.id === currentFocusId);

  const mostRecentSession =
    currentFocus.sessions[currentFocus.sessions.length - 1];

  // if (mostRecentSession && mostRecentSession.isOngoing)
  if (mostRecentSession?.isOngoing)
    throw new Error("Session is already ongoing");

  if (mostRecentSession) mostRecentSession.isOngoing = false;

  const newSession = {
    start: Date.now(),
    end: Date.now(),
    isOngoing: true,
  };
  currentFocus.sessions.push(newSession);

  electronStore.set("data.focuses", focuses);
}

function stopTime() {
  console.log(`stopping time, ${new Date().toLocaleDateString()}`);

  const { focuses, currentFocus: currentFocusId } = electronStore.get("data");
  if (!currentFocusId) throw new Error("No current focus");
  const currentFocus = focuses.find((focus) => focus.id === currentFocusId);

  const mostRecentSession =
    currentFocus.sessions[currentFocus.sessions.length - 1];

  if (!mostRecentSession || !mostRecentSession.isOngoing)
    throw new Error("Session is not ongoing");

  mostRecentSession.end = Date.now();
  mostRecentSession.isOngoing = false;

  electronStore.set("data.focuses", focuses);
}

export { getSessionStartStamp, startTime, stopTime };
