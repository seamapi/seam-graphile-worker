module.exports = {
  files: ["tests/**/*.test.ts"],
  extensions: ["ts"],
  require: ["esbuild-register"],
  ignoredByWatcher: [".next", ".nsm"],
  "snapshotDir": "tests/__snapshots__"
}
