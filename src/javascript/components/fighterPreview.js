import createElement from '../helpers/domHelper';

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}

export function createFighterPreview(fighter, position) {
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    if (!fighter) {
        const emptyState = createElement({ tagName: 'div', className: 'fighter-preview___empty' });

        emptyState.innerText = 'Select a fighter';
        fighterElement.append(emptyState);

        return fighterElement;
    }

    const imageElement = createFighterImage(fighter);
    const nameElement = createElement({ tagName: 'div', className: 'fighter-preview___name' });
    const statsElement = createElement({ tagName: 'div', className: 'fighter-preview___stats' });

    nameElement.innerText = fighter.name;
    statsElement.innerText = `Health: ${fighter.health} | Attack: ${fighter.attack} | Defense: ${fighter.defense}`;

    fighterElement.append(imageElement, nameElement, statsElement);

    return fighterElement;
}
