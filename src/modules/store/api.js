import axios from '../axios';

class API {
    async add(name, data) {
        const {data: id} = await axios.post(`/${name}`, data);
        return id;
    }

    delete(name, id) {
        return axios.delete(`/${name}/${id}`);
    }

    getAll(name) {
        return axios.get(`/${name}`).then(({ data }) => data);
    }
}

export default new API()
