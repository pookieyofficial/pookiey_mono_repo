const { withMainApplication } = require("@expo/config-plugins");

/**
 * Twilio Voice RN SDK requires VoiceApplicationProxy to be initialized from the Android Application
 * (constructor + onCreate). Without this, TwilioVoiceReactNativeModule crashes during
 * create_react_context with:
 *   VoiceApplicationProxy.instance == null
 *   -> getJSEventEmitter() NPE
 *
 * This plugin injects the initialization into the generated MainApplication (Java or Kotlin).
 */
module.exports = function withTwilioVoiceAndroid(config) {
  return withMainApplication(config, (mod) => {
    let src = mod.modResults.contents;

    // Idempotency: if we already injected, do nothing.
    if (src.includes("VoiceApplicationProxy(") || src.includes("new VoiceApplicationProxy(")) {
      mod.modResults.contents = src;
      return mod;
    }

    // Ensure import exists (Kotlin or Java).
    if (!src.includes("com.twiliovoicereactnative.VoiceApplicationProxy")) {
      // Kotlin: add after package line
      if (src.includes("\npackage ") || src.startsWith("package ")) {
        const pkgMatch = src.match(/^\s*package\s+[^\n]+\n/m);
        if (pkgMatch) {
          const insertAt = pkgMatch.index + pkgMatch[0].length;
          src = src.slice(0, insertAt) + "\nimport com.twiliovoicereactnative.VoiceApplicationProxy\n" + src.slice(insertAt);
        }
      }
      // Java: add after package declaration
      if (src.includes("package ") && !src.includes("import ")) {
        // no-op; typical templates have imports, handled below
      }
      if (src.includes("package ") && src.includes("import ") && !src.includes("import com.twiliovoicereactnative.VoiceApplicationProxy")) {
        src = src.replace(
          /(package\s+[^\n;]+;?\s*\n)/,
          "$1\nimport com.twiliovoicereactnative.VoiceApplicationProxy;\n"
        );
      }
    }

    // Inject initialization in onCreate right after super.onCreate.
    if (src.includes("override fun onCreate()")) {
      // Kotlin
      src = src.replace(
        /override fun onCreate\(\)\s*\{\s*\n(\s*)super\.onCreate\(\)\s*\n/,
        (m, indent) =>
          `override fun onCreate() {\n${indent}super.onCreate()\n${indent}VoiceApplicationProxy(this).onCreate()\n`
      );
    } else if (src.includes("public void onCreate()")) {
      // Java
      src = src.replace(
        /public void onCreate\(\)\s*\{\s*\n(\s*)super\.onCreate\(\);\s*\n/,
        (m, indent) =>
          `public void onCreate() {\n${indent}super.onCreate();\n${indent}new VoiceApplicationProxy(this).onCreate();\n`
      );
    }

    mod.modResults.contents = src;
    return mod;
  });
};


