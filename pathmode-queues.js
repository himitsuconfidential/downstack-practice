// putting the environment variables or global variables up top
// not sure what we call these ...
let last_output = [
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ["G", "G", "G", "N", "N", "N", "G", "G", "G", "G"],
  ["G", "G", "G", "N", "N", "N", "G", "G", "G", "G"],
  ["G", "G", "G", "N", "N", "N", "G", "G", "G", "G"],
  ["G", "G", "G", "N", "N", "N", "G", "G", "G", "G"],
].reverse();

var weight_table = [
  [1, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
// this is a subset of the queues that solve 3x4 box.
var queues = [
  ["JILZ", "JIZL", "JZIL"], // Array with 48 elements
  ["TIJO", "TIOJ", "TOIJ"], // Array with 48 elements
  ["JILZ", "JLIZ", "LJIZ"], // Array with 48 elements
  ["LITO", "ILTO", "OITL"], // Array with 48 elements
  ["JLOZ", "JLZO", "LJSO"], // Array with 48 elements
  ["JOZL", "OJZL", "OJLZ"], // Array with 32 elements
  ["LSJT", "SLJT", "SLTJ"], // Array with 32 elements
  ["JZLO", "JZIL", "JZOL"], // Array with 32 elements
  ["TZLJ", "ZTLJ", "ZTJL"], // Array with 32 elements
  ["SLTJ", "LSTJ", "TSLJ"], // Array with 32 elements
  ["OJLZ", "JOLZ", "LOJS"], // Array with 32 elements
  ["JLZO", "JLZI", "LJZI"], // Array with 32 elements
  ["LJSO", "SJOL", "SJLO"], // Array with 32 elements
  ["SLTJ", "LSTJ", "LTSJ"], // Array with 32 elements
  ["TJZL", "TJLZ", "JTLZ"], // Array with 32 elements
];

// the variable distributedQueues keeps track of how we order the queues.
const distributedQueuesButton = document.getElementById(
  "toggleDistributedQueues",
);

let distributedQueues = distributedQueuesButton.checked;

distributedQueuesButton.addEventListener("change", function () {
  distributedQueues = distributedQueuesButton.checked;
});

document.addEventListener("DOMContentLoaded", () => {
  const fileInputMD = document.getElementById("mdFile");

  fileInputMD.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;
      const parsedData = parse_md_queues(text);
      queues = parsedData;
      weight_table = setup_weight_table(queues);
    };

    reader.readAsText(file);
  });
});

document.getElementById("txtFile").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    //document.getElementById('output').textContent = text;
    last_output = parse_last_output(text);
  };
  reader.readAsText(file);
});

function parse_last_output(text) {
  const lines = text.split("\n");
  const field = [];

  let insideField = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# Setup Field")) {
      insideField = true;
      continue;
    }

    if (insideField) {
      if (trimmed === "" || trimmed.startsWith("#")) break;

      // Convert each line into a row of G/N
      const row = [...trimmed].map((char) => (char === "X" ? "G" : "N"));
      field.push(row);
    }
  }

  // Pad with empty rows at the top to make it 20 rows tall
  const totalRows = 20;
  const numColumns = 10;
  const emptyRow = Array(numColumns).fill("N");

  const paddedField = [];

  const paddingCount = totalRows - field.length;
  for (let i = 0; i < paddingCount; i++) {
    paddedField.push([...emptyRow]);
  }

  // Then add the original rows
  paddedField.push(...field);

  return paddedField.reverse();
}
function setup_weight_table(queues) {
  let out = queues.map((subArr) => subArr.slice()); // copy the array queues to out
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out[i].length; j++) {
      out[i][j] = 0;
    }
  }
  return out;
}

function parse_md_queues(markdown) {
  const regex = /```(?:\r?\n)?([\s\S]*?)```/g;
  const result = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const content = match[1].trim(); // get the content inside the code block
    const patterns = content.split(",").map((p) => p.trim());
    if (patterns.length > 0 && patterns[0]) {
      result.push(patterns);
    }
  }

  return result;
}

function print_log() {
  console.log("last_output = " + last_output);
  console.log("queues = " + queues);
  console.log("weight_table = " + weight_table);
}

// function for parsing the path_minimal_strict_file.md and storing the
// information in a meaningful way
function parse_path_minimal_strict_file() {
  document.getElementById("mdFile").addEventListener("change", function (e) {});
}

function get_next_queue() {
  if (distributedQueues) {
    //if distributedQueues is enabled, we want to cycle throught the queues in an
    //interesting way. Basically I want it to not repeat a 'minimal' if
    //there has been a puzzle in that row already.
    return get_next_queue_helper();
  } else {
    //else let's just iterate through them.
    for (let i = 0; i < weight_table.length; i++) {
      for (let j = 0; j < weight_table[i].length; j++) {
        if (weight_table[i][j] == 0) {
          weight_table[i][j] += 1;
          return queues[i][j].split("");
        }
      }
    }
  }
}

function get_lowest_row(arr) {
  let minRowIndex = 0;
  let minRowSum = arr[0].reduce((acc, val) => acc + val, 0); // Sum of the first row

  // Loop through each row to find the row with the smallest sum of its elements
  for (let i = 1; i < arr.length; i++) {
    let rowSum = arr[i].reduce((acc, val) => acc + val, 0); // Sum of current row
    if (rowSum < minRowSum) {
      minRowSum = rowSum;
      minRowIndex = i;
    }
  }

  // Return the index of the row with the lowest sum of elements
  return minRowIndex;
}

function get_next_queue_helper() {
  print_log();
  let row = get_lowest_row(weight_table); // Get the row with the smallest minimum value
  console.log("row " + row);
  let lowestInRow = Math.min(...weight_table[row]); // Get the smallest value in that row
  console.log("lowestInRow " + lowestInRow);
  // Find the column index of the lowest value in that row
  let column = weight_table[row].indexOf(lowestInRow);
  console.log("column " + column);
  // Increment the weight value for that queue
  weight_table[row][column] += 1;

  // Return the corresponding queue as a string
  return queues[row][column].split("");
}

function find_lowest() {
  let lowest = 100;
  for (let i = 0; i < weight_table.length; i++) {
    for (let j = 0; j < weight_table[i].length; j++) {
      if (weight_table[i][j] < lowest) {
        lowest = weight_table[i][j];
      }
    }
  }
  console.log("lowest = " + lowest);
  return lowest;
}
