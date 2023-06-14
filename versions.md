# Current Version: prerelease 0.78

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
