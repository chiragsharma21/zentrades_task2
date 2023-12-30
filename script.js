var displayedFields = document.getElementById('displayedFields');

function enableStep2() {
    var fileInput = document.getElementById('fileInput');
    var fileType = document.getElementById('fileType');
    var encoding = document.getElementById('encoding');
    var hasHeader = document.getElementById('hasHeader');

    fileType.disabled = !fileInput.files[0];
    encoding.disabled = !fileInput.files[0];
    hasHeader.disabled = !fileInput.files[0];
}

function moveSelected(sourceId, targetId) {
    var source = document.getElementById(sourceId);
    var target = document.getElementById(targetId);

    // Keep track of unique values in target list
    var targetValues = Array.from(target.options).map(option => option.value);

    Array.from(source.selectedOptions).forEach(option => {
        // Check if the value is not already in the target list
        if (!targetValues.includes(option.value)) {
            target.add(new Option(option.text, option.value));
            targetValues.push(option.value);
        }
        option.remove();
    });
}


function nextStep() {
    var fileInput = document.getElementById('fileInput');
    var fileTypeDropdown = document.getElementById('fileType');
    var selectedFileType = fileTypeDropdown.value.toLowerCase();
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var fileContent = event.target.result;

            try {
                var data;
                if (selectedFileType === 'csv') {
                    if (!file.name.toLowerCase().endsWith('.csv')) {
                        throw new Error('Selected file type does not match the actual file format.');
                    }
                    data = parseCSV(fileContent);
                } else if (selectedFileType === 'json') {
                    if (!file.name.toLowerCase().endsWith('.json')) {
                        throw new Error('Selected file type does not match the actual file format.');
                    }
                    data = JSON.parse(fileContent);
                } else {
                    throw new Error('Unsupported file type. Please select either CSV or JSON.');
                }

                var products = data.products;

                // Sort products based on descending popularity
                var sortedProducts = Object.values(products).sort((a, b) => b.popularity - a.popularity);

                // Display data with the initially selected fields
                displayDataInTable(sortedProducts, getSelectedFields());
                alert("Swipe down to see displayed fields.");
            } catch (error) {
                console.error("Error:", error.message);
                alert(error.message);
            }
        };

        reader.readAsText(file);
    } else {
        alert("Please choose a file before proceeding.");
    }
}

// Helper function to parse CSV content (assuming comma as delimiter)
function parseCSV(csvContent) {
    // Implement your CSV parsing logic here
    // This is just a simple example, you may need a more robust CSV parser
    var lines = csvContent.split('\n');
    var headers = lines[0].split(',');
    var products = {};

    for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',');
        var products = values[0];
        products[products] = {};

        for (var j = 1; j < headers.length; j++) {
            products[products][headers[j]] = values[j];
        }
    }

    return { products: products };
}


function displayDataInTable(products, selectedFields) {
    // Clear previously displayed data
    clearTable();

    var table = document.createElement('table');
    table.classList.add('result-table');

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    selectedFields.forEach(field => {
        var th = document.createElement('th');
        th.textContent = field;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    Object.entries(products).forEach(([products, product]) => {
        var tr = document.createElement('tr');
        selectedFields.forEach(field => {
            var td = document.createElement('td');

            // Display product ID if the field is "productId"
            if (field === "product id") {
                td.textContent = products;
            } else {
                td.textContent = product[field] || ''; // Use empty string if the field is not present
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    document.body.appendChild(table);
}


function clearTable() {
    // Remove any previously displayed table
    var existingTable = document.querySelector('.result-table');
    if (existingTable) {
        existingTable.remove();
    }
}

function getSelectedFields() {
    return Array.from(displayedFields.options).map(option => option.value);
}

function cancel() {
    clearTable();
    alert("Table Cleared.");
}

// Listen for changes in displayed fields and update the table accordingly
displayedFields.addEventListener('change', function () {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var fileContent = event.target.result;

            try {
                var data = JSON.parse(fileContent);
                var products = data.products;

                // Sort products based on descending popularity
                var sortedProducts = Object.values(products).sort((a, b) => b.popularity - a.popularity);

                // Display data with the updated selected fields
                displayDataInTable(sortedProducts, getSelectedFields());
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };

        reader.readAsText(file);
    } else {
        alert("Please choose a file before proceeding.");
    }
});
