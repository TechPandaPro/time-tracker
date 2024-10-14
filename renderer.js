console.log("hello world!");

const electronApi = window._electronApi;

(async () => {
  const data = await electronApi.getData();
  console.log(data);
  const { dailyLog, focuses } = data;

  // const focusesElem = document.querySelector(".focuses");

  const focusesTableBody = document.querySelector("table.focuses tbody");

  for (const focus of focuses) {
    const focusRow = document.createElement("tr");
    focusRow.dataset.id = focus.id;

    // const focusElem = document.createElement("td");
    // focusElem.classList.add("focus");
    // focusRow.dataset.id = focus.id;

    const focusIconCell = document.createElement("td");
    focusIconCell.classList.add("focusIcon");
    const focusIcon = document.createElement("img");
    focusIcon.src = "trayIcon_16x16.png"; // TODO: replace with selected icon
    focusIconCell.append(focusIcon);
    focusRow.append(focusIconCell);

    // const focusNameCell = document.createElement("td");
    // focusNameCell.classList.add("focusName");
    // focusNameCell.innerText = focus.name;
    // focusRow.append(focusNameCell);

    const focusNameCell = document.createElement("td");
    focusNameCell.classList.add("focusName");
    // focusNameCell.innerText = focus.name;
    const focusNameInput = document.createElement("input");
    focusNameInput.type = "text";
    focusNameInput.value = focus.name;
    focusNameCell.append(focusNameInput);
    focusRow.append(focusNameCell);

    const dailyGoalCell = document.createElement("td");
    dailyGoalCell.classList.add("dailyGoal");
    const dailyGoalInput = document.createElement("input");
    dailyGoalInput.type = "number";
    dailyGoalInput.min = "0";
    dailyGoalInput.max = "24";
    dailyGoalInput.value = focus.dailyGoal;
    // dailyGoalCell.append(dailyGoalInput);
    const dailyGoalUnit = document.createElement("span");
    dailyGoalUnit.innerText = "hours";
    dailyGoalCell.append(dailyGoalInput, dailyGoalUnit);
    focusRow.append(dailyGoalCell);

    focusesTableBody.append(focusRow);
  }
})();
