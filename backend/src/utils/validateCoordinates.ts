export const isValidLocation = (longitude: number, latitude: number): boolean => {
    if (longitude < -180 || longitude > 180) {
        return false; // invalid longitude
    } else if (latitude < -90 || latitude > 90) {
        return false; // invalid latitude
    } else {
        return true; // valid
    }
}
