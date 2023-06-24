# Current Version: prerelease 0.82

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
- Cleanup: Removed depricated "Add" from panel components
- Bug Fix: Fixed bug that prevented registrar list and mass email from utilizing the modules and completed modules panel
