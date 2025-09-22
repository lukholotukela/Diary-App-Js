let formattedEntry;
let rawtext;
const entryDisplay = document.getElementById("entry-display");
document
  .getElementById("file-input")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.querySelector(".save-entry").classList.remove("inactive");
        rawtext = e.target.result;
        formattedEntry = renderEntry(rawtext);
        displayEntry();
      };
      reader.readAsText(file);
    } else {
      alert("Invalid file format. Please upload a .txt file.");
    }
  });

function displayEntry() {
  entryDisplay.innerHTML = formattedEntry;
  const textInputs = document.querySelectorAll(".section-input");
  textInputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newValue = e.target.value;
        const index = parseInt(e.target.dataset.index, 10);
        sectionConfig[index].title = newValue;
        sectionConfig[index].input = newValue;
        e.target.previousElementSibling.textContent = newValue;
        // Reassign formattedEntry with the new entry-display innerHTML
        formattedEntry = entryDisplay.innerHTML;
      }
    });
  });
}

// Create UI to save the formattedEntry to localStorage and allow the user to give it a new name
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const overlayAndModal = [modal, overlay];
document.getElementById("open-modal-box").addEventListener("click", () => {
  overlayAndModal.forEach((e) => e.classList.remove("inactive"));
  closeModal();
});

let finalEntry = "";
document.getElementById("save-button").addEventListener("click", () => {
  const saveName = document.getElementById("entry-name").value;
  finalEntry = { text, config: sectionConfig };
  if (saveName) {
    localStorage.setItem(saveName, JSON.stringify(finalEntry));
    console.log("Saved to localStorage!");
    overlayAndModal.forEach((e) => e.classList.add("inactive"));
    refreshEntries();
  }
});

// Close the modal
function closeModal() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".close-modal, .overlay")) {
      overlayAndModal.forEach((e) => e.classList.add("inactive"));
    }
  });
}

// Display the saved entries
let savedEntries = document.getElementById("saved-entries-display");
let savedEntriesNames = [];
function previousEntries() {
  for (let i = 0; i < localStorage.length; i++) {
    savedEntriesNames.push(localStorage.key(i));
    savedEntries.innerHTML += `
      <div id="entry-${i}" data-index="${i}" class="entry-blocks">
        <p>
          ${savedEntriesNames[i]}
        </p>
      </div>
      <button id="delete-${i}" data-index="${i}" class="delete-blocks">
          &times;
      </button>
    `;
  }
}

previousEntries();

function refreshEntries() {
  savedEntriesNames = [];
  savedEntries.innerHTML = "<h2>Saved Entries</h2>";
  previousEntries();
  deleteOnClickListener();
  savedEntryListener();
}

// Modify Entry list
const entryBlocks = document.querySelectorAll(".entry-blocks");
function savedEntryListener() {
  entryBlocks.forEach((element) => {
    element.addEventListener("click", () => {
      const entryJSON = localStorage.getItem(
        localStorage.key(element.getAttribute("data-index"))
      );
      const entryObj = JSON.parse(entryJSON);
      sectionConfig = entryObj.config;
      formattedEntry = renderEntry(entryObj.rawtext);
      displayEntry();
    });
  });
}
savedEntryListener();

// Delete entries
function deleteOnClickListener() {
  const deleteBlocks = document.querySelectorAll(".delete-blocks");
  deleteBlocks.forEach((e) => {
    e.addEventListener("click", () => {
      localStorage.removeItem(localStorage.key(e.getAttribute("data-index")));
      refreshEntries();
    });
  });
}
deleteOnClickListener();

// Configuration for sections
const defaultConfig = [
  {
    title: "Today's Goals",
    tag: "h2",
    class: "goals",
    input: "",
  },
  {
    title: "4 Hour Schedule",
    tag: "h2",
    class: "schedule",
    input: "",
  },
  {
    title: "Notes",
    tag: "h2",
    class: "notes",
    input: "",
  },
  {
    title: "Typing Practice",
    tag: "h2",
    class: "typing",
    input: "",
  },
];

let sectionConfig = [];

function renderEntry(text) {
  // Use line break to split text to seperate lines
  const lines = text.split("\n");
  let formattedEntry = "";
  let isGoalsList = false;
  let isNotesList = false;
  let currentSection = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      // Close lists on blank lines
      if (isGoalsList) {
        formattedEntry += `</ul>`;
        isGoalsList = false;
      }
      if (isNotesList) {
        formattedEntry += `</ol>`;
        isNotesList = false;
      }
      formattedEntry += `<br>`;
    }
    // Date header
    else if (
      trimmedLine.includes("MONDAY") ||
      trimmedLine.includes("TUESDAY") ||
      trimmedLine.includes("WEDNESDAY") ||
      trimmedLine.includes("THURSDAY") ||
      trimmedLine.includes("FRIDAY") ||
      trimmedLine.includes("SATURDAY") ||
      trimmedLine.includes("SUNDAY")
    ) {
      // Close previous section if open
      if (currentSection) {
        formattedEntry += `</div>`;
        currentSection = null;
      }
      formattedEntry += `<h1>${trimmedLine}</h1>`;
    }
    // Section header from sectionConfig
    else if (sectionConfig.some((s) => trimmedLine.includes(s.title))) {
      // Close previous section if open
      if (currentSection) {
        formattedEntry += `</div>`;
      }
      const section = sectionConfig.find((s) => trimmedLine.includes(s.title));
      section.input = trimmedLine;
      formattedEntry += `<div class="${section.class}"><${section.tag}>${
        section.input
      }</${
        section.tag
      }><input type="text" class="section-input" data-index="${sectionConfig.indexOf(
        section
      )}" value="${section.input}">`;
      currentSection = section.class;
    }
    // Section headers from defaultConfig
    else if (defaultConfig.some((s) => trimmedLine.includes(s.title))) {
      // Close previous section if open
      if (currentSection) {
        formattedEntry += `</div>`;
      }
      const section = defaultConfig.find((s) => trimmedLine.includes(s.title));
      section.input = trimmedLine;
      formattedEntry += `<div class="${section.class}"><${section.tag}>${
        section.input
      }</${
        section.tag
      }><input type="text" class="section-input" data-index="${defaultConfig.indexOf(
        section
      )}" value="${section.input}">`;
      currentSection = section.class;
    }
    // Goals list
    else if (trimmedLine.startsWith(">")) {
      const newTrimmedLine = trimmedLine.replace(">", "").trim();
      if (!isGoalsList) {
        formattedEntry += `<ul>`;
        isGoalsList = true;
      }
      formattedEntry += `<li>${newTrimmedLine}</li>`;
    }
    // Notes list
    else if (trimmedLine.startsWith("-")) {
      const newTrimmedLine = trimmedLine.replace("-", "").trim();
      if (!isNotesList) {
        formattedEntry += `<ol>`;
        isNotesList = true;
      }
      formattedEntry += `<li>${newTrimmedLine}</li>`;
    }
    // Paragraphs or plain text
    else {
      formattedEntry += `<p>${trimmedLine}</p>`;
    }
  });

  // Close any open lists
  if (isGoalsList) formattedEntry += `</ul>`;
  if (isNotesList) formattedEntry += `</ol>`;

  // Close last open section
  if (currentSection) {
    formattedEntry += `</div>`;
  }

  return formattedEntry;
}
