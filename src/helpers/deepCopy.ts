export const deepCopy = <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    let copiedObj: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            copiedObj[key] = deepCopy(obj[key]);
        }
    }

    return copiedObj;
}