console.log("hello world!");

const electronApi = window._electronApi;

(async () => {
  const focusIcons = ["bed", "book", "bug", "chart"];

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

    focusIcon.addEventListener("click", (e) => {
      if (document.querySelector(".focusSelect")) return;
      e.stopPropagation();
      const focusSelect = document.createElement("div");
      focusSelect.classList.add("focusSelect");
      for (const item of focusIcons) {
        const focusSelectItem = document.createElement("button");
        focusSelectItem.classList.add("focusSelectItem");
        const focusSelectImage = document.createElement("img");
        focusSelectImage.src = `focus_icons/${item}.svg`;
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

    focusNameInput.addEventListener("input", updateNameElemWidth);

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
