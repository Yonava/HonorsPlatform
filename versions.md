# Current Version: prerelease 0.85

### prerelease 0.85 (Jul. 9)
- Improved Data Modelling: Added Student Sys ID to data layer across all panels dependent on students or graduates.
- Fixed bug that caused items to duplicate when moved between ranges without document refresh
- Student Match darastically improved and moved into its own composable
- StudentLink and StudentLinkButton added to all panels dependent on students or graduates to relink on the fly
- Student IDs can now finally be edited!
- Students and Graduates can now hold modules and engagements without the need for an ID
- Removed LockArea on EmbeddedDetail
- Various other minor stability improvements

### prerelease 0.84.3 (Jul. 8)
- Overhauled "increment student year" to add the ability to include or exclude students
- Major simplifications and efficiency improvements to suggested delete panel
- Transitioned InstructorAutoComplete from legacy instructor caching system to new useDocumentCache api and enhanced the logic to re-assess available instructors efficiently on the fly
- Fixed major bug with postInRange causing data to be misaligned when posting batch data

### prerelease 0.84 (Jul. 4)
- Improved loading times across every panel
- Changed model for loading data by adding the "Dependencies" property to each panel
- Wrote batchGet API integrations to fetch data much faster and much more efficiently
- Removed "fetchItems" API in favor of getAllDocuments for managing batchGet endpoint and cache refresh API
- Fixed bug causing announcements to refetch and read state to be wiped after closing PanelCoverAppBar

### prerelease 0.83 (Jul. 2)
- Feature: Live updating smart suggestions to quickly flag and delete any unwanted entities in the system. Tests against dozens of criteria and forms a "rationale" paragraph along with two levels of recommendation ("warn" for consider, and "danger" for strongly recommended) based on how urgent the problem being flagged is deemed
- Removed “Missing Start Date” DocuSign Status on module list item in favor of displaying “DocuSign Completed” no matter if there is a start date or not
- Brand new useStudentMatch composable added to link together any component with a studentId to a student (with graduate fallback). Displays human readable errors when student is found but in graduates, if student is not found in either students or graduates, or when a studentId is missing from the entity
- Thesis "view ..." (jump to) button can now if it can jump to a student, or if the destination for the jump is a graduate. Has 4 different states for users: No student linked (no id), no student found (no grad or student matching id), "View Student" when student exists, and "View Graduate" if the ID links to a grad
- Student panel icon switched from mdi-account-group to mdi-account
- Added new sort option to Grad Engagements: “Event”

### prerelease 0.82 (Jun. 24)
- Graduate engageements added as a full service panel with list item and detail
- Fixed sort panel not updating sort options on panel switch
- Reordered panels and refactored panel key bindings to dynamically rebind when panels re-order
- useUpdateItem now terminates impending update request when user reverts item back to former state
- Bug fixes on useDocumentCache updateItem
- Improved setSelectedItemByKeyValue API on useDocumentCache
- Fixed bug that duplicated module when selecting to move it to completed before it saved the original module to sheet

### prerelease 0.81 (Jun. 22)
- Fixed student year increment cache duplication bugs
- Fixed completed module term display red text bug
- Removed Finish Module system and replaced it with a cleaner system that integrates with new Pinia APIs
- Integrated the embedded module detail system with useDocumentCache
- Removed mass add and remove from cache endpoints on useDocumentCache. On mass updates, refreshCache preferred
- Improved the useDocument addItemToCache API and renamed it to addItem for consistency
- Added concurrency controls to deleteItem in useDocumentCache
- Student year now defaults to "Senior" when moved moved from graduates back to students
- Tons of other smaller bug fixes and improvements

### prerelease 0.8 (Jun. 19)
- Entire application much more efficient with REST requests
- Massive architectural overhaul: added useDocumentCache store to create comprehensive document caching system with auto detection of stale data
- Cleaned up and standardized dialog messages and color schemes
- Standardized panel embeddings new pinia store APIs
- Recursive embeddings refreshCache written to do a full cache refresh when user hits "Refresh Data" button on AppBar
- Various smaller code quality improvements

### prerelease 0.78 (Jun. 14)
- Feature: Better dialogs on mobile. ModalContent now handles xs device modals using navigation-drawer for a non-abrasive user experience
- Improvement: Improvements to the "Add Student Note" feature. Added date to each new note, added autofocusing inputs, and added new keyboard shortcuts.
- Tweak: Added version exporting from Panel
- Bug Fix: Fixed bug where some browsers blocked the auth pop-ups by adding a button after 1 second to the authorization information modal.
- Tweak: Dialogbody made optional in typescript definition (useDialog)

### prerelease 0.77 (Jun. 9)
- Feature: Authorization state moved to Pinia for seriously improved auth flow. Increased efficiency, auth in fewer clicks, and open a new tab to authenticate while preserving each request in a queue so no data is lost due to reload.
- UI tweaks on AddBar.vue for mobile nav drawers
- Bug Fix: 3 second buffer added to thesis unlock to allow freshly inserted StudentId time to propagate

### prerelease 0.76 (Jun. 7)
- Feature: Add API for frictionless experience adding an item, including self removing empty items and add button UI feedback

### prerelease 0.75 (Jun. 6)
- Feature: new "Create Temporary Sheet" tool on every panel allows users to create a temporary speadsheet with a subset of the columns/properties available on each panel configurable through a new dialog.
- Cleanup: Removed deprecated "Add" from panel components
- Bug Fix: Fixed bug that prevented registrar list and mass email from utilizing the modules and completed modules panel
