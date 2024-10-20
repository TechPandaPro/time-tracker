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

  document.addEventListener("click", (e) => {
    // if (e.target.matches(".customSelect *")) return;
    const allCustomSelectExpanded = document.querySelectorAll(
      ".customSelect.expanded"
    );
    for (const customSelectExpanded of allCustomSelectExpanded) {
      if (customSelectExpanded.contains(e.target)) continue;
      customSelectExpanded.classList.remove("expanded");
    }
  });

  const currentFocusElem = document.querySelector(".currentFocus");

  const focusSelectInput = currentFocusElem.querySelector(
    '.customSelectHidden[data-name="focusSelectInput"]'
  );

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

  for (const focus of focuses) {
    const focusOption = document.createElement("option");
    focusOption.value = focus.id;
    focusOption.dataset.icon = focus.icon;
    focusOption.innerText = focus.name;
    focusSelectInput.append(focusOption);
    console.log(JSON.stringify(focus, 0, 2));
    console.log(focus.name);
    console.log(focusOption.cloneNode(true));
  }

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

  updateCustomSelects();

  // FIXME: prevent page from shifting when calling function ?
  function updateCustomSelects() {
    for (const existingCustomSelect of document.querySelectorAll(
      ".customSelect"
    ))
      existingCustomSelect.remove();

    // const customSelectHidden = document.querySelector(".customSelectHidden");

    for (const customSelectHidden of document.querySelectorAll(
      ".customSelectHidden"
    )) {
      const customSelect = document.createElement("div");
      customSelect.classList.add("customSelect");

      const customSelectButton = document.createElement("button");
      customSelectButton.classList.add("customSelectButton");

      // customSelectButton.innerText = "Focus"; // TODO: change button text based on selection

      const customSelectButtonImg = document.createElement("img");
      customSelectButtonImg.width = 16;
      customSelectButtonImg.height = 16;
      customSelectButtonImg.src = `focus_icons/unknown.png`;
      // customSelectButton.append(customSelectButtonImg);

      const customSelectButtonText = document.createElement("span");
      customSelectButtonText.innerText = "Focus";

      customSelectButton.append(customSelectButtonImg, customSelectButtonText);

      customSelectButton.addEventListener("click", () => {
        // if (customSelect.classList.contains("expanded"))
        //   customSelect.classList.remove("expanded");
        // else customSelect.classList.add("expanded");
        customSelect.classList.toggle("expanded");

        customSelect.scrollTo(0, 0);
        const selectedLabel = customSelect.querySelector(
          ".customSelectOption input:checked ~ label"
        );
        // const selectedLabelPos = selectedLabel.getBoundingClientRect();
        // setTimeout(() => {
        //   if (selectedLabel) selectedLabel.scrollIntoView();
        // }, 500);
        const top = selectedLabel.offsetTop;
        if (
          selectedLabel.offsetTop + selectedLabel.offsetHeight >
          customSelectDropdown.offsetHeight
        ) {
          customSelectDropdown.scrollTo(
            0,
            selectedLabel.offsetTop -
              customSelectDropdown.offsetHeight / 2 +
              selectedLabel.offsetHeight / 2
          );
        }
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
        if (option.selected) {
          // console.log(`set to ${option.dataset.icon}`);
          // console.log(customSelectButtonImg);
          customSelectButtonImg.src = `focus_icons/${option.dataset.icon}.png`;
          customSelectButtonText.innerText = option.innerText;
        }
        optionInput.addEventListener("change", () => {
          // TODO: figure out if these really need to be in sync
          customSelectHidden.value = optionInput.value;
          customSelectButtonText.innerText = option.innerText;
          // customSelect.classList.remove("expanded");
          handleSelectOptionChange(
            customSelectHidden.dataset.name,
            customSelectHidden.value
          );
        });

        const optionLabel = document.createElement("label");
        optionLabel.htmlFor = `${customSelectHidden.dataset.name}_${option.value}`;
        // optionLabel.innerText = option.innerText;

        const optionLabelImg = document.createElement("img");
        optionLabelImg.width = 16;
        optionLabelImg.height = 16;
        optionLabelImg.src = `focus_icons/${option.dataset.icon}.png`;
        // customSelectButton.append(customSelectButtonImg);

        const optionLabelText = document.createElement("span");
        optionLabelText.innerText = option.innerText;

        optionLabel.append(optionLabelImg, optionLabelText);

        optionLabel.addEventListener("click", () => {
          customSelect.classList.remove("expanded");
        });

        optionItem.append(optionInput, optionLabel);
        customSelectDropdown.append(optionItem);
        // customSelect.append(optionDiv);
      }

      customSelect.append(customSelectButton, customSelectDropdown);
      customSelectHidden.after(customSelect);
    }
  }

  function handleSelectOptionChange(selectName, newValue) {
    switch (selectName) {
      case "focusSelectInput":
        console.log(newValue);
        electronApi.setFocus(newValue).then((result) => {
          console.log(result);
          if (!result.success) return;
          // focusRow.remove();
          // nothing else needs to happen, since onCurrentFocusUpdate will be called
        });
        break;
      default:
        console.log(`Select menu with name "${selectName}" not recognized`);
    }
  }

  function updateCurrentFocusElem(_currentFocus) {
    currentFocus = _currentFocus;

    // console.log(currentFocus.id);
    focusSelectInput.value = currentFocus.id;
    const toUpdateSelectOption =
      focusSelectInput.querySelector("option:checked");
    toUpdateSelectOption.innerText = currentFocus.name;
    toUpdateSelectOption.dataset.icon = currentFocus.icon;
    // console.log(focusSelectInput.value);
    // console.log(currentFocus.id);
    // console.log(focusSelectInput.cloneNode());
    // console.log(focusSelectInput.value);
    // console.log(toUpdateSelectOption);
    // console.log(currentFocus.id);
    // console.log(currentFocus.name);
    // console.log("update these!");
    updateCustomSelects();

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

      const focusOption = document.createElement("option");
      focusOption.value = newFocus.id;
      focusOption.dataset.icon = newFocus.icon;
      focusOption.innerText = newFocus.name;
      focusSelectInput.append(focusOption);
      updateCustomSelects();
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
          electronApi.updateFocusIcon(focus.id, item).then((result) => {
            console.log(result);
            if (!result.success) return;
            const thisFocusOption = focusSelectInput.querySelector(
              `option[value="${focus.id}"]`
            );
            if (thisFocusOption) {
              thisFocusOption.dataset.icon = item;
              updateCustomSelects();
            }

            // const toUpdateSelectOption = focusSelectInput.querySelector(
            //   `option[value="${focus.id}"]`
            // );
            // focusSelectInput.value = currentFocus.id;
            // toUpdateSelectOption.innerText = currentFocus.name;
            // toUpdateSelectOption.dataset.icon = currentFocus.icon;
            // console.log(focusSelectInput.value);
            // console.log(currentFocus.id);
            // console.log(focusSelectInput.cloneNode());
            // console.log(focusSelectInput.value);
            // updateCustomSelects();
          });
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
        .then((result) => {
          console.log(result);
          if (!result.success) return;
          const thisFocusOption = focusSelectInput.querySelector(
            `option[value="${focus.id}"]`
          );
          if (thisFocusOption) {
            thisFocusOption.innerText = focusNameInput.value;
            updateCustomSelects();
          }
        });
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
      if (
        !confirm(
          "Are you sure you want to delete this focus? This will erase all logs for this focus."
        )
      )
        return;
      electronApi.deleteFocus(focus.id).then((result) => {
        console.log(result);
        if (!result.success) return;
        focusRow.remove();
        focusSelectInput.querySelector(`option[value="${focus.id}"]`)?.remove();
        updateCustomSelects();
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
