# Changelog since Faroe(v1.0.0) release

## [v1.1.0](https://github.com/sodafoundation/dashboard/tree/v1.1.0) (2020-09-29)

[Full Changelog](https://github.com/sodafoundation/dashboard/compare/v1.0.1...v1.1.0)

**Implemented enhancements:**

- Consistent naming convention of Menu items to reduce confusion and remove obsolete menu items. [\#434](https://github.com/sodafoundation/dashboard/issues/434)
- Updated menu. Removed deprecated telemetry. Renamed Delfin to monitor [\#435](https://github.com/sodafoundation/dashboard/pull/435) ([anvithks](https://github.com/anvithks))
- Added volumes and pool overview and list in tree view. Fixed \#424 [\#433](https://github.com/sodafoundation/dashboard/pull/433) ([anvithks](https://github.com/anvithks))
- Fixed size input in GiB to bytes issue. Cleaned up code. [\#428](https://github.com/sodafoundation/dashboard/pull/428) ([anvithks](https://github.com/anvithks))
- Added sidebar panel to home page. Improved register and show backends view [\#426](https://github.com/sodafoundation/dashboard/pull/426) ([anvithks](https://github.com/anvithks))

**Fixed bugs:**

- Enter size parameter in GiB for create and modify cloud volume and file share [\#427](https://github.com/sodafoundation/dashboard/issues/427)
- \[Delfin UI\] Error in Storage summary page tree view. loadNode is not a function [\#424](https://github.com/sodafoundation/dashboard/issues/424)

**Closed issues:**

- Dashboard should not force and block if AK/SK not set [\#436](https://github.com/sodafoundation/dashboard/issues/436)
- Profile Detailed View? [\#422](https://github.com/sodafoundation/dashboard/issues/422)

**Merged pull requests:**

- Fixed incorrect route for storage summary [\#439](https://github.com/sodafoundation/dashboard/pull/439) ([anvithks](https://github.com/anvithks))
- Fixed \#436. Fixed AKSK warning popup blocking operation. Show only on buckets and dataflow pages. [\#437](https://github.com/sodafoundation/dashboard/pull/437) ([anvithks](https://github.com/anvithks))
- Added attribution to author of formatBytes\(\) method [\#425](https://github.com/sodafoundation/dashboard/pull/425) ([anvithks](https://github.com/anvithks))

## [v1.0.1](https://github.com/sodafoundation/dashboard/tree/v1.0.1) (2020-09-21)

[Full Changelog](https://github.com/sodafoundation/dashboard/compare/v1.0.0...v1.0.1)

**Implemented enhancements:**

- \[GCP Fileshare Support Request\] Need to standarize AK/SK lengths  [\#408](https://github.com/sodafoundation/dashboard/issues/408)
- \[Multicloud UI\] Enhance the cloud file share service to provide support for GCP [\#401](https://github.com/sodafoundation/dashboard/issues/401)
- \[Multicloud UI\] Add modify AWS cloud volume support. [\#399](https://github.com/sodafoundation/dashboard/issues/399)
- \[Delfin UI\]Use a query filter to fetch the storage pools associated with a storage array. [\#397](https://github.com/sodafoundation/dashboard/issues/397)
- \[Delfin UI\]Use a query filter to fetch the volumes associated with a storage array. [\#396](https://github.com/sodafoundation/dashboard/issues/396)
- \[Multicloud UI\] Enhance the Create Volume for AWS Cloud Backend adding new types of volumes and required parameters [\#390](https://github.com/sodafoundation/dashboard/issues/390)
- \[Multicloud UI\] Enhancement of the Multi-Cloud Block Support for AWS Create/List/Get/Update/Delete [\#389](https://github.com/sodafoundation/dashboard/issues/389)
- Enforce user to generate an AK/SK on using SODA from dashboard for the first time on a fresh installation  [\#366](https://github.com/sodafoundation/dashboard/issues/366)
- Added customization key:value to view in profile card [\#423](https://github.com/sodafoundation/dashboard/pull/423) ([anvithks](https://github.com/anvithks))
- Updated the alerts list table view. Added expand view and severity icons [\#421](https://github.com/sodafoundation/dashboard/pull/421) ([anvithks](https://github.com/anvithks))
- Added GCP File share service support to cloud file share. [\#414](https://github.com/sodafoundation/dashboard/pull/414) ([anvithks](https://github.com/anvithks))
- Added modify cloud volume support. [\#413](https://github.com/sodafoundation/dashboard/pull/413) ([anvithks](https://github.com/anvithks))
- Updated the cloud block service support. With new changes for AWS. [\#412](https://github.com/sodafoundation/dashboard/pull/412) ([anvithks](https://github.com/anvithks))
- Changed the AK/SK length as per requirement for GCP fileshare support. [\#411](https://github.com/sodafoundation/dashboard/pull/411) ([anvithks](https://github.com/anvithks))
- Updated the register alert source feature to support API changes. Added Delete Alert source. [\#409](https://github.com/sodafoundation/dashboard/pull/409) ([anvithks](https://github.com/anvithks))
- Added Storage array Details. Added Volumes & pool component. Storage capacity and Alerts Tab [\#402](https://github.com/sodafoundation/dashboard/pull/402) ([anvithks](https://github.com/anvithks))
- \[Feature\] Added collapsible sub-menu feature. [\#377](https://github.com/sodafoundation/dashboard/pull/377) ([anvithks](https://github.com/anvithks))
- Fixed \#366. Added check if AK/SK exists when user accesses multi-cloud functions [\#369](https://github.com/sodafoundation/dashboard/pull/369) ([anvithks](https://github.com/anvithks))

**Fixed bugs:**

- Name field validations in Create File share for GCP File storage  [\#419](https://github.com/sodafoundation/dashboard/issues/419)
- Check for AK/SK exists when user accesses multi-cloud functions does not show the confirm dialog [\#416](https://github.com/sodafoundation/dashboard/issues/416)
- Secret key is visible in Modify AK/SK modal while modifying cloud backend AK/SK on home page. [\#405](https://github.com/sodafoundation/dashboard/issues/405)
- Unable to access the dashboard when installing on Ubuntu 18.04 and CentOS on VirtualBox [\#373](https://github.com/sodafoundation/dashboard/issues/373)
- Unable to see list of cloud volumes [\#364](https://github.com/sodafoundation/dashboard/issues/364)

**Closed issues:**

- \[Delfin UI\] Provide Sync storage device trigger from dashboard [\#394](https://github.com/sodafoundation/dashboard/issues/394)
- \[Delfin UI\] Modify the storage array access info [\#393](https://github.com/sodafoundation/dashboard/issues/393)
- \[Delfin UI\] Storage Array Details [\#391](https://github.com/sodafoundation/dashboard/issues/391)
- \[Delfin UI\] - Register Alert source and Clear Alert Source [\#384](https://github.com/sodafoundation/dashboard/issues/384)
- \[Delfin UI\] - Storage Summary Dashboard - List Alerts widget [\#383](https://github.com/sodafoundation/dashboard/issues/383)
- \[Delfin UI\] - Storage Summary Dashboard - Widget for listing arrays by capacity usage [\#382](https://github.com/sodafoundation/dashboard/issues/382)
- \[Delfin UI\] Show capacities on Storage Summary page [\#380](https://github.com/sodafoundation/dashboard/issues/380)
- Delfin UI - Storage Summary Dashboard [\#379](https://github.com/sodafoundation/dashboard/issues/379)
- Delfin UI - Register Storage [\#378](https://github.com/sodafoundation/dashboard/issues/378)
- \[New Feature\] Add Delfin Project APIs support to dashboard [\#370](https://github.com/sodafoundation/dashboard/issues/370)
- Can SODA Infrastructure Manager \(SIM\) be triggered from the Dashboard? [\#330](https://github.com/sodafoundation/dashboard/issues/330)

**Merged pull requests:**

- Removed occurences of Fake Storage / Fake driver from the delfin UI [\#420](https://github.com/sodafoundation/dashboard/pull/420) ([anvithks](https://github.com/anvithks))
- Fixed validations for GCP file share. Fixed iops issue in AWS volume [\#418](https://github.com/sodafoundation/dashboard/pull/418) ([anvithks](https://github.com/anvithks))
- Fixed \#416. AK/SK check popup not visible issue. [\#417](https://github.com/sodafoundation/dashboard/pull/417) ([anvithks](https://github.com/anvithks))
- Added modify access info support for a storage device [\#410](https://github.com/sodafoundation/dashboard/pull/410) ([anvithks](https://github.com/anvithks))
- Fixed secret key visible in modify ak/sk modal [\#406](https://github.com/sodafoundation/dashboard/pull/406) ([anvithks](https://github.com/anvithks))
- Added register storage feature. [\#403](https://github.com/sodafoundation/dashboard/pull/403) ([anvithks](https://github.com/anvithks))
- \[Feature\] Added Delfin UI support. Storage Summary page and widgets. [\#395](https://github.com/sodafoundation/dashboard/pull/395) ([anvithks](https://github.com/anvithks))
- \[Fixes \#373\] Fixed envsubst not working on Ubuntu18.04/CentOS8 on VirtualBox [\#374](https://github.com/sodafoundation/dashboard/pull/374) ([anvithks](https://github.com/anvithks))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
