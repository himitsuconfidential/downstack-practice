
var game = new Game();
console.log(game.tetramino, JSON.stringify(game.to_shape()))
const Keybind = {'keydown':{}, 'keyup':{}}
var Config = {'das':100, 'arr':0, 'delay':0, 'pressing_left':false, 'pressing_right': false, 'pressing_down': false, 'pressing':{},
'skim_ind':true, 'mdhole_ind':false, 'unqiue_ind':true, 'auto_next_ind':true,
'mode':'1', 'no_of_unreserved_piece':7, 'no_of_piece':7,
'no_of_trial':0, 'no_of_success':0}
var Customized_key = ['ArrowLeft','ArrowRight','ArrowDown','Space','KeyZ','KeyX','KeyA','ShiftLeft','KeyR','KeyP']
var board = document.getElementById('board')

const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);

function clone2d(arr){
    var newarr = []
    for (var sub_arr of arr){
        newarr.push([...sub_arr])
    }
    return newarr
}
fetch('./learnfromai.json')
.then(results=>results.json())
.then(d=>{jsondata = d;console.log('loading')})


/*
0. sound effect
*/
const sound={
    0:new Audio ("sound/1.ogg"),
    1:new Audio ("sound/2.ogg"),
    2:new Audio ("sound/3.ogg"),
    3:new Audio ("sound/4.ogg"),
    4:new Audio ("sound/5.ogg"),
    5:new Audio ("sound/6.ogg"),
    6:new Audio ("sound/7.ogg"),
    win:new Audio ("sound/win.ogg"),
    lose:new Audio ("sound/lose.ogg")
}
    
function play_sound(){
    if (game.combo >= 0){
        console.log('sing', game.combo)
        sound[Math.min(6,game.combo)].cloneNode().play()
    }
}

/*
1. html related
*/


function load_setting(){
    try{
        var storage = localStorage.getItem('Customized_key')
        if (storage!= null){
            Customized_key = JSON.parse(storage);
            Config.das = parseInt(localStorage.getItem('das'))
            if (! (Config.das>=1 && Config.das<=200)){
                Config.das = 100}
            Config.arr = parseInt(localStorage.getItem('arr'))
            if (! (Config.arr>=0 && Config.arr<=100)){
                Config.arr = 0
            }
            Config.auto_next_ind = localStorage.getItem('auto_next_ind') != 'false'
            
        }
    }
    catch(err){
        localStorage.clear()
        console.log('storage corrupted')
    }
    for (var i=0; i<10; i++){
        document.getElementById('input'+(i+1)).value = Customized_key[i]
    }
    document.getElementById('input11').value = Config.das
    document.getElementById('input12').value = Config.arr
    document.getElementById('input12.1').checked = Config.auto_next_ind
}

function load_level(modname){
    Config.mode = modname
    localStorage.setItem('current_level', modname)
    play_a_map()
    document.getElementById('input13').innerHTML = jsondata[modname]['display_name'];
}

function load_jsondata(){

    var passed_level_list = JSON.parse(localStorage.getItem('passed_level'))
    if (passed_level_list == null) passed_level_list = []


    var text = ''
    for (var modname in jsondata){
        label = passed_level_list.includes(modname)? "✅": " "
        color = passed_level_list.includes(modname)? "green": "red"; console.log(color,typeof(modname))
        display_name = jsondata[modname]["display_name"]
        text += `<button class="game_button ${color}" onclick='load_level("${modname}"); board.focus()'>${display_name}${label}</button>`
    }
    document.getElementById('scrollable').innerHTML = text
}


function save_setting(){
    console.log('save_setting')
    for (var i=0; i<10; i++){
        Customized_key[i] = document.getElementById('input'+(i+1)).value 
    }
    Config.das = parseInt(document.getElementById('input11').value)
    if (! (Config.das>=1 && Config.das<=200)){
        alert('DAS should be between 1 to 200')
        Config.das = 100
    }
    Config.arr = parseInt(document.getElementById('input12').value)
    if (! (Config.arr>=0 && Config.arr<=100)){
        alert('ARR should be between 0 to 100')
        Config.arr = 0
    }
    
    Config.auto_next_ind = document.getElementById('input12.1').checked
    update_keybind()
    localStorage.setItem('auto_next_ind', Config.auto_next_ind) 
    localStorage.setItem('Customized_key',JSON.stringify(Customized_key))
    localStorage.setItem('das',Config.das)
    localStorage.setItem('arr',Config.arr)
}

function save_gamemode(){
    console.log('save_gamemode')
    Config.mode = selection.options[selection.selectedIndex].value
}

/*
2. render
*/
function render(){
    var ctx = document.getElementById("board").getContext('2d');
    ctx.clearRect(0,0,520,610);
    // render background and margin

    var offset_x = 110
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,300,600);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,300,600);
    // render grid
    for (var row=0; row<20; row++)
    for (var col=0; col<10; col++){
        ctx.strokeRect(col*30+offset_x,(19-row)*30+offset_y,30,30);
    }
    
    // render shodow
    var min_relative_height = 20 
    for ([col, row] of game.to_shape()){
        var ground_height = 0
        for (var i=0; i<row; i++)
            if (game.board[i][col] != 'N')
                ground_height = i+1
        min_relative_height = Math.min(min_relative_height, row - ground_height)
    }
    ctx.fillStyle = 'grey';
    for ([col, row] of game.to_shape())
        ctx.fillRect(col*30+offset_x,(19-row+min_relative_height)*30+offset_y,30,30);
    // render piece
    ctx.fillStyle = color_table[game.tetramino]
    for (var [col,row] of game.to_shape()){
        ctx.fillRect(col*30+offset_x,(19-row)*30+offset_y,30,30)
    }
    // render board
    ctx.strokeStyle = 'grey';
    for (var row=0; row<20; row++)
        for (var col=0; col<10; col++){
            if (game.board[row][col] != 'N'){
                ctx.fillStyle = color_table[game.board[row][col]];
                ctx.fillRect(col*30+offset_x,(19-row)*30+offset_y,30,30);
            }
        }


    // render hold
    var offset_x = 5
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,100,100);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,100,100); 
    if (game.holdmino != ''){
        ctx.fillStyle = color_table[game.holdmino]
        for (var [col, row] of game.to_shape(game.holdmino)){
            var piece_offset = 'IO'.includes(game.holdmino)? 10: 20;
            ctx.fillRect((col+1)*20+offset_x+piece_offset,(3-row)*20+offset_y,20,20);
        }
        
    }
    // render next
    var offset_x = 415
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,100,410);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,100,410); 
    for (var piece_idx=1; piece_idx<6; piece_idx++){
        ctx.fillStyle = color_table[game.bag[piece_idx]]
        for (var [col, row] of game.to_shape(game.bag[piece_idx])){
            var piece_offset = 'IO'.includes(game.bag[piece_idx])? 10: 20;
            ctx.fillRect((col+1)*20+offset_x+piece_offset,(3-row)*20+(piece_idx-1)*80+offset_y,20,20);
            
        }
    }

    // render game stat
    ctx.fillStyle = 'green';
    ctx.font = "bold 20px Arial ";
    if (game.line_clear>0 && game.line_clear<4 && game.b2b>=0)ctx.fillText('TSPIN',10,150)
    if (game.line_clear>0)ctx.fillText(['','Single','Double','Triple','Quad'][game.line_clear],10,200)
    if (game.combo > 0) ctx.fillText(game.combo+' Combo',10,300)
    if (game.pc) ctx.fillText('All Clear',10,350)

    ctx.fillText('Trial:',420,450)
    ctx.fillText(Config.no_of_success+'/'+Config.no_of_trial,420,470)
    
}
/*
3. keybind
*/
function press_left(first_call = false){

    if (first_call && !Config.pressing_left){
        Config.timer1 = new Date().getTime();
        Config.delay = Config.das;
        game.move_left()
        render();
        Config.pressing_left = true;
        Config.pressing_right = false;
        setTimeout(press_left, 1)
    }

    else if (!first_call && Config.pressing_left){
        var now = new Date().getTime()
        console.log(now - Config.timer1)
        if (now - Config.timer1 > Config.delay){
            Config.arr===0? game.move_leftmost(): game.move_left()
            render();
            Config.delay = Config.arr
            Config.timer1 = now
        }
        setTimeout(press_left, 1)
    }
}
function release_left(){
    Config.pressing_left = false; 
}

function press_right(first_call = false){

    if (first_call && !Config.pressing_right){
        Config.timer2 = new Date().getTime();
        Config.delay = Config.das;
        game.move_right()
        render();
        Config.pressing_right = true;
        Config.pressing_left = false;
        setTimeout(press_right, 1)
    }

    else if (!first_call && Config.pressing_right){
        var now = new Date().getTime()
        console.log(now - Config.timer2)
        if (now - Config.timer2 > Config.delay){
            Config.arr===0? game.move_rightmost(): game.move_right()
            render();
            Config.delay = Config.arr
            Config.timer2 = now
        }
        setTimeout(press_right, 1)
    }
}
function release_right(){
    Config.pressing_right = false;
}

function press_down(first_call = false){
    if (first_call && !Config.pressing_down){
        game.softdrop()
        render();
        Config.pressing_down = true;
        setTimeout(press_down, 1)
    }
    else if (!first_call && Config.pressing_down){
        game.softdrop()
        render();
        setTimeout(press_down, 1)
    }
}

function release_down(){
    Config.pressing_down = false;
}




// bind('keydown ArrowRight>', lambda event: (release_right()))


function add_generic_keybind(key,func){
    Keybind.keydown[key] = e=>{if (!Config.pressing[key]) func(); 
        render();
        Config.pressing[key] = true;
    }
    Keybind.keyup[key] = e=>{Config.pressing[key] = false}

}

function update_keybind(){
    Keybind.keydown = {}
    Keybind.keyup = {}

    Keybind.keydown[Customized_key[0]] = e=>{press_left(true)}
    Keybind.keyup[Customized_key[0]] = e=>{release_left(true)}

    Keybind.keydown[Customized_key[1]] = e=>{press_right(true)}
    Keybind.keyup[Customized_key[1]] = e=>{release_right(true)}

    Keybind.keydown[Customized_key[2]] = e=>{press_down(true)}
    Keybind.keyup[Customized_key[2]] = e=>{release_down(true)}

    add_generic_keybind(Customized_key[3], ()=> (game.harddrop(), play_sound(), detect_win()))
    add_generic_keybind(Customized_key[4], ()=> game.rotate_anticlockwise())
    add_generic_keybind(Customized_key[5], ()=> game.rotate_clockwise())
    add_generic_keybind(Customized_key[6], ()=> game.rotate_180())
    add_generic_keybind(Customized_key[7], ()=> game.hold())
    add_generic_keybind(Customized_key[8], ()=> retry())
    add_generic_keybind(Customized_key[9], ()=> pcfinder())
    
}

function set_event_listener(){
    document.onkeydown = (e => {
        console.log('down',e.code)
        var func = Keybind.keydown[e.code];
        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code) && document.activeElement.tagName != 'INPUT' && document.activeElement.tagName != 'TEXTAREA'){
            e.preventDefault()}
        if (document.activeElement.className == 'keybind'){
            document.activeElement.value = e.code
            save_setting()
            
        }
        if (document.activeElement.tagName != 'INPUT' && document.activeElement.tagName != 'TEXTAREA' && func != undefined){
            board.focus()
            func()
        }


    })

    document.onkeyup = (e => {
        console.log('up',e.code)
        var func = Keybind.keyup[e.code];
        if (func != undefined){
            func()
        }
        })

    board.onfocus = (e =>{
        render()

    })

    board.onblur = (e =>{
        var ctx = document.getElementById("board").getContext('2d');
        if (!Config.on_focus){
            ctx.font = "bold 40px Arial ";

            ctx.fillStyle = 'rgba(234,200,0,0.5)'
            ctx.fillText('          OUT OF FOCUS',0,300)
            
        }

    })
    document.getElementById('input11').oninput = e=>{save_setting()}
    document.getElementById('input12').oninput = e=>{save_setting()}
    document.getElementById('input12.1').onchange = e=>{save_setting()}

    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        document.getElementById('board').onblur = (e=>e.preventDefault())
        document.getElementById('tcc').style.display = 'inline-block';
    } else if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)
    ) {
        document.getElementById('board').onblur = (e=>e.preventDefault())
        document.getElementById('tcc').style.display = 'inline-block';
    } // else document.getElementById("tcc").style.display = 'none';

    
    document.getElementById('tc-dr').addEventListener('touchstart', function (e) {
        game.rotate_180()
        render()
    });
    document.getElementById('tc-h').addEventListener('touchstart', function (e) {
        game.hold()
        render()
    });
    document.getElementById('tc-hd').addEventListener('touchstart', function (e) {
        game.harddrop()
        play_sound()
        detect_win()
        render()
    });
    document.getElementById('tc-l').addEventListener('touchstart', function (e) {
        press_left(true)
        render()
    });
    document.getElementById('tc-l').addEventListener('touchend', function (e) {
        release_left(true)
        render()
    });
    document.getElementById('tc-r').addEventListener('touchstart', function (e) {
        press_right(true)
        render()
    });
    document.getElementById('tc-r').addEventListener('touchend', function (e) {
        release_right(true)
        render()
    });
    document.getElementById('tc-d').addEventListener('touchstart', function (e) {
        press_down(true)
        render()
    });
    document.getElementById('tc-d').addEventListener('touchend', function (e) {
        release_down(true)
        render()
    });
    document.getElementById('tc-cc').addEventListener('touchstart', function (e) {
        game.rotate_anticlockwise()
        render()
    });
    document.getElementById('tc-c').addEventListener('touchstart', function (e) {
        game.rotate_clockwise()
        render()
    });

}
/*
4. map generation
*/
Record={
    added_line:[],
    board:[],
    piece_added:[],
    shuffled_queue:['I','O','J','L','S','Z','T'],
    finished_map:[
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']],
    tsd: 0,
    quadL: 0,
    pc: 0,
    max_combo: 0,

}

function random_choose(arr){
    var idx = Math.floor(Math.random() * arr.length)
    return arr[idx]
}

function get_shuffled_holdable_queue(queue){
    var result = []
    var size = queue.length
    if (2<= size && size<=7){
        var rng = Math.floor(Math.random()*reverse_hold_table[size].length)
        var selected_table = reverse_hold_table[size][rng]
        for (var pointer of selected_table){
            result.push(queue[pointer])}
    }
    return result
}
// 4.4 shuffle queue and play / restart
function play(){
    Record.tsd = Record.quad = Record.pc = Record.max_combo = 0
    game = new Game()
    game.board = clone(Record.finished_map)

    game.bag = Record.piece_added.concat(['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'])
    game.update()
    game.holdmino = ''
    
    
}



function play_a_map(){
    mode = Config.mode
    game = new Game()
    if (jsondata[mode]['winning_requirement']["max_combo"] > 0)
        document.getElementById('winning_requirement1').innerHTML = jsondata[mode]['winning_requirement']["max_combo"]+' Combo'
    else
        document.getElementById('winning_requirement1').innerHTML = ''
    if (jsondata[mode]['winning_requirement']["tsd"] > 0)
        document.getElementById('winning_requirement2').innerHTML = jsondata[mode]['winning_requirement']["tsd"]+' Tspin Double'
    else
        document.getElementById('winning_requirement2').innerHTML = ''
    if (jsondata[mode]['winning_requirement']["quad"] > 0)
        document.getElementById('winning_requirement3').innerHTML = jsondata[mode]['winning_requirement']["quad"]+' Quad'
    else
        document.getElementById('winning_requirement3').innerHTML = ''
    if (jsondata[mode]['winning_requirement']["pc"] > 0)
        document.getElementById('winning_requirement4').innerHTML = jsondata[mode]['winning_requirement']["pc"]+' Perfect Clear'
    else
        document.getElementById('winning_requirement4').innerHTML = ''

    Config.no_of_piece = jsondata[mode]["no_of_piece"]
    game.board = clone2d(jsondata[mode]['board']).reverse()
    Record.finished_map = clone(game.board)
    Record.piece_added = [...jsondata[mode]['queue']]


    play()
    render()

}





function detect_win(){
    if (game.total_piece == 1){
        Config.no_of_trial += 1
    }
    mode = Config.mode
    if (game.line_clear == 2 && game.b2b >= 0) Record.tsd++
    if (game.line_clear == 4) Record.quad++
    if (game.pc) Record.pc ++
    if (game.combo > Record.max_combo) Record.max_combo = game.combo
    if (game.total_piece == Config.no_of_piece){
        if (Record.tsd >= jsondata[mode]["winning_requirement"]['tsd'] &&
            Record.quad >= jsondata[mode]["winning_requirement"]['quad'] &&
            Record.pc >= jsondata[mode]["winning_requirement"]['pc'] &&
            Record.max_combo >= jsondata[mode]["winning_requirement"]['max_combo']){
                sound['win'].play()
                if (Config.auto_next_ind){
                    play_a_map()}
                Config.no_of_success += 1
                var passed_level_list = JSON.parse(localStorage.getItem('passed_level'))
                if (passed_level_list == null)
                    passed_level_list = []
                if(!passed_level_list.includes(Config.mode))
                    localStorage.setItem('passed_level', JSON.stringify(passed_level_list.concat(Config.mode)))
                load_jsondata()
            }

        else{
                sound['lose'].play()
                retry()   
        }
    }

}

function retry(){
    play()
    render()
}

function show_ans(){

    
}








/*
5. start
*/

set_event_listener()
load_setting()
update_keybind()



function initialize(){
    
    

    load_jsondata()

    var current_level = localStorage.getItem('current_level')
    if (current_level == null) current_level = "1"
    try{
        load_level(current_level)
    }
    catch(err){
        load_level('1')
    }
    
}

setTimeout(initialize,1000)