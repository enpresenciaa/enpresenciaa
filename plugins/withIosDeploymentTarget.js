const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs").promises;
const path = require("path");

const DEPLOYMENT_TARGET = "17.0";
const MARKER = "Set iOS 17.0 for all targets (Voltra widget)";

/**
 * Ensures every iOS target (app + extensions like Voltra widget) has
 * IPHONEOS_DEPLOYMENT_TARGET = 17.0 so Swift APIs like containerBackground(for: .widget) compile.
 */
function withIosDeploymentTarget(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let contents = await fs.readFile(podfilePath, "utf8");
      if (contents.includes(MARKER)) return cfg;

      const patch = `
  # ${MARKER}
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${DEPLOYMENT_TARGET}'
    end
  end
`;
      contents = contents.replace(
        /post_install do \|installer\|/,
        `post_install do |installer|${patch}`,
      );
      await fs.writeFile(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withIosDeploymentTarget;
