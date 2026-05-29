import callApi from '../helpers/apiHelper';

class FighterService {
    #endpoint = 'fighters.json';

    #detailsEndpoint = 'details/fighter';

    async getFighters() {
        return callApi(this.#endpoint);
    }

    async getFighterDetails(id) {
        return callApi(`${this.#detailsEndpoint}/${id}.json`);
    }
}

const fighterService = new FighterService();

export default fighterService;
