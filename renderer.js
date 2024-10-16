console.log("hello world!");

const electronApi = window._electronApi;

(async () => {
  // const focusIcons = [
  //   "bed",
  //   "book",
  //   "bug",
  //   "cart",
  //   "chart",
  //   "clipboard",
  //   // "paused_filled",
  //   // "paused_outline",
  //   "video",
  // ];

  const focusIcons = [
    "file",
    "clipboard",
    "chart",
    "book",
    "video",
    "group",
    "cart",
    "bug",
    "bed",
  ];

  const data = await electronApi.getData();
  console.log(data);
  // TODO: do stuff with dailyLog
  const { dailyLog, focuses, currentFocus: currentFocusId } = data;

  // const currentFocus = focuses.find((focus) => focus.id === currentFocusId);

  const currentFocusElem = document.querySelector(".currentFocus");

  // start of custom select
  const customSelectHidden = document.querySelector(".customSelectHidden");

  const customSelect = document.createElement("div");
  customSelect.classList.add("customSelect");

  const customSelectButton = document.createElement("button");
  customSelectButton.classList.add("customSelectButton");
  customSelectButton.innerText = "Focus"; // TODO: change button text based on selection
  customSelectButton.addEventListener("click", () => {
    // if (customSelect.classList.contains("expanded"))
    //   customSelect.classList.remove("expanded");
    // else customSelect.classList.add("expanded");
    customSelect.classList.toggle("expanded");
  });

  const customSelectDropdown = document.createElement("ul");
  customSelectDropdown.classList.add("customSelectDropdown");

  for (const option of customSelectHidden.querySelectorAll("option")) {
    // const optionDiv = document.createElement("div");
    const optionItem = document.createElement("li");
    optionItem.classList.add("customSelectOption");
    optionItem.dataset.id = option.value;

    const optionInput = document.createElement("input");
    optionInput.type = "radio";
    optionInput.id = `${customSelectHidden.dataset.name}_${option.value}`;
    optionInput.name = customSelectHidden.dataset.name;
    optionInput.value = option.value;
    optionInput.checked = option.selected;
    if (option.selected) customSelectButton.innerText = option.innerText;
    optionInput.addEventListener("change", () => {
      // TODO: figure out if these really need to be in sync
      customSelectHidden.value = optionInput.value;
      customSelectButton.innerText = option.innerText;
      customSelect.classList.remove("expanded");
    });

    const optionLabel = document.createElement("label");
    optionLabel.htmlFor = `${customSelectHidden.dataset.name}_${option.value}`;
    optionLabel.innerText = option.innerText;

    optionItem.append(optionInput, optionLabel);
    customSelectDropdown.append(optionItem);
    // customSelect.append(optionDiv);
  }

  customSelect.append(customSelectButton, customSelectDropdown);
  customSelectHidden.after(customSelect);
  // end of custom select

  const currentFocusIcon = currentFocusElem.querySelector(
    ".currentFocusIcon > img"
  );
  const currentFocusName = currentFocusElem.querySelector(".currentFocusName");
  const currentFocusTime = currentFocusElem.querySelector(".currentFocusTime");
  const currentFocusTimeToday = currentFocusTime.querySelector(
    ".currentFocusTimeToday"
  );
  const currentFocusTimeSession = currentFocusTime.querySelector(
    ".currentFocusTimeSession"
  );
  const currentFocusTimeAvg = currentFocusTime.querySelector(
    ".currentFocusTimeAvg"
  );

  let currentFocus;

  updateCurrentFocusElem(focuses.find((focus) => focus.id === currentFocusId));

  // electronApi.onCurrentFocusUpdate((focusId, focus) => {
  electronApi.onCurrentFocusUpdate((updatedFocus) => {
    // console.log(focusId);
    // console.log(focus);
    console.log(`${updatedFocus.id} updated`);
    console.log(updatedFocus);
    updateCurrentFocusElem(updatedFocus);
  });

  setInterval(updateElapsedTimes);

  function updateCurrentFocusElem(_currentFocus) {
    currentFocus = _currentFocus;
    currentFocusIcon.src = `focus_icons/${currentFocus.icon}.svg`;
    currentFocusName.innerText = currentFocus.name;
    // currentFocusTimeToday.innerText = Date.now() - currentFocus.selectedSince;
    updateElapsedTimes();
  }

  function updateElapsedTimes() {
    const selectedDuration = currentFocus
      ? Date.now() - currentFocus.selectedSince
      : "";
    currentFocusTimeSession.innerText = formatElapsedTime(selectedDuration);
  }

  function formatElapsedTime(ms) {
    const units = [
      { label: "h", value: 1000 * 60 * 60 },
      { label: "m", value: 1000 * 60 },
      { label: "s", value: 1000 },
    ];

    let remaining = ms;
    let formattedString = "";

    // for (const unit of units) {
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const count = Math.floor(remaining / unit.value);
      remaining %= unit.value;
      if (count === 0 && !formattedString && i !== units.length - 1) continue;
      formattedString += ` ${count}${unit.label}`;
      formattedString = formattedString.trim();
    }

    return formattedString;
  }

  // const focusesElem = document.querySelector(".focuses");

  const focusesTableBody = document.querySelector("table.focuses tbody");

  for (const focus of focuses) {
    createFocusElem(focus);
  }

  const newFocusBtn = document.querySelector(".newFocus");

  newFocusBtn.addEventListener("click", () => {
    // const newFocus = electronApi.createFocus();
    // console.log(newFocus);
    // console.log("create new focus");
    // createFocusElem(newFocus);
    electronApi.createFocus().then((newFocus) => {
      // console.log(newFocus);
      // console.log("create new focus");
      createFocusElem(newFocus, true);
    });
  });

  function createFocusElem(focus, selectNameInput) {
    const focusRow = document.createElement("tr");
    focusRow.dataset.id = focus.id;

    // const focusElem = document.createElement("td");
    // focusElem.classList.add("focus");
    // focusRow.dataset.id = focus.id;

    const focusIconCell = document.createElement("td");
    focusIconCell.classList.add("focusIcon");
    // TODO: make this a button
    const focusIcon = document.createElement("img");
    // focusIcon.src = "trayIcon_16x16.png"; // TODO: replace with selected icon
    // TODO: create function for getting icon path
    focusIcon.src = `focus_icons/${focus.icon}.svg`;
    focusIconCell.append(focusIcon);
    focusRow.append(focusIconCell);

    focusIcon.addEventListener("click", (e) => {
      if (document.querySelector(".focusSelect")) return;
      e.stopPropagation();
      const focusSelect = document.createElement("div");
      focusSelect.classList.add("focusSelect");
      for (const item of focusIcons) {
        const itemSrc = `focus_icons/${item}.svg`;
        const focusSelectItem = document.createElement("button");
        focusSelectItem.classList.add("focusSelectItem");
        focusSelectItem.addEventListener("click", (e) => {
          console.log(item);
          focusIcon.src = itemSrc;
          electronApi
            .updateFocusIcon(focus.id, item)
            .then((result) => console.log(result));
        });
        const focusSelectImage = document.createElement("img");
        focusSelectImage.src = itemSrc;
        focusSelectItem.append(focusSelectImage);
        focusSelect.append(focusSelectItem);
      }
      focusIconCell.append(focusSelect);
    });

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

    focusNameInput.addEventListener("input", updateNameElemWidth);

    focusNameInput.addEventListener("change", (e) => {
      electronApi
        .updateFocusName(focus.id, focusNameInput.value)
        .then((result) => console.log(result));
    });

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
    updateNameElemLimits();
    updateDisplayedDailyGoal();
    dailyGoalInputWrapper.append(dailyGoalInput, dailyGoalUnit);
    dailyGoalCell.append(dailyGoalInputWrapper);
    // dailyGoalCell.append(dailyGoalInputWrapper);
    focusRow.append(dailyGoalCell);

    const deleteCell = document.createElement("td");
    deleteCell.classList.add("deleteFocus");
    const deleteBtn = document.createElement("button");
    const deleteBtnImage = document.createElement("img");
    deleteBtnImage.src = "trash.svg";
    deleteBtn.append(deleteBtnImage);
    deleteCell.append(deleteBtn);
    focusRow.append(deleteCell);

    deleteBtn.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this focus?")) return;
      electronApi.deleteFocus(focus.id).then((result) => {
        console.log(result);
        if (!result.success) return;
        focusRow.remove();
      });
      // console.log("delete focus");
    });

    // setInterval(() => {
    //   console.log(dailyGoalInput.selectionStart);
    // }, 100);

    dailyGoalInput.addEventListener("input", (e) => {
      if (dailyGoalInput.value.length > 3) {
        let newValue = String(dailyGoalInput.value).slice(0, 3);
        newValue = newValue.endsWith(".")
          ? newValue.slice(0, newValue.length - 1)
          : newValue;
        dailyGoalInput.value = newValue;
      }
      // console.log();
      // console.log(dailyGoalInput);
      // console.log(String(dailyGoalInput.value).slice(0, 3));
      updateDatasetDailyGoal();
      updateUnitElemWidth();
    });

    dailyGoalInput.addEventListener("change", (e) => {
      electronApi
        .updateFocusGoal(focus.id, dailyGoalInput.dataset.valueMs)
        .then((result) => console.log(result));
    });

    dailyGoalUnit.addEventListener("click", (e) => {
      dailyGoalInput.focus();
      const newUnit =
        dailyGoalUnit.dataset.unit === "hours" ? "minutes" : "hours";
      dailyGoalUnit.dataset.unit = newUnit;
      dailyGoalUnit.innerText = newUnit;
      updateNameElemLimits();
      updateDisplayedDailyGoal();
    });

    updateNameElemWidth();
    // updateUnitElemWidth();

    document.body.addEventListener("click", () => {
      const focusSelect = document.querySelector(".focusSelect");
      if (focusSelect) focusSelect.remove();
    });

    focusesTableBody.append(focusRow);

    // console.log("focus?");
    // console.log(selectNameInput);

    if (selectNameInput) {
      focusNameInput.focus();
      focusNameInput.select();
    }

    function updateNameElemLimits() {
      const unit = dailyGoalUnit.dataset.unit;
      const min = 0;
      const max = unit === "hours" ? 24 : 60 * 24;
      dailyGoalInput.min = min;
      dailyGoalInput.max = max;
    }

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
      // const displayValue =
      //   dailyGoalUnit.dataset.unit === "minutes"
      //     ? Math.round(valueMs / getMsInUnit())
      //     : valueMs / getMsInUnit();
      const displayValue = Math.round((valueMs / getMsInUnit()) * 100) / 100;
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
  }
})();
