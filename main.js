const app = new PIXI.Application({width: 1600, height: 900, backgroundColor: 0xFFFFFF});

document.body.appendChild(app.view);

app.loader
    // Symbols
    .add('seven', 'seven.png')
    .add('lemon', 'lemon.png')
    .add('cherries', 'cherries.png')
    .add('grape', 'grape.png')
    .add('bar', 'bar.png')

    // Scene
    .add('initialScreen', 'initialScreen.png')
    .add('winScreen', 'winScreen.png')
    .add('creditsScreen', 'creditsScreen.png')
    .add('mainScene', 'MainScene.png')
    .add('credits', 'credits.png')
    .add('soundon', 'soundon.png')
    .add('soundoff', 'soundoff.png')
    .add('display', 'display.png')
    .add('machine', 'SlotMachine.png')
    .add('cables', 'cables.png')
    .add('electricity1', 'electricity1.png')
    .add('electricity2', 'electricity2.png')
    .add('electricity3', 'electricity3.png')
    .add('electricity4', 'electricity4.png')
    .add('flash', 'flash.png')

    // Lever animation
    .add('lever1', 'lever0000.png')
    .add('lever2', 'lever0001.png')
    .add('lever3', 'lever0002.png')
    .add('lever4', 'lever0003.png')

    // Door animations
    .add('rightdoor', 'rightdoor.png')
    .add('leftdoor', 'leftdoor.png')
    .add('backdoorL', 'backdoor0000.png')
    .add('backdoorM', 'backdoor0001.png')
    .add('backdoorO', 'backdoor0002.png')
    .add('trapdoorLL', 'trapdoor0000.png')
    .add('trapdoorMM', 'trapdoor0001.png')
    .add('trapdoorOL', 'trapdoor0002.png')
    .add('trapdoorOM', 'trapdoor0003.png')
    .add('trapdoorLO', 'trapdoor0004.png')
    .add('trapdoorMO', 'trapdoor0005.png')
    .add('trapdoorOO', 'trapdoor0006.png')

    // Coins
    .add('coin', 'coin.png')
    .add('heap', 'heap.png')

    // Sounds
    .add('lever', 'lever.mp3')
    .add('reelsRolling', 'reelsRolling.mp3')
    .add('reelsStopping', 'reelsStopping.mp3')
    .add('coins', 'coins.mp3')
    .add('lockedBackdoor', 'lockedBackdoor.mp3')
    .add('lockedTrapdoor', 'lockedTrapdoor.mp3')
    .add('electricity', 'electricity.mp3')
    .add('unlocking', 'unlocking.mp3')
    .add('win', 'win.mp3');

PIXI.sound.volumeAll = 1;

app.loader.load((loader, resources) => {
    // Global
    game = new Game();

    app.stage.addChild(game);
});

const symbols = ['cherries', 'lemon', 'grape', 'bar', 'seven'];

class Game extends PIXI.Container {
    constructor() {
        super();

        // The background
        this.background = new PIXI.Sprite(app.loader.resources.mainScene.texture);
        this.addChild(this.background);

        // The cables
        this.cables = new PIXI.Sprite(app.loader.resources.cables.texture);
        this.cables.x = 850;
        this.cables.y = 600;
        this.addChild(this.cables);

        // The doors
        this.rightDoor = new Door("right");
        this.leftDoor = new Door("left");
        this.backDoor = new Door("back");
        this.trapDoor = new Door("trap");
        this.addChild(this.rightDoor);
        this.addChild(this.leftDoor);
        this.addChild(this.backDoor);
        this.addChild(this.trapDoor);

        // The coin heap
        this.coinHeap = new PIXI.Sprite(app.loader.resources.heap.texture);
        this.coinHeap.x = 280;
        this.coinHeap.y = 449;
        this.coinHeap.interactive = true;
        this.coinHeap.pointerdown = () => this.refillCoins();
        this.addChild(this.coinHeap);

        // The coin indicators
        this.coinIndicator = [];
        for (let i = 0; i < 3; i++) {
            this.coinIndicator[i] = new PIXI.Sprite(app.loader.resources.coin.texture);
            this.coinIndicator[i].x = 50 + 60 * i;
            this.coinIndicator[i].y = 50;
            this.coinIndicator[i].scale.set(0.75);
            this.addChild(this.coinIndicator[i]);
        }
        this.numberOfCoins = 0;


        // The machine
        this.machine = new PIXI.Sprite(app.loader.resources.machine.texture);
        this.machine.x = 675;
        this.machine.y = 385;
        this.addChild(this.machine);

        // The lever
        this.lever = new Lever();
        this.addChild(this.lever);

        // The credits button
        this.credits = new PIXI.Sprite(app.loader.resources.credits.texture);
        this.credits.interactive = true;
        this.credits.x = 1380;
        this.credits.y = 0;
        this.credits.alpha = 0.3;
        this.credits.pointerdown = () => {
            this.creditsScreen.visible = true;
            this.initialScreen.visible = true;
            this.soundButton.visible = true;
        }
        this.addChild(this.credits);

        // The display
        this.display = new DisplaySlots();
        this.addChild(this.display);

        // Electricity effects
        this.electricity = new PIXI.Sprite();
        this.electricity.x = 850;
        this.electricity.y = 600;
        this.electricity.filters = [new PIXI.filters.AdvancedBloomFilter({bloomScale: 20, quality: 5, pixelSize: 1})];
        this.electricity.visible = false;
        this.electricity.targetV = 0;
        this.electricity.currentV = 0;
        this.addChild(this.electricity);

        // Fade to black
        this.ftb = new PIXI.Graphics();
        this.ftb.alpha = 0;
        this.ftb.beginFill(0x000000);
        this.ftb.drawRect(0, 0, 1600, 900);
        this.addChild(this.ftb);
        this.targetAlpha = 0;

        // Flash
        this.flash = new PIXI.Sprite(app.loader.resources.flash.texture);
        this.flash.alpha = 0;
        this.addChild(this.flash);

        // The win screen
        this.winScreen = new PIXI.Sprite(app.loader.resources.winScreen.texture);
        this.winScreen.interactive = true;
        this.winScreen.pointerdown = () => this.winScreen.visible = false;
        this.winScreen.visible = false;
        this.addChild(this.winScreen);

        // The initial screen
        this.initialScreen = new PIXI.Sprite(app.loader.resources.initialScreen.texture);
        this.initialScreen.interactive = true;
        this.addChild(this.initialScreen);
        this.initialScreen.pointerdown = () => {PIXI.sound.play('coins'); this.initialScreen.visible = false; this.soundButton.visible = false};

        // The credits screen
        this.creditsScreen = new PIXI.Sprite(app.loader.resources.creditsScreen.texture);
        this.creditsScreen.interactive = true;
        this.creditsScreen.pointerdown = () => {PIXI.sound.play('coins'); this.creditsScreen.visible = false};
        this.addChild(this.creditsScreen);

        // The sound toggle
        this.soundButton = new PIXI.Sprite(app.loader.resources.soundon.texture);
        this.soundButton.interactive = true;
        this.soundButton.anchor.set(0.5);
        this.soundButton.x = 1330;
        this.soundButton.y = 460;
        this.soundButton.scale.set(0.6);
        this.soundButton.alpha = 0.5;
        this.addChild(this.soundButton);

        this.soundButton.pointerdown = () => {
            PIXI.sound.volumeAll = 1 - PIXI.sound.volumeAll;
            this.soundButton.texture = app.loader.resources[(PIXI.sound.volumeAll < 0.5) ? 'soundoff' : 'soundon'].texture;
        };

        // The parameters of the game
        //
        // When going through the right door, it changes the middle symbol by a (fixed) random value
        // When going through the left door, it does the opposite of the right door
        // When going through the trap door, it changes the first two symbols by differents values
        // When going through the back door, it changes all symbols by different values.

        function randSymExcept(excludedValues) {
            // Generates a random number between 1 and 4 (included), but not in the array excludedValues
            let result = Math.floor(Math.random() * 4) + 1;
            if (excludedValues.includes(result))
                return randSymExcept(excludedValues);
            else
                return result;
        }

        let deltaSym = {};
        let positions = Math.random() < 0.5 ? [1, 2, 0] : [1, 0, 2];
        let value1 = randSymExcept([]);
        let value12 = randSymExcept([value1]);
        let value22 = randSymExcept([value12]);
        let value13 = randSymExcept([value1, value12]);
        let value23 = randSymExcept([value13, value22]);
        let value33 = randSymExcept([value13, value23]);

        deltaSym.right = [0, 0, 0];
        deltaSym.right[positions[0]] = value1;
        deltaSym.left = [0, 0, 0];
        deltaSym.left[positions[0]] = (5 - value1) % 5;
        deltaSym.trap = [0, 0, 0];
        deltaSym.trap[positions[0]] = value12;
        deltaSym.trap[positions[1]] = value22;
        deltaSym.back = [0, 0, 0];
        deltaSym.back[positions[0]] = value13;
        deltaSym.back[positions[1]] = value23;
        deltaSym.back[positions[2]] = value33;

        this.deltaSym = deltaSym;
    }

    spin() {
        PIXI.sound.play('lever');

        if (this.numberOfCoins == 0) {
            this.lever.targetV = 0.4;
            return;
        }

        PIXI.sound.play('reelsRolling');

        this.numberOfCoins--;
        this.lever.targetV = 1;

        this.display.spin();
    }

    goThrough(door) {
        this.targetAlpha = 1;
        this.display.shiftSymbols(door);
    }

    refillCoins() {
        if (this.numberOfCoins < 3)
            PIXI.sound.play('coins');
        this.numberOfCoins = Math.max(this.numberOfCoins, 3);
    }

    unlock(lock) {
        if (lock != 'win')
            PIXI.sound.play('electricity');

        if (lock == 'trapL') {
            this.electricCable = 1;
            this.electricity.targetV = 1;
        }
        if (lock == 'trapR') {
            this.electricCable = 2;
            this.electricity.targetV = 1;
        }
        if (lock == 'back') {
            this.electricCable = 3;
            this.electricity.targetV = 1;
        }
        if (lock == 'win') {
            this.electricCable = 4;
            this.electricity.targetV = 1;
        }
    }

    _render() {
        const alphaSpeed = 0.003;

        // Fade to black
        this.ftb.alpha = transit(this.ftb.alpha, this.targetAlpha, alphaSpeed * app.ticker.deltaMS);
        if (this.ftb.alpha == 1)
            this.targetAlpha = 0;

        const flashSpeed = 0.007;

        // Flash
        this.flash.alpha = transit(this.flash.alpha, 0, flashSpeed * app.ticker.deltaMS);

        const elSpeed = 0.003;

        this.electricity.currentV = transit(this.electricity.currentV, this.electricity.targetV, elSpeed * app.ticker.deltaMS);
        if (this.electricity.currentV > 0) {
            this.electricity.texture = app.loader.resources['electricity' + this.electricCable].texture;

            if (this.electricity.mask)
                this.electricity.mask.destroy();
            const lengths = [300, 350, 450, 500];
            const mask = new PIXI.Graphics();
            mask.beginFill(0x000000);
            mask.drawRect(880 + this.electricity.currentV * lengths[this.electricCable - 1], 0, 10, 900);
            mask.endFill();
            this.electricity.mask = mask;
            this.electricity.visible = true;
        }
        if (this.electricity.currentV == 1) {
            this.electricity.visible = false;
            this.electricity.targetV = 0;
            this.electricity.currentV = 0;

            let flash = false;
            if (this.electricCable == 1) {
                this.flash.x = 1000;
                this.flash.y = 650;
                flash = this.trapDoor.lockedL
                this.trapDoor.lockedL = false;
            } else if (this.electricCable == 2) {
                this.flash.x = 1150;
                this.flash.y = 650;
                flash = this.trapDoor.lockedR
                this.trapDoor.lockedR = false;
            } else if (this.electricCable == 3) {
                this.flash.x = 1150;
                this.flash.y = 450;
                flash = this.backDoor.locked;
                this.backDoor.locked = false;
            } else {
                PIXI.sound.volume('win', 0.5);
                PIXI.sound.play('win');
                this.winScreen.visible = true;
            }

            if (flash) {
                this.flash.alpha = 1;
                PIXI.sound.play('unlocking');
            }
        }

        for (let i = 0; i < 3; i++) {
            this.coinIndicator[i].visible = (this.numberOfCoins >= i + 1);
        }
    }
}

class Lever extends PIXI.Container {
    constructor() {
        super();
        this.sprite = new PIXI.Sprite(app.loader.resources.lever1.texture)
        this.sprite.x = 785;
        this.sprite.y = 505;
        this.interactive = true;
        this.pointerdown = () => this.parent.spin();
        this.addChild(this.sprite);

        this.targetV = 0;
        this.currentV = 0;
    }

    _render() {
        const leverSpeed = 0.004;

        this.currentV = transit(this.currentV, this.targetV, leverSpeed * app.ticker.deltaMS);

        if (this.currentV < 0.25)
            this.sprite.texture = app.loader.resources.lever1.texture;
        else if (this.currentV < 0.5)
            this.sprite.texture = app.loader.resources.lever2.texture;
        else if (this.currentV < 0.75)
            this.sprite.texture = app.loader.resources.lever3.texture;
        else
            this.sprite.texture = app.loader.resources.lever4.texture;

        if ((this.currentV === this.targetV) && (this.targetV > 0))
            this.targetV = 0;
    }
}

class DisplaySlots extends PIXI.Container {
    constructor() {
        super();

        // Initially invisible
        this.visible = false;

        // The backdrop
        var graphics = new PIXI.Graphics();
        graphics.alpha = 0.4;
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, 1600, 900);
        this.addChild(graphics);

        // The display
        this.display = new PIXI.Sprite(app.loader.resources.display.texture);
        this.display.x = 390;
        this.display.y = -20;
        this.addChild(this.display);

        // The symbols
        this.reels = [];
        let remainingSymbols = [0, 1, 2, 3];
        for (let i = 0; i < 3; i++) {
            let k = Math.floor(Math.random() * remainingSymbols.length);
            this.reels[i] = new Reel(remainingSymbols[k], 535 + 200 * i, 500 * (i + 1));
            this.addChild(this.reels[i]);
            remainingSymbols.splice(k, 1);
        }
        this.reels[2].spinningFinishedCallback = () => this.spinningFinished();

        this.interactive = true;
        this.pointerdown = () => this.dismiss();
    }

    dismiss() {
        this.visible = false;
        PIXI.sound.stop('reelsRolling');
    }

    spin() {
        this.visible = true;
        this.reels.forEach(reel => reel.spin());
    }

    spinningFinished() {
        this.parent.lever.targetV = 0;
        let a = this.reels[0].tID;
        let b = this.reels[1].tID;
        let c = this.reels[2].tID;
        if (a == b && b == c && a == 4)
            this.parent.unlock("win");
        else if (a == b && b == c)
            this.parent.unlock("back");
        else if (a == b)
            this.parent.unlock("trapL");
        else if (b == c)
            this.parent.unlock("trapR");

        this.reels[0].setHighlight(a == b);
        this.reels[1].setHighlight((a == b || b == c));
        this.reels[2].setHighlight(b == c);
    }

    shiftSymbols(door) {
        this.dismiss();
        for (let i = 0; i < 3; i++) {
            this.reels[i].shiftSymbol(this.parent.deltaSym[door][i]);
        }
    }
}

class Door extends PIXI.Container {
    constructor(door) {
        super();
        let sprite = new PIXI.Sprite();
        if (door == 'right') {
            sprite.texture = app.loader.resources.rightdoor.texture;
            sprite.x = 1474;
            sprite.y = 367;
        }
        if (door == 'left') {
            sprite.texture = app.loader.resources.leftdoor.texture;
            sprite.x = 16;
            sprite.y = 378;
        }
        if (door == 'trap') {
            sprite.texture = app.loader.resources.trapdoorLL.texture;
            sprite.x = 1047;
            sprite.y = 700;
            sprite.tint = 0xDDDDDD;

            this.lockedL = true;
            this.lockedR = true;
        }
        if (door == 'back') {
            sprite.texture = app.loader.resources.backdoorL.texture;
            sprite.x = 1210;
            sprite.y = 376;
            this.locked = true;
        }
        this.addChild(sprite);
        this.sprite = sprite;

        this.interactive = true;
        this.pointerdown = () => this.goThrough();
        this.door = door;

        this.currentV = 0;
        this.targetV = 0;
    }

    isLocked() {
        if (this.locked)
            return true;
        if (this.lockedL || this.lockedR)
            return true;
        return false;
    }

    goThrough() {
        if (!this.isLocked())
            this.parent.goThrough(this.door)
        else {
            if (this.door == 'back')
                PIXI.sound.play('lockedBackdoor');
            if (this.door == 'trap')
                PIXI.sound.play('lockedTrapdoor');
            this.targetV = 0.4;
        }
    }

    _render() {
        const doorSpeed = 0.004;

        this.currentV = transit(this.currentV, this.targetV, doorSpeed * app.ticker.deltaMS);
        let tx;

        if (this.currentV < 0.25)
            tx = 'L';
        else
            tx = 'M';
        if (this.currentV == this.targetV && this.targetV > 0)
            this.targetV = 0;

        if (this.door == 'back') {
            let texture = 'backdoorO';
            if (this.locked)
                texture = 'backdoor' + tx;

            this.sprite.texture = app.loader.resources[texture].texture;
        }
        if (this.door == 'trap') {
            let txL = this.lockedL ? tx : 'O';
            let txR = this.lockedR ? tx : 'O';
            let texture = 'trapdoor' + txL + txR;
            this.sprite.texture = app.loader.resources[texture].texture;
        }
    }
}

function transit(current, goal, speed) {
    if (current > goal)
        current = Math.max(current - speed, goal)
    else
        current = Math.min(current + speed, goal)

    return current;
}

const symbolY = 210;

class Reel extends PIXI.Container {
    constructor(tID, x, duration) {
        super();

        // The sprite
        this.symbol = new PIXI.Sprite();
        this.symbol.x = x;
        this.symbol.y = symbolY;
        this.symbol.anchor.set(0.2);
        this.symbol.scale.set(1.5);
        this.addChild(this.symbol);
        this.tID = tID;

        // The mask
        const mask = new PIXI.Graphics();
        mask.beginFill(0x000000);
        mask.drawRect(0, 180, 1600, 150);
        mask.endFill();
        this.symbol.mask = mask;

        // The blur filter
        let filter = new PIXI.filters.BlurFilter();
        filter.blurX = 5;
        filter.blurY = 30;
        filter.quality = 10;
        this.filter = filter;

        this.lt = duration;
        this.duration = duration;
    }

    setHighlight(b) {
        this.alpha = b ? 1 : 0.4;
    }

    spin() {
        this.filters = [this.filter];
        this.lt = 0;
        this.alpha = 1;
        this.symbol.scale.set(1.5);
        this.sentCallback = false;
    }

    shiftSymbol(k) {
        this.tID += 5 + k;
        this.tID = this.tID % 5;
    }

    _render() {
        this.lt += app.ticker.deltaMS;

        let tID;
        if (this.lt < this.duration) {
            tID = Math.floor(Math.random() * 5);
            this.symbol.y = symbolY + (Math.random() - 0.5) * 140;
        } else {
            tID = this.tID;
            this.symbol.y = symbolY;
            this.filters = [];
            if (this.spinningFinishedCallback && !this.sentCallback) {
                this.spinningFinishedCallback();
                PIXI.sound.stop('reelsRolling');
            }
            if (!this.sentCallback)
                PIXI.sound.play('reelsStopping');
            this.sentCallback = true;
        }

        this.symbol.texture = app.loader.resources[symbols[tID]].texture;
    }
}
