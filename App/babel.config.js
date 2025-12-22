module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // Required by react-native-reanimated (v2/v3). Must be listed last.
            "react-native-reanimated/plugin",
        ],
    };
};
