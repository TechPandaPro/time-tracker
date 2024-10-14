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
    const dailyGoalInputWrapper = document.createElement("div");
    dailyGoalInputWrapper.classList.add("dailyGoalWrapper");
    // dailyGoalInputWrapper.dataset.unit = "hours";
    const dailyGoalInput = document.createElement("input");
    // dailyGoalInput.dataset.unit = "hours";
    dailyGoalInput.type = "number";
    dailyGoalInput.min = 0;
    dailyGoalInput.max = 24;
    dailyGoalInput.dataset.valueMs = focus.dailyGoal;
    // dailyGoalInput.value = focus.dailyGoal;
    // dailyGoalCell.append(dailyGoalInput);
    const dailyGoalUnit = document.createElement("div");
    dailyGoalUnit.dataset.unit = "hours";
    dailyGoalUnit.classList.add("dailyGoalUnit");
    dailyGoalUnit.innerText = "hours";
    // dailyGoalCell.append(dailyGoalInput, dailyGoalUnit);
    updateDisplayedDailyGoal();
    dailyGoalInputWrapper.append(dailyGoalInput, dailyGoalUnit);
    dailyGoalCell.append(dailyGoalInputWrapper);
    // dailyGoalCell.append(dailyGoalInputWrapper);
    focusRow.append(dailyGoalCell);

    focusNameInput.addEventListener("input", updateNameElemWidth);

    // setInterval(() => {
    //   console.log(dailyGoalInput.selectionStart);
    // }, 100);

    dailyGoalInput.addEventListener("input", (e) => {
      if (dailyGoalInput.value.length > 5)
        dailyGoalInput.value = String(dailyGoalInput.value).slice(0, 5);
      updateDatasetDailyGoal();
      updateUnitElemWidth();
    });

    dailyGoalUnit.addEventListener("click", (e) => {
      const newUnit =
        dailyGoalUnit.dataset.unit === "hours" ? "minutes" : "hours";
      dailyGoalUnit.dataset.unit = newUnit;
      dailyGoalUnit.innerText = newUnit;
      updateDisplayedDailyGoal();
    });

    updateNameElemWidth();
    // updateUnitElemWidth();

    function updateNameElemWidth() {
      const width = measureTextWidth(focusNameInput.value);
      focusNameInput.style.width = `${Math.max(width, 100)}px`;
    }

    function updateUnitElemWidth() {
      // const measureElem = document.createElement("div");
      // measureElem.style.visibility = "hidden";
      // measureElem.style.whiteSpace = "pre-wrap";
      // measureElem.style.position = "absolute";
      // measureElem.innerText = `${dailyGoalInput.value} `;
      // document.body.append(measureElem);
      // const numWidth = measureElem.offsetWidth;
      // measureElem.remove();

      const numWidth = measureTextWidth(`${dailyGoalInput.value} `);
      dailyGoalUnit.style.left = `${numWidth}px`;
    }

    function measureTextWidth(text) {
      const measureElem = document.createElement("div");
      measureElem.style.visibility = "hidden";
      measureElem.style.whiteSpace = "pre-wrap";
      measureElem.style.position = "absolute";
      measureElem.innerText = text;
      document.body.append(measureElem);
      const textWidth = measureElem.offsetWidth;
      measureElem.remove();
      return textWidth;
    }

    function updateDisplayedDailyGoal() {
      const valueMs = Number(dailyGoalInput.dataset.valueMs);
      const displayValue = valueMs / getMsInUnit();
      dailyGoalInput.value = displayValue;
      updateUnitElemWidth();
    }

    function updateDatasetDailyGoal() {
      const displayValue = Number(dailyGoalInput.value);
      const datasetValue = displayValue * getMsInUnit();
      dailyGoalInput.dataset.valueMs = datasetValue;
    }

    function getMsInUnit() {
      const unit = dailyGoalUnit.dataset.unit;
      switch (unit) {
        case "hours":
          return 1000 * 60 * 60;
        // break;
        case "minutes":
          return 1000 * 60;
        // break;
        default:
          return -1;
      }
    }

    focusesTableBody.append(focusRow);
  }
})();
