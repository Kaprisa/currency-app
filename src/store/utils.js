import {OrderedMap, Map, fromJS} from 'immutable'

export function mapDataToEntries(data, RecordModel = Map) {
    if (!data) return new OrderedMap({});
    return new OrderedMap(fromJS(data.reduce((prev, item) => {
        prev[item.id] = new RecordModel(item);
        return prev;
    }, {})))
}
