// Base path for fetching JSON files
var base_path = "https://raw.githubusercontent.com/cyroxx/demodiff_raw/main";


// Function to display an error message
function displayInfoMessage(message) {
  var infoMessage = document.getElementById("info-message");
  infoMessage.textContent = message;
  infoMessage.style.display = "block";
}

// Function to clear the error message
function clearInfoMessage() {
  var infoMessage = document.getElementById("info-message");
  infoMessage.textContent = "";
  infoMessage.style.display = "none";
}
// Function to display an error message
function displayErrorMessage(message) {
  var errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// Function to clear the error message
function clearErrorMessage() {
  var errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// Function to fetch and display JSON data
function fetchAndDisplayData(selectedFilename, topicQuery, page = 1, pageSize = 42) {
  fetch(base_path + "/" + selectedFilename + "?page=" + page + "&filter=" + encodeURIComponent(topicQuery))
    .then(response => response.json())
    .then(data => {
      var table = document.getElementById("table");
      var paginationContainer = document.getElementById("paginationContainer");

      // Clear previous table content
      table.querySelector("tbody").innerHTML = "";

      // Get the data from the "index" key
      var indexData = data["index"];

      // Check if the index data is an array
      if (Array.isArray(indexData)) {
        // Clear the error message if the data is successfully loaded
        clearErrorMessage();

        // Filter the data based on the topic query
        var filteredData = indexData;
        if (topicQuery) {
          filteredData = indexData.filter(obj => {
            for (var key in obj) {
              if (obj[key].toString().toLowerCase().includes(topicQuery.toLowerCase())) {
                return true;
              }
            }
            return false;
          });
        }

        // Apply pagination
        var totalItems = filteredData.length;
        var totalPages = Math.ceil(totalItems / pageSize);

        // Write total no of results into div
        if (totalItems === 0 || totalItems === 1) {
          document.getElementById('totalResults').innerHTML = "Diese Suche ergibt <i>" + totalItems + " Versammlung</i>.";
        } else {
          document.getElementById('totalResults').innerHTML = "Diese Suche ergibt <i>" + totalItems + " Versammlungen</i>.";
        }

        if (page > totalPages) {
          page = totalPages;
        }

        var startIndex = Math.max(0, page - 2);
        var endIndex = Math.min(totalPages, page + 2);
        var visibleData = filteredData.slice(startIndex * pageSize, endIndex * pageSize);

        // Iterate over the filtered data and create table rows
        visibleData.forEach(function(obj) {
          var row = table.querySelector("tbody").insertRow();
          var columns = ['id', 'datum', 'von', 'bis', 'thema', 'plz', 'strasse_nr', 'aufzugsstrecke'];

          columns.forEach(function(key) {
            var cell = row.insertCell();
            var cellValue = obj[key];
            if (topicQuery) {
              // Highlight the matched text in all fields using <mark> element
              cellValue = cellValue.toString().replace(new RegExp(topicQuery, "gi"), function(match) {
                return "<mark>" + match + "</mark>";
              });
            }

            if (key.replace("entry-", "") === "id") {
              var url = new URL(window.location);
              url.searchParams.set("timestamp", dropdown.value);
              url.searchParams.set("filter", topicInput.value);
              url.searchParams.set("page", page);

              cellValue = "<span id='entry-" + cellValue + "'></span><a class='identifier' href='" + url.href.toString().replace(/#.*/, "") + "#entry-" + cellValue + "'>" +  cellValue + "</a>";
            }

            if (cellValue === '') {
              cellValue = "&mdash;";
            }

            cell.innerHTML = cellValue;
          });
        });



        // Generate pagination links
        paginationContainer.innerHTML = "";

        if (totalPages > 1) {
          if (startIndex > 0) {
            var firstLink = document.createElement("a");
            firstLink.href = "?page=1";
            firstLink.textContent = "1";
            firstLink.addEventListener("click", function(event) {
              event.preventDefault();
              fetchAndDisplayData(selectedFilename, topicQuery, 1, pageSize);
            });
            paginationContainer.appendChild(firstLink);

            if (startIndex > 1) {
              var prevLink = document.createElement("span");
              prevLink.href = "?page=" + (startIndex - 1);
              prevLink.textContent = "...";
              prevLink.addEventListener("click", function(event) {
                event.preventDefault();
                fetchAndDisplayData(selectedFilename, topicQuery, startIndex - 1, pageSize);
              });
              paginationContainer.appendChild(prevLink);
            }
          }

          for (var i = startIndex; i <= endIndex; i++) {
            var link = document.createElement("a");
            link.href = "?page=" + i;
            link.textContent = i;
            link.addEventListener("click", function(pageNum) {
              return function(event) {
                event.preventDefault();
                fetchAndDisplayData(selectedFilename, topicQuery, pageNum, pageSize);
              };
            }(i));

            if (i === page) {
              link.classList.add("active");
            }

            paginationContainer.appendChild(link);
          }

          if (endIndex < totalPages) {
            if (endIndex < totalPages - 1) {
              var nextLink = document.createElement("span");
              nextLink.href = "?page=" + (endIndex + 1);
              nextLink.textContent = "...";
              nextLink.addEventListener("click", function(event) {
                event.preventDefault();
                fetchAndDisplayData(selectedFilename, topicQuery, endIndex + 1, pageSize);
              });
              paginationContainer.appendChild(nextLink);
            }

            var lastLink = document.createElement("a");
            lastLink.href = "?page=" + totalPages;
            lastLink.textContent = totalPages;
            lastLink.addEventListener("click", function(event) {
              event.preventDefault();
              fetchAndDisplayData(selectedFilename, topicQuery, totalPages, pageSize);
            });
            paginationContainer.appendChild(lastLink);
          }
        }

        // Get all child elements of the pagination
        const childElements = paginationContainer.children;
        
        // Loop through the child elements
        for (let i = childElements.length - 1; i >= 0; i--) {
          const element = childElements[i];
        
          // Check if the innerHTML is equal to zero
          if (element.innerHTML === '0') {
            // Remove the element from its parent
            element.parentNode.removeChild(element);
          }
        }

      } else {
        // Display an error message if the index data is not an array
        displayErrorMessage("Ung\u00fcltiges Datenformat.");
      }
    })
    .catch(error => {
      // Display an error message if there is an error fetching or parsing the JSON data
      displayErrorMessage("Fehler beim Abrufen der JSON-Daten.");
      console.log("Error fetching JSON:", error);
    });
}

// Fetch the JSON file from the summary URL
fetch(base_path + "/summary/file_dict.json")
  .then(response => response.json())
  .then(data => {
    var dropdown = document.getElementById("dropdown");
    var topicInput = document.getElementById("topicInput");
    var resetButton = document.getElementById("resetButton");
    var copyLinkButton = document.getElementById("copyLinkButton");

    // Iterate over the keys in the JSON data
    Object.keys(data).forEach(function(key) {
      // Create an option element for each key
      var option = document.createElement("option");
      option.value = key;
      option.text = key;

      dropdown.appendChild(option);
    });

    // Get the timestamp, page and filter from the URL
    var pageParams = new URLSearchParams(window.location.search);
    var page = parseInt(pageParams.get("page")) || 1;
    var timestamp = pageParams.get("timestamp");
    var filter = pageParams.get("filter");

    if (timestamp) {
      // Pre-select the option based on the timestamp fromthe URL
      dropdown.value = timestamp;
    } else {
      // Select the last option by default if no timestamp is specified in the URL
      dropdown.selectedIndex = dropdown.options.length - 1;
    }

    // Set the topic filter input value
    topicInput.value = filter || '';

    // Get the initially selected filename
    var initiallySelectedFilename = data[dropdown.value];

    // Fetch and display the initially selected data
    fetchAndDisplayData(initiallySelectedFilename, filter, page);

    // Handle dropdown change event
    dropdown.addEventListener("change", function() {
      var selectedFilename = data[this.value];
      var topicQuery = topicInput.value;
      fetchAndDisplayData(selectedFilename, topicQuery);

      // Update the URL with the selected timestamp and filter
      var url = new URL(window.location);
      url.searchParams.set("page", 1);
      url.searchParams.set("timestamp", this.value);
      url.searchParams.set("filter", topicQuery);
      window.history.pushState(null, null, url);
    });

    // Handle topic input event
    topicInput.addEventListener("input", function() {
      var selectedFilename = data[dropdown.value];
      var topicQuery = this.value;
      fetchAndDisplayData(selectedFilename, topicQuery);
    });

    // Handle reset button click event
    resetButton.addEventListener("click", function() {
      window.location.replace("/");
    });

    // Handle copy link button click event
    copyLinkButton.addEventListener("click", function() {
      var url = new URL(window.location);
      url.searchParams.set("timestamp", dropdown.value);
      url.searchParams.set("filter", topicInput.value);
      url.searchParams.set("page", page);

      navigator.clipboard.writeText(url.href)
        .then(function() {
          console.log("Link copied to clipboard.");
          displayInfoMessage("Der Link wurde in die Zwischenablage kopiert.");
        })
        .catch(function(error) {
          console.error("Error copying link to clipboard:", error);
        });
    });
  })
  .catch(error => {
    // Display an error message if there is an error fetching or parsing the summary JSON data
    displayErrorMessage("Fehler beim Abrufen der Zusammenfassungs-JSON-Daten.");
    console.log("Error fetching JSON:", error);
  });
