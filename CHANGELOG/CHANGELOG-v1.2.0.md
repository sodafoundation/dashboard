# Changelog since Greenland(v1.1.0) release

## [v1.2.0-rc2](https://github.com/sodafoundation/dashboard/tree/v1.2.0-rc2) (2021-01-04)

[Full Changelog](https://github.com/sodafoundation/dashboard/compare/v1.2.0-rc1...v1.2.0-rc2)

**Implemented enhancements:**

- \[Delfin UI\] Add new resource types to storage device [\#463](https://github.com/sodafoundation/dashboard/issues/463)
- Removed created and updated time from ports and controllers view [\#504](https://github.com/sodafoundation/dashboard/pull/504) ([anvithks](https://github.com/anvithks))
- Added new storage resources to delfin UI: Controllers and Ports [\#490](https://github.com/sodafoundation/dashboard/pull/490) ([anvithks](https://github.com/anvithks))
- Fixed empty snapshot desc issue. Added err display for fileshare api calls, removed commented code from profile [\#488](https://github.com/sodafoundation/dashboard/pull/488) ([anvithks](https://github.com/anvithks))

**Fixed bugs:**

- \[multi-cloud\]Cloud object archival should not be available for non-supported vendors [\#505](https://github.com/sodafoundation/dashboard/issues/505)
- \[Multicloud UI\] Object names are prefixed with null when an object is uploaded on a fresh installation of SODA [\#500](https://github.com/sodafoundation/dashboard/issues/500)
- \[Delfin UI\] All alerts have same name and details. Alerts overwritten by last entry [\#498](https://github.com/sodafoundation/dashboard/issues/498)
- Modify fileshare - empty description returns error in API, user is not shown any notification  [\#440](https://github.com/sodafoundation/dashboard/issues/440)

**Closed issues:**

- Add EMC Unity as new Storage Vendor for registration [\#508](https://github.com/sodafoundation/dashboard/issues/508)

**Merged pull requests:**

- Add registration UI for EMC Unity [\#509](https://github.com/sodafoundation/dashboard/pull/509) ([kumarashit](https://github.com/kumarashit))
- Fixed cloud archival allowed for non supported vendor and mandatory tier selection [\#507](https://github.com/sodafoundation/dashboard/pull/507) ([anvithks](https://github.com/anvithks))
- Added disk support to delfin UI storage details [\#502](https://github.com/sodafoundation/dashboard/pull/502) ([anvithks](https://github.com/anvithks))
- Fixed the null prefix in object name issue [\#501](https://github.com/sodafoundation/dashboard/pull/501) ([anvithks](https://github.com/anvithks))

## [v1.2.0-rc1](https://github.com/sodafoundation/dashboard/tree/v1.2.0-rc1) (2020-12-24)

[Full Changelog](https://github.com/sodafoundation/dashboard/compare/v1.1.1...v1.2.0-rc1)

**Implemented enhancements:**

- \[Multicloud UI\] Show success and error messages for Register, Modify and Delete backend [\#495](https://github.com/sodafoundation/dashboard/issues/495)
- \[Delfin UI\] Add support for fetching Delfin alerts from Alertmanager API  [\#485](https://github.com/sodafoundation/dashboard/issues/485)
- \[Multicloud\] Data archival and retrieval support for multicloud [\#476](https://github.com/sodafoundation/dashboard/issues/476)
- \[Delfin UI\]Add support for new storage array vendors Hitachi and IBM [\#475](https://github.com/sodafoundation/dashboard/issues/475)
- Hosts should be discovered and not Created in the Resource Manager -\> Hosts Page. [\#470](https://github.com/sodafoundation/dashboard/issues/470)
- \[Multicloud UI\] Data snapshot support for cloud  [\#467](https://github.com/sodafoundation/dashboard/issues/467)
- \[Delfin UI\] Add performance monitoring tab under storage device Details [\#462](https://github.com/sodafoundation/dashboard/issues/462)
- \[Delfin UI\] Add performance monitoring dashboard to Delfin UI [\#461](https://github.com/sodafoundation/dashboard/issues/461)
- \[Multicloud UI\]Add select disk type support for Huawei EVS in multicloud Block service. [\#460](https://github.com/sodafoundation/dashboard/issues/460)
- \[MultiCloud Block Service\] Add support for Huawei EVS to SODA Dashboard [\#455](https://github.com/sodafoundation/dashboard/issues/455)
- \[AWS Block Storage\] Set the IOPS value for volume type General Purpose as per AWS specifications in create an modify cloud volume pages. [\#415](https://github.com/sodafoundation/dashboard/issues/415)
- Added success and error notifications for register, modify, delete backend [\#496](https://github.com/sodafoundation/dashboard/pull/496) ([anvithks](https://github.com/anvithks))
- Added support for delfin alerts through Alertmanager API [\#486](https://github.com/sodafoundation/dashboard/pull/486) ([anvithks](https://github.com/anvithks))
- Added multicloud archive/restore feature [\#483](https://github.com/sodafoundation/dashboard/pull/483) ([anvithks](https://github.com/anvithks))
- Added support to register Hitachi VSP and IBM Storwize/SVC storage devices from dashboard [\#478](https://github.com/sodafoundation/dashboard/pull/478) ([anvithks](https://github.com/anvithks))
- Fixed \#470. Changed 'Create Host' to 'Register Host' [\#473](https://github.com/sodafoundation/dashboard/pull/473) ([anvithks](https://github.com/anvithks))
- Updated the home page to add Huawei Block storage backend [\#459](https://github.com/sodafoundation/dashboard/pull/459) ([anvithks](https://github.com/anvithks))

**Fixed bugs:**

- \[Delfin UI\] Configure metrics collection link appears twice in the operations menu in list all storages [\#493](https://github.com/sodafoundation/dashboard/issues/493)
- \[Delfin UI\] Alerts table view in storage details is not consistent with list all alerts table. Severity codes and widths of table are not same [\#491](https://github.com/sodafoundation/dashboard/issues/491)
- \[Multicloud UI\] Restore object from archived tier throws SignatureDoesNotMatch error [\#484](https://github.com/sodafoundation/dashboard/issues/484)
- \[Multicloud File Share\] Changing File share backend type from Huawei to GCP sets the default size to incorrect value of  1 GiB, should be 1024 GiB \(minimum required for GCP\) [\#454](https://github.com/sodafoundation/dashboard/issues/454)
- Profile card height and alignment are not uniform. Long Profile names are not displayed correctly. Long profile descriptions are cut off. [\#449](https://github.com/sodafoundation/dashboard/issues/449)
- Cloud block service Modify AWS Volume Incorrect text in error notification. [\#442](https://github.com/sodafoundation/dashboard/issues/442)
- Cloud Bock service Create AWS Magnetic Volume. Incorrect warning message on max size validation [\#441](https://github.com/sodafoundation/dashboard/issues/441)

**Closed issues:**

- \[Multicloud UI\] Adding support for Cloud Archival and Retrieval \[AWS\] [\#482](https://github.com/sodafoundation/dashboard/issues/482)
- \[Delfin UI\]Move all vendor, model and storage array lists from Register, modify and list storage pages to Consts file [\#477](https://github.com/sodafoundation/dashboard/issues/477)
- \[Delfin UI\] Integrate Alertmanager with Prometheus for displaying alerts generated in Delfin. [\#474](https://github.com/sodafoundation/dashboard/issues/474)
- \[Delfin UI\] Setup Prometheus with Delfin and explore integration with Grafana for performance monitoring [\#471](https://github.com/sodafoundation/dashboard/issues/471)
- \[Delfin UI\]  Performance Monitoring metrics collection configuration page [\#404](https://github.com/sodafoundation/dashboard/issues/404)
- \[Delfin UI\] List all alerts page to show the alerts generated on storage arrays [\#392](https://github.com/sodafoundation/dashboard/issues/392)
- Create an Util file with methods that are used repeatedly and regularly across the application. [\#186](https://github.com/sodafoundation/dashboard/issues/186)

**Merged pull requests:**

- Fixed the issue of alerts getting overwritten by last entry. [\#499](https://github.com/sodafoundation/dashboard/pull/499) ([anvithks](https://github.com/anvithks))
- Fixed content type issue with signature generation. [\#497](https://github.com/sodafoundation/dashboard/pull/497) ([anvithks](https://github.com/anvithks))
- Fixed configure metrics link appearing twice in operations menu in list storages [\#494](https://github.com/sodafoundation/dashboard/pull/494) ([anvithks](https://github.com/anvithks))
- Fixed alerts view in storage details [\#492](https://github.com/sodafoundation/dashboard/pull/492) ([anvithks](https://github.com/anvithks))
- Fixed object restore issue. Added appropriate messages while archiving object. [\#489](https://github.com/sodafoundation/dashboard/pull/489) ([anvithks](https://github.com/anvithks))
- Added performance monitoring UI. Overall & details [\#481](https://github.com/sodafoundation/dashboard/pull/481) ([anvithks](https://github.com/anvithks))
- Added a configuration popup to enable performance collection for a storage device [\#472](https://github.com/sodafoundation/dashboard/pull/472) ([anvithks](https://github.com/anvithks))
- Fixed the issue of alignment of profile cards, long profile names and description [\#450](https://github.com/sodafoundation/dashboard/pull/450) ([anvithks](https://github.com/anvithks))

## [v1.1.1](https://github.com/sodafoundation/dashboard/tree/v1.1.1) (2020-10-19)

[Full Changelog](https://github.com/sodafoundation/dashboard/compare/v1.1.0...v1.1.1)

**Implemented enhancements:**

- Add support for Huawei EVS to SODA Dashboard multicloud block service [\#456](https://github.com/sodafoundation/dashboard/pull/456) ([anvithks](https://github.com/anvithks))
- \[Hw-SFS FileShare Support\] Implement Hw Cloud SFS FileShare Dashboard Support for Multi-Cloud [\#452](https://github.com/sodafoundation/dashboard/pull/452) ([himanshuvar](https://github.com/himanshuvar))

**Fixed bugs:**

- Backend Type, Region, End point etc  are not listed to register a storage backend [\#446](https://github.com/sodafoundation/dashboard/issues/446)

**Closed issues:**

- \[Multi-Cloud FileShare\] Need to support for protocol drop-down for multiple protocol selections [\#453](https://github.com/sodafoundation/dashboard/issues/453)
- \[Multicloud UI\] Support for Hw Cloud SFS for Multi-Cloud FileShare [\#451](https://github.com/sodafoundation/dashboard/issues/451)
- Cleanup on failed installation not cleaning completely [\#447](https://github.com/sodafoundation/dashboard/issues/447)

**Merged pull requests:**

- Fixed issues with Huawei FS create form. Fixes \#453 and \#454 [\#457](https://github.com/sodafoundation/dashboard/pull/457) ([anvithks](https://github.com/anvithks))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
