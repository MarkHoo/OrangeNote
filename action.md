
cargo in /src-tauri for glib - Update #1411593672 #7

```text
updater | 2026/06/14 06:53:12 INFO <job_1411593672> Requirements to unlock update_not_possible
2026/06/14 06:53:12 INFO <job_1411593672> Requirements update strategy bump_versions_if_necessary
updater | 2026/06/14 06:53:12 INFO <job_1411593672> The latest possible version of glib that can be installed is 0.18.5
updater | 2026/06/14 06:53:12 INFO <job_1411593672> The earliest fixed version is 0.20.0.
  proxy | 2026/06/14 06:53:12 [814] POST /update_jobs/1411593672/record_update_job_error
  proxy | 2026/06/14 06:53:12 [814] 204 /update_jobs/1411593672/record_update_job_error
  proxy | 2026/06/14 06:53:12 [816] POST /update_jobs/1411593672/record_ecosystem_meta
  proxy | 2026/06/14 06:53:12 [816] 204 /update_jobs/1411593672/record_ecosystem_meta
  proxy | 2026/06/14 06:53:12 [818] PATCH /update_jobs/1411593672/mark_as_processed
  proxy | 2026/06/14 06:53:13 [818] 204 /update_jobs/1411593672/mark_as_processed
updater | 2026/06/14 06:53:13 INFO <job_1411593672> Finished job processing
updater | 2026/06/14 06:53:13 INFO Results:
Dependabot encountered '1' error(s) during execution, please check the logs for more details.
+-----------------------------------------------------------------------------+
|                                   Errors                                    |
+------------------------------+----------------------------------------------+
| Type                         | Details                                      |
+------------------------------+----------------------------------------------+
| security_update_not_possible | {                                            |
|                              |   "dependency-name": "glib",                 |
|                              |   "latest-resolvable-version": "0.18.5",     |
|                              |   "lowest-non-vulnerable-version": "0.20.0", |
|                              |   "conflicting-dependencies": []             |
|                              | }                                            |
+------------------------------+----------------------------------------------+
Failure running container a88ca85bda563632f54f7cd3ccb7fcc47b3622981462a7240c750b4ce7d28937: Error: Command failed with exit code 1: /bin/sh -c $DEPENDABOT_HOME/dependabot-updater/bin/run update_files
Cleaned up container a88ca85bda563632f54f7cd3ccb7fcc47b3622981462a7240c750b4ce7d28937
  proxy | 2026/06/14 06:53:13 1/909 calls cached (0%)
2026/06/14 06:53:13 Posting metrics to remote API endpoint
  proxy | 2026/06/14 06:53:13 Successfully posted metrics data via api client
Error: Dependabot encountered an error performing the update

Error: The updater encountered one or more errors.

For more information see: https://github.com/MarkHoo/OrangeNote/network/updates/1411593672 (write access to the repository is required to view the log)
🤖 ~ finished: error reported to Dependabot ~
```


npm_and_yarn in /app-frontend for esbuild, vite, @vitejs/plugin-react - Update #1411593882 #9

```
Run github/dependabot-action@main
🤖 ~ starting update ~
Fetching job details
🤖 ~ Failed to parse GITHUB_REGISTRIES_PROXY environment variable ~
Pulling updater images
Starting update process
Created proxy container: 64b3db8ef04234398bfb035aeecb15d698b126751c08fb97488abdc1976e8bfd
Created container: 77e5d0ef65f061c32c842f65029d1ddc2cca893ea7d2fe30f5f6d5d9b1e20541
Started container 77e5d0ef65f061c32c842f65029d1ddc2cca893ea7d2fe30f5f6d5d9b1e20541
  proxy | 2026/06/14 06:53:52 proxy starting, commit: bf13607d24f11c5313dd547916eede60172a1f91
  proxy | 2026/06/14 06:53:52 Listening (:1080)
updater | Updating certificates in /etc/ssl/certs...
updater | rehash: warning: skipping ca-certificates.crt,it does not contain exactly one certificate or CRL
updater | 1 added, 0 removed; done.
updater | Running hooks in /etc/ca-certificates/update.d...
updater | done.
updater | fetch_files command is no longer used directly
updater | 2026/06/14 06:53:56 INFO <job_1411593882> Starting job processing
updater | 2026/06/14 06:53:57 INFO <job_1411593882> Job definition: {"job":{"command":"recreate","allowed-updates":[{"dependency-type":"direct","update-type":"all"}],"commit-message-options":{"prefix":null,"prefix-development":null,"include-scope":null},"credentials-metadata":[{"type":"git_source","host":"github.com"}],"debug":null,"dependencies":["esbuild","vite","@vitejs/plugin-react"],"dependency-groups":[],"dependency-group-to-refresh":null,"existing-pull-requests":[{"pr-number":1,"dependencies":[{"dependency-name":"@vitejs/plugin-react","dependency-version":"6.0.2","directory":"/app-frontend"},{"dependency-name":"vite","dependency-version":"8.0.16","directory":"/app-frontend"}]},{"pr-number":2,"dependencies":[{"dependency-name":"@vitejs/plugin-react","dependency-version":"6.0.2","directory":"/app-frontend"},{"dependency-name":"esbuild","directory":"/app-frontend","dependency-removed":true},{"dependency-name":"vite","dependency-version":"8.0.16","directory":"/app-frontend"}]},{"pr-number":3,"dependencies":[{"dependency-name":"@vitejs/plugin-react","dependency-version":"6.0.2","directory":"/"},{"dependency-name":"esbuild","directory":"/","dependency-removed":true},{"dependency-name":"vite","dependency-version":"8.0.16","directory":"/"}]},{"pr-number":4,"dependencies":[{"dependency-name":"@vitejs/plugin-react","dependency-version":"6.0.2","directory":"/"},{"dependency-name":"vite","dependency-version":"8.0.16","directory":"/"}]}],"existing-group-pull-requests":[],"experiments":{"record-ecosystem-versions":true,"record-update-job-unknown-error":true,"proxy-cached":true,"enable-corepack-for-npm-and-yarn":true,"enable-private-registry-for-corepack":true,"allow-refresh-for-existing-pr-dependencies":true,"allow-refresh-group-with-all-dependencies":true,"azure-registry-backup":true,"enable-enhanced-error-details-for-updater":true,"gradle-lockfile-updater":true,"enable-exclude-paths-subdirectory-manifest-files":true,"workflow-job-summary":true,"async-retry":true},"ignore-conditions":[],"lockfile-only":false,"max-updater-run-time":2700,"package-manager":"npm_and_yarn","requirements-update-strategy":null,"reject-external-code":false,"security-advisories":[{"dependency-name":"esbuild","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 0.17.0 < 0.28.1"]},{"dependency-name":"esbuild","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 0.27.3 < 0.28.1"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":["<= 5.4.8"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 8.0.0 <= 8.0.4",">= 7.0.0 <= 7.3.1","<= 6.4.1"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 8.0.0 <= 8.0.4",">= 7.1.0 <= 7.3.1"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 8.0.0 <= 8.0.4",">= 7.0.0 <= 7.3.1",">= 6.0.0 <= 6.4.1"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 7.1.0 <= 7.1.10",">= 7.0.0 <= 7.0.7",">= 6.0.0 <= 6.4.0",">= 2.9.18 < 3.0.0",">= 3.2.9 < 4.0.0",">= 4.5.3 < 5.0.0",">= 5.2.6 <= 5.4.20"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 7.1.0 <= 7.1.4",">= 7.0.0 <= 7.0.6",">= 6.0.0 <= 6.3.5","<= 5.4.19"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.3.0 <= 6.3.3",">= 6.2.0 <= 6.2.6",">= 6.0.0 <= 6.1.5",">= 5.0.0 <= 5.4.18","<= 4.5.13"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.2.0 < 6.2.6",">= 6.1.0 < 6.1.5",">= 6.0.0 < 6.0.15",">= 5.0.0 < 5.4.18","< 4.5.13"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.2.0 < 6.2.5",">= 6.1.0 < 6.1.4",">= 6.0.0 < 6.0.14",">= 5.0.0 < 5.4.17","< 4.5.12"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.2.0 < 6.2.4",">= 6.1.0 < 6.1.3",">= 6.0.0 < 6.0.13",">= 5.0.0 < 5.4.16","< 4.5.11"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.2.0 < 6.2.3",">= 6.1.0 < 6.1.2",">= 6.0.0 < 6.0.12",">= 5.0.0 < 5.4.15","< 4.5.10"]},{"dependency-name":"esbuild","patched-versions":[],"unaffected-versions":[],"affected-versions":["<= 0.24.2"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 6.0.0 <= 6.0.8",">= 5.0.0 <= 5.4.11","<= 4.5.5"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 4.0.0 < 4.5.4",">= 5.4.0 < 5.4.6",">= 5.3.0 < 5.3.6",">= 5.2.0 < 5.2.14","< 3.2.11",">= 5.0.0 < 5.1.8"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 5.4.0 <= 5.4.5",">= 5.3.0 <= 5.3.5",">= 4.0.0 <= 4.5.3","<= 3.2.10",">= 5.2.0 < 5.2.14",">= 5.0.0 <= 5.1.7"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 2.7.0 <= 2.9.17",">= 3.0.0 <= 3.2.8",">= 4.0.0 <= 4.5.2",">= 5.0.0 <= 5.0.12",">= 5.1.0 <= 5.1.6",">= 5.2.0 <= 5.2.5"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 2.7.0 <= 2.9.16",">= 3.0.0 <= 3.2.7",">= 4.0.0 <= 4.5.1",">= 5.0.0 <= 5.0.11"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":[">= 4.4.0 < 4.4.12","= 4.5.0",">= 5.0.0 < 5.0.5"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":["< 2.9.16",">= 3.0.2 < 3.2.7",">= 4.0.0 < 4.0.5",">= 4.1.0 < 4.1.5",">= 4.2.0 < 4.2.3",">= 4.3.0 < 4.3.9"]},{"dependency-name":"vite","patched-versions":[],"unaffected-versions":[],"affected-versions":["< 2.9.13",">= 3.0.0-alpha.0 < 3.0.0-beta.4"]}],"security-updates-only":true,"source":{"provider":"github","repo":"MarkHoo/OrangeNote","branch":null,"api-endpoint":"https://api.github.com/","hostname":"github.com","directories":["/app-frontend"]},"updating-a-pull-request":true,"update-subdependencies":false,"vendor-dependencies":false,"enable-beta-ecosystems":false,"repo-private":false,"multi-ecosystem-update":false,"exclude-paths":[]}}
  proxy | 2026/06/14 06:53:57 [002] GET https://github.com:443/MarkHoo/OrangeNote.git/info/refs?service=git-upload-pack
2026/06/14 06:53:57 [002] * authenticating git server request (host: github.com)
  proxy | 2026/06/14 06:53:57 [002] 200 https://github.com:443/MarkHoo/OrangeNote.git/info/refs?service=git-upload-pack
updater | 2026/06/14 06:53:57 INFO <job_1411593882> Started process PID: 1176 with command: {} git clone --no-tags --depth 1 --recurse-submodules --shallow-submodules https://github.com/MarkHoo/OrangeNote /home/dependabot/dependabot-updater/repo {}
  proxy | 2026/06/14 06:53:58 [004] GET https://github.com:443/MarkHoo/OrangeNote/info/refs?service=git-upload-pack
2026/06/14 06:53:58 [004] * authenticating git server request (host: github.com)
  proxy | 2026/06/14 06:53:58 [004] 200 https://github.com:443/MarkHoo/OrangeNote/info/refs?service=git-upload-pack
  proxy | 2026/06/14 06:53:58 [006] POST https://github.com:443/MarkHoo/OrangeNote/git-upload-pack
  proxy | 2026/06/14 06:53:58 [006] * authenticating git server request (host: github.com)
  proxy | 2026/06/14 06:53:58 [006] 200 https://github.com:443/MarkHoo/OrangeNote/git-upload-pack
  proxy | 2026/06/14 06:53:58 [008] POST https://github.com:443/MarkHoo/OrangeNote/git-upload-pack
2026/06/14 06:53:58 [008] * authenticating git server request (host: github.com)
  proxy | 2026/06/14 06:53:58 [008] 200 https://github.com:443/MarkHoo/OrangeNote/git-upload-pack
updater | 2026/06/14 06:53:58 INFO <job_1411593882> Process PID: 1176 completed with status: pid 1176 exit 0
updater | 2026/06/14 06:53:58 INFO <job_1411593882> Total execution time: 1.28 seconds
updater | 2026/06/14 06:53:58 INFO <job_1411593882> Started process PID: 1218 with command: {} git -C /home/dependabot/dependabot-updater/repo ls-files --stage {}
updater | 2026/06/14 06:53:58 INFO <job_1411593882> Process PID: 1218 completed with status: pid 1218 exit 0
2026/06/14 06:53:58 INFO <job_1411593882> Total execution time: 0.01 seconds
updater | 2026/06/14 06:53:58 INFO <job_1411593882> Started process PID: 1314 with command: {} git lfs pull --include .yarn,./yarn/cache {}
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Process PID: 1314 completed with status: pid 1314 exit 0
2026/06/14 06:53:59 INFO <job_1411593882> Total execution time: 0.57 seconds
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Started process PID: 1438 with command: {} git rev-parse HEAD {}
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Process PID: 1438 completed with status: pid 1438 exit 0
2026/06/14 06:53:59 INFO <job_1411593882> Total execution time: 0.02 seconds
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Started process PID: 1621 with command: {} git lfs pull --include .yarn,./yarn/cache {}
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Process PID: 1621 completed with status: pid 1621 exit 0
updater | 2026/06/14 06:53:59 INFO <job_1411593882> Total execution time: 0.03 seconds
  proxy | 2026/06/14 06:53:59 [010] POST /update_jobs/1411593882/close_pull_request
  proxy | 2026/06/14 06:53:59 [010] 204 /update_jobs/1411593882/close_pull_request
updater | 2026/06/14 06:53:59 ERROR <job_1411593882> Error during file fetching; aborting: /app-frontend not found
  proxy | 2026/06/14 06:54:00 [012] POST /update_jobs/1411593882/record_update_job_error
  proxy | 2026/06/14 06:54:00 [012] 204 /update_jobs/1411593882/record_update_job_error
  proxy | 2026/06/14 06:54:00 [014] PATCH /update_jobs/1411593882/mark_as_processed
  proxy | 2026/06/14 06:54:00 [014] 204 /update_jobs/1411593882/mark_as_processed
updater | 2026/06/14 06:54:00 INFO <job_1411593882> Finished job processing
updater | 2026/06/14 06:54:00 INFO Results:
+----------------------------------------------------------------+
|              Changes to Dependabot Pull Requests               |
+----------------------------+-----------------------------------+
| closed: dependency_removed | esbuild,vite,@vitejs/plugin-react |
+----------------------------+-----------------------------------+
Dependabot encountered '1' error(s) during execution, please check the logs for more details.
+---------------------------------------------------------------------+
|                               Errors                                |
+---------------------------+-----------------------------------------+
| Type                      | Details                                 |
+---------------------------+-----------------------------------------+
| dependency_file_not_found | {                                       |
|                           |   "message": "/app-frontend not found", |
|                           |   "file-path": "/app-frontend"          |
|                           | }                                       |
+---------------------------+-----------------------------------------+
Failure running container 77e5d0ef65f061c32c842f65029d1ddc2cca893ea7d2fe30f5f6d5d9b1e20541: Error: Command failed with exit code 1: /bin/sh -c $DEPENDABOT_HOME/dependabot-updater/bin/run update_files
Cleaned up container 77e5d0ef65f061c32c842f65029d1ddc2cca893ea7d2fe30f5f6d5d9b1e20541
  proxy | 2026/06/14 06:54:00 0/7 calls cached (0%)
2026/06/14 06:54:00 Posting metrics to remote API endpoint
Error: Dependabot encountered an error performing the update

Error: The updater encountered one or more errors.

For more information see: https://github.com/MarkHoo/OrangeNote/network/updates/1411593882 (write access to the repository is required to view the log)
🤖 ~ finished: error reported to Dependabot ~
```