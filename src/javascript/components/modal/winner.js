import { showModal } from './modal';
import createElement from '../../helpers/domHelper';

const victorySources = {
    'Ryu': 'https://i.pinimg.com/originals/fe/c2/9c/fec29c46dff0df3eaeab8660a8933ed0.gif',
    'Dhalsim': 'https://i.gifer.com/78Eh.gif',
    'Guile': 'https://www.fightersgeneration.com/characters/guile-sf2-win1.gif',
    'Zangief': 'https://media.tenor.com/jGRuH1CBcVEAAAAj/street-fighter-zangief.gif',
    'Ken': 'https://www.fightersgeneration.com/characters2/ken-sfa-win.gif',
    'Bison': 'https://www.fightersgeneration.com/np6/char/gifus/bison-flyback.gif'
};

function createWinnerImage(fighter) {
    const winnerSource = victorySources[fighter.name] || fighter.source;

    return createElement({
        tagName: 'img',
        className: 'winner-modal___img',
        attributes: {
            src: winnerSource,
            title: fighter.name,
            alt: fighter.name
        }
    });
}

export default function showWinnerModal(fighter) {
    const bodyElement = createElement({ tagName: 'div', className: 'modal-body winner-modal___body' });
    const imageElement = createWinnerImage(fighter);
    const nameElement = createElement({ tagName: 'div', className: 'winner-modal___name' });

    nameElement.innerText = `${fighter.name} wins`;
    bodyElement.append(imageElement, nameElement);

    return showModal({
        title: 'Winner',
        bodyElement
    });
}
