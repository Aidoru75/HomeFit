const { withProjectBuildGradle, withAppBuildGradle } = require('expo/config-plugins');

function withDisableLint(config) {
  // Patch root build.gradle — disable lintVitalAnalyze/Report for all subprojects
  config = withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes('lintVitalAnalyze')) {
      config.modResults.contents = contents.replace(
        /allprojects\s*\{[\s\S]*?(\n\s*)\}/m,
        (match, indent) =>
          match.replace(
            /\n(\s*)\}$/,
            `\n$1afterEvaluate { project ->\n$1  project.tasks.configureEach { task ->\n$1    if (task.name.contains("lintVitalAnalyze") || task.name.contains("lintVitalReport")) {\n$1      task.enabled = false\n$1    }\n$1  }\n$1}\n$1}`
          )
      );
    }
    return config;
  });

  // Patch app/build.gradle — disable lint for release builds
  config = withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes('checkReleaseBuilds')) {
      config.modResults.contents = contents.replace(
        /(compileSdk\s+.*\n)/,
        `$1\n    lintOptions {\n        checkReleaseBuilds false\n        abortOnError false\n    }\n`
      );
    }
    return config;
  });

  return config;
}

module.exports = withDisableLint;
