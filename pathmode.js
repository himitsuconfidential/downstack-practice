var game = new Game();

console.log(
  "game.tetramino is: " +
    game.tetramino +
    ".JSON.stringify(game.to_shape()) is: " +
    JSON.stringify(game.to_shape()),
);

const Keybind = { keydown: {}, keyup: {} };

var Config = {
  das: 100,
  arr: 0,
  delay: 0,
  pressing_left: false,
  pressing_right: false,
  pressing_down: false,
  pressing: {},
  skim_ind: true,
  mdhole_ind: false,
  unqiue_ind: true,
  auto_next_ind: true,
  mode: "Path Mode",
  no_of_unreserved_piece: 7,
  no_of_piece: 7,
  no_of_trial: 0,
  no_of_success: 0,
};

var Customized_key = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "Space",
  "KeyZ",
  "KeyX",
  "KeyA",
  "ShiftLeft",
  "KeyR",
  "KeyP",
];

var board = document.getElementById("board");

const clone = (items) =>
  items.map((item) => (Array.isArray(item) ? clone(item) : item));

function clone2d(arr) {
  var newarr = [];
  for (var sub_arr of arr) {
    newarr.push([...sub_arr]);
  }
  return newarr;
}

fetch("./usermode.json")
  .then((results) => results.json())
  .then((d) => {
    jsondata = d;
  });

/*
0. sound effect
*/

const sound = {
  0: new Audio("sound/1.ogg"),
  1: new Audio("sound/2.ogg"),
  2: new Audio("sound/3.ogg"),
  3: new Audio("sound/4.ogg"),
  4: new Audio("sound/5.ogg"),
  5: new Audio("sound/6.ogg"),
  6: new Audio("sound/7.ogg"),
  win: new Audio("sound/win.ogg"),
  lose: new Audio("sound/lose.ogg"),
};

function play_sound() {
  if (game.combo >= 0) {
    //console.log('sing', game.combo)
    sound[Math.min(6, game.combo)].cloneNode().play();
  }
}

/*
1. html related
*/

function load_setting() {
  try {
    var storage = localStorage.getItem("Customized_key");
    if (storage != null) {
      Customized_key = JSON.parse(storage);
      Config.das = parseInt(localStorage.getItem("das"));
      if (!(Config.das >= 1 && Config.das <= 200)) {
        Config.das = 100;
      }
      Config.arr = parseInt(localStorage.getItem("arr"));
      if (!(Config.arr >= 0 && Config.arr <= 100)) {
        Config.arr = 0;
      }
      Config.auto_next_ind = localStorage.getItem("auto_next_ind") != "false";
    }
  } catch (err) {
    localStorage.clear();
    console.log("storage corrupted");
  }
  for (var i = 0; i < 10; i++) {
    document.getElementById("input" + (i + 1)).value = Customized_key[i];
  }
  document.getElementById("input11").value = Config.das;
  document.getElementById("input12").value = Config.arr;
  document.getElementById("input12.1").checked = Config.auto_next_ind;
}

function load_gamemode() {
  var text = "";
  for (var modname in jsondata) {
    text += `<option value="${modname}">${modname}</option>`;
  }
  text += '<option value="customized">customized</option>';
  //document.getElementById('input13').innerHTML = text;
}

function save_setting() {
  console.log("inside save_setting()");
  for (var i = 0; i < 10; i++) {
    Customized_key[i] = document.getElementById("input" + (i + 1)).value;
  }
  Config.das = parseInt(document.getElementById("input11").value);
  if (!(Config.das >= 1 && Config.das <= 200)) {
    alert("DAS should be between 1 to 200");
    Config.das = 100;
  }
  Config.arr = parseInt(document.getElementById("input12").value);
  if (!(Config.arr >= 0 && Config.arr <= 100)) {
    alert("ARR should be between 0 to 100");
    Config.arr = 0;
  }

  Config.auto_next_ind = document.getElementById("input12.1").checked;
  update_keybind();
  localStorage.setItem("auto_next_ind", Config.auto_next_ind);
  localStorage.setItem("Customized_key", JSON.stringify(Customized_key));
  localStorage.setItem("das", Config.das);
  localStorage.setItem("arr", Config.arr);
}

function save_gamemode() {
  console.log("inside save_gamemode");
  //var selection = document.getElementById('input13')
  //Config.mode = selection.options[selection.selectedIndex].value
}

/*
2. render
*/
function render() {
  var ctx = document.getElementById("board").getContext("2d");
  ctx.clearRect(0, 0, 520, 610);
  // render background and margin

  var offset_x = 110;
  var offset_y = 5;
  ctx.fillStyle = "black";
  ctx.fillRect(offset_x, offset_y, 300, 600);
  ctx.strokeStyle = "grey";
  ctx.strokeRect(offset_x, offset_y, 300, 600);
  // render grid
  for (var row = 0; row < 20; row++)
    for (var col = 0; col < 10; col++) {
      ctx.strokeRect(col * 30 + offset_x, (19 - row) * 30 + offset_y, 30, 30);
    }

  // render shodow
  var min_relative_height = 20;
  for ([col, row] of game.to_shape()) {
    var ground_height = 0;
    for (var i = 0; i < row; i++)
      if (game.board[i][col] != "N") ground_height = i + 1;
    min_relative_height = Math.min(min_relative_height, row - ground_height);
  }
  ctx.fillStyle = "grey";
  for ([col, row] of game.to_shape())
    ctx.fillRect(
      col * 30 + offset_x,
      (19 - row + min_relative_height) * 30 + offset_y,
      30,
      30,
    );
  // render piece
  ctx.fillStyle = color_table[game.tetramino];
  for (var [col, row] of game.to_shape()) {
    ctx.fillRect(col * 30 + offset_x, (19 - row) * 30 + offset_y, 30, 30);
  }
  // render board
  ctx.strokeStyle = "grey";
  for (var row = 0; row < 20; row++)
    for (var col = 0; col < 10; col++) {
      if (game.board[row][col] != "N") {
        ctx.fillStyle = color_table[game.board[row][col]];
        ctx.fillRect(col * 30 + offset_x, (19 - row) * 30 + offset_y, 30, 30);
      }
    }

  // render hold
  var offset_x = 5;
  var offset_y = 5;
  ctx.fillStyle = "black";
  ctx.fillRect(offset_x, offset_y, 100, 100);
  ctx.strokeStyle = "grey";
  ctx.strokeRect(offset_x, offset_y, 100, 100);
  if (game.holdmino != "") {
    ctx.fillStyle = color_table[game.holdmino];
    for (var [col, row] of game.to_shape(game.holdmino)) {
      var piece_offset = "IO".includes(game.holdmino) ? 10 : 20;
      ctx.fillRect(
        (col + 1) * 20 + offset_x + piece_offset,
        (3 - row) * 20 + offset_y,
        20,
        20,
      );
    }
  }
  // render next
  var offset_x = 415;
  var offset_y = 5;
  ctx.fillStyle = "black";
  ctx.fillRect(offset_x, offset_y, 100, 410);
  ctx.strokeStyle = "grey";
  ctx.strokeRect(offset_x, offset_y, 100, 410);
  for (var piece_idx = 1; piece_idx < 6; piece_idx++) {
    ctx.fillStyle = color_table[game.bag[piece_idx]];
    for (var [col, row] of game.to_shape(game.bag[piece_idx])) {
      var piece_offset = "IO".includes(game.bag[piece_idx]) ? 10 : 20;
      ctx.fillRect(
        (col + 1) * 20 + offset_x + piece_offset,
        (3 - row) * 20 + (piece_idx - 1) * 80 + offset_y,
        20,
        20,
      );
    }
  }

  // render game stat
  ctx.fillStyle = "green";
  ctx.font = "bold 20px Arial ";
  if (game.line_clear > 0 && game.line_clear < 4 && game.b2b >= 0)
    ctx.fillText("TSPIN", 10, 150);
  if (game.line_clear > 0)
    ctx.fillText(
      ["", "Single", "Double", "Triple", "Quad"][game.line_clear],
      10,
      200,
    );
  if (game.combo > 0) ctx.fillText(game.combo + " Combo", 10, 300);
  if (game.pc) ctx.fillText("All Clear", 10, 350);

  ctx.fillText("Trial:", 420, 450);
  ctx.fillText(Config.no_of_success + "/" + Config.no_of_trial, 420, 470);
}
/*
3. keybind
*/
function press_left(first_call = false) {
  if (first_call && !Config.pressing_left) {
    Config.timer1 = new Date().getTime();
    Config.delay = Config.das;
    game.move_left();
    render();
    Config.pressing_left = true;
    Config.pressing_right = false;
    setTimeout(press_left, 1);
  } else if (!first_call && Config.pressing_left) {
    var now = new Date().getTime();
    //console.log(now - Config.timer1)
    if (now - Config.timer1 > Config.delay) {
      Config.arr === 0 ? game.move_leftmost() : game.move_left();
      render();
      Config.delay = Config.arr;
      Config.timer1 = now;
    }
    setTimeout(press_left, 1);
  }
}
function release_left() {
  Config.pressing_left = false;
}

function press_right(first_call = false) {
  if (first_call && !Config.pressing_right) {
    Config.timer2 = new Date().getTime();
    Config.delay = Config.das;
    game.move_right();
    render();
    Config.pressing_right = true;
    Config.pressing_left = false;
    setTimeout(press_right, 1);
  } else if (!first_call && Config.pressing_right) {
    var now = new Date().getTime();
    //console.log(now - Config.timer2)
    if (now - Config.timer2 > Config.delay) {
      Config.arr === 0 ? game.move_rightmost() : game.move_right();
      render();
      Config.delay = Config.arr;
      Config.timer2 = now;
    }
    setTimeout(press_right, 1);
  }
}
function release_right() {
  Config.pressing_right = false;
}

function press_down(first_call = false) {
  if (first_call && !Config.pressing_down) {
    game.softdrop();
    render();
    Config.pressing_down = true;
    setTimeout(press_down, 1);
  } else if (!first_call && Config.pressing_down) {
    game.softdrop();
    render();
    setTimeout(press_down, 1);
  }
}

function release_down() {
  Config.pressing_down = false;
}

// bind('keydown ArrowRight>', lambda event: (release_right()))

function add_generic_keybind(key, func) {
  Keybind.keydown[key] = (e) => {
    if (!Config.pressing[key]) func();
    render();
    Config.pressing[key] = true;
  };
  Keybind.keyup[key] = (e) => {
    Config.pressing[key] = false;
  };
}

function update_keybind() {
  Keybind.keydown = {};
  Keybind.keyup = {};

  Keybind.keydown[Customized_key[0]] = (e) => {
    press_left(true);
  };
  Keybind.keyup[Customized_key[0]] = (e) => {
    release_left(true);
  };

  Keybind.keydown[Customized_key[1]] = (e) => {
    press_right(true);
  };
  Keybind.keyup[Customized_key[1]] = (e) => {
    release_right(true);
  };

  Keybind.keydown[Customized_key[2]] = (e) => {
    press_down(true);
  };
  Keybind.keyup[Customized_key[2]] = (e) => {
    release_down(true);
  };

  add_generic_keybind(
    Customized_key[3],
    () => (game.harddrop(), play_sound(), detect_win()),
  );
  add_generic_keybind(
    Customized_key[4],
    () => (
      game.rotate_anticlockwise(),
      game.tetramino == "O" ? game.drop((factor = 1)) : ""
    ),
  );
  add_generic_keybind(
    Customized_key[5],
    () => (
      game.rotate_clockwise(),
      game.tetramino == "O" ? game.drop((factor = 1)) : ""
    ),
  );
  add_generic_keybind(
    Customized_key[6],
    () => (
      game.rotate_180(), game.tetramino == "O" ? game.drop((factor = 1)) : ""
    ),
  );
  add_generic_keybind(Customized_key[7], () => game.hold());
  add_generic_keybind(Customized_key[8], () => retry());
  add_generic_keybind(Customized_key[9], () => pcfinder());
}

function set_event_listener() {
  document.onkeydown = (e) => {
    //console.log('down',e.code)
    var func = Keybind.keydown[e.code];
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
        e.code,
      ) &&
      document.activeElement.tagName != "INPUT" &&
      document.activeElement.tagName != "TEXTAREA"
    ) {
      e.preventDefault();
    }
    if (document.activeElement.className == "keybind") {
      document.activeElement.value = e.code;
      save_setting();
    }
    if (
      document.activeElement.tagName != "INPUT" &&
      document.activeElement.tagName != "TEXTAREA" &&
      func != undefined
    ) {
      board.focus();
      func();
    }
  };

  document.onkeyup = (e) => {
    //console.log('up',e.code)
    var func = Keybind.keyup[e.code];
    if (func != undefined) {
      func();
    }
  };

  board.onfocus = (e) => {
    render();
  };

  board.onblur = (e) => {
    var ctx = document.getElementById("board").getContext("2d");
    if (!Config.on_focus) {
      ctx.font = "bold 40px Arial ";

      ctx.fillStyle = "rgba(234,200,0,0.5)";
      ctx.fillText("          OUT OF FOCUS", 0, 300);
    }
  };
  document.getElementById("input11").oninput = (e) => {
    save_setting();
  };
  document.getElementById("input12").oninput = (e) => {
    save_setting();
  };
  document.getElementById("input12.1").onchange = (e) => {
    save_setting();
  };
  // document.getElementById('input13').onchange = e => {
  //     save_gamemode();
  //     var is_hidden = !(Config.mode == 'customized')
  //     document.getElementById('customized').hidden = is_hidden
  // }
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    document.getElementById("board").onblur = (e) => e.preventDefault();
    document.getElementById("tcc").style.display = "inline-block";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    )
  ) {
    document.getElementById("board").onblur = (e) => e.preventDefault();
    document.getElementById("tcc").style.display = "inline-block";
  } // else document.getElementById("tcc").style.display = 'none';

  document.getElementById("tc-dr").addEventListener("touchstart", function (e) {
    game.rotate_180();
    render();
  });
  document.getElementById("tc-h").addEventListener("touchstart", function (e) {
    game.hold();
    render();
  });
  document.getElementById("tc-hd").addEventListener("touchstart", function (e) {
    game.harddrop();
    play_sound();
    detect_win();
    render();
  });
  document.getElementById("tc-l").addEventListener("touchstart", function (e) {
    press_left(true);
    render();
  });
  document.getElementById("tc-l").addEventListener("touchend", function (e) {
    release_left(true);
    render();
  });
  document.getElementById("tc-r").addEventListener("touchstart", function (e) {
    press_right(true);
    render();
  });
  document.getElementById("tc-r").addEventListener("touchend", function (e) {
    release_right(true);
    render();
  });
  document.getElementById("tc-d").addEventListener("touchstart", function (e) {
    press_down(true);
    render();
  });
  document.getElementById("tc-d").addEventListener("touchend", function (e) {
    release_down(true);
    render();
  });
  document.getElementById("tc-cc").addEventListener("touchstart", function (e) {
    game.rotate_anticlockwise();
    render();
  });
  document.getElementById("tc-c").addEventListener("touchstart", function (e) {
    game.rotate_clockwise();
    render();
  });
}
/*
4. map generation
*/
Record = {
  added_line: [],
  board: [],
  piece_added: [],
  shuffled_queue: ["I", "O", "J", "L", "S", "Z", "T"],
  finished_map: [
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
    ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
    ["N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
  ],
  last_paint: -1,
};

function random_choose(arr) {
  var idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function get_shuffled_holdable_queue(queue) {
  var result = [];
  var size = queue.length;
  if (2 <= size && size <= 7) {
    var rng = Math.floor(Math.random() * reverse_hold_table[size].length);
    var selected_table = reverse_hold_table[size][rng];
    for (var pointer of selected_table) {
      result.push(queue[pointer]);
    }
  }
  return result;
}
// 4.4 shuffle queue and play / restart
function play() {
  game = new Game();
  game.board = clone(Record.finished_map);

  game.bag = Record.piece_added.concat([
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
    "G",
  ]);
  game.update();
  game.holdmino = "";
  game.hold();
}

function play_a_map(mode = null) {
  let counter = 0;
  queues.forEach((row, index) => {
    console.log(`Row ${index} has ${row.length} columns`);
    counter += row.length;
  });
  Config.no_of_trial = counter;
  game = new Game();
  Config.no_of_piece = queues[0][0].length;
  game.board = last_output;
  Record.finished_map = clone(game.board);
  Record.piece_added = get_next_queue();

  play();
  render();
}

function detect_win() {
  if (game.total_piece == 1) {
    //Config.no_of_trial += 1
  }
  if (game.pc) {
    sound["win"].play();
    if (Config.auto_next_ind) {
      play_a_map();
    }
    Config.no_of_success += 1;
  } else if (game.total_piece == Config.no_of_piece) {
    sound["lose"].play();
    console.log("you failed this queue: " + Record.piece_added);
    retry();
  }
}

function retry() {
  play();
  render();
}
// 4.5 customized_map
function load_map() {
  document.getElementById("field_error").innerHTML = "";
  var partial_map = document
    .getElementById("field")
    .value.trim()
    .split("\n")
    .reverse();
  if (partial_map.length == 1 && partial_map[0] == "") {
    return true;
  }

  if (partial_map.length > 20) {
    document.getElementById("field_error").innerHTML =
      "too many lines in field";
    return false;
  }
  for (var line of partial_map) {
    if (line.length != 10) {
      document.getElementById("field_error").innerHTML =
        "there must be 10 characters in each line";
      return false;
    }
  }
  for (var j = 0; j < partial_map.length; j++) {
    for (var i = 0; i < 10; i++) {
      if (partial_map[j][i] == "X") {
        game.board[j][i] = "G";
      } else if (partial_map[j][i] == "_") {
        game.board[j][i] = "N";
      } else if ("IOTSZJL".includes(partial_map[j][i])) {
        game.board[j][i] = partial_map[j][i];
      } else {
        document.getElementById("field_error").innerHTML =
          'only characters of "_XIOTSZJL" allowed';
        return false;
      }
    }
  }
  return true;
}
function queue_generator(expr) {
  //example of queue I,[IJLOSTZ]p3; I,*p3
  document.getElementById("queue_error").innerHTML = "";
  var tokens = expr.split(",");
  var queue = [];

  for (var token of tokens) {
    var is_hat = false;
    var is_factorial = false;
    var repeat = 1;
    var subqueue = "";
    var splitted_token = token.split("p");

    if (splitted_token.length == 2) {
      if (splitted_token[1] != "") {
        if (isNaN(splitted_token[1])) {
          document.getElementById("queue_error").innerHTML =
            "invalid format, cannot read " + splitted_token[1];
          return false;
        }
        repeat = parseInt(splitted_token[1]);
      }
    } else if (splitted_token.length == 1) {
      if (splitted_token[0].endsWith("!")) {
        splitted_token[0] = splitted_token[0].slice(
          0,
          splitted_token[0].length - 1,
        );
        is_factorial = true;
      }
    } else {
      document.getElementById("queue_error").innerHTML =
        "invalid format, cannot read " + token;
      return false;
    }

    if (splitted_token[0].startsWith("[") && splitted_token[0].endsWith("]")) {
      var queue_token = splitted_token[0].slice(
        1,
        splitted_token[0].length - 1,
      );
    } else {
      var queue_token = splitted_token[0];
    }

    if (queue_token.startsWith("^")) {
      queue_token = queue_token.slice(1);
      is_hat = true;
    }

    for (var letter of queue_token) {
      if (letter == "*") {
        if (queue_token.length != 1) {
          document.getElementById("queue_error").innerHTML =
            "invalid format, cannot read " + queue_token;
          return false;
        }
        subqueue = "IJLOSTZ";
      } else if ("IJLOSTZ".includes(letter)) {
        subqueue += letter;
      } else {
        document.getElementById("queue_error").innerHTML =
          "invalid format, cannot read " + queue_token;
        return false;
      }
    }

    if (is_hat) {
      subqueue = [..."IJLOSTZ"].filter((x) => !subqueue.includes(x)).join("");
    }
    if (is_factorial) {
      repeat = subqueue.length;
    }
    console.log(subqueue, repeat);
    if (subqueue.length > 0) {
      if (repeat > subqueue.length) {
        document.getElementById("queue_error").innerHTML =
          `bag ${subqueue} has only ${subqueue.length} shapes`;
        return false;
      }
      var added = [...subqueue];
      shuffle(added);
      queue = queue.concat(added.slice(0, repeat));
    }
  }
  return queue;
}

function gen_url() {
  var first =
    "https://himitsuconfidential.github.io/downstack-practice/usermode.html/";
  var second = document.getElementById("field").value;
  var third = document.getElementById("input_queue").value;
  var output = document.getElementById("output_url");
  output.value = first + second + "=" + third;
  output.focus();
  output.select();
}
function pcfinder() {
  var url = "https://wirelyre.github.io/tetra-tools/pc-solver.html";
  var field = [];
  for (var i = 0; i < 190; i++) field.push(0);
  console.log(field.length, JSON.stringify(field));
  for (var row = 3; row >= 0; row--) {
    for (var col = 0; col < 10; col++) {
      console.log(game.board[row][col]);
      if (game.board[row][col] == "N") field.push(0);
      else field.push(8);
    }
  }
  console.log(field.length, JSON.stringify(field));
  for (var i = 0; i < 10; i++) field.push(0);
  console.log(field.length, JSON.stringify(field));
  var queue =
    [...game.holdmino].filter((x) => x != "G").join("") +
    game.bag.filter((x) => x != "G").join("");

  var fumen = encode_simple(field, queue);

  console.log(fumen);
  window.open(url + "?fumen=" + encodeURIComponent(fumen));
}
/*
4.6 pcwizard
*/
//function toggle_pcwizard() {
//     const dropdown = document.querySelector('.nav .dropdown');
//     const pcwizard = document.getElementById('pcwizard');
//     dropdown.classList.remove('open');
//     pcwizard.classList.toggle('open');

// }
document.getElementById("pcwizard_option").onchange = (e) => {
  var instrution = [
    "Enter 0 pieces",
    "Enter 4 pieces e.g. IOTS",
    "Enter 1 pieces e.g. I",
    "Enter 5 pieces e.g. IOTSZ",
    "Enter 2 pieces e.g. IO",
    "Enter 6 pieces e.g. IOTSZJ",
    "Enter 3 pieces e.g. IOT",
  ];
  document.getElementById("pcwizard_instruction").textContent =
    instrution[document.getElementById("pcwizard_option").selectedIndex];
};
function close_pcwizard() {
  const pcwizard = document.getElementById("pcwizard");
  pcwizard.classList.remove("open");
}

function save_wizard() {
  var input_queue = document.getElementById("input_queue");
  var pcwizard_queue = document.getElementById("pcwizard_queue");
  var pcwizard_option = document.getElementById("pcwizard_option");
  var pcwizard_error = document.getElementById("pcwizard_error");
  input_queue.value = pcwizard_queue.value + pcwizard_option.selectedIndex;
  if (pcwizard_option.selectedIndex == 0) {
    //1st
    input_queue.value = `*!,*p4`;
  } else if (pcwizard_option.selectedIndex == 1) {
    //2nd
    input_queue.value = `[${pcwizard_queue.value}]!,*!`;
  } else if (pcwizard_option.selectedIndex == 2) {
    //3nd
    input_queue.value = `[${pcwizard_queue.value}]!,*!,*p3`;
  } else if (pcwizard_option.selectedIndex == 3) {
    //4th
    input_queue.value = `[${pcwizard_queue.value}]!,*p6`;
  } else if (pcwizard_option.selectedIndex == 4) {
    //5th
    input_queue.value = `[${pcwizard_queue.value}]!,*!,*p2`;
  } else if (pcwizard_option.selectedIndex == 5) {
    //6th
    input_queue.value = `[${pcwizard_queue.value}]!,*p5`;
  } else if (pcwizard_option.selectedIndex == 6) {
    //7th
    input_queue.value = `[${pcwizard_queue.value}]!,*!`;
  }
  document.getElementById("field").value = "";
}

/*
5. start
*/

set_event_listener();
load_setting();
update_keybind();

function initialize() {
  console.log("inside initialize");
  console.log("queues" + queues);
  queues.forEach((row, index) => {
    console.log(`Row ${index} has ${row.length} columns`);
    Config.no_of_trial += row.length;
  });

  var temp = sessionStorage.getItem("temp");
  sessionStorage.removeItem("temp");
  if (temp != null) {
    play_a_map();
  } else {
    setTimeout(load_gamemode, 1500);
    setTimeout(play_a_map, 1500);
  }
}

initialize();
