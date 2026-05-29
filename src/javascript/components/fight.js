import { controls as gameControls } from '../../constants/controls';

const attackSources = {
    'Ryu': 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3ZkNHY0dHc4MXVtb2J0NmY3OW5vcnFvMDBveHlzZjIyenBrOHFmcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmYzQ9cw/7yYtA4Sx2y0mY/giphy.gif',
    'Dhalsim': 'https://www.fightersgeneration.com/characters/dhalsim-yogafire1a.gif',
    'Guile': 'https://www.fightersgeneration.com/np7/char/gifs/guile/a/guile-cfe-a5.gif',
    'Zangief': 'https://www.fightersgeneration.com/characters/zangief-fireballstop.gif',
    'Ken': 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXl1M283dXRjOWk5bWE4Z3hlY3k4bWhmcmJsZGgyMW1idzR4ejl6NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/tvkonzi46uJCE/giphy.gif',
    'Bison': 'https://www.fightersgeneration.com/characters/bison-cvs-smash.gif'
};

const blockSources = {
    'Ryu': 'https://www.fightersgeneration.com/characters3/ryu-block-low.gif',
    'Ken': 'https://www.sfrpg.com.br/img/2009/11/ken-block2.gif'
};

const defeatSources = {
    'Ryu': 'https://www.fightersgeneration.com/characters3/ryu-slam.gif',
    'Guile': 'https://www.fightersgeneration.com/np7/char/gifs/guile/guile-cfe-twist.gif',
    'Zangief': 'https://media1.tenor.com/m/9a-EU4W-SPAAAAAC/zangief-street.gif',
    'Ken': 'https://fightersgeneration.com/characters2/ken-twist.gif'
};

const attackAnimationDuration = 800;
const defeatAnimationDuration = 1200;
const attackRestoreTimers = new Map();

Object.values(attackSources).forEach(source => {
    if (typeof Image !== 'undefined') {
        const preloadImage = new Image();
        preloadImage.src = source;
    }
});

Object.values(blockSources).forEach(source => {
    if (typeof Image !== 'undefined') {
        const preloadImage = new Image();
        preloadImage.src = source;
    }
});

function cleanup(onKeyDown, onKeyUp) {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
}

function getCriticalHitPower(fighter) {
    return 2 * fighter.attack;
}

function canUseCriticalHit(fighter) {
    return Date.now() - fighter.lastCriticalHitTime >= 10000;
}

export function getHitPower(fighter) {
    const criticalHitChance = 1 + Math.random();

    return fighter.attack * criticalHitChance;
}

export function getBlockPower(fighter) {
    const dodgeChance = 1 + Math.random();

    return fighter.defense * dodgeChance;
}

export function getDamage(attacker, defender) {
    const hitPower = getHitPower(attacker);

    if (!defender.isBlocking) {
        return hitPower;
    }

    const blockPower = getBlockPower(defender);

    return blockPower > hitPower ? 0 : hitPower - blockPower;
}

function getOpponent(firstState, secondState, attacker) {
    return attacker === firstState ? secondState : firstState;
}

function updateHealthBar(firstState, fighter) {
    const fighterPosition = fighter === firstState ? 'left' : 'right';
    const healthBar = document.getElementById(`${fighterPosition}-fighter-indicator`);

    if (healthBar) {
        const healthPercent = Math.max((fighter.currentHealth / fighter.maxHealth) * 100, 0);
        healthBar.style.width = `${healthPercent}%`;
    }
}

function playAttackAnimation(attacker) {
    const fighterElement = document.querySelector(`[data-fighter-position="${attacker.position}"]`);
    const fighterImage = fighterElement?.querySelector('img');
    const attackSource = attackSources[attacker.name];

    if (!fighterImage || !attackSource) {
        return;
    }

    if (attackRestoreTimers.has(attacker.position)) {
        return;
    }

    const originalSource = fighterImage.getAttribute('src');
    fighterImage.setAttribute('src', attackSource);

    const timerId = window.setTimeout(() => {
        const blockSource = blockSources[attacker.name];
        const nextSource = attacker.isBlocking && blockSource ? blockSource : attacker.source;

        fighterImage.setAttribute('src', nextSource || originalSource);
        attackRestoreTimers.delete(attacker.position);
    }, attackAnimationDuration);

    attackRestoreTimers.set(attacker.position, timerId);
}

function updateBlockAnimation(fighter) {
    const blockSource = blockSources[fighter.name];

    if (!blockSource) {
        return;
    }

    const fighterElement = document.querySelector(`[data-fighter-position="${fighter.position}"]`);
    const fighterImage = fighterElement?.querySelector('img');

    if (!fighterImage || attackRestoreTimers.has(fighter.position)) {
        return;
    }

    fighterImage.setAttribute('src', fighter.isBlocking ? blockSource : fighter.source);
}

function playDefeatAnimation(loser) {
    const fighterElement = document.querySelector(`[data-fighter-position="${loser.position}"]`);
    const fighterImage = fighterElement?.querySelector('img');
    const defeatSource = defeatSources[loser.name];

    if (!fighterImage || !defeatSource) {
        return window.setTimeout(() => {}, 0);
    }

    const restoreTimer = attackRestoreTimers.get(loser.position);

    if (restoreTimer) {
        window.clearTimeout(restoreTimer);
        attackRestoreTimers.delete(loser.position);
    }

    const originalSource = fighterImage.getAttribute('src');
    fighterImage.setAttribute('src', defeatSource);

    return window.setTimeout(() => {
        fighterImage.setAttribute('src', originalSource);
    }, defeatAnimationDuration);
}

export async function fight(firstFighter, secondFighter) {
    const firstState = {
        ...firstFighter,
        position: 'left',
        maxHealth: firstFighter.health,
        currentHealth: firstFighter.health,
        isBlocking: false,
        lastCriticalHitTime: 0
    };
    const secondState = {
        ...secondFighter,
        position: 'right',
        maxHealth: secondFighter.health,
        currentHealth: secondFighter.health,
        isBlocking: false,
        lastCriticalHitTime: 0
    };
    const pressedKeys = new Set();

    return new Promise(resolve => {
        const finishFight = (winner, loser, onKeyDownRef, onKeyUpRef) => {
            cleanup(onKeyDownRef, onKeyUpRef);
            playDefeatAnimation(loser);

            window.setTimeout(() => {
                resolve({ winner, loser });
            }, defeatAnimationDuration);
        };

        function updateBlockStates() {
            firstState.isBlocking = pressedKeys.has(gameControls.PlayerOneBlock);
            secondState.isBlocking = pressedKeys.has(gameControls.PlayerTwoBlock);
            updateBlockAnimation(firstState);
            updateBlockAnimation(secondState);
        }

        function applyDamage(attacker, defender, damage) {
            const nextHealth = Math.max(defender.currentHealth - damage, 0);
            const defenderState = defender;

            defenderState.currentHealth = nextHealth;
            updateHealthBar(firstState, defenderState);

            return nextHealth === 0 ? { winner: attacker, loser: defenderState } : null;
        }

        function runAttack(attacker) {
            if (attacker.isBlocking) {
                return null;
            }

            playAttackAnimation(attacker);

            const defender = getOpponent(firstState, secondState, attacker);

            if (defender.isBlocking) {
                return null;
            }

            return applyDamage(attacker, defender, getDamage(attacker, defender));
        }

        function runCritical(attacker) {
            if (attacker.isBlocking || !canUseCriticalHit(attacker)) {
                return null;
            }

            playAttackAnimation(attacker);

            const defender = getOpponent(firstState, secondState, attacker);
            const attackerState = attacker;

            attackerState.lastCriticalHitTime = Date.now();

            return applyDamage(attackerState, defender, getCriticalHitPower(attackerState));
        }

        function onKeyUp(event) {
            pressedKeys.delete(event.code);
            updateBlockStates();
        }

        function onKeyDown(event) {
            if (event.repeat) {
                return;
            }

            pressedKeys.add(event.code);
            updateBlockStates();

            const firstCriticalCombo =
                gameControls.PlayerOneCriticalHitCombination.includes(event.code) &&
                gameControls.PlayerOneCriticalHitCombination.every(key => pressedKeys.has(key));
            const secondCriticalCombo =
                gameControls.PlayerTwoCriticalHitCombination.includes(event.code) &&
                gameControls.PlayerTwoCriticalHitCombination.every(key => pressedKeys.has(key));

            const battleResult =
                (event.code === gameControls.PlayerOneAttack && runAttack(firstState)) ||
                (event.code === gameControls.PlayerTwoAttack && runAttack(secondState)) ||
                (firstCriticalCombo && runCritical(firstState)) ||
                (secondCriticalCombo && runCritical(secondState));

            if (battleResult) {
                finishFight(battleResult.winner, battleResult.loser, onKeyDown, onKeyUp);
            }
        }

        updateHealthBar(firstState, firstState);
        updateHealthBar(firstState, secondState);

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    });
}
