import {OrderedMap, Map, fromJS} from 'immutable'

export function mapDataToEntries(data, RecordModel = Map) {
    if (!data) return new OrderedMap({})
    return new OrderedMap(fromJS(data.reduce((prev, curr) => {
        prev[curr.id] = new RecordModel(curr)
        return prev
    }, {})))
}