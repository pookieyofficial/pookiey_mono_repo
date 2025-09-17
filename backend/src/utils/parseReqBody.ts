type AnyObject = Record<string, any>;

export function parseForMonggoSetUpdates(obj: AnyObject, prefix = ''): AnyObject {
    const result: AnyObject = {};

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            result[path] = value;
        } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
            const nested = parseForMonggoSetUpdates(value, path);
            Object.assign(result, nested);
        } else {
            result[path] = value;
        }
    }

    return result;
}
