
var game = new Game();
console.log(game.tetramino, JSON.stringify(game.to_shape()))
const Keybind = {'keydown':{}, 'keyup':{}}
var Config = {'das':100, 'arr':0, 'delay':0, 'pressing_left':false, 'pressing_right': false, 'pressing_down': false, 'pressing':{},
'skim_ind':false, 'mdhole_ind':false, 'unqiue_ind':true, 'smooth_ind':true, 'donate_ind':false, 'zero9_ind': false, 'auto_next_ind':true,
'mode':'prepare', 'no_of_unreserved_piece':7, 'no_of_piece':7,
'no_of_trial':0, 'no_of_success':0}
var Customized_key = ['ArrowLeft','ArrowRight','ArrowDown','Space','KeyZ','KeyX','KeyA','ShiftLeft','KeyR','KeyP']
var board = document.getElementById('board')

const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);
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

function load_gamemode(){
    document.getElementById('input13').value = Config.no_of_piece
    document.getElementById('input14').checked = Config.skim_ind
    document.getElementById('input15').checked = Config.mdhole_ind
    document.getElementById('input16').checked = Config.unqiue_ind
    document.getElementById('input17').checked = Config.smooth_ind

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
    Config.no_of_piece = parseInt(document.getElementById('input13').value)
    if (! (Config.no_of_piece>=2 && Config.no_of_piece<=7)){
        alert('no of piece should be between 2 to 7')
        Config.no_of_piece = 7
    }
    Config.skim_ind = document.getElementById('input14').checked
    Config.mdhole_ind = document.getElementById('input15').checked 
    Config.unqiue_ind = document.getElementById('input16').checked
    Config.smooth_ind = document.getElementById('input17').checked

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
    add_generic_keybind(Customized_key[9], ()=> show_ans())
    
}

function set_event_listener(){
    document.onkeydown = (e => {
        console.log('down',e.code)
        var func = Keybind.keydown[e.code];
        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
            e.preventDefault()}
        if (document.activeElement.className == 'keybind'){
            document.activeElement.value = e.code
            save_setting()
            
        }
        if (document.activeElement.tagName != 'INPUT' && func != undefined){
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
    document.getElementById('input13').oninput = e=>{save_gamemode()}
    document.getElementById('input14').onchange = e=>{save_gamemode()}
    document.getElementById('input15').onchange = e=>{save_gamemode()}
    document.getElementById('input16').onchange = e=>{save_gamemode()}
    document.getElementById('input17').onchange = e=>{save_gamemode()}
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
    done_quad: false,
    done_tsd: false,
    done_tst: false
    
}

// 4.1 add line
function add_line(row_idx){
    for (var i=0; i<10; i++){
        for (var j=19; j>row_idx; j--){
            game.board[j][i] = game.board[j-1][i]
        }
        game.board[row_idx][i] = 'G'
    }
    Record.added_line.push(row_idx)
}

function add_random_line(){
    var max_height = game.get_max_height()
    
    var row_index = Math.floor(Math.random()*(max_height+2))
    Record.added_line = []
    var rng = Math.random()
    if (rng<0.05){
        add_line(row_index)
        add_line(row_index+1)
        add_line(row_index+2)
    }
    else if (rng<0.07 && row_index < max_height+1){
        add_line(row_index)
        add_line(row_index+2)
    }
    else if (rng<0.15){
        add_line(row_index)
        add_line(row_index+1)
    }
    else if (rng<0.3){
        add_line(row_index)
    }
}

function add_random_line_less_skim(){
    var non_garbages = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var row_idx=0; row_idx<20; row_idx++)
        for (var col_idx=0; col_idx<10; col_idx++)
            if (game.board[row_idx][col_idx] != 'G')
                non_garbages[row_idx] += 1
    
    var garbage_height = 0
    for (var num of non_garbages){
        if (num == 1)
            garbage_height+=1
        else
            break}
    var row_index = garbage_height
    Record.added_line = []
    var rng = Math.random()
    if (rng<0.05){
        add_line(row_index)
        add_line(row_index+1)
        add_line(row_index+2)
    }
    else if (rng<0.15 ){
        add_line(row_index)
        add_line(row_index+1)
    }
    else if (rng<0.3){
        add_line(row_index)
    }
}
// 4.2 validation test
function try_drop(){//return whether garbage below current piece can be converted to current piece in current column
    var shape = game.to_shape()
    var heights = []
    for (var[c,r] of shape) heights.push(r)
    var lowest_height = Math.min(...heights)

    var min_relative_height = 20 
    for (var [col, row] of shape){
        var ground_height = 0
        for (var i=0; i<row; i++)
            if (game.board[i][col] == 'G')
                ground_height = i+1
        min_relative_height = Math.min(min_relative_height, row - ground_height)
    }


    for (var fall=min_relative_height+1; fall<=lowest_height; fall++){
        
        var all_g = true
        
        for (var [col, row] of shape){
            if (game.board[row-fall][col] != 'G'){
                all_g = false
                break
            }
        }
        if (all_g){
            for (var [col, row] of shape){
                game.board[row-fall][col] = 'N'}
            game.y -= fall
            return true
        }
    }    
    return false
    
}

function is_exposed(){//return whether exist garbage above current piece
    for (var [col, row] of game.to_shape()){
        for (var j=row+1; j<20; j++){
            if (game.board[j][col] == 'G'){
                return false}}}
    return true}

function is_floatable(){//return whether exist garbage 1 block below current piece
    for (var [col, row] of game.to_shape()){
        if (row == 0 || game.board[row-1][col] == 'G'){
            return false}}
    return true}

function is_spinable(depth = 1){
    if (depth > 2){
        return false}
    var piece_info = [game.x, game.y, game.orientation]

    if (depth == 2){
        if (game.move_left()){
            if (is_exposed() && ! is_floatable()){
                game.x += 1
                return true
            }
        }
        if (game.move_right()){
            if (is_exposed() && ! is_floatable()){
                game.x -= 1
                return true
            }
        }
    }
    if (game.rotate_clockwise()){
        if ((is_exposed() && ! is_floatable()) || is_spinable(depth+1)){
            game.rotate_anticlockwise()
            if (piece_info[0]==game.x && piece_info[1]==game.y && piece_info[2]==game.orientation){
                return true}
        }
    }

    [game.x, game.y, game.orientation] = piece_info
    if (game.rotate_anticlockwise()){
        if ((is_exposed() && ! is_floatable()) || is_spinable(depth+1)){
            game.rotate_clockwise()
            if (piece_info[0]==game.x && piece_info[1]==game.y && piece_info[2]==game.orientation){
                return true}
        }
    }


    [game.x, game.y, game.orientation] = piece_info
    if (game.rotate_180()){
        if ((is_exposed() && ! is_floatable())){
        
            game.rotate_180()
            return true
        }
    }

    return false
}
    

function get_unstability(){
    var grounded_position = new Set()
    var ungrounded_position = new Set()
    for (var col_idx=0; col_idx<10; col_idx++) {
        var is_grounded = true
        for (var row_idx=0; row_idx<20; row_idx++){
            if (game.board[row_idx][col_idx] == 'G'){
                if (is_grounded){
                    grounded_position.add(JSON.stringify([row_idx,col_idx]))}
                else{
                    ungrounded_position.add([row_idx,col_idx])}
            }
            else{
                is_grounded = false}
        }
    }
    
    //test if ungrounded are next to grounded
    var unstability = 0
    for (var [row_idx, col_idx] of ungrounded_position){
    
        var right_grounded = (col_idx < 9) &&  grounded_position.has(JSON.stringify([row_idx, col_idx+1]))
        var left_grounded = (col_idx > 0) && grounded_position.has(JSON.stringify([row_idx, col_idx-1]))
        if (! (right_grounded || left_grounded)){
            unstability += 1}
    }
    return unstability}

function is_smooth(arr){
    var uped = false
    var downed = false
    var last = null
    for (var ele of arr){
        if (last == null){
            last = ele
        }
        else{
            
            if (ele - last >1){
                uped = true
            }
            else if (last - ele >1){
                if (uped) return false
                downed = true
            }
            last = ele
        }
    }
    return true
}

function is_few_non_cheese_hole(){
    var height = []
    for (var col_idx=0; col_idx<10; col_idx++) {
        var h=0
        for (var row_idx=0; row_idx<20; row_idx++){ 
            if (game.board[row_idx][col_idx] == 'G'){
                h=row_idx}}
        height.push(h)
    }

    if (Config.smooth_ind){
        if (! is_smooth(height))
         return false
        var height_copy = [...height].sort(function(a, b){return a - b})
        if (height_copy[8] - height_copy[1] > 5)
            return false
    }

    var holes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var non_garbages = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var row_idx=0; row_idx<20; row_idx++) 
        for (var col_idx=0; col_idx<10; col_idx++){
            if (game.board[row_idx][col_idx] != 'G')
                non_garbages[row_idx] += 1
            if (game.board[row_idx][col_idx] != 'G' && row_idx < height[col_idx])
                holes[row_idx] += 1}

    
    var no_of_non_cheese_holes = 0
    var is_cheese_level = true
    for (var i=0; i<20; i++){
        var non_garbage = non_garbages[i]
        var hole = holes[i]
        if (non_garbage != 1){
            is_cheese_level = false}
        if (! is_cheese_level){
            no_of_non_cheese_holes += hole
        }
    }//console.log(Config.mdhole_ind,no_of_non_cheese_holes,Config.no_of_unreserved_piece,Record.piece_added.length,Config.no_of_unreserved_piece - Record.piece_added.length - (!Config.mdhole_ind) + 2*(Config.no_of_unreserved_piece<2))
    return no_of_non_cheese_holes <= Config.no_of_unreserved_piece - Record.piece_added.length - (!Config.mdhole_ind) + 2*(Config.no_of_unreserved_piece<2)
}

// 4.3 try to add pieces
function try_a_piece(){
    // find position piece that include (x,y)
    // find neighbour piece
    if (try_drop()){
        
        //pass test if the piece is reachable , the added line is clearable , the piece is not floatable , unstability == 0 and there are few holes
        var test = ! is_floatable()
        var shape = game.to_shape()
        test = test && Record.added_line.every(val => shape.some(pos => val==pos[1]))
        test = test && is_few_non_cheese_hole()
        test = test && (get_unstability() == 0)
        test = test && (is_exposed() || is_spinable())
        for (var [col, row] of shape){
            game.board[row][col] = "G"
        }
        return test

    }

    return false
}

function is_unique(bag){
    counter = {I:0, O:0, T:0, J:0, L:0, Z:0, S:0}
    for (var piece of bag){
        counter[piece] += 1
        if (counter[piece] > 1)
            return false
        if (piece == last_piece)
            return false
        last_piece = piece
    }
    return true
}

function is_even_distributed(bag){
    var last_piece = null
    var counter = {I:0, O:0, T:0, J:0, L:0, Z:0, S:0}
    var limit = {I:2, O:2, T:2, J:2, L:2, Z:2, S:2}
    if (Config.unqiue_ind){
        limit = {I:1, O:1, T:1, J:1, L:1, Z:1, S:1}
    }
    if (Config.mode == 'dt' || Config.mode == 'cspin' || Config.mode == 'fractal' || Config.mode == 'stsd'){
        limit.T -= 2}
    else if (Config.mode == 'cspinquad'){
        limit.T -= 2
        limit.I -= 1}
    for (var piece of bag){
        
        counter[piece] += 1
        if (counter[piece] > limit[piece]){
            return false}
        if (piece == last_piece)
            return false
        last_piece = piece
    }
    if (counter.I + counter.J + counter.L >4){	
        return false	
    }
    return true
}

function try_all_pieces(){
    var seenbag = []
    var unseenbag = []
    
    for (var piece of 'IOTJLZS'){
        if (Record.piece_added.includes(piece)){
            seenbag.push(piece)
        }
        else{
            unseenbag.push(piece)
        }
    }
    shuffle(seenbag)
    shuffle(unseenbag)
    
    var bag = unseenbag.concat(seenbag)
    for (var piece of bag){
        if (! is_even_distributed(Record.piece_added.concat(piece))) continue
        shuffle(possible_piece_config_table[piece])
        for (var [ori_idx, col_idx] of possible_piece_config_table[piece]){
            game.tetramino = piece
            game.x = col_idx
            game.y = 18
            game.orientation = ori_idx
            
            if (try_a_piece()){
                Record.piece_added.push(piece)
                return true
            }
        }
    }
    return false
}

function try_a_move(){
    //step 1 add line
    if (Config.skim_ind){
        add_random_line()}
    //step 2 try to add piece
    if (try_all_pieces()){
        game.lock()
        Record.board.push(clone(game.board))
        return true
    }
    else{
        return false}
}

function is_good_queue(queue){	
    var accum = []	
    var count = 1	
    for (var ele of queue){	
        if (accum.includes(ele)){	
            accum = []	
            count ++	
        }	
        accum.push(ele)	
    }	
    return count <= 2	
}	
function get_shuffled_holdable_queue(queue){	
    	
    var size = queue.length	
    if (2<= size && size<=7){	
        var selected_table = reverse_hold_table[size]	
        shuffle(selected_table)	
        for (var selected_row of selected_table){	
            var result = []	
            for (var pointer of selected_row){	
                result.push(queue[pointer])	
            }	
            if (is_good_queue(result)){	
                	
                return result	
            }	
        }	
        	
    }	
    return []	
}
// 4.4 shuffle queue and play / restart
function play(){
    game = new Game()
    Record.done_quad = 0
    Record.done_tst = 0
    Record.done_tsd = 0
    game.bag = Record.shuffled_queue.concat(['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'])
    game.update()
    game.holdmino = ''
    game.hold()
    if ((Record.board.length)>0){
        game.board = clone(Record.board[Record.board.length-1])
        for (var row_idx=0; row_idx<20; row_idx++){
            for (var col_idx=0; col_idx<10; col_idx++){
                if (game.board[row_idx][col_idx] != 'G'){
                game.board[row_idx][col_idx] = 'N'}}}
    }
}
// 4.5 generate the final map and develop the progression
function generate_final_map(){
    
    game = new Game()

    if (Config.mode == 'fractal'){
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*2)+5)
        var tsd_col = Math.floor(Math.random()*8)+1
        height[tsd_col] = 0
        if (tsd_col == 1){
            is_left = false}
        else if (tsd_col == 8){
            is_left = true}
        else{
            is_left = Math.floor(Math.random()*2)}
        var sign_left = is_left==1? 1:-1
        height[tsd_col + (sign_left)] = 3
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}
        game.board[3][tsd_col - 1] = 'N'
        game.board[3][tsd_col + 1] = 'N'
        game.board[1][tsd_col - 1] = 'N'
        game.board[1][tsd_col + 1] = 'N'
        
        if (is_left){
            game.board[4][tsd_col-1] = 'G'
            game.board[2][tsd_col-2] = 'G'
            game.board[3][tsd_col-2] = 'G'
            game.board[4][tsd_col-2] = 'G'
        }
        else{
            game.board[4][tsd_col+1] = 'G'
            game.board[2][tsd_col+2] = 'G'
            game.board[3][tsd_col+2] = 'G'
            game.board[4][tsd_col+2] = 'G'
        }
        var lines_add = Math.floor(Math.random()*3)
        var is_tsd_col = Math.floor(Math.random()*2)
        var col_add = (is_tsd_col == 1)? tsd_col: Math.floor(Math.random()*10)

        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]

    }
    else if (Config.mode=='dt'){
        //create random landsacpe
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*3)+5)

        //create dt hole
        var is_right = Math.floor(Math.random()*2) == 0 //overhang is left?
        if (is_right){
            var tsd_col = Math.floor(Math.random()*6)+2 //2 to 7
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col-1]-=1
                height[tsd_col-2]-=1
            }      
        }
        else{
            var tsd_col = Math.floor(Math.random()*6)+2
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col+1]-=1
                height[tsd_col+2]-=1
            }     
        }
 
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}

        if (is_right){
            var garbage_pos = ['GGNG','GGNG','GNNN','GNNG','GGNG','NNNG','NNGG']
            for (var row_idx=0; row_idx<7;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-2+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col-3


        }
        else{
            var garbage_pos = ['GNGG','GNGG','NNNG','GNNG','GNGG','GNNN','GGNN']
            for (var row_idx=0; row_idx<7;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-1+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col+3

        }
        if (kick_col>=0 && kick_col<10){
            if (Math.floor(Math.random()*2) == 0 && game.board[7][kick_col] == 'N'){
                game.board[5][kick_col] = 'N'
                game.board[6][kick_col] = 'N'
            }
            else{
                game.board[5][kick_col] = 'G'
                game.board[6][kick_col] = 'G'
            }
        }


        var lines_add = Math.floor(Math.random()*3)
        var is_tsd_col = Math.floor(Math.random()*2)
        var col_add = (is_tsd_col == 1)? tsd_col: Math.floor(Math.random()*10)

        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]

    }
    else if (Config.mode=='cspin'){
        //create random landsacpe
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*3)+5)

        //create cspin hole
        var is_right = Math.floor(Math.random()*2) == 0 //overhang is left?
        if (is_right){
            var tsd_col = Math.floor(Math.random()*7)+1 //1 to 7
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col-1]-=1
                height[tsd_col]-=1
            }
            height[tsd_col-1]-=1
            height[tsd_col]-=1 
        }
        else{
            var tsd_col = Math.floor(Math.random()*7)+2 //2 to 8
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col+1]-=1
                height[tsd_col]-=1
            }     
            height[tsd_col+1]-=1
            height[tsd_col]-=1
        }
 
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}

        if (is_right){
            var garbage_pos = ['GNGG','GGNG','GNNG','GGNG','NNNG','NNGG']
            for (var row_idx=0; row_idx<6;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-1+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col-2


        }
        else{
            var garbage_pos = ['GGNG','GNGG','GNNG','GNGG','GNNN','GGNN']
            for (var row_idx=0; row_idx<6;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-2+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col+2

        }
        if (kick_col>=0 && kick_col<10){

                game.board[4][kick_col] = 'G'
                game.board[5][kick_col] = 'G'
            
        }


        var lines_add = Math.floor(Math.random()*3)
        var is_tsd_col = Math.floor(Math.random()*2)
        var col_add = (is_tsd_col == 1)? tsd_col: Math.floor(Math.random()*10)

        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]

    }
    else if (Config.mode=='cspinquad'){
        //create random landsacpe
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*3)+5)

        //create cspin hole
        var is_right = Math.floor(Math.random()*2) == 0 //overhang is left?
        if (is_right){
            var tsd_col = Math.floor(Math.random()*7)+1 //1 to 7
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col-1]-=1
                height[tsd_col]-=1
            }
            height[tsd_col-1]-=1
            height[tsd_col]-=1 
        }
        else{
            var tsd_col = Math.floor(Math.random()*7)+2 //2 to 8
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col+1]-=1
                height[tsd_col]-=1
            }     
            height[tsd_col+1]-=1
            height[tsd_col]-=1
        }
 
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}

        if (is_right){
            var garbage_pos = ['GNGG','GGNG','GNNG','GGNG','NNNG','NNGG']
            for (var row_idx=0; row_idx<6;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-1+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col-2


        }
        else{
            var garbage_pos = ['GGNG','GNGG','GNNG','GNGG','GNNN','GGNN']
            for (var row_idx=0; row_idx<6;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-2+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col+2

        }
        if (kick_col>=0 && kick_col<10){

                game.board[4][kick_col] = 'G'
                game.board[5][kick_col] = 'G'
            
        }


        var lines_add = 4
        var col_add =  tsd_col

        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]

    }
    else if (Config.mode=='stsd'){
        //create random landsacpe
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*3)+5)

        //create dt hole
        var is_right = Math.floor(Math.random()*2) == 0 //overhang is left?
        if (is_right){
            var tsd_col = Math.floor(Math.random()*6)+2 //2 to 7
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col-1]-=1
                height[tsd_col-2]-=1
            }      
        }
        else{
            var tsd_col = Math.floor(Math.random()*6)+2
            if (Math.floor(Math.random()*2) == 0){
                for (var i=0; i<10; i++){
                    height[i]+=1
                }
                height[tsd_col+1]-=1
                height[tsd_col+2]-=1
            }     
        }
 
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}

        if (is_right){
            var garbage_pos = ['GNNG','GNNG','GGNG','NNNG','NNGG',]//['GNNG','GNNG','GGNG','NNNG','NNGG','NNNN','NNNN']
            for (var row_idx=0; row_idx<5;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-2+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col-3
            game.board[5][tsd_col-2] = 'N'
            game.board[5][tsd_col-1] = 'N'
            game.board[6][tsd_col-2] = 'N'
            game.board[6][tsd_col-1] = 'N'
        }
        else{
            var garbage_pos = ['GNNG','GNNG','GNGG','GNNN','GGNN',]//['GNNG','GNNG','GNGG','GNNN','GGNN','NNNN','NNNN']
            for (var row_idx=0; row_idx<5;row_idx++){
                for (var col_idx=0; col_idx<4;col_idx++){
                    game.board[row_idx][tsd_col-1+col_idx]= garbage_pos[row_idx][col_idx]
                }
            }
            var kick_col = tsd_col+3
            game.board[5][tsd_col+1] = 'N'
            game.board[5][tsd_col+2] = 'N'
            game.board[6][tsd_col+1] = 'N'
            game.board[6][tsd_col+2] = 'N'

        }
        if (kick_col>=0 && kick_col<10){
            game.board[3][kick_col] = 'G'
            game.board[4][kick_col] = 'G'
            
        }

        
        var lines_add = Math.floor(Math.random()*3)+2
        var col_add = Math.floor(Math.random()*2)+1

        if (is_right){
            col_add = tsd_col-col_add
        }
        else{
            col_add = tsd_col+col_add
        }
        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]
    }
}
count = 0
last_info = 'null'
function generate_a_ds_map(move){
    

    for (var trial=0; trial<5; trial++){
        if (move == 1){
            success_generate = try_a_move()}
        else{
            success_generate = try_a_move() && generate_a_ds_map(move - 1)}
        if (success_generate){
            return true}
        else{
            count++
            var info = `${game.tetramino} ${game.x} ${game.y} ${game.orientation}`
            if (info == last_info) 
                {trial = 5}
            last_info = info
            
            Record.board.length = Config.no_of_unreserved_piece-move
            Record.piece_added.length = Config.no_of_unreserved_piece-move
            if (Record.board.length > 0){
                game.board = clone(Record.board[Record.board.length-1])}
            else{
                game.board = clone(Record.finished_map)}
        }
    }
    return false
}

function play_a_map(mode = null){
    if (mode == null){
        mode = Config.mode}
    
    game = new Game()

    
    Config.mode = mode
    Config.no_of_unreserved_piece = Config.no_of_piece - 2 - (Config.mode == 'cspinquad')
    generate_final_map()
    Record.finished_map = clone(game.board)
    game.drawmode = true
    Record.piece_added = []
    Record.board = []
    
    for (var i=0; i<999; i++) {
        if (i==50){
            Config.skim_ind = false
            Config.mdhole_ind = true
        }
        if (generate_a_ds_map(Config.no_of_unreserved_piece) && game.get_max_height() < 17){
            var queue = [...Record.piece_added].reverse()	
            if (Config.mode == 'cspin' || Config.mode == 'dt' || Config.mode == 'fractal' || Config.mode == 'stsd'){	
                queue.push('T')
                queue.push('T')}	
            else if (Config.mode == 'cspinquad'){	
                queue.push('T')
                queue.push('T')
                queue.push('I')}
            Record.shuffled_queue = get_shuffled_holdable_queue(queue)	
            if (Record.shuffled_queue.length >0){	
                break}
        }
        else if (i%2 == 1){
            generate_final_map()
            Record.finished_map = clone(game.board)
            game.drawmode = true
            Record.piece_added = []
            Record.board = []
        }
        
    }
            
    Config.skim_ind = document.getElementById('input14').checked
    Config.mdhole_ind = document.getElementById('input15').checked 
    
    play()
    
    game.drawmode = false
    render()
    // update_stat()
    // update_win_text()
}

function play_a_dt_map(){
    play_a_map('dt')
    document.getElementById('winning_requirement1').innerHTML = 'Do a Tspin Double'
    document.getElementById('winning_requirement2').innerHTML = 'Do a Tspin Triple'
}

function play_a_cspin_map(){
    play_a_map('cspin')
    document.getElementById('winning_requirement1').innerHTML = 'Do a Tspin Double'
    document.getElementById('winning_requirement2').innerHTML = 'Do a Tspin Triple'  
}
function play_a_cspinquad_map(){
    play_a_map('cspinquad')
    document.getElementById('winning_requirement1').innerHTML = 'Do a Tspin Double'
    document.getElementById('winning_requirement2').innerHTML = 'Do a Tspin Triple'
}
function play_a_fractal_map(){
    play_a_map('fractal')
    document.getElementById('winning_requirement1').innerHTML = 'Do 2 Tspin Double'
    document.getElementById('winning_requirement2').innerHTML = ''
}
function play_a_stsd_map(){
    play_a_map('stsd')
    document.getElementById('winning_requirement1').innerHTML = 'Do 2 Tspin Double'
    document.getElementById('winning_requirement2').innerHTML = ''
}
function all_grounded(){
    for (var col_idx=0; col_idx<10; col_idx++) {
        var is_grounded = true
        for (var row_idx=0; row_idx<20; row_idx++){
            if (game.board[row_idx][col_idx] != 'N'){
                if (!is_grounded){
                return false}

            }
            else{
                is_grounded = false}
        }
    }
    return true
}
function detect_win(){

    if (game.total_piece == 1){
        Config.no_of_trial += 1}
    console.log(Config.mode,Record.done_tsd,Record.done_quad)
    if (game.line_clear == 2 && game.b2b >= 0) Record.done_tsd++
    if (game.line_clear == 3 && game.b2b >= 0) Record.done_tst++
    if (game.line_clear == 4) Record.done_quad++

    if (game.total_piece == Config.no_of_piece){
        if ((Config.mode == 'cspin' && Record.done_tsd && Record.done_tst) ||
            (Config.mode == 'dt' && Record.done_tsd && Record.done_tst) ||
            (Config.mode == 'cspinquad' && Record.done_tsd && Record.done_tst && Record.done_quad) ||
            (Config.mode == 'fractal' && Record.done_tsd >=2) ||
            (Config.mode == 'stsd' && Record.done_tsd >=2)){
                sound['win'].play()
                if (Config.auto_next_ind){
                    play_a_map()}
                Config.no_of_success += 1
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
    if (Record.board.length>0){
        game.board = clone(Record.board[Record.board.length-1])
        render()
        setTimeout(retry, 3000)
}
}
/*
5. start
*/
set_event_listener()
load_setting()
load_gamemode()
update_keybind()
board.focus()
play_a_dt_map()
render()

