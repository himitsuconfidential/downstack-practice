function toggleBurger() {
    const dropdown = document.querySelector('.nav .dropdown');
    dropdown.classList.toggle('open');
}

function toggleSettings() {
    const dropdown = document.querySelector('.nav .dropdown');
    const setting = document.getElementById('setting');
    dropdown.classList.remove('open');
    setting.classList.toggle('open');

}

function closeSettings() {
    const setting = document.getElementById('setting');
    setting.classList.remove('open');
}

function toggleOptions() {
    const gamemode = document.getElementById('gamemode');
    const game_button = document.getElementById('game_button');
    if (gamemode.classList.contains('open')) {
        game_button.innerHTML = 'Show Options';
    } else {
        game_button.innerHTML = 'Hide Options';
    }
    gamemode.classList.toggle('open');
}